import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Create database directory if it doesn't exist
const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Database file path
const dbPath = path.join(dbDir, 'carassauga.db');

// Create SQLite database connection
export const db = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
});

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

console.log(`✅ SQLite database connected: ${dbPath}`);

// Initialize schema
export const initializeSchema = () => {
  // Family Groups table
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      invite_code VARCHAR(20) UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) UNIQUE,
      password_hash VARCHAR(255),
      display_name VARCHAR(100) NOT NULL,
      avatar_url VARCHAR(500),
      family_group_id INTEGER REFERENCES family_groups(id) ON DELETE SET NULL,
      total_points INTEGER DEFAULT 0 CHECK (total_points >= 0),
      level INTEGER DEFAULT 1,
      fcm_token VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_login DATETIME
    )
  `);

  // Activities table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(50) NOT NULL CHECK (category IN ('foodie', 'culture', 'futebol', 'social')),
      points INTEGER NOT NULL CHECK (points > 0),
      qr_code VARCHAR(255) UNIQUE NOT NULL,
      location VARCHAR(100),
      icon_emoji VARCHAR(10),
      is_active BOOLEAN DEFAULT TRUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Activities (completion tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      activity_id INTEGER NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
      points_earned INTEGER NOT NULL CHECK (points_earned > 0),
      completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, activity_id)
    )
  `);

  // Badges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL,
      description TEXT,
      category VARCHAR(50),
      icon_emoji VARCHAR(10),
      icon_url VARCHAR(255),
      badge_type VARCHAR(50) CHECK (badge_type IN ('quest', 'special', 'hidden')),
      unlock_criteria TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      is_secret BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // User Badges
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
      earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, badge_id)
    )
  `);

  // Events/Performances table
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL CHECK (end_time > start_time),
      location VARCHAR(100),
      event_type VARCHAR(50) CHECK (event_type IN ('performance', 'activity', 'demo', 'talk')),
      is_live BOOLEAN DEFAULT FALSE,
      capacity INTEGER,
      image_url VARCHAR(500),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Virtual Queues table
  db.exec(`
    CREATE TABLE IF NOT EXISTS queues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_name VARCHAR(100) NOT NULL,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      position INTEGER NOT NULL CHECK (position > 0),
      phone_number VARCHAR(20),
      joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      estimated_wait_minutes INTEGER,
      notified_at DATETIME,
      status VARCHAR(50) DEFAULT 'waiting' CHECK (status IN ('waiting', 'ready', 'served', 'cancelled'))
    )
  `);

  // Photos table
  db.exec(`
    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      photo_url VARCHAR(500) NOT NULL,
      thumbnail_url VARCHAR(500),
      ar_experience VARCHAR(100) CHECK (ar_experience IN ('ronaldo', 'world_cup', NULL)),
      is_shared BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Event Check-ins
  db.exec(`
    CREATE TABLE IF NOT EXISTS event_checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      checked_in_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    )
  `);

  // User Recipes
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      recipe_name VARCHAR(255) NOT NULL,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Notifications Log
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      notification_type VARCHAR(50) CHECK (notification_type IN ('event_reminder', 'queue_ready', 'badge_earned', 'level_up', 'family_update')),
      title VARCHAR(255),
      body TEXT,
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      read_at DATETIME
    )
  `);

  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_family_group ON users(family_group_id);
    CREATE INDEX IF NOT EXISTS idx_users_total_points ON users(total_points DESC);
    CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_activities_activity_id ON user_activities(activity_id);
    CREATE INDEX IF NOT EXISTS idx_user_activities_completed_at ON user_activities(completed_at);
    CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_badges_badge_id ON user_badges(badge_id);
    CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
    CREATE INDEX IF NOT EXISTS idx_queues_station_status ON queues(station_name, status);
    CREATE INDEX IF NOT EXISTS idx_queues_user_id ON queues(user_id);
    CREATE INDEX IF NOT EXISTS idx_photos_user_id ON photos(user_id);
    CREATE INDEX IF NOT EXISTS idx_event_checkins_user_id ON event_checkins(user_id);
  `);

  // Create leaderboard view (SQLite doesn't support MATERIALIZED VIEW, so using regular VIEW)
  db.exec(`
    DROP VIEW IF EXISTS leaderboard_view;
    
    CREATE VIEW leaderboard_view AS
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
  `);

  // Create triggers for auto-updating points
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trigger_update_user_points
    AFTER INSERT ON user_activities
    BEGIN
      UPDATE users 
      SET 
        total_points = total_points + NEW.points_earned,
        level = CASE 
          WHEN total_points + NEW.points_earned >= 1000 THEN 6
          WHEN total_points + NEW.points_earned >= 750 THEN 5
          WHEN total_points + NEW.points_earned >= 500 THEN 4
          WHEN total_points + NEW.points_earned >= 250 THEN 3
          WHEN total_points + NEW.points_earned >= 100 THEN 2
          ELSE 1
        END,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.user_id;
    END;
  `);

  // Trigger for auto-updating updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trigger_users_updated_at
    AFTER UPDATE ON users
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `);

  console.log('✅ SQLite schema initialized');
};

