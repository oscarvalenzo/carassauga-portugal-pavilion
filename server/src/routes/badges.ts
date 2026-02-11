import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const badgeRouter = Router();

badgeRouter.use(authMiddleware);

// GET /api/badges - Get all badges
badgeRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await query('SELECT * FROM badges WHERE is_secret = false ORDER BY sort_order');
  res.json({ success: true, badges: result.rows });
}));

// GET /api/badges/earned - Get user's earned badges
badgeRouter.get('/earned', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT b.*, ub.earned_at 
     FROM user_badges ub 
     JOIN badges b ON ub.badge_id = b.id 
     WHERE ub.user_id = $1 
     ORDER BY ub.earned_at DESC`,
    [req.userId]
  );
  res.json({ success: true, badges: result.rows });
}));

