import { Hono } from 'hono';
import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const sessionsRouter = new Hono();
const DATA_DIR = path.join(process.cwd(), 'data', 'sessions');
const INDEX_FILE = path.join(process.cwd(), 'data', 'sessions-index.json');

interface SessionIndex {
  currentSessionId: string | null;
  sessionIds: string[];
}

type SessionStatus = 'idle' | 'generating' | 'completed' | 'error';

interface Session {
  id: string;
  title: string;
  isDefaultTitle?: boolean;
  createdAt: number;
  updatedAt: number;
  status: SessionStatus;
  error: string | null;
  config: {
    content: {
      type: string;
      text: string;
      topic: string;
      fileContent: string;
      fileName: string;
      fileType?: 'text' | 'csv' | 'pdf';
      url: string;
      urlContent: string;
    };
    style: string;
    settings: {
      aspectRatio: string;
      slideCount: number;
      colorPalette: string;
      layoutStructure: string;
      character?: {
        enabled: boolean;
        renderStyle: string;
        gender: string;
      };
    };
  };
  slides: Array<{ slideNumber: number; title: string; prompt: string }>;
  generatedPrompt: null | {
    plainText: string;
    slides: Array<{ slideNumber: number; title: string; prompt: string }>;
    jsonFormat: {
      model: string;
      messages: Array<{ role: 'system' | 'user'; content: string }>;
    };
  };
}

const ALLOWED_STATUSES: SessionStatus[] = ['idle', 'generating', 'completed', 'error'];
const ALLOWED_CONTENT_TYPES = ['text', 'topic', 'file', 'url'];
const ALLOWED_ASPECT_RATIOS = ['16:9', '4:3', '1:1', '9:16'];
const ALLOWED_LAYOUT_STRUCTURES = ['visual-heavy', 'text-heavy', 'balanced'];