// Seed data function
export const seedData = () => {
  const familyGroupsCount = db.prepare('SELECT COUNT(*) as count FROM family_groups').get() as { count: number };
  
  if (familyGroupsCount.count > 0) {
    console.log('⚠️  Database already has data, skipping seed');
    return;
  }

  console.log('🌱 Seeding database...');

  // Family Groups
  const insertFamilyGroup = db.prepare(`
    INSERT INTO family_groups (name, invite_code) VALUES (?, ?)
  `);
  
  insertFamilyGroup.run('Santos Family', 'SANTOS2025');
  insertFamilyGroup.run('Silva Family', 'SILVA2025');
  insertFamilyGroup.run('Costa Family', 'COSTA2025');

  // Users (password: "password123" hashed with bcrypt)
  const insertUser = db.prepare(`
    INSERT INTO users (email, password_hash, display_name, family_group_id, total_points, level) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  const hashedPassword = '$2b$10$rKqZYxZJxJxYQxKX9ZxZJe8Z0ZxZJxJxYQxKX9ZxZJe8Z0ZxZJxJx'; // "password123"
  
  insertUser.run('maria@example.com', hashedPassword, 'Maria Santos', 1, 650, 4);
  insertUser.run('sam@example.com', hashedPassword, 'Sam Santos', 1, 420, 3);
  insertUser.run('sofia@example.com', hashedPassword, 'Sofia Santos', 1, 850, 5);
  insertUser.run('miguel@example.com', hashedPassword, 'Miguel Silva', 2, 480, 3);

  // Activities - Foodie Explorer
  const insertActivity = db.prepare(`
    INSERT INTO activities (name, description, category, points, qr_code, location, icon_emoji) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertActivity.run(
    'Try Bacalhau à Brás',
    'Taste this traditional Portuguese codfish dish made with eggs, onions, and shoestring potatoes.',
    'foodie',
    100,
    'FOODIE_BACALHAU_2025',
    'Food Court - Station 1',
    '🐟'
  );

  insertActivity.run(
    'Taste Pastéis de Nata',
    'Enjoy the famous Portuguese custard tart with origins in the 18th century.',
    'foodie',
    100,
    'FOODIE_PASTEIS_2025',
    'Food Court - Dessert Station',
    '🥮'
  );

  insertActivity.run(
    'Sample Caldo Verde',
    'Try this traditional Portuguese green soup made with potatoes, kale, and chorizo.',
    'foodie',
    100,
    'FOODIE_CALDO_2025',
    'Food Court - Station 2',
    '🍲'
  );

  // Activities - Culture Keeper
  insertActivity.run(
    'Watch Fado Performance',
    'Experience UNESCO Intangible Cultural Heritage - the soulful Portuguese music tradition.',
    'culture',
    150,
    'CULTURE_FADO_2025',
    'Main Stage',
    '🎭'
  );

  insertActivity.run(
    'Learn 5 Portuguese Words',
    'Complete the pronunciation quiz and learn essential Portuguese phrases.',
    'culture',
    75,
    'CULTURE_LANGUAGE_2025',
    'Language Learning Corner',
    '🗣️'
  );

  insertActivity.run(
    'Share Your Heritage Story',
    'Record a 30-60 second video or audio sharing your family\'s Portuguese connection.',
    'culture',
    100,
    'CULTURE_STORY_2025',
    'Story Booth',
    '📖'
  );

  // Activities - Futebol Fan
  insertActivity.run(
    'Play Panna Challenge',
    'Test your soccer skills in the traditional Dutch street soccer game.',
    'futebol',
    125,
    'FUTEBOL_PANNA_2025',
    'Futebol Zone',
    '⚽'
  );

  insertActivity.run(
    'Answer 3 Soccer Trivia Questions',
    'Show your knowledge of Portuguese soccer history and legends.',
    'futebol',
    75,
    'FUTEBOL_TRIVIA_2025',
    'Trivia Station',
    '🏆'
  );

  insertActivity.run(
    'AR Photo with Ronaldo',
    'Take an augmented reality photo with Cristiano Ronaldo.',
    'futebol',
    100,
    'FUTEBOL_AR_RONALDO_2025',
    'AR Photo Booth',
    '📸'
  );

  // Activities - Social Connector
  insertActivity.run(
    'Join a Family Group',
    'Connect with your family and compete together on the leaderboard.',
    'social',
    50,
    'SOCIAL_FAMILY_2025',
    'Registration Desk',
    '👨‍👩‍👧‍👦'
  );

  insertActivity.run(
    'Share on Social Media',
    'Share your Carassauga experience on social media.',
    'social',
    75,
    'SOCIAL_SHARE_2025',
    'Anywhere',
    '📱'
  );

  insertActivity.run(
    'Make a New Friend',
    'Meet someone new and scan their QR code to connect.',
    'social',
    100,
    'SOCIAL_FRIEND_2025',
    'Anywhere',
    '🤝'
  );

  insertActivity.run(
    'Attend 2 Different Events',
    'Experience the variety of Portuguese culture by attending multiple events.',
    'social',
    150,
    'SOCIAL_EVENTS_2025',
    'Event Venues',
    '🎪'
  );

  insertActivity.run(
    'Complete the Festival Loop',
    'Visit all four corners of the pavilion.',
    'social',
    100,
    'SOCIAL_LOOP_2025',
    'Pavilion',
    '🗺️'
  );

  // Badges
  const insertBadge = db.prepare(`
    INSERT INTO badges (name, description, category, icon_emoji, badge_type, unlock_criteria, sort_order) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertBadge.run(
    'Foodie Explorer',
    'Tried 3 different Portuguese dishes',
    'foodie',
    '🍴',
    'quest',
    JSON.stringify({ category: 'foodie', required_activities: 3 }),
    1
  );

  insertBadge.run(
    'Culture Keeper',
    'Completed 3 cultural activities',
    'culture',
    '🎭',
    'quest',
    JSON.stringify({ category: 'culture', required_activities: 3 }),
    2
  );

  insertBadge.run(
    'Futebol Fan',
    'Completed 3 soccer activities',
    'futebol',
    '⚽',
    'quest',
    JSON.stringify({ category: 'futebol', required_activities: 3 }),
    3
  );

  insertBadge.run(
    'Social Connector',
    'Completed 4 social activities',
    'social',
    '🤝',
    'quest',
    JSON.stringify({ category: 'social', required_activities: 4 }),
    4
  );

  insertBadge.run(
    'First Steps',
    'Completed your first activity',
    'special',
    '🌟',
    'special',
    JSON.stringify({ total_activities: 1 }),
    5
  );

  insertBadge.run(
    'Rising Star',
    'Reached 100 points',
    'special',
    '⭐',
    'special',
    JSON.stringify({ total_points: 100 }),
    6
  );

  insertBadge.run(
    'Festival Champion',
    'Reached 500 points',
    'special',
    '🏆',
    'special',
    JSON.stringify({ total_points: 500 }),
    7
  );

  insertBadge.run(
    'Legend',
    'Reached 1000 points',
    'special',
    '👑',
    'special',
    JSON.stringify({ total_points: 1000 }),
    8
  );

  insertBadge.run(
    'Early Bird',
    'First 100 people to register',
    'special',
    '🐦',
    'special',
    JSON.stringify({ registration_rank: 100 }),
    9
  );

  insertBadge.run(
    'Completionist',
    'Completed all 14 activities',
    'special',
    '💯',
    'special',
    JSON.stringify({ total_activities: 14 }),
    10
  );

  insertBadge.run(
    'Family First',
    'Joined a family group',
    'social',
    '👨‍👩‍👧‍👦',
    'special',
    JSON.stringify({ has_family_group: true }),
    11
  );

  insertBadge.run(
    'Trendsetter',
    'Shared on social media 3 times',
    'social',
    '📱',
    'special',
    JSON.stringify({ social_shares: 3 }),
    12
  );

  // Events
  const insertEvent = db.prepare(`
    INSERT INTO events (name, description, start_time, end_time, location, event_type, is_live, capacity) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const today = new Date();
  const eventDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0); // 2pm today

  insertEvent.run(
    'Traditional Fado Performance',
    'Experience the soulful sounds of Portuguese Fado music.',
    new Date(eventDate.getTime()).toISOString(),
    new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(), // +1 hour
    'Main Stage',
    'performance',
    1,
    200
  );

  insertEvent.run(
    'Portuguese Language Workshop',
    'Learn basic Portuguese phrases and pronunciation.',
    new Date(eventDate.getTime() + 2 * 60 * 60 * 1000).toISOString(), // +2 hours
    new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
    'Workshop Area',
    'activity',
    0,
    50
  );

  insertEvent.run(
    'Bacalhau Cooking Demo',
    'Watch a chef prepare the famous Bacalhau à Brás.',
    new Date(eventDate.getTime() + 4 * 60 * 60 * 1000).toISOString(), // +4 hours
    new Date(eventDate.getTime() + 5 * 60 * 60 * 1000).toISOString(), // +5 hours
    'Food Court',
    'demo',
    0,
    75
  );

  insertEvent.run(
    'Panna Soccer Tournament',
    'Compete in the traditional Dutch street soccer game.',
    new Date(eventDate.getTime() + 3 * 60 * 60 * 1000).toISOString(), // +3 hours
    new Date(eventDate.getTime() + 5 * 60 * 60 * 1000).toISOString(), // +5 hours
    'Futebol Zone',
    'activity',
    0,
    32
  );

  insertEvent.run(
    'Portuguese History Talk',
    'Learn about Portugal\'s Age of Discovery and cultural heritage.',
    new Date(eventDate.getTime() + 6 * 60 * 60 * 1000).toISOString(), // +6 hours
    new Date(eventDate.getTime() + 7 * 60 * 60 * 1000).toISOString(), // +7 hours
    'Conference Room',
    'talk',
    0,
    100
  );

  insertEvent.run(
    'Evening Fado Show',
    'Spectacular evening performance by renowned Fado artists.',
    new Date(eventDate.getTime() + 8 * 60 * 60 * 1000).toISOString(), // +8 hours
    new Date(eventDate.getTime() + 10 * 60 * 60 * 1000).toISOString(), // +10 hours
    'Main Stage',
    'performance',
    0,
    300
  );

  console.log('✅ Database seeded successfully!');
  console.log('📊 Summary:');
  console.log('   - 3 family groups');
  console.log('   - 4 users');
  console.log('   - 14 activities (3 foodie, 3 culture, 3 futebol, 5 social)');
  console.log('   - 12 badges');
  console.log('   - 6 events');
};

export default db;

