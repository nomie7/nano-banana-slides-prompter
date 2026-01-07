import { useState, useCallback, useRef, useEffect } from "react";
import {
  generatePromptStream,
  type GeneratePromptRequest,
  type StreamEvent,
} from "@/lib/api";
import { useSessionStore } from "@/stores/sessionStore";
import type { ParsedSlide, GeneratedPrompt } from "@/types/slidePrompt";

export interface UseStreamingGenerationState {
  isGenerating: boolean;
  slides: ParsedSlide[];
  error: string | null;
  generatedPrompt: GeneratedPrompt | null;
}

export interface UseStreamingGenerationReturn
  extends UseStreamingGenerationState {
  generate: (request: GeneratePromptRequest) => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useStreamingGeneration(): UseStreamingGenerationReturn {
  const {
    getCurrentSession,
    currentSessionId,
    updateSessionStatus,
    updateSessionSlides,
    updateSessionPrompt,
    updateSessionError,
    updateSessionConfig,
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

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (currentSession) {
      setLocalSlides(currentSession.slides);
      setLocalPrompt(currentSession.generatedPrompt);
      setLocalError(currentSession.error);
      setLocalIsGenerating(currentSession.status === "generating");
    } else {
      setLocalSlides([]);
      setLocalPrompt(null);
      setLocalError(null);
      setLocalIsGenerating(false);
    }
  }, [currentSession?.id]);

  const cancel = useCallback(() => {
    if (!currentSessionId) return;

    const controller = getAbortController(currentSessionId);
    if (controller) {
      controller.abort();
      removeAbortController(currentSessionId);
    }
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    updateSessionStatus(currentSessionId, "idle");
    setLocalIsGenerating(false);
  }, [
    currentSessionId,
    getAbortController,
    removeAbortController,
    updateSessionStatus,
  ]);

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
  }, [
    cancel,
    currentSessionId,
    updateSessionSlides,
    updateSessionPrompt,
    updateSessionError,
  ]);

  const generate = useCallback(
    async (request: GeneratePromptRequest) => {
      if (!currentSessionId) return;

      cancel();

      updateSessionSlides(currentSessionId, []);
      updateSessionPrompt(currentSessionId, null);
      updateSessionError(currentSessionId, null);
      updateSessionStatus(currentSessionId, "generating");
      updateSessionConfig(currentSessionId, request);

      setLocalSlides([]);
      setLocalError(null);
      setLocalPrompt(null);
      setLocalIsGenerating(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;
      setAbortController(currentSessionId, controller);

      try {
        const collectedSlides: ParsedSlide[] = [];

        for await (const event of generatePromptStream(
          request,
          controller.signal
        )) {
          switch (event.type) {
            case "slide": {
              const slide = event.data as ParsedSlide;
              collectedSlides.push(slide);
              const sortedSlides = [...collectedSlides].sort(
                (a, b) => a.slideNumber - b.slideNumber
              );
              setLocalSlides(sortedSlides);
              updateSessionSlides(currentSessionId, sortedSlides);
              break;
            }
            case "done": {
              const sortedSlides = [...collectedSlides].sort(
                (a, b) => a.slideNumber - b.slideNumber
              );
              const plainText = sortedSlides
                .map(
                  (s) =>
                    `**Slide ${s.slideNumber}: ${s.title}**\n\`\`\`\n${s.prompt}\n\`\`\``
                )
                .join("\n\n");

              const prompt: GeneratedPrompt = {
                plainText,
                slides: sortedSlides,
                jsonFormat: {
                  model: "nano-banana-pro",
                  messages: [
                    {
                      role: "system",
                      content: "Nano Banana Pro optimized prompts",
                    },
                    { role: "user", content: plainText },
                  ],
                },
              };
              setLocalPrompt(prompt);
              updateSessionPrompt(currentSessionId, prompt);
              updateSessionStatus(currentSessionId, "completed");

              if (sortedSlides.length > 0) {
                const currentTitle = getCurrentSession()?.title;
                if (currentTitle === "New Session") {
                  const autoTitle =
                    sortedSlides[0].title.slice(0, 30) +
                    -(sortedSlides[0].title.length > 30 ? "..." : "");
                  updateSessionTitle(currentSessionId, autoTitle);
                }
              }
              break;
            }
            case "error": {
              const errorData = event.data as { error: string };
              setLocalError(errorData.error);
              updateSessionError(currentSessionId, errorData.error);
              updateSessionStatus(currentSessionId, "error");
              break;
            }
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }
        const errorMsg =
          err instanceof Error ? err.message : "Failed to generate prompts";
        setLocalError(errorMsg);
        updateSessionError(currentSessionId, errorMsg);
        updateSessionStatus(currentSessionId, "error");
      } finally {
        setLocalIsGenerating(false);
        abortControllerRef.current = null;
        removeAbortController(currentSessionId);
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
      updateSessionConfig,
      updateSessionTitle,
    ]
  );

  return {
    isGenerating: localIsGenerating,
    slides: localSlides,
    error: localError,
    generatedPrompt: localPrompt,
    generate,
    cancel,
    reset,
  };
}
