import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const activityRouter = Router();

// GET /api/activities - Get all activities
activityRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM activities WHERE is_active = true ORDER BY category, id');
  res.json({ success: true, activities: result.rows });
}));

// GET /api/activities/:id - Get activity by ID
activityRouter.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM activities WHERE id = $1', [req.params.id]);
  if (result.rows.length === 0) {
    res.status(404).json({ error: 'Activity not found' });
    return;
  }
  res.json({ success: true, activity: result.rows[0] });
}));

// POST /api/activities/complete - Complete an activity by QR code
activityRouter.post('/complete', authMiddleware, asyncHandler(async (req: Request, res: Response) => {
  const { qr_code } = req.body;
  const userId = req.userId;

  if (!qr_code) {
    res.status(400).json({ error: 'QR code is required' });
    return;
  }

  // Find the activity by QR code
  const activityResult = await query('SELECT * FROM activities WHERE qr_code = $1 AND is_active = true', [qr_code]);
  
  if (activityResult.rows.length === 0) {
    res.status(404).json({ error: 'Invalid QR code or activity not found' });
    return;
  }

  const activity = activityResult.rows[0];

  // Check if user already completed this activity
  const existingResult = await query(
    'SELECT * FROM user_activities WHERE user_id = $1 AND activity_id = $2',
    [userId, activity.id]
  );

  if (existingResult.rows.length > 0) {
    res.status(400).json({ error: 'Activity already completed' });
    return;
  }

  // Record activity completion
  await query(
    `INSERT INTO user_activities (user_id, activity_id, points_earned) 
     VALUES ($1, $2, $3)`,
    [userId, activity.id, activity.points]
  );

  // Get updated user info (trigger will have updated points and level)
  const userResult = await query('SELECT * FROM users WHERE id = $1', [userId]);
  const user = userResult.rows[0];

  // Check for badge unlocks based on category
  const categoryBadgeMap: { [key: string]: string } = {
    'foodie': 'Foodie Explorer',
    'culture': 'Culture Keeper',
    'futebol': 'Futebol Fan',
    'social': 'Social Connector',
  };

  const badgeName = categoryBadgeMap[activity.category];
  let unlockedBadge = null;

  if (badgeName) {
    // Count completed activities in this category
    const categoryCountResult = await query(
      `SELECT COUNT(*) as count FROM user_activities ua
       JOIN activities a ON ua.activity_id = a.id
       WHERE ua.user_id = $1 AND a.category = $2`,
      [userId, activity.category]
    );

    const categoryCount = parseInt(categoryCountResult.rows[0].count);

    // Unlock badge if user completed 3 activities in the category
    if (categoryCount >= 3) {
      const badgeResult = await query(
        'SELECT * FROM badges WHERE name = $1',
        [badgeName]
      );

      if (badgeResult.rows.length > 0) {
        const badge = badgeResult.rows[0];

        // Check if badge not already earned
        const existingBadgeResult = await query(
          'SELECT * FROM user_badges WHERE user_id = $1 AND badge_id = $2',
          [userId, badge.id]
        );

        if (existingBadgeResult.rows.length === 0) {
          await query(
            'INSERT INTO user_badges (user_id, badge_id) VALUES ($1, $2)',
            [userId, badge.id]
          );
          unlockedBadge = badge;
        }
      }
    }
  }

  res.json({
    success: true,
    message: `Activity completed! +${activity.points} points`,
    points_earned: activity.points,
    activity: {
      id: activity.id,
      name: activity.name,
      category: activity.category,
    },
    user: {
      id: user.id,
      display_name: user.display_name,
      total_points: user.total_points,
      level: user.level,
    },
    badge_unlocked: unlockedBadge ? {
      id: unlockedBadge.id,
      name: unlockedBadge.name,
      description: unlockedBadge.description,
      icon_emoji: unlockedBadge.icon_emoji,
    } : null,
  });
}));

