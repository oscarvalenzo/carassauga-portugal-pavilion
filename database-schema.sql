-- Carassauga Connect Database Schema
-- PostgreSQL 14+
-- Version: 1.0.0

-- Enable UUID extension (optional, if using UUIDs instead of SERIAL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if exists (for development only - remove in production)
DROP TABLE IF EXISTS photos CASCADE;
DROP TABLE IF EXISTS queues CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS user_badges CASCADE;
DROP TABLE IF EXISTS badges CASCADE;
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS family_groups CASCADE;

-- Family Groups table
CREATE TABLE family_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  invite_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  avatar_url VARCHAR(500),
  family_group_id INT REFERENCES family_groups(id) ON DELETE SET NULL,
  total_points INT DEFAULT 0,
  level INT DEFAULT 1,
  fcm_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  CONSTRAINT positive_points CHECK (total_points >= 0)
);

-- Activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'foodie', 'culture', 'futebol', 'social'
  points INT NOT NULL,
  qr_code VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(100),
  icon_emoji VARCHAR(10),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_category CHECK (category IN ('foodie', 'culture', 'futebol', 'social')),
  CONSTRAINT positive_activity_points CHECK (points > 0)
);

-- User Activities (completion tracking)
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  points_earned INT NOT NULL,
  completed_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_id),
  CONSTRAINT positive_earned_points CHECK (points_earned > 0)
);

-- Badges table
CREATE TABLE badges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_emoji VARCHAR(10),
  icon_url VARCHAR(255),
  badge_type VARCHAR(50), -- 'quest', 'special', 'hidden'
  unlock_criteria JSONB NOT NULL,
  sort_order INT DEFAULT 0,
  is_secret BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_badge_type CHECK (badge_type IN ('quest', 'special', 'hidden'))
);

-- User Badges
CREATE TABLE user_badges (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id INT NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Events/Performances table
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  location VARCHAR(100),
  event_type VARCHAR(50), -- 'performance', 'activity', 'demo', 'talk'
  is_live BOOLEAN DEFAULT FALSE,
  capacity INT,
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_event_type CHECK (event_type IN ('performance', 'activity', 'demo', 'talk')),
  CONSTRAINT valid_times CHECK (end_time > start_time)
);

-- Virtual Queues table
CREATE TABLE queues (
  id SERIAL PRIMARY KEY,
  station_name VARCHAR(100) NOT NULL,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  position INT NOT NULL,
  phone_number VARCHAR(20),
  joined_at TIMESTAMP DEFAULT NOW(),
  estimated_wait_minutes INT,
  notified_at TIMESTAMP,
  status VARCHAR(50) DEFAULT 'waiting',
  CONSTRAINT valid_queue_status CHECK (status IN ('waiting', 'ready', 'served', 'cancelled')),
  CONSTRAINT positive_position CHECK (position > 0)
);

-- Photos table
CREATE TABLE photos (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  photo_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  ar_experience VARCHAR(100),
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_ar_experience CHECK (ar_experience IN ('ronaldo', 'world_cup', NULL))
);

