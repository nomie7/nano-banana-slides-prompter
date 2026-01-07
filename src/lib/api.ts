import type {
  ContentInput,
  SlideStyle,
  PresentationSettings,
  ParsedSlide,
} from '@/types/slidePrompt';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export interface GeneratePromptRequest {
  content: ContentInput;
  style: SlideStyle;
  settings: PresentationSettings;
  llmConfig?: LLMConfig;
}

export interface GeneratePromptResponse {
  success: boolean;
  prompts?: string;
  slides?: ParsedSlide[];
  error?: string;
  metadata?: {
    style: SlideStyle;
    slideCount: number;
    aspectRatio: string;
  };
}

export interface ExtractUrlResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    description?: string;
    url: string;
  };
  error?: string;
}

export interface StreamEvent {
  type: 'slide' | 'done' | 'error';
  data: ParsedSlide | { totalSlides: number; style: string; aspectRatio: string } | { error: string };
}

export async function generatePrompt(
  request: GeneratePromptRequest
): Promise<GeneratePromptResponse> {
  const response = await fetch(`${API_BASE}/api/generate-prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error: ${response.status}`);
  }

  return response.json();
}

/**
 * Stream slide generation via SSE.
 * Yields parsed slides as they arrive from the server.
 */
export async function* generatePromptStream(
  request: GeneratePromptRequest,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  const response = await fetch(`${API_BASE}/api/generate-prompt-stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('No response body');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Parse SSE events from buffer
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer

      let currentEvent = '';
      let currentData = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          currentEvent = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          currentData = line.slice(5).trim();
        } else if (line === '' && currentEvent && currentData) {
          // End of event, emit it
          try {
            const parsed = JSON.parse(currentData);
            yield {
              type: currentEvent as 'slide' | 'done' | 'error',
              data: parsed,
            };
          } catch {
            console.warn('Failed to parse SSE data:', currentData);
          }
          currentEvent = '';
          currentData = '';
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function extractUrl(url: string): Promise<ExtractUrlResponse> {
  const response = await fetch(`${API_BASE}/api/extract-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `HTTP error: ${response.status}`);
  }

  return response.json();
}

