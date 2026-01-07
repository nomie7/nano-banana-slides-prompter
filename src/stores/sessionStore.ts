import { create } from 'zustand';
import type {
  Session,
  SessionStatus,
  SlidePromptConfig,
  ParsedSlide,
  GeneratedPrompt,
  ContentInput,
  PresentationSettings,
} from '@/types/slidePrompt';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const generateId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

const defaultContent: ContentInput = {
  type: 'text',
  text: '',
  topic: '',
  fileContent: '',
  fileName: '',
  url: '',
  urlContent: ''
};

const defaultSettings: PresentationSettings = {
  aspectRatio: '16:9',
  slideCount: 10,
  colorPalette: 'auto',
  layoutStructure: 'balanced'
};

const createDefaultSession = (): Session => ({
  id: generateId(),
  title: 'New Session',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  config: {
    content: defaultContent,
    style: 'professional',
    settings: defaultSettings,
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

  loadSessions: async () => {
    try {
      const res = await fetch(`${API_BASE}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        set({
          sessions: data.sessions || [],
          currentSessionId: data.currentSessionId,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  getCurrentSession: () => {
    const { sessions, currentSessionId } = get();
    if (!currentSessionId) return null;
    return sessions.find(s => s.id === currentSessionId) || null;
  },

  createSession: async () => {
    const newSession = createDefaultSession();
    set(state => ({
      sessions: [newSession, ...state.sessions],
      currentSessionId: newSession.id,
    }));

    try {
      await fetch(`${API_BASE}/api/sessions`, {
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
      get().abortControllers.delete(id);
    }

    set(state => {
      const newSessions = state.sessions.filter(s => s.id !== id);
      let newCurrentId = state.currentSessionId;
      if (state.currentSessionId === id) {
        newCurrentId = newSessions[0]?.id || null;
      }
      return { sessions: newSessions, currentSessionId: newCurrentId };
    });

    try {
      await fetch(`${API_BASE}/api/sessions/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  },

  setCurrentSession: async (id) => {
    set({ currentSessionId: id });
    try {
      await fetch(`${API_BASE}/api/sessions/current/${id}`, { method: 'PUT' });
    } catch (e) {
      console.error('Failed to set current session:', e);
    }
  },

  updateSessionConfig: (id, config) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id
          ? { ...s, config: { ...s.config, ...config }, updatedAt: Date.now() }
          : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionStatus: (id, status) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, status, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionSlides: (id, slides) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, slides, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionPrompt: (id, prompt) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, generatedPrompt: prompt, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionError: (id, error) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, error, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  updateSessionTitle: (id, title) => {
    set(state => ({
      sessions: state.sessions.map(s =>
        s.id === id ? { ...s, title, updatedAt: Date.now() } : s
      ),
    }));
    get().syncToServer();
  },

  syncToServer: async () => {
    const { sessions, currentSessionId } = get();
    try {
      await fetch(`${API_BASE}/api/sessions/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions, currentSessionId }),
      });
    } catch (e) {
      console.error('Failed to sync sessions:', e);
    }
  },

  getAbortController: (id) => get().abortControllers.get(id),

  setAbortController: (id, controller) => {
    get().abortControllers.set(id, controller);
  },

  removeAbortController: (id) => {
    get().abortControllers.delete(id);
  },
}));
