-- Carassauga Connect Database Seed Data
-- Populate database with initial activities, badges, and events
-- Version: 1.0.0

-- Clear existing data (for development only)
TRUNCATE TABLE 
  notifications_log,
  user_recipes,
  event_checkins,
  photos,
  queues,
  events,
  user_badges,
  badges,
  user_activities,
  activities,
  users,
  family_groups
RESTART IDENTITY CASCADE;

-- ========================================
-- FAMILY GROUPS (Sample Data)
-- ========================================
INSERT INTO family_groups (name, invite_code) VALUES
('Santos Family', 'SANTOS2025'),
('Silva Family', 'SILVA2025'),
('Costa Family', 'COSTA2025');

-- ========================================
-- SAMPLE USERS
-- ========================================
INSERT INTO users (email, display_name, family_group_id, total_points, level) VALUES
('maria@example.com', 'Maria Santos', 1, 650, 4),
('sam@example.com', 'Sam Santos', 1, 420, 3),
('sofia@example.com', 'Sofia Santos', 1, 850, 5),
('miguel@example.com', 'Miguel Silva', 2, 480, 3);

-- ========================================
-- ACTIVITIES - FOODIE EXPLORER
-- ========================================
INSERT INTO activities (name, description, category, points, qr_code, location, icon_emoji) VALUES
(
  'Try Bacalhau à Brás',
  'Taste this traditional Portuguese codfish dish made with eggs, onions, and shoestring potatoes. Learn about Portugal''s 15th-century codfish tradition.',
  'foodie',
  100,
  'FOODIE_BACALHAU_2025',
  'Food Court - Station 1',
  '🐟'
),
(
  'Taste Pastéis de Nata',
  'Enjoy the famous Portuguese custard tart with origins in the 18th century Jerónimos Monastery.',
  'foodie',
  100,
  'FOODIE_PASTEIS_2025',
  'Food Court - Dessert Station',
  '🥮'
),
(
  'Sample Caldo Verde',
  'Try this traditional Portuguese green soup made with potatoes, kale, and chorizo - the ultimate comfort food.',
  'foodie',
  100,
  'FOODIE_CALDO_2025',
  'Food Court - Station 2',
  '🍲'
);

-- ========================================
-- ACTIVITIES - CULTURE KEEPER
-- ========================================
INSERT INTO activities (name, description, category, points, qr_code, location, icon_emoji) VALUES
(
  'Watch Fado Performance',
  'Experience UNESCO Intangible Cultural Heritage - the soulful Portuguese music tradition dating back to the 1820s.',
  'culture',
  150,
  'CULTURE_FADO_2025',
  'Main Stage',
  '🎭'
),
(
  'Learn 5 Portuguese Words',
  'Complete the pronunciation quiz and learn essential Portuguese phrases to connect with your heritage.',
  'culture',
  75,
  'CULTURE_LANGUAGE_2025',
  'Language Learning Corner',
  '🗣️'
),
(
  'Share Your Heritage Story',
  'Record a 30-60 second video or audio sharing your family''s Portuguese connection and immigration story.',
  'culture',
  100,
  'CULTURE_STORY_2025',
  'Story Booth',
  '📖'
),
(
  'Find 3 Portuguese Symbols',
  'Complete the photo scavenger hunt! Find and photograph the Portuguese flag, Barcelos rooster, and azulejo tiles.',
  'culture',
  75,
  'CULTURE_SYMBOLS_2025',
  'Throughout Pavilion',
  '🔍'
);

-- ========================================
-- ACTIVITIES - FUTEBOL FAN
-- ========================================
INSERT INTO activities (name, description, category, points, qr_code, location, icon_emoji) VALUES
(
  'AR Photo with Cristiano Ronaldo',
  'Take an augmented reality photo with Portugal''s legendary footballer CR7 in his iconic celebration pose.',
  'futebol',
  100,
  'FUTEBOL_RONALDO_AR_2025',
  'AR Photo Wall',
  '⚽'
),
(
  'Football Trivia Challenge',
  'Test your knowledge of Portuguese football history! Answer 10 questions - score 7/10 or higher to pass.',
  'futebol',
  150,
  'FUTEBOL_TRIVIA_2025',
  'Trivia Zone',
  '🧠'
),
(
  'Panna Skills Challenge',
  'Complete the Portuguese street football nutmeg challenge! Pass the ball through the legs from 2 meters away.',
  'futebol',
  125,
  'FUTEBOL_PANNA_2025',
  'Skills Challenge Area',
  '🎯'
),
(
  'Learn World Cup History',
  'Explore Portugal''s journey from the 1966 semi-finals to modern glory - interactive timeline experience.',
  'futebol',
  75,
  'FUTEBOL_HISTORY_2025',
  'Heritage Wall',
  '🏆'
);

