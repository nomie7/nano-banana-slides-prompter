import { create } from 'zustand';
import type {
  Session,
  SessionStatus,
  SlidePromptConfig,
  ParsedSlide,
  GeneratedPrompt,
} from '@/types/slidePrompt';

// Cache for backend port
let cachedApiBase: string | null = null;
let apiBasePromise: Promise<string> | null = null;

/**
 * Get API base URL dynamically - uses Electron backend port if available
 */
async function getApiBase(): Promise<string> {
  if (cachedApiBase) return cachedApiBase;
  if (apiBasePromise) return apiBasePromise;

  apiBasePromise = (async () => {
    if (typeof window !== 'undefined' && window.electronAPI) {
      const port = await window.electronAPI.getBackendPort();
      if (port) {
        cachedApiBase = `http://localhost:${port}`;
        return cachedApiBase;
      }
    }
    cachedApiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return cachedApiBase;
  })();

  return apiBasePromise;
}

const generateId = (): string => `session_${crypto.randomUUID()}`;

const createDefaultSession = (): Session => ({
  id: generateId(),
  title: 'New Session',
  isDefaultTitle: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  config: {
    content: {
      type: 'text',
      text: '',
      topic: '',
      fileContent: '',
      fileName: '',
      url: '',
      urlContent: '',
    },
    style: 'professional',
    settings: {
      aspectRatio: '16:9',
      slideCount: 10,
      colorPalette: 'auto',
      layoutStructure: 'balanced',
    },
  },
  status: 'idle',
  slides: [],
  generatedPrompt: null,
  error: null,
});

interface SessionStore {
  sessions: Session[];
  currentSessionId: string | null;
  abortControllers: Map<string, AbortController>;
  isLoading: boolean;
  syncTimeoutId: ReturnType<typeof setTimeout> | null;
  syncInFlight: boolean;

  loadSessions: () => Promise<void>;
  getCurrentSession: () => Session | null;
  createSession: () => Promise<string>;
  deleteSession: (id: string) => Promise<void>;
  setCurrentSession: (id: string) => Promise<void>;
  updateSessionConfig: (id: string, config: Partial<SlidePromptConfig>) => void;
  updateSessionStatus: (id: string, status: SessionStatus) => void;
  updateSessionSlides: (id: string, slides: ParsedSlide[]) => void;
  updateSessionPrompt: (id: string, prompt: GeneratedPrompt | null) => void;
  updateSessionError: (id: string, error: string | null) => void;
  updateSessionTitle: (id: string, title: string) => void;
  updateSlideImageUrl: (sessionId: string, slideNumber: number, imageUrl: string) => void;
  syncToServer: () => Promise<void>;

  getAbortController: (id: string) => AbortController | undefined;
  setAbortController: (id: string, controller: AbortController) => void;
  removeAbortController: (id: string) => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  sessions: [],
  currentSessionId: null,
  abortControllers: new Map(),
  isLoading: true,
  syncTimeoutId: null,
  syncInFlight: false,

  loadSessions: async () => {
    try {
      const apiBase = await getApiBase();
      const res = await fetch(`${apiBase}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        const normalizedSessions = (data.sessions || []).map((session: Session) => ({
          ...session,
          isDefaultTitle:
            typeof session.isDefaultTitle === 'boolean'
              ? session.isDefaultTitle
              : session.title === 'New Session',
        }));
        const normalizedCurrent = normalizedSessions.find((s) => s.id === data.currentSessionId)
          ? data.currentSessionId
          : (normalizedSessions[0]?.id ?? null);
        set({
          sessions: normalizedSessions,
          currentSessionId: normalizedCurrent,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (e) {
      console.error('Failed to load sessions:', e);
      set({ isLoading: false });
    }
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    if (!currentSessionId) return null;
    return sessions.find((s) => s.id === currentSessionId) || null;
  },

  createSession: async () => {
    const newSession = createDefaultSession();
    set((state) => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
    }));

    try {
      const apiBase = await getApiBase();
      await fetch(`${apiBase}/api/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession),
      });
    } catch (e) {
      console.error('Failed to save session:', e);
    }

    return newSession.id;
  },

  deleteSession: async (id) => {
    const controller = get().abortControllers.get(id);
    if (controller) {
      controller.abort();
      set((state) => {
        const newAbortControllers = new Map(state.abortControllers);
        newAbortControllers.delete(id);
        return { abortControllers: newAbortControllers };
      });
    }

    set((state) => {
      const newSessions = state.sessions.filter((s) => s.id !== id);
      let newCurrentId = state.currentSessionId;
      if (state.currentSessionId === id) {
        newCurrentId = newSessions[0]?.id || null;
      }
      return { sessions: newSessions, currentSessionId: newCurrentId };
    });

    try {
      const apiBase = await getApiBase();
      await fetch(`${apiBase}/api/sessions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  },

  setCurrentSession: async (id) => {
    set({ currentSessionId: id });
    try {
      const apiBase = await getApiBase();
      await fetch(`${apiBase}/api/sessions/current/${id}`, { method: 'PUT' });

      const res = await fetch(`${apiBase}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        const freshSession = data.sessions.find((s: Session) => s.id === id);
        if (freshSession) {
          set((state) => ({
            sessions: state.sessions.map((s) =>
              s.id === id
                ? {
                    ...freshSession,
                    isDefaultTitle:
                      typeof freshSession.isDefaultTitle === 'boolean'
                        ? freshSession.isDefaultTitle
                        : freshSession.title === 'New Session',
                  }
                : s
            ),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to set current session:', e);
    }
  },

  updateSessionConfig: (id, config) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, config: { ...s.config, ...config }, updatedAt: Date.now() } : s
      ),
    }));
  },

  updateSessionStatus: (id, status) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, status, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionSlides: (id, slides) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, slides, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionPrompt: (id, generatedPrompt) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, generatedPrompt, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionError: (id, error) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, error, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionTitle: (id, title) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === id ? { ...s, title, isDefaultTitle: false, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSlideImageUrl: (sessionId, slideNumber, imageUrl) => {
    set((state) => ({
      sessions: state.sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              slides: s.slides.map((slide) =>
                slide.slideNumber === slideNumber
                  ? { ...slide, generatedImageUrl: imageUrl }
                  : slide
              ),
              updatedAt: Date.now(),
            }
          : s
      ),
    }));
    get().syncToServer();
  },

  syncToServer: async () => {
    const { syncTimeoutId } = get();
    if (syncTimeoutId) clearTimeout(syncTimeoutId);

    const timeoutId = setTimeout(async () => {
      const { sessions, currentSessionId, syncInFlight } = get();
      if (syncInFlight) {
        setTimeout(() => get().syncToServer(), 300);
        return;
      }
      set({ syncInFlight: true });
      try {
        const apiBase = await getApiBase();
        await fetch(`${apiBase}/api/sessions/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessions, currentSessionId }),
        });
      } catch (e) {
        console.error('Failed to sync sessions:', e);
      }
      set({ syncTimeoutId: null, syncInFlight: false });
    }, 500);
    set({ syncTimeoutId: timeoutId });
  },

  getAbortController: (id) => get().abortControllers.get(id),

  setAbortController: (id, controller) => {
    set((state) => {
      const abortControllers = new Map(state.abortControllers);
      abortControllers.set(id, controller);
      return { abortControllers };
    });
  },

  removeAbortController: (id) => {
    set((state) => {
      const abortControllers = new Map(state.abortControllers);
      abortControllers.delete(id);
      return { abortControllers };
    });
  },
}));
