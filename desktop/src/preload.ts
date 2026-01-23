import { contextBridge, ipcRenderer } from 'electron';

/**
 * Type definitions for config
 */
interface LLMConfig {
  apiBase: string;
  apiKey: string;
  model: string;
}

interface GeminiConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  baseURL?: string;
}

interface AppConfig {
  llm: LLMConfig;
  gemini: GeminiConfig;
  firstRunComplete: boolean;
  checkUpdatesOnStartup: boolean;
  theme: 'system' | 'light' | 'dark';
}

interface UpdateInfo {
  version: string;
  releaseNotes: string | null;
}

interface UpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  version: string | null;
  releaseNotes: string | null;
  progress: number;
}

/**
 * Electron API exposed to renderer process
 */
const electronAPI = {
  // ============ App Info ============
  /**
   * Get the backend server port
   */
  getBackendPort: (): Promise<number | null> => {
    return ipcRenderer.invoke('get-backend-port');
  },

  /**
   * Get the application version
   */
  getAppVersion: (): Promise<string> => {
    return ipcRenderer.invoke('get-app-version');
  },

  /**
   * Check if app is packaged (production)
   */
  isPackaged: (): Promise<boolean> => {
    return ipcRenderer.invoke('is-packaged');
  },

  /**
   * Get the current platform
   */
  getPlatform: (): Promise<NodeJS.Platform> => {
    return ipcRenderer.invoke('get-platform');
  },

  /**
   * Get the app path
   */
  getAppPath: (): Promise<string> => {
    return ipcRenderer.invoke('get-app-path');
  },

  /**
   * Get the user data path
   */
  getUserDataPath: (): Promise<string> => {
    return ipcRenderer.invoke('get-user-data-path');
  },

  /**
   * Restart the application
   */
  restartApp: (): Promise<void> => {
    return ipcRenderer.invoke('restart-app');
  },

  /**
   * Open external URL in default browser
   */
  openExternal: (url: string): Promise<void> => {
    return ipcRenderer.invoke('open-external', url);
  },

  // ============ Configuration ============
  /**
   * Get app configuration
   */
  getConfig: (): Promise<AppConfig> => {
    return ipcRenderer.invoke('get-config');
  },

  /**
   * Set app configuration
   */
  setConfig: (config: Partial<AppConfig>): Promise<boolean> => {
    return ipcRenderer.invoke('set-config', config);
  },

  /**
   * Get LLM configuration
   */
  getLLMConfig: (): Promise<LLMConfig> => {
    return ipcRenderer.invoke('get-llm-config');
  },

  /**
   * Set LLM configuration
   */
  setLLMConfig: (config: Partial<LLMConfig>): Promise<boolean> => {
    return ipcRenderer.invoke('set-llm-config', config);
  },

  /**
   * Get Gemini configuration
   */
  getGeminiConfig: (): Promise<GeminiConfig> => {
    return ipcRenderer.invoke('get-gemini-config');
  },

  /**
   * Set Gemini configuration
   */
  setGeminiConfig: (config: Partial<GeminiConfig>): Promise<boolean> => {
    return ipcRenderer.invoke('set-gemini-config', config);
  },

  /**
   * Check if this is the first run
   */
  isFirstRun: (): Promise<boolean> => {
    return ipcRenderer.invoke('is-first-run');
  },

  /**
   * Mark first run as complete
   */
  markFirstRunComplete: (): Promise<boolean> => {
    return ipcRenderer.invoke('mark-first-run-complete');
  },

  /**
   * Get config file path
   */
  getConfigPath: (): Promise<string> => {
    return ipcRenderer.invoke('get-config-path');
  },

  // ============ Auto-Updater ============
  /**
   * Check for updates
   */
  checkForUpdates: (): Promise<{ success: boolean; updateInfo?: unknown; error?: string }> => {
    return ipcRenderer.invoke('check-for-updates');
  },

  /**
   * Download available update
   */
  downloadUpdate: (): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke('download-update');
  },

  /**
   * Install downloaded update and restart
   */
  installUpdate: (): Promise<void> => {
    return ipcRenderer.invoke('install-update');
  },

  /**
   * Get current update status
   */
  getUpdateStatus: (): Promise<UpdateStatus> => {
    return ipcRenderer.invoke('get-update-status');
  },

  /**
   * Listen for update available event
   */
  onUpdateAvailable: (callback: (info: UpdateInfo) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, info: UpdateInfo) => callback(info);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },

  /**
   * Listen for update progress event
   */
  onUpdateProgress: (callback: (percent: number) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, percent: number) => callback(percent);
    ipcRenderer.on('update-progress', handler);
    return () => ipcRenderer.removeListener('update-progress', handler);
  },

  /**
   * Listen for update downloaded event
   */
  onUpdateDownloaded: (callback: (version: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, version: string) => callback(version);
    ipcRenderer.on('update-downloaded', handler);
    return () => ipcRenderer.removeListener('update-downloaded', handler);
  },

  /**
   * Listen for update error event
   */
  onUpdateError: (callback: (error: string) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, error: string) => callback(error);
    ipcRenderer.on('update-error', handler);
    return () => ipcRenderer.removeListener('update-error', handler);
  },

  /**
   * Listen for update status changes
   */
  onUpdateStatus: (callback: (status: UpdateStatus) => void): (() => void) => {
    const handler = (_: Electron.IpcRendererEvent, status: UpdateStatus) => callback(status);
    ipcRenderer.on('update-status', handler);
    return () => ipcRenderer.removeListener('update-status', handler);
  },
};

// Expose API to renderer
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Type declaration for renderer
export type ElectronAPI = typeof electronAPI;
