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

// CORS Configuration (Allow localhost, LAN IP network origins, and dev devices with credentials)
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // Allow localhost, 127.0.0.1, or any LAN network IP (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
    const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin);

    if (isLocalOrLan || origin === config.clientUrl) {
      return callback(null, true);
    }

    // In development, permit all origins for smooth testing on LAN devices
    if (config.nodeEnv !== 'production') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
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
