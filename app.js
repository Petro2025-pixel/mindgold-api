import express from 'express';
import { setupSecurity } from './middlewares/security.js';
import apiRouter from './routes/index.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

/**
 * Express Application Instance.
 * Configures global middlewares, security layers, API routing, and centralized error handling.
 *
 * @type {import('express').Application}
 */
const app = express();

// Base Middlewares
app.use(express.json());

// Security Configuration (CORS, Helmet, Rate Limiting, Mongo Sanitize)
setupSecurity(app);

// Health Check Endpoint
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// API Routing (подключает все роуты: auth, quizzes, game)
app.use('/api/v1', apiRouter);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

export default app;