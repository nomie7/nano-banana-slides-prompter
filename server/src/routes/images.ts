import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { writeFile, mkdir, readFile, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const imagesRouter = new Hono();

const IMAGES_DIR = path.join(process.cwd(), 'data', 'images');

// Session ID pattern from sessions.ts
const SESSION_ID_PATTERN =
  /^session_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}|\d+_[a-zA-Z0-9]+)$/;

// Filename pattern for generated slide images
const FILENAME_PATTERN = /^slide-\d+\.(png|jpg|webp)$/;

// Schema for save request
const saveImageSchema = z.object({
  sessionId: z.string().regex(SESSION_ID_PATTERN, 'Invalid session ID'),
  slideNumber: z.number().int().positive(),
  imageData: z.string().min(1),
  mimeType: z.string().regex(/^image\/(png|jpeg|webp)$/),
});

/**
 * Ensure session image directory exists
 */
async function ensureImageDir(sessionId: string): Promise<string> {
  const dir = path.join(IMAGES_DIR, sessionId);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
  return dir;
}

/**
 * Get file extension from mimeType
 */
function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'png';
}

/**
 * POST /images/save
 * Save base64 image to disk, return URL
 */
imagesRouter.post('/save', zValidator('json', saveImageSchema), async (c) => {
  const { sessionId, slideNumber, imageData, mimeType } = c.req.valid('json');

  try {
    const dir = await ensureImageDir(sessionId);
    const ext = getExtension(mimeType);
    const filename = `slide-${slideNumber}.${ext}`;
    const filepath = path.join(dir, filename);

    // Decode base64 and save
    const buffer = Buffer.from(imageData, 'base64');

    // Size check (10MB max)
    if (buffer.length > 10 * 1024 * 1024) {
      return c.json({ success: false, error: 'Image too large (max 10MB)' }, 400);
    }

    await writeFile(filepath, buffer);

    // Return relative URL path
    const imageUrl = `/api/images/${sessionId}/${filename}`;

    return c.json({ success: true, imageUrl });
  } catch (error) {
    console.error('Failed to save image:', error);
    return c.json({ success: false, error: 'Failed to save image' }, 500);
  }
});

/**
 * GET /images/:sessionId/:filename
 * Serve saved image with caching
 */
imagesRouter.get('/:sessionId/:filename', async (c) => {
  const sessionId = c.req.param('sessionId');
  const filename = c.req.param('filename');

  // Security: validate params - prevent path traversal
  if (!sessionId || !filename || filename.includes('..') || sessionId.includes('..')) {
    return c.json({ error: 'Invalid request' }, 400);
  }

  // Validate session ID format
  if (!SESSION_ID_PATTERN.test(sessionId)) {
    return c.json({ error: 'Invalid session ID' }, 400);
  }

  // Validate filename format
  if (!FILENAME_PATTERN.test(filename)) {
    return c.json({ error: 'Invalid filename format' }, 400);
  }

  const filepath = path.join(IMAGES_DIR, sessionId, filename);

  if (!existsSync(filepath)) {
    return c.json({ error: 'Image not found' }, 404);
  }

  try {
    const buffer = await readFile(filepath);
    const ext = path.extname(filename).slice(1);
    const mimeType = ext === 'jpg' ? 'image/jpeg' : `image/${ext}`;

    return new Response(buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Failed to read image:', error);
    return c.json({ error: 'Failed to read image' }, 500);
  }
});

/**
 * Delete all images for a session
 * Called when session is deleted
 */
export async function deleteSessionImages(sessionId: string): Promise<void> {
  if (!SESSION_ID_PATTERN.test(sessionId)) return;

  const dir = path.join(IMAGES_DIR, sessionId);
  if (existsSync(dir)) {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.error(`Failed to delete images for session ${sessionId}:`, error);
    }
  }
}