-- ========================================
-- ACTIVITIES - SOCIAL CONNECTOR (Unlocks at 500 pts)
-- ========================================
INSERT INTO activities (name, description, category, points, qr_code, location, icon_emoji, is_active) VALUES
(
  'Meet Another Portuguese-Canadian Family',
  'Exchange digital handshakes with another family group and build diaspora connections.',
  'social',
  200,
  'SOCIAL_FAMILY_2025',
  'Community Lounge',
  '🤝',
  true
),
(
  'Attend Q&A with Community Elder',
  'Join the scheduled talk and hear first-hand immigration stories from 1960s-1970s Portuguese immigrants.',
  'social',
  150,
  'SOCIAL_QA_2025',
  'Heritage Hall',
  '👴',
  true
),
(
  'Join Cultural Group',
  'Sign up for ongoing Portuguese cultural activities - dance groups, language classes, or social clubs.',
  'social',
  150,
  'SOCIAL_CLUB_2025',
  'Information Desk',
  '🌟',
  true
);

-- ========================================
-- BADGES
-- ========================================

-- Quest Completion Badges
INSERT INTO badges (name, description, icon_emoji, badge_type, unlock_criteria, sort_order) VALUES
(
  'Master Chef',
  'Complete all Foodie Explorer activities and taste the flavors of Portugal!',
  '🏆',
  'quest',
  '{"category": "foodie", "required_activities": 3}',
  1
),
(
  'Guardian of Heritage',
  'Complete all Culture Keeper activities and become a keeper of Portuguese traditions!',
  '🎖️',
  'quest',
  '{"category": "culture", "required_activities": 4}',
  2
),
(
  'Football Legend',
  'Complete all Futebol Fan activities and celebrate Portugal''s sporting excellence!',
  '⚽',
  'quest',
  '{"category": "futebol", "required_activities": 4}',
  3
),
(
  'Community Builder',
  'Complete all Social Connector activities and strengthen the Portuguese-Canadian community!',
  '🌟',
  'quest',
  '{"category": "social", "required_activities": 3}',
  4
);

-- Special Achievement Badges
INSERT INTO badges (name, description, icon_emoji, badge_type, unlock_criteria, sort_order) VALUES
(
  'First Timer',
  'Welcome! You''ve completed your very first activity at the Portugal Pavilion.',
  '🎉',
  'special',
  '{"type": "first_activity"}',
  5
),
(
  'Completionist',
  'Amazing! You''ve earned all 4 core quest badges - you''re a true Portuguese culture champion!',
  '💎',
  'special',
  '{"type": "all_quests", "required_badges": 4}',
  6
),
(
  'Social Star',
  'You''ve shared your Portuguese journey 5+ times on social media - spreading cultural awareness!',
  '📱',
  'special',
  '{"type": "social_shares", "required_shares": 5}',
  7
),
(
  'Speed Demon',
  'Incredible! You completed all 3 core quests in under 2 hours.',
  '⚡',
  'special',
  '{"type": "speed_run", "max_hours": 2}',
  8
),
(
  'Family Champion',
  'Your entire family completed at least 2 quests each - teamwork makes the dream work!',
  '👨‍👩‍👧‍👦',
  'special',
  '{"type": "family_achievement", "min_quests_per_member": 2}',
  9
);

-- Hidden Easter Egg Badges
INSERT INTO badges (name, description, icon_emoji, badge_type, unlock_criteria, sort_order, is_secret) VALUES
(
  'Secret Treasure',
  'You found the hidden QR code! Your curiosity and exploration are rewarded.',
  '🔍',
  'hidden',
  '{"type": "secret_qr", "code": "SECRET_TREASURE_2025"}',
  10,
  true
),
(
  'Translator Pro',
  'You successfully ordered food entirely in Portuguese - muito bem!',
  '🗣️',
  'hidden',
  '{"type": "portuguese_order"}',
  11,
  true
),
(
  'Dance Floor Star',
  'You joined the impromptu dance during the Fado performance - living the culture!',
  '💃',
  'hidden',
  '{"type": "dance_participation"}',
  12,
  true
);

