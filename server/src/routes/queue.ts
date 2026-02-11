import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { query } from '../config/database';
import redis from '../config/redis';
import { Request, Response } from 'express';

export const queueRouter = Router();

queueRouter.use(authMiddleware);

// POST /api/queue/join - Join virtual queue
queueRouter.post('/join', asyncHandler(async (req: Request, res: Response) => {
  const { station_name, phone_number } = req.body;
  const userId = req.userId!;
  
  // Get current queue length
  const queueLength = await query(
    'SELECT COUNT(*) as count FROM queues WHERE station_name = $1 AND status = $2',
    [station_name, 'waiting']
  );
  
  const position = parseInt(queueLength.rows[0].count) + 1;
  const estimatedWait = position * 3; // 3 minutes per person
  
  // Add to queue
  const result = await query(
    `INSERT INTO queues (station_name, user_id, position, phone_number, estimated_wait_minutes) 
     VALUES ($1, $2, $3, $4, $5) 
     RETURNING *`,
    [station_name, userId, position, phone_number, estimatedWait]
  );
  
  res.json({
    success: true,
    queue: result.rows[0],
    message: `You're #${position} in line. Estimated wait: ${estimatedWait} minutes`
  });
}));

// DELETE /api/queue/leave - Leave queue
queueRouter.delete('/leave', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  
  await query(
    'UPDATE queues SET status = $1 WHERE user_id = $2 AND status = $3',
    ['cancelled', userId, 'waiting']
  );
  
  res.json({ success: true, message: 'Left queue successfully' });
}));

// GET /api/queue/position - Get current position
queueRouter.get('/position', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId!;
  
  const result = await query(
    'SELECT * FROM queues WHERE user_id = $1 AND status = $2',
    [userId, 'waiting']
  );
  
  if (result.rows.length === 0) {
    res.json({ success: true, in_queue: false });
    return;
  }
  
  res.json({ success: true, in_queue: true, queue: result.rows[0] });
}));

// GET /api/queue/station/:stationName - Get station queue status
queueRouter.get('/station/:stationName', asyncHandler(async (req: Request, res: Response) => {
  const stationName = req.params.stationName;
  
  const result = await query(
    `SELECT COUNT(*) as count, AVG(estimated_wait_minutes) as avg_wait 
     FROM queues 
     WHERE station_name = $1 AND status = $2`,
    [stationName, 'waiting']
  );
  
  const queueLength = parseInt(result.rows[0].count);
  const avgWait = result.rows[0].avg_wait || 0;
  
  res.json({ 
    success: true, 
    station_name: stationName,
    queue_length: queueLength,
    estimated_wait: Math.round(avgWait)
  });
}));

