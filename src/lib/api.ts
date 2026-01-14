import type {
  ContentInput,
  SlideStyle,
  PresentationSettings,
  ParsedSlide,
} from '@/types/slidePrompt';

// Type declarations for Electron API exposed via preload
interface ElectronLLMConfig {
  apiBase: string;
  apiKey: string;
  model: string;
}

interface ElectronGeminiConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  baseURL?: string;
}

interface ElectronAppConfig {
  llm: ElectronLLMConfig;
  gemini: ElectronGeminiConfig;
  firstRunComplete: boolean;
  checkUpdatesOnStartup: boolean;
  theme: 'system' | 'light' | 'dark';
}

interface ElectronUpdateInfo {
  version: string;
  releaseNotes: string | null;
}

interface ElectronUpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  version: string | null;
  releaseNotes: string | null;
  progress: number;
}

declare global {
  interface Window {
    electronAPI?: {
      // App Info
      getBackendPort: () => Promise<number | null>;
      getAppVersion: () => Promise<string>;
      isPackaged: () => Promise<boolean>;
      getPlatform: () => Promise<NodeJS.Platform>;
      getAppPath: () => Promise<string>;
      getUserDataPath: () => Promise<string>;
      restartApp: () => Promise<void>;
      openExternal: (url: string) => Promise<void>;

      // Configuration
      getConfig: () => Promise<ElectronAppConfig>;
      setConfig: (config: Partial<ElectronAppConfig>) => Promise<boolean>;
      getLLMConfig: () => Promise<ElectronLLMConfig>;
      setLLMConfig: (config: Partial<ElectronLLMConfig>) => Promise<boolean>;
      getGeminiConfig: () => Promise<ElectronGeminiConfig>;
      setGeminiConfig: (config: Partial<ElectronGeminiConfig>) => Promise<boolean>;
      isFirstRun: () => Promise<boolean>;
      markFirstRunComplete: () => Promise<boolean>;
      getConfigPath: () => Promise<string>;

      // Auto-Updater
      checkForUpdates: () => Promise<{ success: boolean; updateInfo?: unknown; error?: string }>;
      downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
      installUpdate: () => Promise<void>;
      getUpdateStatus: () => Promise<ElectronUpdateStatus>;
      onUpdateAvailable: (callback: (info: ElectronUpdateInfo) => void) => () => void;
      onUpdateProgress: (callback: (percent: number) => void) => () => void;
      onUpdateDownloaded: (callback: (version: string) => void) => () => void;
      onUpdateError: (callback: (error: string) => void) => () => void;
      onUpdateStatus: (callback: (status: ElectronUpdateStatus) => void) => () => void;
    };
  }
}

// Cache for backend port (resolved once)
let cachedBackendPort: number | null = null;
let portPromise: Promise<number | null> | null = null;

/**
 * Get the backend port from Electron API (cached)
 */
async function getElectronBackendPort(): Promise<number | null> {
  if (cachedBackendPort !== null) return cachedBackendPort;
  if (portPromise) return portPromise;

  if (typeof window !== 'undefined' && window.electronAPI) {
    portPromise = window.electronAPI.getBackendPort().then((port) => {
      cachedBackendPort = port;
      return port;
    });
    return portPromise;
  }
  return null;
}

/**
 * Get the API base URL
 * - In Electron: uses dynamic port from backend manager
 * - In browser: uses VITE_API_BASE env or empty string
 */
async function getBaseUrl(): Promise<string> {
  // Check for Electron environment
  if (typeof window !== 'undefined' && window.electronAPI) {
    const port = await getElectronBackendPort();
    if (port) {
      return `http://localhost:${port}`;
    }
  }

  // Fallback to Vite env or empty string
  return import.meta.env.VITE_API_BASE || '';
}

// Synchronous API_BASE for backward compatibility (used where async isn't possible)
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
  metadata?: { style: SlideStyle; slideCount: number; aspectRatio: string };
}
export interface ExtractUrlResponse {
  success: boolean;
  data?: { title: string; content: string; description?: string; url: string };
  error?: string;
}
export interface StreamEvent {
  type: 'slide' | 'done' | 'error';
  data:
    | ParsedSlide
    | { totalSlides: number; style: string; aspectRatio: string }
    | { error: string };
}

export async function generatePrompt(
  request: GeneratePromptRequest
): Promise<GeneratePromptResponse> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/generate-prompt`, {
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

export async function* generatePromptStream(
  request: GeneratePromptRequest,
  signal?: AbortSignal
): AsyncGenerator<StreamEvent> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/generate-prompt-stream`, {
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
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let currentEvent = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('event:')) currentEvent = line.slice(6).trim();
        else if (line.startsWith('data:') && currentEvent) {
          const data = line.slice(5).trim();
          try {
            yield { type: currentEvent as 'slide' | 'done' | 'error', data: JSON.parse(data) };
            currentEvent = '';
          } catch {
            /* ignore */
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function extractUrl(url: string): Promise<ExtractUrlResponse> {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/extract-url`, {
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

export interface ImportFileResponse {
  success: boolean;
  data?: {
    text: string;
    metadata?: { pages?: number; wordCount?: number };
    fileName: string;
  };
  error?: string;
}

/**
 * Import PDF file and extract text
 */
export async function importPdf(file: File): Promise<ImportFileResponse> {
  const baseUrl = await getBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/api/import/pdf`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, error: error.error || `HTTP error: ${response.status}` };
  }
  return response.json();
}

/**
 * Import DOCX file and extract text
 */
export async function importDocx(file: File): Promise<ImportFileResponse> {
  const baseUrl = await getBaseUrl();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${baseUrl}/api/import/docx`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    return { success: false, error: error.error || `HTTP error: ${response.status}` };
  }
  return response.json();
}
