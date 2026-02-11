import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const leaderboardRouter = Router();

leaderboardRouter.use(authMiddleware);

// GET /api/leaderboard/family/:familyId
leaderboardRouter.get('/family/:familyId', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT display_name, total_points, family_rank, badges_earned, activities_completed
     FROM leaderboard_view 
     WHERE family_group_id = $1 
     ORDER BY family_rank`,
    [req.params.familyId]
  );
  res.json({ success: true, leaderboard: result.rows });
}));

// GET /api/leaderboard/pavilion
leaderboardRouter.get('/pavilion', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT display_name, total_points, global_rank, badges_earned, activities_completed
     FROM leaderboard_view 
     ORDER BY global_rank 
     LIMIT 20`
  );
  res.json({ success: true, leaderboard: result.rows });
}));

// GET /api/leaderboard/global - Alias for pavilion
leaderboardRouter.get('/global', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT display_name, total_points, global_rank, badges_earned, activities_completed
     FROM leaderboard_view 
     ORDER BY global_rank 
     LIMIT 20`
  );
  res.json({ success: true, leaderboard: result.rows });
}));

