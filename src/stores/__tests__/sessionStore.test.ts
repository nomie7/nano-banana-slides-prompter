import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSessionStore } from '../sessionStore';
import type { SlidePromptConfig } from '@/types/slidePrompt';

// Mock fetch - declared but initialized in beforeEach
let mockFetch: ReturnType<typeof vi.fn>;

describe('sessionStore', () => {
  beforeEach(() => {
    // Initialize mocks inside beforeEach to avoid top-level vi usage
    mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    // Mock crypto.randomUUID
    vi.stubGlobal('crypto', {
      randomUUID: vi.fn(() => 'mock-uuid-1234'),
    });

    // Reset store state before each test
    useSessionStore.setState({
      sessions: [],
      currentSessionId: null,
      abortControllers: new Map(),
      isLoading: true,
      syncTimeoutId: null,
      syncInFlight: false,
      showPromptPreview: true,
    });

    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ sessions: [], currentSessionId: null }),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session with default values', async () => {
      const sessionId = await useSessionStore.getState().createSession();

      const state = useSessionStore.getState();
      expect(state.sessions).toHaveLength(1);
      expect(state.currentSessionId).toBe(sessionId);
      expect(state.sessions[0].title).toBe('New Session');
      expect(state.sessions[0].isDefaultTitle).toBe(true);
    });

    it('should set new session as current session', async () => {
      await useSessionStore.getState().createSession();

      const state = useSessionStore.getState();
      expect(state.currentSessionId).toBe(state.sessions[0].id);
    });

    it('should add new session at the beginning of sessions array', async () => {
      // Create first session
      await useSessionStore.getState().createSession();
      const firstSessionId = useSessionStore.getState().sessions[0].id;

      // Mock different UUID for second session
      vi.mocked(crypto.randomUUID).mockReturnValueOnce('mock-uuid-5678');

      // Create second session
      await useSessionStore.getState().createSession();

      const state = useSessionStore.getState();
      expect(state.sessions).toHaveLength(2);
      expect(state.sessions[0].id).not.toBe(firstSessionId);
      expect(state.sessions[1].id).toBe(firstSessionId);
    });

    it('should call API to save session', async () => {
      await useSessionStore.getState().createSession();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    it('should handle API failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const sessionId = await useSessionStore.getState().createSession();

      // Session should still be created locally
      expect(sessionId).toBeDefined();
      expect(useSessionStore.getState().sessions).toHaveLength(1);
    });
  });

  describe('updateSessionConfig', () => {
    it('should update session config partially', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const newConfig: Partial<SlidePromptConfig> = {
        style: 'creative',
      };

      useSessionStore.getState().updateSessionConfig(sessionId, newConfig);

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.config.style).toBe('creative');
    });

    it('should update updatedAt timestamp', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;
      const originalUpdatedAt = useSessionStore.getState().sessions[0].updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      useSessionStore.getState().updateSessionConfig(sessionId, { style: 'technical' });

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('should preserve existing config values not being updated', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionConfig(sessionId, { style: 'minimalist' });

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.config.settings.slideCount).toBe(10); // Default value preserved
      expect(session?.config.style).toBe('minimalist');
    });

    it('should not affect other sessions', async () => {
      await useSessionStore.getState().createSession();
      const firstSessionId = useSessionStore.getState().currentSessionId!;

      vi.mocked(crypto.randomUUID).mockReturnValueOnce('mock-uuid-second');
      await useSessionStore.getState().createSession();
      const secondSessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionConfig(secondSessionId, { style: 'creative' });

      const firstSession = useSessionStore.getState().sessions.find((s) => s.id === firstSessionId);
      const secondSession = useSessionStore
        .getState()
        .sessions.find((s) => s.id === secondSessionId);

      expect(firstSession?.config.style).toBe('professional');
      expect(secondSession?.config.style).toBe('creative');
    });

    it('should handle non-existent session ID gracefully', async () => {
      await useSessionStore.getState().createSession();

      // Should not throw
      useSessionStore.getState().updateSessionConfig('non-existent-id', { style: 'creative' });

      // Original session should be unchanged
      expect(useSessionStore.getState().sessions[0].config.style).toBe('professional');
    });
  });

  describe('deleteSession', () => {
    it('should remove session from sessions array', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      await useSessionStore.getState().deleteSession(sessionId);

      expect(useSessionStore.getState().sessions).toHaveLength(0);
    });

    it('should set currentSessionId to next session when deleting current', async () => {
      await useSessionStore.getState().createSession();
      const firstSessionId = useSessionStore.getState().currentSessionId!;

      vi.mocked(crypto.randomUUID).mockReturnValueOnce('mock-uuid-second');
      await useSessionStore.getState().createSession();

      // Delete second (current) session
      await useSessionStore.getState().deleteSession(useSessionStore.getState().currentSessionId!);

      expect(useSessionStore.getState().currentSessionId).toBe(firstSessionId);
    });

    it('should set currentSessionId to null when deleting last session', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      await useSessionStore.getState().deleteSession(sessionId);

      expect(useSessionStore.getState().currentSessionId).toBeNull();
    });

    it('should call API to delete session', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      await useSessionStore.getState().deleteSession(sessionId);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/sessions/${sessionId}`),
        expect.objectContaining({ method: 'DELETE' })
      );
    });

    it('should abort ongoing operations for deleted session', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const mockAbortController = { abort: vi.fn() } as unknown as AbortController;
      useSessionStore.getState().setAbortController(sessionId, mockAbortController);

      await useSessionStore.getState().deleteSession(sessionId);

      expect(mockAbortController.abort).toHaveBeenCalled();
    });
  });

  describe('getCurrentSession', () => {
    it('should return null when no current session', () => {
      const session = useSessionStore.getState().getCurrentSession();

      expect(session).toBeNull();
    });

    it('should return current session when set', async () => {
      await useSessionStore.getState().createSession();

      const session = useSessionStore.getState().getCurrentSession();

      expect(session).not.toBeNull();
      expect(session?.title).toBe('New Session');
    });

    it('should return null when currentSessionId does not match any session', async () => {
      await useSessionStore.getState().createSession();
      useSessionStore.setState({ currentSessionId: 'non-existent-id' });

      const session = useSessionStore.getState().getCurrentSession();

      expect(session).toBeNull();
    });
  });

  describe('updateSessionTitle', () => {
    it('should update session title', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionTitle(sessionId, 'New Title');

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.title).toBe('New Title');
    });

    it('should set isDefaultTitle to false', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      expect(useSessionStore.getState().sessions[0].isDefaultTitle).toBe(true);

      useSessionStore.getState().updateSessionTitle(sessionId, 'Custom Title');

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.isDefaultTitle).toBe(false);
    });
  });

  describe('updateSessionStatus', () => {
    it('should update session status', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionStatus(sessionId, 'generating');

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.status).toBe('generating');
    });

    it('should trigger sync to server', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      mockFetch.mockClear();
      useSessionStore.getState().updateSessionStatus(sessionId, 'completed');

      // Wait for debounced sync
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/sync'),
        expect.any(Object)
      );
    });
  });

  describe('loadSessions', () => {
    it('should load sessions from API successfully', async () => {
      const mockSessions = [
        {
          id: 'session_1',
          title: 'Test Session',
          isDefaultTitle: false,
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
              slideCount: 5,
              colorPalette: 'auto',
              layoutStructure: 'balanced',
            },
          },
          status: 'idle',
          slides: [],
          generatedPrompt: null,
          error: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: mockSessions, currentSessionId: 'session_1' }),
      });

      await useSessionStore.getState().loadSessions();

      const state = useSessionStore.getState();
      expect(state.sessions).toHaveLength(1);
      expect(state.currentSessionId).toBe('session_1');
      expect(state.isLoading).toBe(false);
    });

    it('should handle API failure gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await useSessionStore.getState().loadSessions();

      expect(useSessionStore.getState().isLoading).toBe(false);
    });

    it('should handle non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      });

      await useSessionStore.getState().loadSessions();

      expect(useSessionStore.getState().isLoading).toBe(false);
    });

    it('should normalize isDefaultTitle for sessions without it', async () => {
      const mockSessions = [
        {
          id: 'session_1',
          title: 'New Session',
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
              slideCount: 5,
              colorPalette: 'auto',
              layoutStructure: 'balanced',
            },
          },
          status: 'idle',
          slides: [],
          generatedPrompt: null,
          error: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: mockSessions, currentSessionId: 'session_1' }),
      });

      await useSessionStore.getState().loadSessions();

      const state = useSessionStore.getState();
      expect(state.sessions[0].isDefaultTitle).toBe(true);
    });

    it('should fallback to first session if currentSessionId not found', async () => {
      const mockSessions = [
        {
          id: 'session_1',
          title: 'Test',
          isDefaultTitle: false,
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
              slideCount: 5,
              colorPalette: 'auto',
              layoutStructure: 'balanced',
            },
          },
          status: 'idle',
          slides: [],
          generatedPrompt: null,
          error: null,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: mockSessions, currentSessionId: 'non-existent' }),
      });

      await useSessionStore.getState().loadSessions();

      expect(useSessionStore.getState().currentSessionId).toBe('session_1');
    });
  });

  describe('setCurrentSession', () => {
    it('should set current session and fetch fresh data', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const freshSession = {
        id: sessionId,
        title: 'Updated Title',
        isDefaultTitle: false,
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
            slideCount: 5,
            colorPalette: 'auto',
            layoutStructure: 'balanced',
          },
        },
        status: 'idle',
        slides: [],
        generatedPrompt: null,
        error: null,
      };

      mockFetch.mockResolvedValueOnce({ ok: true }); // PUT request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ sessions: [freshSession], currentSessionId: sessionId }),
      });

      await useSessionStore.getState().setCurrentSession(sessionId);

      expect(useSessionStore.getState().currentSessionId).toBe(sessionId);
    });

    it('should handle API failure gracefully', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await useSessionStore.getState().setCurrentSession(sessionId);

      // Should still set the currentSessionId locally
      expect(useSessionStore.getState().currentSessionId).toBe(sessionId);
    });
  });

  describe('updateSessionSlides', () => {
    it('should update session slides', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const slides = [
        { slideNumber: 1, title: 'Slide 1', prompt: 'Content 1' },
        { slideNumber: 2, title: 'Slide 2', prompt: 'Content 2' },
      ];

      useSessionStore.getState().updateSessionSlides(sessionId, slides);

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.slides).toEqual(slides);
    });
  });

  describe('updateSessionPrompt', () => {
    it('should update session generated prompt', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const prompt = {
        plainText: 'Test prompt',
        slides: [{ slideNumber: 1, title: 'Test', prompt: 'Content' }],
        jsonFormat: {
          model: 'test-model',
          messages: [{ role: 'user' as const, content: 'Test' }],
        },
      };

      useSessionStore.getState().updateSessionPrompt(sessionId, prompt);

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.generatedPrompt).toEqual(prompt);
    });

    it('should set prompt to null', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionPrompt(sessionId, null);

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.generatedPrompt).toBeNull();
    });
  });

  describe('updateSessionError', () => {
    it('should update session error', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionError(sessionId, 'Something went wrong');

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.error).toBe('Something went wrong');
    });

    it('should clear session error', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      useSessionStore.getState().updateSessionError(sessionId, 'Error');
      useSessionStore.getState().updateSessionError(sessionId, null);

      const session = useSessionStore.getState().sessions.find((s) => s.id === sessionId);
      expect(session?.error).toBeNull();
    });
  });

  describe('abortController management', () => {
    it('should get abort controller', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const controller = new AbortController();
      useSessionStore.getState().setAbortController(sessionId, controller);

      expect(useSessionStore.getState().getAbortController(sessionId)).toBe(controller);
    });

    it('should return undefined for non-existent controller', () => {
      expect(useSessionStore.getState().getAbortController('non-existent')).toBeUndefined();
    });

    it('should remove abort controller', async () => {
      await useSessionStore.getState().createSession();
      const sessionId = useSessionStore.getState().currentSessionId!;

      const controller = new AbortController();
      useSessionStore.getState().setAbortController(sessionId, controller);
      useSessionStore.getState().removeAbortController(sessionId);

      expect(useSessionStore.getState().getAbortController(sessionId)).toBeUndefined();
    });
  });

  describe('syncToServer', () => {
    it('should debounce sync calls', async () => {
      await useSessionStore.getState().createSession();

      // Wait for any pending syncs from createSession
      await new Promise((resolve) => setTimeout(resolve, 600));

      mockFetch.mockClear();

      // Trigger multiple syncs rapidly
      useSessionStore.getState().syncToServer();
      useSessionStore.getState().syncToServer();
      useSessionStore.getState().syncToServer();

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Should only call once due to debouncing
      const syncCalls = mockFetch.mock.calls.filter((call) =>
        call[0].includes('/api/sessions/sync')
      );
      expect(syncCalls.length).toBe(1);
    });

    it('should handle sync failure gracefully', async () => {
      await useSessionStore.getState().createSession();

      // Wait for any pending syncs
      await new Promise((resolve) => setTimeout(resolve, 600));

      mockFetch.mockClear();
      mockFetch.mockRejectedValueOnce(new Error('Sync failed'));

      useSessionStore.getState().syncToServer();

      // Wait for debounce
      await new Promise((resolve) => setTimeout(resolve, 600));

      // Should not throw
      expect(useSessionStore.getState().syncInFlight).toBe(false);
    });
  });
});
