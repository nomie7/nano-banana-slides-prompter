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

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadIndex(): Promise<SessionIndex> {
  try {
    if (existsSync(INDEX_FILE)) {
      const data = await readFile(INDEX_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to load index:', e);
  }
  return { currentSessionId: null, sessionIds: [] };
}

async function saveIndex(index: SessionIndex): Promise<void> {
  await ensureDataDir();
  await writeFile(INDEX_FILE, JSON.stringify(index, null, 2), 'utf-8');
}

function isValidSessionId(id: string): boolean {
  return /^session_\d+_[a-z0-9]+$/.test(id);
}

async function loadSession(id: string): Promise<unknown | null> {
  if (!isValidSessionId(id)) {
    console.error(`Invalid session ID: ${id}`);
    return null;
  }
  
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (existsSync(filePath)) {
      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(`Failed to load session ${id}:`, e);
  }
  return null;
}

async function saveSession(id: string, session: unknown): Promise<void> {
  if (!isValidSessionId(id)) {
    throw new Error(`Invalid session ID: ${id}`);
  }
  
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, `${id}.json`);
  await writeFile(filePath, JSON.stringify(session, null, 2), 'utf-8');
}

async function deleteSessionFile(id: string): Promise<void> {
  if (!isValidSessionId(id)) {
    console.error(`Invalid session ID: ${id}`);
    return;
  }
  
  try {
    const filePath = path.join(DATA_DIR, `${id}.json`);
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (e) {
    console.error(`Failed to delete session ${id}:`, e);
  }
}

sessionsRouter.get('/sessions', async (c) => {
  await ensureDataDir();
  const index = await loadIndex();
  const sessions = [];

  for (const id of index.sessionIds) {
    const session = await loadSession(id);
    if (session) {
      sessions.push(session);
    }
  }

  return c.json({
    sessions,
    currentSessionId: index.currentSessionId,
  });
});

sessionsRouter.post('/sessions', async (c) => {
  const newSession = await c.req.json();
  const index = await loadIndex();

  await saveSession(newSession.id, newSession);
  index.sessionIds.unshift(newSession.id);
  index.currentSessionId = newSession.id;
  await saveIndex(index);

  return c.json({ success: true, session: newSession });
});

sessionsRouter.put('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();

  const session = await loadSession(id);
  if (!session) {
    return c.json({ error: 'Session not found' }, 404);
  }

  const updatedSession = { ...(session as object), ...updates, updatedAt: Date.now() };
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
  const index = await loadIndex();
  index.currentSessionId = id;
  await saveIndex(index);
  return c.json({ success: true });
});

sessionsRouter.post('/sessions/sync', async (c) => {
  const { sessions, currentSessionId } = await c.req.json();

  const index: SessionIndex = {
    currentSessionId,
    sessionIds: sessions.map((s: { id: string }) => s.id),
  };

  for (const session of sessions) {
    await saveSession(session.id, session);
  }

  await saveIndex(index);
  return c.json({ success: true });
});

export { sessionsRouter };
