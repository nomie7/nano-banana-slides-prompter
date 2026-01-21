import { useState, useCallback } from 'react';
import { regenerateSlide as apiRegenerateSlide } from '@/lib/api';
import type { ParsedSlide, SlideStyle, PresentationSettings } from '@/types/slidePrompt';

interface UseSlideRegenerationOptions {
  slides: ParsedSlide[];
  style: SlideStyle;
  settings: PresentationSettings;
  onSlideUpdate: (slideNumber: number, newSlide: ParsedSlide) => void;
  llmConfig?: {
    apiKey?: string;
    baseURL?: string;
    model?: string;
  };
}

/**
 * Hook for regenerating a single slide with context awareness.
 * Passes previous/next slides for consistency.
 */
export function useSlideRegeneration({
  slides,
  style,
  settings,
  onSlideUpdate,
  llmConfig,
}: UseSlideRegenerationOptions) {
  const [regeneratingSlide, setRegeneratingSlide] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const regenerate = useCallback(
    async (slideNumber: number, instructions?: string) => {
      setRegeneratingSlide(slideNumber);
      setError(null);

      const slideIndex = slides.findIndex((s) => s.slideNumber === slideNumber);
      const previousSlide = slideIndex > 0 ? slides[slideIndex - 1] : undefined;
      const nextSlide = slideIndex < slides.length - 1 ? slides[slideIndex + 1] : undefined;

      try {
        const result = await apiRegenerateSlide({
          slideNumber,
          previousSlide: previousSlide
            ? { title: previousSlide.title, prompt: previousSlide.prompt }
            : undefined,
          nextSlide: nextSlide ? { title: nextSlide.title, prompt: nextSlide.prompt } : undefined,
          style,
          settings: {
            aspectRatio: settings.aspectRatio,
            slideCount: settings.slideCount,
            colorPalette: settings.colorPalette,
            layoutStructure: settings.layoutStructure,
          },
          instructions,
          llmConfig,
        });

        if (result.success && result.slide) {
          onSlideUpdate(slideNumber, result.slide);
        } else {
          setError(result.error || 'Failed to regenerate slide');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to regenerate slide');
      } finally {
        setRegeneratingSlide(null);
      }
    },
    [slides, style, settings, onSlideUpdate, llmConfig]
  );

  return {
    regenerate,
    regeneratingSlide,
    isRegenerating: regeneratingSlide !== null,
    error,
    clearError: () => setError(null),
  };
}
