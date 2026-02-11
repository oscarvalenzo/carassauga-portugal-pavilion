import { Request, Response } from 'express';
import { query } from '../config/database';

/**
 * Get all quests with activities
 * GET /api/quests
 */
export const getQuests = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get all activities grouped by category
    const activitiesResult = await query(
      `SELECT 
        a.id, a.name, a.description, a.category, a.points, 
        a.qr_code, a.location, a.icon_emoji,
        CASE WHEN ua.id IS NOT NULL THEN true ELSE false END as is_completed,
        ua.completed_at
       FROM activities a
       LEFT JOIN user_activities ua ON a.id = ua.activity_id AND ua.user_id = $1
       WHERE a.is_active = true
       ORDER BY a.category, a.id`,
      [userId]
    );

    // Group activities by category
    const quests: any = {
      foodie: { category: 'foodie', name: 'Foodie Explorer', emoji: '🍴', activities: [] },
      culture: { category: 'culture', name: 'Culture Keeper', emoji: '🎭', activities: [] },
      futebol: { category: 'futebol', name: 'Futebol Fan', emoji: '⚽', activities: [] },
      social: { category: 'social', name: 'Social Connector', emoji: '🤝', activities: [] }
    };

    activitiesResult.rows.forEach(activity => {
      if (quests[activity.category]) {
        quests[activity.category].activities.push({
          id: activity.id,
          name: activity.name,
          description: activity.description,
          points: activity.points,
          location: activity.location,
          icon_emoji: activity.icon_emoji,
          is_completed: activity.is_completed,
          completed_at: activity.completed_at
        });
      }
    });

    // Calculate progress for each quest
    Object.values(quests).forEach((quest: any) => {
      const total = quest.activities.length;
      const completed = quest.activities.filter((a: any) => a.is_completed).length;
      quest.progress = {
        total,
        completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });

    res.json({
      success: true,
      quests: Object.values(quests)
    });
  } catch (error) {
    console.error('Get quests error:', error);
    res.status(500).json({ error: 'Failed to get quests' });
  }
};

/**
 * Get user's quest progress
 * GET /api/quests/progress
 */
export const getQuestProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId!;

    // Get user's total points and level
    const userResult = await query(
      'SELECT total_points, level FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    // Get completed activities by category
    const activitiesResult = await query(
      `SELECT 
        a.category,
        COUNT(*) as completed_count,
        SUM(a.points) as points_earned
       FROM user_activities ua
       JOIN activities a ON ua.activity_id = a.id
       WHERE ua.user_id = $1
       GROUP BY a.category`,
      [userId]
    );

    // Get total activities by category
    const totalResult = await query(
      `SELECT category, COUNT(*) as total_count
       FROM activities
       WHERE is_active = true
       GROUP BY category`
    );

    // Build progress object
    const progress: any = {};
    
    totalResult.rows.forEach(row => {
      progress[row.category] = {
        total: parseInt(row.total_count),
        completed: 0,
        points_earned: 0
      };
    });

    activitiesResult.rows.forEach(row => {
      if (progress[row.category]) {
        progress[row.category].completed = parseInt(row.completed_count);
        progress[row.category].points_earned = parseInt(row.points_earned);
      }
    });

    // Get earned badges
    const badgesResult = await query(
      `SELECT 
        b.id, b.name, b.icon_emoji, b.badge_type,
        ub.earned_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      progress: {
        total_points: user.total_points,
        level: user.level,
        quests: progress,
        badges: badgesResult.rows
      }
    });
  } catch (error) {
    console.error('Get quest progress error:', error);
    res.status(500).json({ error: 'Failed to get quest progress' });
  }
};

/**
 * Complete an activity (scan QR code)
 * POST /api/quests/complete
 */
export const completeActivity = async (req: Request, res: Response): Promise<void> => {
  const { activity_id, qr_code } = req.body;
  const userId = req.userId!;

  try {
    // Verify QR code and get activity details
    const activityResult = await query(
      'SELECT id, name, category, points, qr_code FROM activities WHERE id = $1 AND qr_code = $2',
      [activity_id, qr_code]
    );

    if (activityResult.rows.length === 0) {
      res.status(400).json({ error: 'Invalid QR code or activity' });
      return;
    }

    const activity = activityResult.rows[0];

    // Check if already completed
    const existingResult = await query(
      'SELECT id FROM user_activities WHERE user_id = $1 AND activity_id = $2',
      [userId, activity_id]
    );

    if (existingResult.rows.length > 0) {
      res.status(400).json({ error: 'Activity already completed' });
      return;
    }

    // Complete activity (trigger will auto-update user points)
    await query(
      'INSERT INTO user_activities (user_id, activity_id, points_earned) VALUES ($1, $2, $3)',
      [userId, activity_id, activity.points]
    );

    // Get updated user info
    const userResult = await query(
      'SELECT total_points, level FROM users WHERE id = $1',
      [userId]
    );

    const user = userResult.rows[0];

    // Check for newly unlocked badges
    const newBadges = await query(
      `SELECT b.id, b.name, b.icon_emoji, b.description
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1 AND ub.earned_at > NOW() - INTERVAL '10 seconds'`,
      [userId]
    );

    res.json({
      success: true,
      message: `Great job! You earned ${activity.points} points!`,
      activity: {
        id: activity.id,
        name: activity.name,
        category: activity.category
      },
      points_earned: activity.points,
      total_points: user.total_points,
      level: user.level,
      badges_unlocked: newBadges.rows
    });
  } catch (error) {
    console.error('Complete activity error:', error);
    res.status(500).json({ error: 'Failed to complete activity' });
  }
};

