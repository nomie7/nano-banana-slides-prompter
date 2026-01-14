/**
 * Build backend binaries for different platforms
 * This script compiles the Bun server into standalone executables
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const PLATFORMS = [
  { target: 'bun-windows-x64', output: 'backend.exe' },
  { target: 'bun-linux-x64', output: 'backend' },
  { target: 'bun-darwin-x64', output: 'backend' },
  { target: 'bun-darwin-arm64', output: 'backend' },
];

const ROOT_DIR = path.resolve(__dirname, '../..');
const SERVER_DIR = path.join(ROOT_DIR, 'server');
const OUTPUT_DIR = path.join(__dirname, '..', 'backend');

function buildBackend(): void {
  console.log('Building backend binaries...');

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Get current platform
  const currentPlatform = process.platform;
  const currentArch = process.arch;

  let targetPlatform: (typeof PLATFORMS)[0] | undefined;

  if (currentPlatform === 'win32') {
    targetPlatform = PLATFORMS.find((p) => p.target === 'bun-windows-x64');
  } else if (currentPlatform === 'darwin') {
    targetPlatform = PLATFORMS.find(
      (p) => p.target === (currentArch === 'arm64' ? 'bun-darwin-arm64' : 'bun-darwin-x64')
    );
  } else if (currentPlatform === 'linux') {
    targetPlatform = PLATFORMS.find((p) => p.target === 'bun-linux-x64');
  }

  if (!targetPlatform) {
    console.error(`Unsupported platform: ${currentPlatform}-${currentArch}`);
    process.exit(1);
  }

  const entryPoint = path.join(SERVER_DIR, 'src', 'index.ts');
  const outputPath = path.join(OUTPUT_DIR, targetPlatform.output);

  console.log(`Building for ${targetPlatform.target}...`);
  console.log(`Entry: ${entryPoint}`);
  console.log(`Output: ${outputPath}`);

  try {
    // Build using bun build --compile
    // Exclude native modules that can't be bundled (pdfjs-dist optional canvas dependency)
    execSync(
      `bun build --compile --target=${targetPlatform.target} --outfile="${outputPath}" --external @napi-rs/canvas "${entryPoint}"`,
      {
        cwd: SERVER_DIR,
        stdio: 'inherit',
      }
    );
    console.log(`Successfully built: ${outputPath}`);
  } catch (error) {
    console.error(`Failed to build backend:`, error);
    process.exit(1);
  }

  // Copy .env.example if exists
  const envExample = path.join(SERVER_DIR, '.env.example');
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, path.join(OUTPUT_DIR, '.env.example'));
    console.log('Copied .env.example');
  }

  console.log('Backend build complete!');
}

buildBackend();
