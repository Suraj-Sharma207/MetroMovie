import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import movieRoutes from './routes/movieRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import authRoutes from './routes/authRoutes.js';

// CineScope Server App
const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration (Strict origin with credentials allowed)
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Body & Cookie Parsers
app.use(express.json());
app.use(cookieParser());

// Request logging in development
if (config.nodeEnv !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Session Validation Middleware (Attaches req.user and req.session, never blocks guests)
app.use(sessionMiddleware);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'movie-discovery-server',
    version: '1.0.0'
  });
});

// Mount Resource Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

// 404 Handler for unmapped API routes
app.use('/api/*', (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
      statusCode: 404
    }
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
