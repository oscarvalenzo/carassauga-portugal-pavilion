import { Router } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import { Request, Response } from 'express';

export const eventRouter = Router();

// GET /api/events - Get upcoming events
eventRouter.get('/', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT * FROM events 
     WHERE end_time > NOW() 
     ORDER BY start_time LIMIT 20`
  );
  res.json({ success: true, events: result.rows });
}));

// GET /api/events/live - Get currently live events
eventRouter.get('/live', asyncHandler(async (req: Request, res: Response) => {
  const result = await query(
    `SELECT * FROM events 
     WHERE is_live = true OR (start_time <= NOW() AND end_time >= NOW())
     ORDER BY start_time`
  );
  res.json({ success: true, events: result.rows });
}));

