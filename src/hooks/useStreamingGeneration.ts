import { useState, useCallback, useEffect } from 'react';
import { generatePromptStream, type GeneratePromptRequest } from '@/lib/api';
import { useSessionStore } from '@/stores/sessionStore';
import type { ParsedSlide, GeneratedPrompt } from '@/types/slidePrompt';

export interface UseStreamingGenerationState {
  isGenerating: boolean;
  slides: ParsedSlide[];
  error: string | null;
  generatedPrompt: GeneratedPrompt | null;
}

export interface UseStreamingGenerationReturn extends UseStreamingGenerationState {
  generate: (request: GeneratePromptRequest) => Promise<void>;
  cancel: (sessionId?: string) => void;
  reset: () => void;
  updateSlides: (slides: ParsedSlide[]) => void;
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const {
    getCurrentSession,
    currentSessionId,
    updateSessionStatus,
    updateSessionSlides,
    updateSessionPrompt,
    updateSessionError,
    updateSessionTitle,
    setAbortController,
    getAbortController,
    removeAbortController,
  } = useSessionStore();

  const currentSession = getCurrentSession();
  const [localIsGenerating, setLocalIsGenerating] = useState(false);
  const [localSlides, setLocalSlides] = useState<ParsedSlide[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localPrompt, setLocalPrompt] = useState<GeneratedPrompt | null>(null);

  useEffect(() => {
    if (currentSession) {
      setLocalSlides(currentSession.slides);
      setLocalPrompt(currentSession.generatedPrompt);
      setLocalError(currentSession.error);
      setLocalIsGenerating(currentSession.status === 'generating');
    } else {
      setLocalSlides([]);
      setLocalPrompt(null);
      setLocalError(null);
      setLocalIsGenerating(false);
    }
  }, [currentSession]);

  const cancel = useCallback(
    (targetId?: string) => {
      const sessionId =
        typeof targetId === 'string' ? targetId : useSessionStore.getState().currentSessionId;
      if (!sessionId) return;

      const controller = getAbortController(sessionId);
      if (controller) {
        controller.abort();
        removeAbortController(sessionId);
      }

      updateSessionStatus(sessionId, 'idle');
      if (useSessionStore.getState().currentSessionId === sessionId) {
        setLocalIsGenerating(false);
      }
    },
    [getAbortController, removeAbortController, updateSessionStatus]
  );

  const reset = useCallback(() => {
    cancel();
    if (currentSessionId) {
      updateSessionSlides(currentSessionId, []);
      updateSessionPrompt(currentSessionId, null);
      updateSessionError(currentSessionId, null);
    }
    setLocalSlides([]);
    setLocalError(null);
    setLocalPrompt(null);
  }, [cancel, currentSessionId, updateSessionSlides, updateSessionPrompt, updateSessionError]);

  const generate = useCallback(
    async (request: GeneratePromptRequest) => {
      if (!currentSessionId) return;

      const targetSessionId = currentSessionId;
      cancel(targetSessionId);

      updateSessionSlides(targetSessionId, []);
      updateSessionPrompt(targetSessionId, null);
      updateSessionError(targetSessionId, null);
      updateSessionStatus(targetSessionId, 'generating');

      setLocalSlides([]);
      setLocalError(null);
      setLocalPrompt(null);
      setLocalIsGenerating(true);

      const controller = new AbortController();
      setAbortController(targetSessionId, controller);

      const isCurrentSession = () =>
        useSessionStore.getState().currentSessionId === targetSessionId;

      try {
        const collectedSlides: ParsedSlide[] = [];

        for await (const event of generatePromptStream(request, controller.signal)) {
          switch (event.type) {
            case 'slide': {
              const slide = event.data as ParsedSlide;
              collectedSlides.push(slide);
              const sortedSlides = [...collectedSlides].sort(
                (a, b) => a.slideNumber - b.slideNumber
              );
              if (isCurrentSession()) setLocalSlides(sortedSlides);
              updateSessionSlides(targetSessionId, sortedSlides);
              break;
            }
            case 'done': {
              const sortedSlides = [...collectedSlides].sort(
                (a, b) => a.slideNumber - b.slideNumber
              );
              const plainText = sortedSlides
                .map((s) => `**Slide ${s.slideNumber}: ${s.title}**\n\`\`\`\n${s.prompt}\n\`\`\``)
                .join('\n\n');
              const prompt: GeneratedPrompt = {
                plainText,
                slides: sortedSlides,
                jsonFormat: {
                  model: 'nano-banana-pro',
                  messages: [
                    { role: 'system', content: 'Nano Banana Pro optimized prompts' },
                    { role: 'user', content: plainText },
                  ],
                },
              };
              if (isCurrentSession()) {
                setLocalPrompt(prompt);
                setLocalIsGenerating(false);
              }
              updateSessionPrompt(targetSessionId, prompt);
              updateSessionStatus(targetSessionId, 'completed');

              if (sortedSlides.length > 0) {
                const session = getCurrentSession();
                if (session?.id === targetSessionId && session?.isDefaultTitle) {
                  updateSessionTitle(
                    targetSessionId,
                    sortedSlides[0].title.slice(0, 30) +
                      (sortedSlides[0].title.length > 30 ? '...' : '')
                  );
                }
              }
              break;
            }
            case 'error': {
              const errorData = event.data as { error: string };
              if (isCurrentSession()) {
                setLocalError(errorData.error);
                setLocalIsGenerating(false);
              }
              updateSessionError(targetSessionId, errorData.error);
              updateSessionStatus(targetSessionId, 'error');
              break;
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate prompts';
        const store = useSessionStore.getState();
        if (store.currentSessionId === targetSessionId) {
          setLocalError(errorMsg);
          setLocalIsGenerating(false);
        }
        updateSessionError(targetSessionId, errorMsg);
        updateSessionStatus(targetSessionId, 'error');
      } finally {
        const store = useSessionStore.getState();
        if (store.currentSessionId === targetSessionId) {
          setLocalIsGenerating(false);
        }
        removeAbortController(targetSessionId);
      }
    },
    [
      currentSessionId,
      cancel,
      setAbortController,
      removeAbortController,
      updateSessionStatus,
      updateSessionSlides,
      updateSessionPrompt,
      updateSessionError,
      updateSessionTitle,
      getCurrentSession,
    ]
  );

  // Update slides after editing (also updates generatedPrompt)
  const updateSlides = useCallback(
    (newSlides: ParsedSlide[]) => {
      if (!currentSessionId) return;

      // Update local state
      setLocalSlides(newSlides);

      // Rebuild generatedPrompt with updated slides
      const plainText = newSlides
        .map((s) => `**Slide ${s.slideNumber}: ${s.title}**\n\`\`\`\n${s.prompt}\n\`\`\``)
        .join('\n\n');
      const updatedPrompt: GeneratedPrompt = {
        plainText,
        slides: newSlides,
        jsonFormat: {
          model: 'nano-banana-pro',
          messages: [
            { role: 'system', content: 'Nano Banana Pro optimized prompts' },
            { role: 'user', content: plainText },
          ],
        },
      };
      setLocalPrompt(updatedPrompt);

      // Persist to session store
      updateSessionSlides(currentSessionId, newSlides);
      updateSessionPrompt(currentSessionId, updatedPrompt);
    },
    [currentSessionId, updateSessionSlides, updateSessionPrompt]
  );

  return {
    isGenerating: localIsGenerating,
    slides: localSlides,
    error: localError,
    generatedPrompt: localPrompt,
    generate,
    cancel,
    reset,
    updateSlides,
  };
}
