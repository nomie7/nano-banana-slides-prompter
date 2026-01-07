import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { promptRouter } from './routes/prompt';
import { extractRouter } from './routes/extract';
import { sessionsRouter } from './routes/sessions';
import { settingsRouter } from './routes/settings';

const app = new Hono();

// Middleware
app.use('*', logger());

// CORS configuration
app.use(
  '/api/*',
  cors({
    origin: [
      'http://localhost:8080',
      'http://[::]:8080',
      'http://127.0.0.1:8080',
      'http://localhost:5173', // Vite default port
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

// Health check endpoint
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: Date.now(),
    version: '1.0.0',
  });
});

// API routes
app.route('/api', promptRouter);
app.route('/api', extractRouter);
app.route('/api', sessionsRouter);
app.route('/api', settingsRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      success: false,
      error: err.message || 'Internal server error',
    },
    500
  );
});

const port = Number(process.env.PORT) || 3001;

console.log(`Starting server on port ${port}...`);

export default {
  port,
  fetch: app.fetch,
  // Increase idle timeout for streaming SSE connections (default is 10s)
  // Max is 255 seconds (~4 min) to accommodate LLMs with long "thinking" phases
  idleTimeout: 255,
};

