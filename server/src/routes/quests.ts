import { Router } from 'express';
import { 
  getQuests, 
  getQuestProgress, 
  completeActivity 
} from '../controllers/questController';
import { authMiddleware } from '../middleware/auth';
import { validate, completeActivitySchema } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';

export const questRouter = Router();

// All quest routes require authentication
questRouter.use(authMiddleware);

// GET /api/quests - Get all quest categories with activities
questRouter.get('/', asyncHandler(getQuests));

// GET /api/quests/progress - Get user's quest progress
questRouter.get('/progress', asyncHandler(getQuestProgress));

// POST /api/quests/complete - Complete an activity
questRouter.post('/complete', validate(completeActivitySchema), asyncHandler(completeActivity));

