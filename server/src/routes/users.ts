import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const userRouter = Router();

userRouter.use(authMiddleware);

// GET /api/users/me
userRouter.get('/me', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [req.userId]);
  res.json({ success: true, user: result.rows[0] });
}));

// PUT /api/users/me
userRouter.put('/me', asyncHandler(async (req: Request, res: Response) => {
  const { display_name, avatar_url, phone_number } = req.body;
  
  let updateQuery = 'UPDATE users SET ';
  const updates = [];
  const params: any[] = [];
  let paramCount = 1;
  
  if (display_name !== undefined) {
    updates.push(`display_name = $${paramCount}`);
    params.push(display_name);
    paramCount++;
  }
  
  if (avatar_url !== undefined) {
    updates.push(`avatar_url = $${paramCount}`);
    params.push(avatar_url);
    paramCount++;
  }
  
  if (phone_number !== undefined) {
    updates.push(`phone_number = $${paramCount}`);
    params.push(phone_number);
    paramCount++;
  }
  
  if (updates.length === 0) {
    res.status(400).json({ error: 'No fields to update' });
    return;
  }
  
  updateQuery += updates.join(', ') + ` WHERE id = $${paramCount} RETURNING *`;
  params.push(req.userId);
  
  const result = await query(updateQuery, params);
  res.json({ success: true, user: result.rows[0] });
}));

// GET /api/users/:userId/stats
userRouter.get('/:userId/stats', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.params.userId;
  
  const [userResult, badgeResult, activityResult] = await Promise.all([
    query('SELECT * FROM users WHERE id = $1', [userId]),
    query('SELECT COUNT(*) as count FROM user_badges WHERE user_id = $1', [userId]),
    query('SELECT COUNT(*) as count FROM user_activities WHERE user_id = $1', [userId]),
  ]);
  
  if (userResult.rows.length === 0) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  
  res.json({
    success: true,
    stats: {
      user: userResult.rows[0],
      badges_earned: parseInt(badgeResult.rows[0].count),
      activities_completed: parseInt(activityResult.rows[0].count),
    }
  });
}));

// POST /api/users/family-group - Join a family group
userRouter.post('/family-group', asyncHandler(async (req: Request, res: Response) => {
  const { code } = req.body;
  
  if (!code) {
    res.status(400).json({ error: 'Family group code is required' });
    return;
  }
  
  // Find the family group
  const familyResult = await query(
    'SELECT * FROM family_groups WHERE invite_code = $1',
    [code.toUpperCase()]
  );
  
  if (familyResult.rows.length === 0) {
    res.status(404).json({ error: 'Invalid family group code' });
    return;
  }
  
  const familyGroup = familyResult.rows[0];
  
  // Update user's family group
  await query(
    'UPDATE users SET family_group_id = $1 WHERE id = $2',
    [familyGroup.id, req.userId]
  );
  
  res.json({
    success: true,
    message: `Joined ${familyGroup.name}!`,
    family_group: familyGroup
  });
}));

// GET /api/users/family-group - Get family group members
userRouter.get('/family-group', asyncHandler(async (req: Request, res: Response) => {
  // Get user's family group
  const userResult = await query(
    'SELECT family_group_id FROM users WHERE id = $1',
    [req.userId]
  );
  
  if (!userResult.rows[0].family_group_id) {
    res.json({ success: true, family_group: null, members: [] });
    return;
  }
  
  const familyGroupId = userResult.rows[0].family_group_id;
  
  // Get family group details and members
  const [groupResult, membersResult] = await Promise.all([
    query('SELECT * FROM family_groups WHERE id = $1', [familyGroupId]),
    query(
      `SELECT id, display_name, avatar_url, total_points, level 
       FROM users 
       WHERE family_group_id = $1 
       ORDER BY total_points DESC`,
      [familyGroupId]
    ),
  ]);
  
  res.json({
    success: true,
    family_group: groupResult.rows[0],
    members: membersResult.rows
  });
}));

