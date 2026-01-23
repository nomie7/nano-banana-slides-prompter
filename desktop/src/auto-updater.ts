import { autoUpdater, UpdateInfo } from 'electron-updater';
import { BrowserWindow, ipcMain } from 'electron';
import log from 'electron-log';

// Configure electron-updater logging
autoUpdater.logger = log;

// Don't auto-download, let user decide
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

export interface UpdateStatus {
  checking: boolean;
  available: boolean;
  downloading: boolean;
  downloaded: boolean;
  error: string | null;
  version: string | null;
  releaseNotes: string | null;
  progress: number;
}

let updateStatus: UpdateStatus = {
  checking: false,
  available: false,
  downloading: false,
  downloaded: false,
  error: null,
  version: null,
  releaseNotes: null,
  progress: 0,
};

let mainWindowRef: BrowserWindow | null = null;

function sendToRenderer(channel: string, data: unknown): void {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send(channel, data);
  }
}

/**
 * Setup auto-updater event handlers
 */
export function setupAutoUpdater(mainWindow: BrowserWindow): void {
  mainWindowRef = mainWindow;

  autoUpdater.on('checking-for-update', () => {
    log.info('Checking for updates...');
    updateStatus = { ...updateStatus, checking: true, error: null };
    sendToRenderer('update-status', updateStatus);
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    log.info('Update available:', info.version);
    updateStatus = {
      ...updateStatus,
      checking: false,
      available: true,
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string'
        ? info.releaseNotes
        : Array.isArray(info.releaseNotes)
          ? info.releaseNotes.map(n => n.note).join('\n')
          : null,
    };
    sendToRenderer('update-status', updateStatus);
    sendToRenderer('update-available', {
      version: info.version,
      releaseNotes: updateStatus.releaseNotes,
    });
  });

  autoUpdater.on('update-not-available', () => {
    log.info('No updates available');
    updateStatus = { ...updateStatus, checking: false, available: false };
    sendToRenderer('update-status', updateStatus);
  });

  autoUpdater.on('download-progress', (progress) => {
    log.info(`Download progress: ${progress.percent.toFixed(1)}%`);
    updateStatus = {
      ...updateStatus,
      downloading: true,
      progress: progress.percent,
    };
    sendToRenderer('update-status', updateStatus);
    sendToRenderer('update-progress', progress.percent);
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    log.info('Update downloaded:', info.version);
    updateStatus = {
      ...updateStatus,
      downloading: false,
      downloaded: true,
      progress: 100,
    };
    sendToRenderer('update-status', updateStatus);
    sendToRenderer('update-downloaded', info.version);
  });

  autoUpdater.on('error', (err) => {
    log.error('Auto-updater error:', err);
    updateStatus = {
      ...updateStatus,
      checking: false,
      downloading: false,
      error: err.message,
    };
    sendToRenderer('update-status', updateStatus);
    sendToRenderer('update-error', err.message);
  });

  log.info('Auto-updater initialized');
}

/**
 * Register IPC handlers for update actions
 */
export function setupUpdateIPC(): void {
  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (err) {
      log.error('Check for updates failed:', err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err) {
      log.error('Download update failed:', err);
      return { success: false, error: (err as Error).message };
    }
  });

  ipcMain.handle('install-update', () => {
    log.info('Installing update and restarting...');
    autoUpdater.quitAndInstall(false, true);
  });

  ipcMain.handle('get-update-status', () => {
    return updateStatus;
  });

  log.info('Update IPC handlers registered');
}

/**
 * Check for updates (call after app is ready)
 */
export function checkForUpdates(): void {
  // Only check in production
  if (process.env.NODE_ENV === 'development') {
    log.info('Skipping update check in development mode');
    return;
  }

  autoUpdater.checkForUpdates().catch((err) => {
    log.error('Initial update check failed:', err);
  });
}
