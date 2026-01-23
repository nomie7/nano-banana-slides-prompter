import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { BackendManager } from './backend-manager';
import { setupConfigIPC, getConfigManager } from './config-manager';
// Auto-updater disabled - will be re-enabled after proper release workflow is established
// import { setupAutoUpdater, setupUpdateIPC, checkForUpdates } from './auto-updater';
import { createAppMenu } from './menu';
import log from 'electron-log';

// Configure logging
log.transports.file.level = 'info';
log.transports.console.level = 'debug';
log.info('App starting...');
log.info('App version:', app.getVersion());
log.info('Electron version:', process.versions.electron);
log.info('Chrome version:', process.versions.chrome);
log.info('Node version:', process.versions.node);

let mainWindow: BrowserWindow | null = null;
let backendManager: BackendManager | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const DEV_SERVER_PORT = process.env.VITE_PORT || '8080';

async function createWindow(): Promise<void> {
  log.info('Creating main window...');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Nano Banana Slides Prompter',
    icon: path.join(__dirname, '../resources/icons/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    show: false,
    backgroundColor: '#1a1a2e',
  });

  // Create application menu
  createAppMenu(mainWindow);

  // Auto-updater disabled - will be re-enabled after proper release workflow is established
  // setupAutoUpdater(mainWindow);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    // Auto-updater disabled - checkForUpdates() removed
  });

  // Start backend and get port
  try {
    backendManager = new BackendManager();
    const port = await backendManager.start();
    log.info(`Backend started on port ${port}`);

    // Load the app
    if (isDev) {
      // Development: load from Vite dev server
      await mainWindow.loadURL(`http://localhost:${DEV_SERVER_PORT}`);
      mainWindow.webContents.openDevTools();
    } else {
      // Production: load from local files
      const indexPath = path.join(__dirname, '../renderer/index.html');

      // Diagnostic logging for debugging blank screen issues
      log.info('=== Renderer Loading Diagnostics ===');
      log.info('__dirname:', __dirname);
      log.info('Index path:', indexPath);
      log.info('Index exists:', fs.existsSync(indexPath));
      log.info('App path:', app.getAppPath());
      log.info('Resources path:', process.resourcesPath);
      log.info('Is packaged:', app.isPackaged);

      // List renderer directory contents
      const rendererDir = path.join(__dirname, '../renderer');
      if (fs.existsSync(rendererDir)) {
        const files = fs.readdirSync(rendererDir);
        log.info('Renderer dir contents:', files);
      }
      log.info('=== End Diagnostics ===');

      await mainWindow.loadFile(indexPath);
    }
  } catch (error) {
    log.error('Failed to start backend:', error);

    // Show error dialog
    const result = await dialog.showMessageBox({
      type: 'error',
      title: 'Backend Error',
      message: 'Failed to start the backend server',
      detail: `${(error as Error).message}\n\nWould you like to retry or quit?`,
      buttons: ['Retry', 'Quit'],
      defaultId: 0,
    });

    if (result.response === 0) {
      // Retry
      app.relaunch();
      app.quit();
    } else {
      app.quit();
    }
    return;
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup IPC handlers before app is ready
function setupIPC(): void {
  // Backend port
  ipcMain.handle('get-backend-port', () => {
    return backendManager?.getPort() ?? null;
  });

  // App info
  ipcMain.handle('get-app-version', () => {
    return app.getVersion();
  });

  ipcMain.handle('is-packaged', () => {
    return app.isPackaged;
  });

  ipcMain.handle('get-platform', () => {
    return process.platform;
  });

  ipcMain.handle('get-app-path', () => {
    return app.getAppPath();
  });

  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData');
  });

  // Restart app
  ipcMain.handle('restart-app', () => {
    app.relaunch();
    app.quit();
  });

  // Open external URL (with validation)
  ipcMain.handle('open-external', async (_event: Electron.IpcMainInvokeEvent, url: string) => {
    // Validate URL to prevent arbitrary protocol execution
    try {
      const parsed = new URL(url);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        log.warn(`Blocked open-external with invalid protocol: ${parsed.protocol}`);
        return { success: false, error: 'Only http/https URLs are allowed' };
      }
      const { shell } = await import('electron');
      await shell.openExternal(url);
      return { success: true };
    } catch (err) {
      log.error('Invalid URL for open-external:', err);
      return { success: false, error: 'Invalid URL' };
    }
  });

  // Setup config IPC
  setupConfigIPC();

  // Auto-updater IPC disabled
  // setupUpdateIPC();

  log.info('IPC handlers registered');
}

// App lifecycle
app.whenReady().then(() => {
  setupIPC();
  createWindow();
});

app.on('window-all-closed', () => {
  log.info('All windows closed, shutting down...');
  backendManager?.stop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  log.info('App quitting, stopping backend...');
  backendManager?.stop();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log.error('Uncaught exception:', error);
  dialog.showErrorBox('Unexpected Error', `An unexpected error occurred:\n\n${error.message}`);
});

process.on('unhandledRejection', (reason) => {
  log.error('Unhandled rejection:', reason);
});

// Security: Prevent new window creation
app.on('web-contents-created', (_, contents) => {
  contents.setWindowOpenHandler(() => {
    return { action: 'deny' };
  });
});
