import { app, ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import log from 'electron-log';

export interface LLMConfig {
  apiBase: string;
  apiKey: string;
  model: string;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  enabled: boolean;
  baseURL?: string;
}

export interface AppConfig {
  llm: LLMConfig;
  gemini: GeminiConfig;
  firstRunComplete: boolean;
  checkUpdatesOnStartup: boolean;
  theme: 'system' | 'light' | 'dark';
}

const defaultConfig: AppConfig = {
  llm: {
    apiBase: 'https://api.openai.com/v1',
    apiKey: '',
    model: 'gpt-4o',
  },
  gemini: {
    apiKey: '',
    model: 'gemini-2.0-flash-preview-image-generation',
    enabled: false,
    baseURL: undefined,
  },
  firstRunComplete: false,
  checkUpdatesOnStartup: true,
  theme: 'system',
};

class ConfigManager {
  private configPath: string;
  private config: AppConfig;

  constructor() {
    this.configPath = path.join(app.getPath('userData'), 'config.json');
    this.config = this.load();
  }

  private load(): AppConfig {
    try {
      if (fs.existsSync(this.configPath)) {
        const data = fs.readFileSync(this.configPath, 'utf-8');
        const parsed = JSON.parse(data);
        // Merge with defaults to handle new config fields
        return {
          ...defaultConfig,
          ...parsed,
          llm: { ...defaultConfig.llm, ...parsed.llm },
          gemini: { ...defaultConfig.gemini, ...parsed.gemini },
        };
      }
    } catch (err) {
      log.error('Failed to load config:', err);
    }
    return { ...defaultConfig };
  }

  save(): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      log.info('Config saved to:', this.configPath);
    } catch (err) {
      log.error('Failed to save config:', err);
    }
  }

  get(): AppConfig {
    return { ...this.config };
  }

  /**
   * Get config without sensitive data (for logging)
   */
  getSafe(): Omit<AppConfig, 'llm'> & { llm: Omit<LLMConfig, 'apiKey'> & { apiKey: string } } {
    return {
      ...this.config,
      llm: {
        ...this.config.llm,
        apiKey: this.config.llm.apiKey ? '***' : '',
      },
    };
  }

  set(config: Partial<AppConfig>): void {
    if (config.llm) {
      this.config.llm = { ...this.config.llm, ...config.llm };
    }
    this.config = { ...this.config, ...config, llm: this.config.llm };
    this.save();
  }

  setLLM(llmConfig: Partial<LLMConfig>): void {
    this.config.llm = { ...this.config.llm, ...llmConfig };
    this.save();
  }

  setGemini(geminiConfig: Partial<GeminiConfig>): void {
    this.config.gemini = { ...this.config.gemini, ...geminiConfig };
    this.save();
  }

  isFirstRun(): boolean {
    return !this.config.firstRunComplete;
  }

  markFirstRunComplete(): void {
    this.config.firstRunComplete = true;
    this.save();
  }

  getConfigPath(): string {
    return this.configPath;
  }
}

// Singleton instance
let configManager: ConfigManager | null = null;

export function getConfigManager(): ConfigManager {
  if (!configManager) {
    configManager = new ConfigManager();
  }
  return configManager;
}

/**
 * Register IPC handlers for config management
 */
export function setupConfigIPC(): void {
  const manager = getConfigManager();

  ipcMain.handle('get-config', () => {
    return manager.get();
  });

  ipcMain.handle(
    'set-config',
    (_event: Electron.IpcMainInvokeEvent, config: Partial<AppConfig>) => {
      manager.set(config);
      return true;
    }
  );

  ipcMain.handle('get-llm-config', () => {
    return manager.get().llm;
  });

  ipcMain.handle(
    'set-llm-config',
    (_event: Electron.IpcMainInvokeEvent, llmConfig: Partial<LLMConfig>) => {
      manager.setLLM(llmConfig);
      return true;
    }
  );

  ipcMain.handle('get-gemini-config', () => {
    return manager.get().gemini;
  });

  ipcMain.handle(
    'set-gemini-config',
    (_event: Electron.IpcMainInvokeEvent, geminiConfig: Partial<GeminiConfig>) => {
      manager.setGemini(geminiConfig);
      return true;
    }
  );

  ipcMain.handle('is-first-run', () => {
    return manager.isFirstRun();
  });

  ipcMain.handle('mark-first-run-complete', () => {
    manager.markFirstRunComplete();
    return true;
  });

  ipcMain.handle('get-config-path', () => {
    return manager.getConfigPath();
  });

  log.info('Config IPC handlers registered');
}