-- Event Check-ins (bonus points for attending)
CREATE TABLE event_checkins (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

-- User Recipes (saved recipes)
CREATE TABLE user_recipes (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipe_name VARCHAR(255) NOT NULL,
  saved_at TIMESTAMP DEFAULT NOW()
);

-- Notifications Log
CREATE TABLE notifications_log (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(50), -- 'event_reminder', 'queue_ready', 'badge_earned', etc.
  title VARCHAR(255),
  body TEXT,
  sent_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  CONSTRAINT valid_notification_type CHECK (notification_type IN ('event_reminder', 'queue_ready', 'badge_earned', 'level_up', 'family_update'))
);

-- Create indexes for performance
CREATE INDEX idx_users_family_group ON users(family_group_id);
CREATE INDEX idx_users_total_points ON users(total_points DESC);
CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX idx_user_activities_activity_id ON user_activities(activity_id);
CREATE INDEX idx_user_activities_completed_at ON user_activities(completed_at);
CREATE INDEX idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge_id ON user_badges(badge_id);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_events_is_live ON events(is_live) WHERE is_live = TRUE;
CREATE INDEX idx_queues_station_status ON queues(station_name, status) WHERE status = 'waiting';
CREATE INDEX idx_queues_user_id ON queues(user_id);
CREATE INDEX idx_photos_user_id ON photos(user_id);
CREATE INDEX idx_event_checkins_user_id ON event_checkins(user_id);

-- Create materialized view for leaderboard (for performance)
CREATE MATERIALIZED VIEW leaderboard_view AS
SELECT 
  u.id,
  u.display_name,
  u.avatar_url,
  u.total_points,
  u.level,
  u.family_group_id,
  COUNT(DISTINCT ub.badge_id) as badges_earned,
  COUNT(DISTINCT ua.activity_id) as activities_completed,
  RANK() OVER (ORDER BY u.total_points DESC) as global_rank,
  RANK() OVER (PARTITION BY u.family_group_id ORDER BY u.total_points DESC) as family_rank
FROM users u
LEFT JOIN user_badges ub ON u.id = ub.user_id
LEFT JOIN user_activities ua ON u.id = ua.user_id
GROUP BY u.id, u.display_name, u.avatar_url, u.total_points, u.level, u.family_group_id
ORDER BY u.total_points DESC;

-- Create index on materialized view
CREATE INDEX idx_leaderboard_global_rank ON leaderboard_view(global_rank);
CREATE INDEX idx_leaderboard_family_rank ON leaderboard_view(family_group_id, family_rank);

-- Function to refresh leaderboard (call this periodically)
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard_view;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update user's total points when activity is completed
CREATE OR REPLACE FUNCTION update_user_points()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users 
  SET total_points = total_points + NEW.points_earned,
      updated_at = NOW()
  WHERE id = NEW.user_id;
  
  -- Update level based on points
  UPDATE users 
  SET level = CASE 
    WHEN total_points >= 1000 THEN 6
    WHEN total_points >= 750 THEN 5
    WHEN total_points >= 500 THEN 4
    WHEN total_points >= 250 THEN 3
    WHEN total_points >= 100 THEN 2
    ELSE 1
  END
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_points
AFTER INSERT ON user_activities
FOR EACH ROW
EXECUTE FUNCTION update_user_points();

-- Function to automatically check and unlock badges
CREATE OR REPLACE FUNCTION check_badge_unlock()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
  criteria JSONB;
  quest_category VARCHAR(50);
  required_count INT;
  actual_count INT;
BEGIN
  -- Check all badges
  FOR badge_record IN SELECT * FROM badges WHERE badge_type = 'quest' LOOP
    criteria := badge_record.unlock_criteria;
    quest_category := criteria->>'category';
    required_count := (criteria->>'required_activities')::INT;
    
    -- Count completed activities in this category
    SELECT COUNT(*) INTO actual_count
    FROM user_activities ua
    JOIN activities a ON ua.activity_id = a.id
    WHERE ua.user_id = NEW.user_id 
      AND a.category = quest_category;
    
    -- If requirements met and badge not yet earned, award it
    IF actual_count >= required_count THEN
      INSERT INTO user_badges (user_id, badge_id)
      VALUES (NEW.user_id, badge_record.id)
      ON CONFLICT (user_id, badge_id) DO NOTHING;
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_badge_unlock
AFTER INSERT ON user_activities
FOR EACH ROW
EXECUTE FUNCTION check_badge_unlock();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to all tables with updated_at
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_family_groups_updated_at BEFORE UPDATE ON family_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_badges_updated_at BEFORE UPDATE ON badges FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comments for documentation
COMMENT ON TABLE users IS 'Main users table storing profile and points';
COMMENT ON TABLE family_groups IS 'Family groups for collaborative experience';
COMMENT ON TABLE activities IS 'Quest activities users can complete';
COMMENT ON TABLE badges IS 'Achievements users can unlock';
COMMENT ON TABLE events IS 'Scheduled performances and events';
COMMENT ON TABLE queues IS 'Virtual queue management for food stations';
COMMENT ON TABLE photos IS 'User-uploaded AR photos';

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO carassauga_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO carassauga_app_user;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Carassauga Connect database schema created successfully!';
  RAISE NOTICE 'Run seed.sql to populate with initial data.';
END $$;