const SESSION_ID_PATTERN = /^session_([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|[0-9a-f]{32}|\d+_[a-zA-Z0-9]+)$/;

function isValidSessionId(id: string): boolean {
  return SESSION_ID_PATTERN.test(id);
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadIndex(): Promise<SessionIndex> {
  try {
    if (existsSync(INDEX_FILE)) {
      return JSON.parse(await readFile(INDEX_FILE, 'utf-8'));
    }
  } catch (error) {
    console.error('Failed to load session index:', error);
  }
  return { currentSessionId: null, sessionIds: [] };
}

async function saveIndex(index: SessionIndex) {
  await ensureDataDir();
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

function getSessionFilePath(id: string) {
  return path.join(DATA_DIR, `${id}.json`);
}

async function loadSession(id: string): Promise<Session | null> {
  if (!isValidSessionId(id)) return null;
  try {
    const fp = getSessionFilePath(id);
    if (existsSync(fp)) {
      return JSON.parse(await readFile(fp, 'utf-8'));
    }
  } catch (error) {
    console.error(`Failed to load session ${id}:`, error);
  }
  return null;
}

async function saveSession(id: string, session: Session) {
  if (!isValidSessionId(id)) throw new Error('Invalid session ID');
  await ensureDataDir();
  await writeFile(getSessionFilePath(id), JSON.stringify(session, null, 2), 'utf-8');
}

async function deleteSessionFile(id: string) {
  if (!isValidSessionId(id)) return;
  try {
    const fp = getSessionFilePath(id);
    if (existsSync(fp)) await unlink(fp);
  } catch (error) {
    console.error(`Failed to delete session file ${id}:`, error);
  }
}

function validateSlide(s: { slideNumber: number; title: string; prompt: string }): boolean {
  return isFiniteNumber(s.slideNumber) &&
    typeof s.title === 'string' && s.title.length <= 500 &&
    typeof s.prompt === 'string' && s.prompt.length <= 50_000;
}

function validateSession(s: Session): { valid: boolean; error?: string } {
  if (!s || typeof s !== 'object') return { valid: false, error: 'Invalid session' };
  if (!isValidSessionId(s.id)) return { valid: false, error: 'Invalid id' };
  if (typeof s.title !== 'string' || !s.title || s.title.length > 200) return { valid: false, error: 'Invalid title' };
  if (s.isDefaultTitle !== undefined && typeof s.isDefaultTitle !== 'boolean') return { valid: false, error: 'Invalid isDefaultTitle' };
  if (!isFiniteNumber(s.createdAt) || !isFiniteNumber(s.updatedAt)) return { valid: false, error: 'Invalid timestamps' };
  if (!ALLOWED_STATUSES.includes(s.status)) return { valid: false, error: 'Invalid status' };
  if (s.error !== null && (typeof s.error !== 'string' || s.error.length > 10_000)) return { valid: false, error: 'Invalid error' };

  const { config } = s;
  if (!config || typeof config !== 'object') return { valid: false, error: 'Invalid config' };

  const { content, style, settings } = config;
  if (!content || !ALLOWED_CONTENT_TYPES.includes(content.type)) return { valid: false, error: 'Invalid content type' };
  const strFields = [content.text, content.topic, content.fileContent, content.fileName, content.url, content.urlContent];
  if (strFields.some(v => typeof v !== 'string')) return { valid: false, error: 'Invalid content fields' };
  if (content.fileType && !['text', 'csv', 'pdf'].includes(content.fileType)) return { valid: false, error: 'Invalid fileType' };
  if (typeof style !== 'string' || style.length > 100) return { valid: false, error: 'Invalid style' };
  if (!settings || !ALLOWED_ASPECT_RATIOS.includes(settings.aspectRatio)) return { valid: false, error: 'Invalid aspectRatio' };
  if (!isFiniteNumber(settings.slideCount) || settings.slideCount < 1 || settings.slideCount > 300) return { valid: false, error: 'Invalid slideCount' };
  if (!ALLOWED_LAYOUT_STRUCTURES.includes(settings.layoutStructure)) return { valid: false, error: 'Invalid layoutStructure' };
  if (typeof settings.colorPalette !== 'string' || settings.colorPalette.length > 100) return { valid: false, error: 'Invalid colorPalette' };

  if (settings.character) {
    const { enabled, renderStyle, gender } = settings.character;
    if (typeof enabled !== 'boolean' || typeof renderStyle !== 'string' || renderStyle.length > 100 || typeof gender !== 'string' || gender.length > 20) {
      return { valid: false, error: 'Invalid character settings' };
    }
  }

  if (!Array.isArray(s.slides) || s.slides.length > 200 || !s.slides.every(validateSlide)) {
    return { valid: false, error: 'Invalid slides' };
  }

  const gp = s.generatedPrompt;
  if (gp !== null) {
    if (typeof gp !== 'object') return { valid: false, error: 'Invalid generatedPrompt' };
    if (typeof gp.plainText !== 'string' || gp.plainText.length > 200_000) return { valid: false, error: 'Invalid plainText' };
    if (!Array.isArray(gp.slides) || gp.slides.length > 200 || !gp.slides.every(validateSlide)) return { valid: false, error: 'Invalid prompt slides' };
    const jf = gp.jsonFormat;
    if (!jf || typeof jf.model !== 'string' || jf.model.length > 200) return { valid: false, error: 'Invalid jsonFormat model' };
    if (!Array.isArray(jf.messages) || jf.messages.length === 0) return { valid: false, error: 'Invalid jsonFormat messages' };
    for (const m of jf.messages) {
      if ((m.role !== 'system' && m.role !== 'user') || typeof m.content !== 'string' || m.content.length > 100_000) {
        return { valid: false, error: 'Invalid message' };
      }
    }
  }

  return { valid: true };
}

sessionsRouter.get('/sessions', async (c) => {
  await ensureDataDir();
  const index = await loadIndex();
  const sessions: Session[] = [];

  for (const id of index.sessionIds) {
    const session = await loadSession(id);
    if (session && validateSession(session).valid) {
      sessions.push(session);
    }
  }

  return c.json({ sessions, currentSessionId: index.currentSessionId });
});

sessionsRouter.post('/sessions', async (c) => {
  const newSession = await c.req.json() as Session;
  const validation = validateSession(newSession);
  if (!validation.valid) return c.json({ error: validation.error }, 400);

  const index = await loadIndex();
  await saveSession(newSession.id, newSession);
  index.sessionIds.unshift(newSession.id);
  index.currentSessionId = newSession.id;
  await saveIndex(index);

  return c.json({ success: true, session: newSession });
});

sessionsRouter.put('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const session = await loadSession(id);
  if (!session) return c.json({ error: 'Session not found' }, 404);

  const updates = await c.req.json();
  const updatedSession = { ...session, ...updates, updatedAt: Date.now() } as Session;
  const validation = validateSession(updatedSession);
  if (!validation.valid) return c.json({ error: validation.error }, 400);

  await saveSession(id, updatedSession);
  return c.json({ success: true, session: updatedSession });
});

sessionsRouter.delete('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const index = await loadIndex();

  await deleteSessionFile(id);
  index.sessionIds = index.sessionIds.filter(sid => sid !== id);
  if (index.currentSessionId === id) {
    index.currentSessionId = index.sessionIds[0] || null;
  }
  await saveIndex(index);

  return c.json({ success: true });
});

sessionsRouter.put('/sessions/current/:id', async (c) => {
  const id = c.req.param('id');
  if (!isValidSessionId(id)) return c.json({ error: 'Invalid session id' }, 400);

  const index = await loadIndex();
  if (!index.sessionIds.includes(id)) {
    index.sessionIds.unshift(id);
  }
  index.currentSessionId = id;
  await saveIndex(index);

  return c.json({ success: true });
});

sessionsRouter.post('/sessions/sync', async (c) => {
  const { sessions, currentSessionId } = await c.req.json() as {
    sessions: Session[];
    currentSessionId: string | null;
  };

  if (!Array.isArray(sessions)) {
    return c.json({ error: 'sessions must be an array' }, 400);
  }

  for (const s of sessions) {
    const v = validateSession(s);
    if (!v.valid) return c.json({ error: v.error }, 400);
  }

  if (currentSessionId != null && !isValidSessionId(currentSessionId)) {
    return c.json({ error: 'Invalid currentSessionId' }, 400);
  }

  const uniqueIds = [...new Set(sessions.map(s => s.id))];
  if (uniqueIds.length !== sessions.length) {
    return c.json({ error: 'Duplicate session IDs' }, 400);
  }

  for (const s of sessions) {
    await saveSession(s.id, s);
  }

  const normalizedCurrent = currentSessionId && uniqueIds.includes(currentSessionId)
    ? currentSessionId
    : sessions[0]?.id ?? null;

  await saveIndex({ currentSessionId: normalizedCurrent, sessionIds: uniqueIds });
  return c.json({ success: true });
});

export { sessionsRouter };
