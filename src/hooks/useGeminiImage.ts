import { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ParsedSlide } from '@/types/slidePrompt';

export interface GeneratedImage {
  data: string;
  mimeType: string;
  slideNumber: number;
}

interface UseGeminiImageState {
  isGenerating: boolean;
  progress: { current: number; total: number };
  images: GeneratedImage[];
  error: string | null;
}

interface UseGeminiImageReturn extends UseGeminiImageState {
  generateImages: (slides: ParsedSlide[]) => Promise<void>;
  generateSingleImage: (slide: ParsedSlide) => Promise<GeneratedImage | null>;
  testConnection: () => Promise<boolean>;
  reset: () => void;
  clearImage: (slideNumber: number) => void;
  isEnabled: boolean;
}

async function getBaseUrl(): Promise<string> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    const port = await window.electronAPI.getBackendPort();
    if (port) return `http://localhost:${port}`;
  }
  return import.meta.env.VITE_API_BASE || '';
}

export function useGeminiImage(): UseGeminiImageReturn {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { geminiSettings } = useSettingsStore();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [state, setState] = useState<UseGeminiImageState>({
    isGenerating: false,
    progress: { current: 0, total: 0 },
    images: [],
    error: null,
  });

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const isEnabled = geminiSettings?.enabled ?? false;

  const testConnection = useCallback(async (): Promise<boolean> => {
    if (!geminiSettings?.apiKey) {
      toast({
        title: t('gemini.testFailed'),
        description: t('gemini.noApiKey'),
        variant: 'destructive',
      });
      return false;
    }

    try {
      const baseUrl = await getBaseUrl();
      const response = await fetch(`${baseUrl}/api/gemini/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: geminiSettings.apiKey,
          model: geminiSettings.model || undefined,
          baseURL: geminiSettings.baseURL || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: t('gemini.testSuccess') });
        return true;
      } else {
        toast({
          title: t('gemini.testFailed'),
          description: data.error,
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: t('gemini.testFailed'),
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  }, [geminiSettings?.apiKey, t, toast]);

  const generateImages = useCallback(
    async (slides: ParsedSlide[]) => {
      if (!geminiSettings?.apiKey) {
        toast({
          title: t('gemini.generationFailed'),
          description: t('gemini.noApiKey'),
          variant: 'destructive',
        });
        return;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: { current: 0, total: slides.length },
        images: [],
        error: null,
      }));

      // Create new abort controller for this request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const baseUrl = await getBaseUrl();
        const prompts = slides.map((slide) => slide.prompt);

        const response = await fetch(`${baseUrl}/api/gemini/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompts,
            apiKey: geminiSettings.apiKey,
            model: geminiSettings.model,
            baseURL: geminiSettings.baseURL || undefined,
            aspectRatio: geminiSettings.aspectRatio || '16:9',
            resolution: geminiSettings.resolution || '2K',
          }),
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (data.success || data.summary?.success > 0) {
          const generatedImages: GeneratedImage[] = [];

          data.results.forEach(
            (
              result: { success: boolean; images?: { data: string; mimeType: string }[] },
              index: number
            ) => {
              if (result.success && result.images?.[0]) {
                generatedImages.push({
                  data: result.images[0].data,
                  mimeType: result.images[0].mimeType,
                  slideNumber: slides[index].slideNumber,
                });
              }
            }
          );

          setState((prev) => ({
            ...prev,
            isGenerating: false,
            progress: { current: slides.length, total: slides.length },
            images: generatedImages,
          }));

          toast({
            title: t('gemini.generationSuccess', { count: generatedImages.length }),
          });
        } else {
          throw new Error(data.error || 'Generation failed');
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: message,
        }));
        toast({
          title: t('gemini.generationFailed'),
          description: message,
          variant: 'destructive',
        });
      }
    },
    [geminiSettings, t, toast]
  );

  const generateSingleImage = useCallback(
    async (slide: ParsedSlide): Promise<GeneratedImage | null> => {
      if (!geminiSettings?.apiKey) {
        toast({
          title: t('gemini.generationFailed'),
          description: t('gemini.noApiKey'),
          variant: 'destructive',
        });
        return null;
      }

      setState((prev) => ({
        ...prev,
        isGenerating: true,
        progress: { current: 0, total: 1 },
        error: null,
      }));

      // Create new abort controller for this request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      try {
        const baseUrl = await getBaseUrl();
        const response = await fetch(`${baseUrl}/api/gemini/generate-images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompts: [slide.prompt],
            apiKey: geminiSettings.apiKey,
            model: geminiSettings.model,
            baseURL: geminiSettings.baseURL || undefined,
            aspectRatio: geminiSettings.aspectRatio || '16:9',
            resolution: geminiSettings.resolution || '2K',
          }),
          signal: abortControllerRef.current.signal,
        });

        const data = await response.json();

        if (data.success || data.summary?.success > 0) {
          const result = data.results[0];
          if (result?.success && result.images?.[0]) {
            const newImage: GeneratedImage = {
              data: result.images[0].data,
              mimeType: result.images[0].mimeType,
              slideNumber: slide.slideNumber,
            };

            setState((prev) => ({
              ...prev,
              isGenerating: false,
              progress: { current: 1, total: 1 },
              images: [
                ...prev.images.filter((img) => img.slideNumber !== slide.slideNumber),
                newImage,
              ],
            }));

            toast({
              title: t('gemini.generationSuccess', { count: 1 }),
            });

            return newImage;
          }
        }

        throw new Error(data.error || 'Generation failed');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: message,
        }));
        toast({
          title: t('gemini.generationFailed'),
          description: message,
          variant: 'destructive',
        });
        return null;
      }
    },
    [geminiSettings, t, toast]
  );

  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      progress: { current: 0, total: 0 },
      images: [],
      error: null,
    });
  }, []);

  const clearImage = useCallback((slideNumber: number) => {
    setState((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.slideNumber !== slideNumber),
    }));
  }, []);

  return {
    ...state,
    generateImages,
    generateSingleImage,
    testConnection,
    reset,
    clearImage,
    isEnabled,
  };
}
