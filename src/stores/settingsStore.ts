import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'nano-banana-llm-settings';

export interface LLMSettings {
  apiKey: string;
  baseURL: string;
  model: string;
}

export interface GeminiSettings {
  apiKey: string;
  model: string;
  enabled: boolean;
  baseURL?: string; // Custom API endpoint (e.g., http://127.0.0.1:8045)
}

interface SettingsStore {
  settings: LLMSettings | null;
  geminiSettings: GeminiSettings | null;
  setSettings: (settings: LLMSettings) => void;
  setGeminiSettings: (settings: GeminiSettings) => void;
  clearSettings: () => void;
  clearGeminiSettings: () => void;
}

/**
 * Zustand store for LLM settings with localStorage persistence.
 * Changes automatically propagate to all consuming components.
 */
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: null,
      geminiSettings: null,
      setSettings: (settings) => set({ settings }),
      setGeminiSettings: (geminiSettings) => set({ geminiSettings }),
      clearSettings: () => set({ settings: null }),
      clearGeminiSettings: () => set({ geminiSettings: null }),
    }),
    {
      name: STORAGE_KEY,
      // Persist both settings fields
      partialize: (state) => ({
        settings: state.settings,
        geminiSettings: state.geminiSettings,
      }),
    }
  )
);
