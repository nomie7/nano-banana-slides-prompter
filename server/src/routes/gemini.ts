import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { Context, Next } from 'hono';
import {
  generateSlideImage,
  generateSlideImages,
  testGeminiConnection,
  getDefaultGeminiConfig,
} from '../services/geminiImageClient';

export const geminiRouter = new Hono();

// Simple in-memory rate limiter for Gemini endpoints
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max requests per window

function getRateLimitKey(c: Context): string {
  return c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'anonymous';
}

async function rateLimitMiddleware(c: Context, next: Next) {
  const key = getRateLimitKey(c);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (record && now < record.resetTime) {
    if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
      return c.json({ success: false, error: 'Rate limit exceeded. Try again later.' }, 429);
    }
    record.count++;
  } else {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }

  // Cleanup old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  await next();
}

// Helper to get effective API key (server-side takes priority)
function getEffectiveApiKey(clientKey?: string): string | undefined {
  const serverKey = process.env.GEMINI_API_KEY;
  return serverKey || clientKey;
}

// Schema for single image generation
const generateImageSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  baseURL: z.string().url().optional(),
});

// Schema for batch image generation
const generateImagesSchema = z.object({
  prompts: z.array(z.string().min(1)).min(1).max(10, 'Maximum 10 prompts allowed'),
  apiKey: z.string().optional(),
  model: z.string().optional(),
  baseURL: z.string().url().optional(),
});

// Schema for connection test
const testConnectionSchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
  baseURL: z.string().url().optional(),
});

/**
 * POST /gemini/generate-image
 * Generate a single slide image from prompt
 */
geminiRouter.post(
  '/generate-image',
  rateLimitMiddleware,
  zValidator('json', generateImageSchema),
  async (c) => {
    const { prompt, apiKey: clientApiKey, model, baseURL } = c.req.valid('json');
    const apiKey = getEffectiveApiKey(clientApiKey);

    if (!apiKey) {
      return c.json(
        {
          success: false,
          error: 'API key is required. Configure GEMINI_API_KEY on server or provide in settings.',
        },
        400
      );
    }

    const result = await generateSlideImage(prompt, { apiKey, model, baseURL });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      images: result.images,
    });
  }
);

/**
 * POST /gemini/generate-images
 * Generate multiple slide images from prompts (batch)
 */
geminiRouter.post(
  '/generate-images',
  rateLimitMiddleware,
  zValidator('json', generateImagesSchema),
  async (c) => {
    const { prompts, apiKey: clientApiKey, model, baseURL } = c.req.valid('json');
    const apiKey = getEffectiveApiKey(clientApiKey);

    if (!apiKey) {
      return c.json(
        {
          success: false,
          error: 'API key is required. Configure GEMINI_API_KEY on server or provide in settings.',
        },
        400
      );
    }

    const { results, totalSuccess, totalFailed } = await generateSlideImages(prompts, {
      apiKey,
      model,
      baseURL,
    });

    return c.json({
      success: totalFailed === 0,
      results,
      summary: {
        total: prompts.length,
        success: totalSuccess,
        failed: totalFailed,
      },
    });
  }
);

/**
 * POST /gemini/test-connection
 * Test Gemini API connection with provided key
 */
geminiRouter.post('/test-connection', zValidator('json', testConnectionSchema), async (c) => {
  const { apiKey, baseURL } = c.req.valid('json');

  const result = await testGeminiConnection({ apiKey, baseURL });

  if (!result.success) {
    return c.json({ success: false, error: result.error }, 400);
  }

  return c.json({ success: true, message: 'Connection successful' });
});

/**
 * GET /gemini/config
 * Get default Gemini configuration (without exposing API key)
 */
geminiRouter.get('/config', (c) => {
  const config = getDefaultGeminiConfig();
  return c.json(config);
});
