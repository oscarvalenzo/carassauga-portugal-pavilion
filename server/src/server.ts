import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize SQLite database
import { initializeSchema, seedData } from './config/sqlite';

// Import routes
import { authRouter } from './routes/auth';
import { userRouter } from './routes/users';
import { questRouter } from './routes/quests';
import { activityRouter } from './routes/activities';
import { badgeRouter } from './routes/badges';
import { leaderboardRouter } from './routes/leaderboard';
import { eventRouter } from './routes/events';
import { queueRouter } from './routes/queue';
import { recipeRouter } from './routes/recipes';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;

// Initialize database schema and seed data
console.log('🗄️  Initializing SQLite database...');
initializeSchema();
seedData();

// Security middleware
app.use(helmet());

// CORS configuration - Allow multiple frontend ports and production URLs
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://carassauga-app.web.app',
  'https://carassauga-app.firebaseapp.com',
  process.env.CLIENT_URL,
  process.env.RENDER_EXTERNAL_URL // Render automatically sets this
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) {
      console.log('CORS: Allowing request with no origin');
      return callback(null, true);
    }
    
    console.log('CORS: Checking origin:', origin);
    
    // In production, be more permissive
    if (process.env.NODE_ENV === 'production') {
      // Allow Firebase hosting URLs
      if (origin.includes('carassauga-app.web.app') || 
          origin.includes('carassauga-app.firebaseapp.com') ||
          origin.includes('onrender.com') ||
          allowedOrigins.includes(origin)) {
        console.log('CORS: Allowing origin (production):', origin);
        return callback(null, true);
      }
    }
    
    // Check allowed origins
    if (allowedOrigins.includes(origin)) {
      console.log('CORS: Allowing origin (allowed list):', origin);
      callback(null, true);
    } else {
      console.log('CORS: Blocking origin:', origin);
      console.log('CORS: Allowed origins:', allowedOrigins);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('dev'));

// Rate limiting - More lenient in development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000'), // 1000 requests per minute in dev
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/quests', questRouter);
app.use('/api/activities', activityRouter);
app.use('/api/badges', badgeRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/events', eventRouter);
app.use('/api/queue', queueRouter);
app.use('/api/recipes', recipeRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Carassauga API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});

export default app;
