import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import log from 'electron-log';

const BACKEND_START_TIMEOUT = 30000; // 30 seconds (increased for slower systems)

export class BackendManager {
  private process: ChildProcess | null = null;
  private port: number | null = null;
  private isRunning = false;
  private forceKillTimeout: NodeJS.Timeout | null = null;
  private stdoutBuffer = '';

  /**
   * Get the path to the backend binary based on platform
   */
  private getBackendPath(): string {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
      // Development: use bun directly
      return 'bun';
    }

    // Production: use compiled binary from resources
    const resourcesPath = process.resourcesPath;
    const platform = process.platform;
    const ext = platform === 'win32' ? '.exe' : '';
    const binaryName = `backend${ext}`;

    return path.join(resourcesPath, 'backend', binaryName);
  }

  /**
   * Get backend arguments for development mode
   */
  private getBackendArgs(): string[] {
    const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

    if (isDev) {
      // Development: run the server source directly
      const serverPath = path.join(app.getAppPath(), '..', 'server', 'src', 'index.ts');
      return ['run', serverPath];
    }

    // Production: no args needed for compiled binary
    return [];
  }

  /**
   * Start the backend server
   * @returns Promise resolving to the port number
   */
  async start(): Promise<number> {
    if (this.isRunning && this.port) {
      log.info(`Backend already running on port ${this.port}`);
      return this.port;
    }

    return new Promise((resolve, reject) => {
      const backendPath = this.getBackendPath();
      const args = this.getBackendArgs();
      const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
      const cwd = app.isPackaged ? undefined : path.join(app.getAppPath(), '..', 'server');

      // Pre-spawn diagnostics for debugging
      log.info('=== Backend Startup Diagnostics ===');
      log.info(`Mode: ${isDev ? 'Development' : 'Production'}`);
      log.info(`Backend path: ${backendPath}`);
      log.info(`Arguments: ${args.join(' ') || '(none)'}`);
      log.info(`Working directory: ${cwd || '(default)'}`);
      log.info(`Resources path: ${process.resourcesPath}`);

      // Check if binary exists (production only)
      if (!isDev) {
        const binaryExists = fs.existsSync(backendPath);
        log.info(`Binary exists: ${binaryExists}`);
        if (binaryExists) {
          const stats = fs.statSync(backendPath);
          log.info(`Binary size: ${stats.size} bytes`);
        } else {
          log.error(`CRITICAL: Backend binary not found at ${backendPath}`);
        }
      }

      log.info(`Starting backend: ${backendPath} ${args.join(' ')}`);

      // Set PORT to 0 for dynamic port allocation
      const env = {
        ...process.env,
        PORT: '0',
        NODE_ENV: app.isPackaged ? 'production' : 'development',
      };

      this.process = spawn(backendPath, args, {
        env,
        stdio: ['ignore', 'pipe', 'pipe'],
        cwd,
      });

      const timeout = setTimeout(() => {
        log.error('=== Backend Startup Timeout ===');
        log.error(`Timeout after ${BACKEND_START_TIMEOUT}ms`);
        log.error(`stdout buffer: ${this.stdoutBuffer || '(empty)'}`);
        log.error(`Port discovered: ${this.port || 'none'}`);
        log.error(`Process running: ${this.process ? !this.process.killed : false}`);
        this.stop();
        reject(new Error('Backend startup timeout'));
      }, BACKEND_START_TIMEOUT);

      // Parse PORT from stdout (buffer to handle chunked output)
      this.process.stdout?.on('data', (data: Buffer) => {
        const chunk = data.toString();
        log.debug(`Backend stdout: ${chunk}`);
        this.stdoutBuffer += chunk;

        // Look for PORT:XXXXX pattern in accumulated buffer
        const portMatch = this.stdoutBuffer.match(/PORT:(\d+)/);
        if (portMatch && !this.port) {
          this.port = parseInt(portMatch[1], 10);
          this.isRunning = true;
          clearTimeout(timeout);
          log.info(`Backend port discovered: ${this.port}`);
          resolve(this.port);
        }
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        log.warn(`Backend stderr: ${data.toString()}`);
      });

      this.process.on('error', (error: NodeJS.ErrnoException) => {
        clearTimeout(timeout);
        this.isRunning = false;

        // Provide detailed error message for common issues
        if (error.code === 'ENOENT') {
          const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
          if (isDev) {
            log.error(
              `Backend error: 'bun' command not found. Please install Bun runtime: https://bun.sh`
            );
          } else {
            log.error(
              `Backend error: Binary not found at ${backendPath}. The app may not be properly installed.`
            );
          }
        } else {
          log.error('Backend process error:', error);
        }
        reject(error);
      });

      this.process.on('exit', (code, signal) => {
        log.info(`Backend exited with code ${code}, signal ${signal}`);
        this.isRunning = false;
        this.port = null;
      });
    });
  }

  /**
   * Stop the backend server
   */
  stop(): void {
    // Clear any pending force kill timeout
    if (this.forceKillTimeout) {
      clearTimeout(this.forceKillTimeout);
      this.forceKillTimeout = null;
    }

    if (this.process) {
      log.info('Stopping backend process...');
      this.process.kill('SIGTERM');

      // Force kill after 5 seconds
      this.forceKillTimeout = setTimeout(() => {
        if (this.process && !this.process.killed) {
          log.warn('Force killing backend process...');
          this.process.kill('SIGKILL');
        }
        this.forceKillTimeout = null;
      }, 5000);

      this.process = null;
      this.isRunning = false;
      this.port = null;
      this.stdoutBuffer = '';
    }
  }

  /**
   * Get the current backend port
   */
  getPort(): number | null {
    return this.port;
  }

  /**
   * Check if backend is running
   */
  isBackendRunning(): boolean {
    return this.isRunning;
  }
}
