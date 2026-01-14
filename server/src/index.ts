// DOM polyfills must be imported first (before pdfjs-dist loads)
import './polyfills/dom-matrix-polyfill';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { promptRouter } from './routes/prompt';
import { extractRouter } from './routes/extract';
import { sessionsRouter } from './routes/sessions';
import { settingsRouter } from './routes/settings';
import { optimizeRouter } from './routes/optimize';
import { geminiRouter } from './routes/gemini';
import importRoutes from './routes/import';

const app = new Hono();

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: (origin) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return origin as string;
      // Allow localhost with any port (for Electron dynamic ports)
      if (/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|\[::\])(:\d+)?$/.test(origin)) {
        return origin;
      }
      // Allow file:// protocol for Electron production
      if (origin.startsWith('file://')) return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.get('/health', (c) => c.json({ status: 'ok', timestamp: Date.now(), version: '1.0.0' }));

app.route('/api', promptRouter);
app.route('/api', extractRouter);
app.route('/api', sessionsRouter);
app.route('/api', settingsRouter);
app.route('/api', optimizeRouter);
app.route('/api/gemini', geminiRouter);
app.route('/api/import', importRoutes);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ success: false, error: err.message || 'Internal server error' }, 500);
});

// Handle PORT=0 explicitly (dynamic allocation) - don't treat 0 as falsy
const envPort = process.env.PORT;
const requestedPort = envPort === '0' ? 0 : Number(envPort) || 3001;

// Try port binding with retry logic for production reliability
const MAX_PORT_RETRIES = 5;
let server: ReturnType<typeof Bun.serve> | null = null;
let boundPort = requestedPort;

for (let attempt = 0; attempt < MAX_PORT_RETRIES; attempt++) {
  // For dynamic allocation (PORT=0), use base port 3001 + attempt for retry
  const basePort = requestedPort === 0 ? 3001 : requestedPort;
  const tryPort = basePort + attempt;
  try {
    server = Bun.serve({
      port: tryPort,
      fetch: app.fetch,
      idleTimeout: 255,
    });
    boundPort = server.port ?? tryPort;
    break; // Success - exit retry loop
  } catch (err: unknown) {
    const error = err as { code?: string };
    if (error.code === 'EADDRINUSE' && attempt < MAX_PORT_RETRIES - 1) {
      console.warn(`Port ${tryPort} in use, trying ${tryPort + 1}...`);
      continue;
    }
    throw err; // Re-throw if not EADDRINUSE or max retries reached
  }
}

if (!server) {
  throw new Error(`Failed to bind server after ${MAX_PORT_RETRIES} attempts`);
}

// Output ACTUAL bound port for Electron IPC detection (AFTER successful bind)
console.log(`PORT:${boundPort}`);
console.log(`Server running at http://localhost:${boundPort}`);

export default server;