-- ========================================
-- EVENTS / PERFORMANCES
-- ========================================
INSERT INTO events (name, description, start_time, end_time, location, event_type, capacity, image_url) VALUES
(
  'Traditional Fado Performance',
  'Experience the soul of Portugal through haunting Fado music performed by local Portuguese-Canadian artists. UNESCO Intangible Cultural Heritage of Humanity.',
  '2025-05-24 14:00:00',
  '2025-05-24 14:45:00',
  'Main Stage',
  'performance',
  200,
  '/images/events/fado-performance.jpg'
),
(
  'Portuguese Cooking Demo: Pastéis de Nata',
  'Learn the secrets of making perfect Portuguese custard tarts from a master baker. Recipe cards provided!',
  '2025-05-24 15:00:00',
  '2025-05-24 15:30:00',
  'Cooking Demo Area',
  'demo',
  50,
  '/images/events/cooking-demo.jpg'
),
(
  'Immigration Stories Q&A',
  'Hear first-hand accounts from Portuguese immigrants who arrived in Canada in the 1960s-1970s. Moderated discussion and Q&A.',
  '2025-05-24 16:00:00',
  '2025-05-24 17:00:00',
  'Heritage Hall',
  'talk',
  100,
  '/images/events/immigration-stories.jpg'
),
(
  'Portuguese Folk Dance Performance',
  'Colorful traditional folk dances from different regions of Portugal, performed in authentic costumes.',
  '2025-05-24 17:30:00',
  '2025-05-24 18:15:00',
  'Main Stage',
  'performance',
  200,
  '/images/events/folk-dance.jpg'
),
(
  'Football Skills Workshop',
  'Learn Portuguese-style futsal moves from local Portuguese-Canadian soccer coaches. All ages welcome!',
  '2025-05-24 18:30:00',
  '2025-05-24 19:15:00',
  'Skills Challenge Area',
  'activity',
  30,
  '/images/events/football-workshop.jpg'
),
(
  'Fado Performance (Evening)',
  'Second evening Fado performance featuring guest artists from Toronto''s Portuguese community.',
  '2025-05-24 20:00:00',
  '2025-05-24 20:45:00',
  'Main Stage',
  'performance',
  200,
  '/images/events/fado-evening.jpg'
);

-- ========================================
-- SAMPLE QUEST COMPLETIONS (for demo users)
-- ========================================

-- Maria Santos progress
INSERT INTO user_activities (user_id, activity_id, points_earned) VALUES
(1, 1, 100),  -- Bacalhau
(1, 2, 100),  -- Pastéis
(1, 4, 150),  -- Fado
(1, 6, 100),  -- Heritage Story
(1, 7, 75),   -- Symbols
(1, 8, 100);  -- AR Photo Ronaldo

-- Sam Santos progress
INSERT INTO user_activities (user_id, activity_id, points_earned) VALUES
(2, 1, 100),  -- Bacalhau
(2, 8, 100),  -- AR Photo Ronaldo
(2, 9, 150),  -- Trivia
(2, 10, 125); -- Panna Skills

-- Sofia Santos progress (most advanced)
INSERT INTO user_activities (user_id, activity_id, points_earned) VALUES
(3, 1, 100),  -- Bacalhau
(3, 2, 100),  -- Pastéis
(3, 3, 100),  -- Caldo Verde
(3, 4, 150),  -- Fado
(3, 5, 75),   -- Language
(3, 6, 100),  -- Heritage Story
(3, 7, 75),   -- Symbols
(3, 8, 100),  -- AR Photo Ronaldo
(3, 9, 150);  -- Trivia

-- ========================================
-- SAMPLE BADGES EARNED
-- ========================================

-- Maria earned First Timer and is working on quests
INSERT INTO user_badges (user_id, badge_id) VALUES
(1, 5);  -- First Timer

-- Sam earned First Timer
INSERT INTO user_badges (user_id, badge_id) VALUES
(2, 5);  -- First Timer

-- Sofia earned multiple badges
INSERT INTO user_badges (user_id, badge_id) VALUES
(3, 1),  -- Master Chef
(3, 2),  -- Guardian of Heritage
(3, 5);  -- First Timer

-- ========================================
-- SAMPLE EVENT CHECK-INS
-- ========================================
INSERT INTO event_checkins (user_id, event_id) VALUES
(1, 1),  -- Maria attended Fado
(3, 1),  -- Sofia attended Fado
(3, 2);  -- Sofia attended Cooking Demo

-- Refresh the materialized view
REFRESH MATERIALIZED VIEW leaderboard_view;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Database seeded successfully!';
  RAISE NOTICE '📊 Created: 14 activities, 12 badges, 6 events';
  RAISE NOTICE '👥 Sample users: Maria (650pts), Sam (420pts), Sofia (850pts)';
  RAISE NOTICE '🎯 Ready for testing!';
END $$;

