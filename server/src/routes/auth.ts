import { Router } from 'express';
import { register, login, refreshToken, getProfile } from '../controllers/authController';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { authMiddleware } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

export const authRouter = Router();

// POST /api/auth/register - Register new user
authRouter.post('/register', validate(registerSchema), asyncHandler(register));

// POST /api/auth/login - Login user
authRouter.post('/login', validate(loginSchema), asyncHandler(login));

// POST /api/auth/refresh - Refresh JWT token
authRouter.post('/refresh', authMiddleware, asyncHandler(refreshToken));

// POST /api/auth/refresh-token - Alias for refresh
authRouter.post('/refresh-token', authMiddleware, asyncHandler(refreshToken));

// GET /api/auth/me - Get current user profile
authRouter.get('/me', authMiddleware, asyncHandler(getProfile));

