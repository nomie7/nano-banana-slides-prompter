# Research: Electron + Bun Backend Integration

**Date:** 2026-01-12 | **Researcher ID:** a37d8c4

---

## 1. Electron Child Process Spawning

### UtilityProcess vs child_process.spawn

| Aspect | UtilityProcess | child_process.spawn/fork |
|--------|----------------|--------------------------|
| Integration | Chromium Services API | Standard Node.js |
| Renderer IPC | Direct via MessagePort | Must go through main process |
| Node.js env | Full support | Full support |
| Recommended | **Yes** (modern Electron) | Legacy/simple cases |

### Best Practices
- **Prefer UtilityProcess** for spawning from main process
- Use `MessagePort` for direct renderer-to-utility communication
- Isolate CPU-intensive/crash-prone code in utility processes
- Graceful shutdown: listen to `app.on('before-quit')` and terminate child processes

```javascript
// main.js - UtilityProcess example
import { utilityProcess } from 'electron';

const child = utilityProcess.fork(path.join(__dirname, 'backend.js'));
child.on('message', (msg) => console.log('From utility:', msg));
child.postMessage({ type: 'start', port: 3000 });

app.on('before-quit', () => {
  child.kill();
});
```

---

## 2. Bun Binary Embedding in Electron

### Two Approaches

**Option A: Embed Bun runtime + script files**
- Download platform-specific Bun binaries (bun-windows-x64, bun-darwin-arm64, etc.)
- Bundle as extraResources
- Spawn Bun with script at runtime

**Option B: `bun build --compile` (Recommended)**
- Compile backend to single executable per platform
- No runtime dependency on Bun binary
- Smaller, faster startup

```bash
# Build single executable for each platform
bun build ./src/backend/index.ts --compile --outfile=backend-win.exe --target=bun-windows-x64
bun build ./src/backend/index.ts --compile --outfile=backend-mac --target=bun-darwin-arm64
bun build ./src/backend/index.ts --compile --outfile=backend-linux --target=bun-linux-x64
```

### Platform Binary Sources
- Official releases: `https://github.com/oven-sh/bun/releases`
- Or use compiled executables (no Bun runtime needed)

---

## 3. electron-builder Configuration

### extraResources Setup

```json
// package.json or electron-builder.yml
{
  "build": {
    "extraResources": [
      {
        "from": "bin/${os}",
        "to": "bin",
        "filter": ["**/*"]
      }
    ]
  }
}
```

### Platform Variable Mapping
- `${os}` resolves to: `win`, `mac`, `linux`
- Files copied to `resources/bin/` in packaged app

### Runtime Access

```javascript
import path from 'path';
import { spawn } from 'child_process';

const getBinaryPath = () => {
  const ext = process.platform === 'win32' ? '.exe' : '';
  return path.join(process.resourcesPath, 'bin', `backend${ext}`);
};

// Spawn the backend
const backend = spawn(getBinaryPath(), [], {
  stdio: 'pipe',
  env: { ...process.env, PORT: '0' }
});
```

### Build Script Hook (download binaries before build)

```json
{
  "scripts": {
    "prebuild": "node scripts/download-binaries.js",
    "build": "electron-builder"
  }
}
```

---

## 4. Port Management

### Dynamic Port Allocation

**Method 1: Listen on port 0 (OS assigns)**
```javascript
// backend server
const server = Bun.serve({
  port: 0, // OS picks available port
  fetch(req) { /* ... */ }
});
console.log(`PORT:${server.port}`); // stdout for parent to parse
```

**Method 2: portfinder package**
```javascript
import portfinder from 'portfinder';
const port = await portfinder.getPortPromise({ port: 3000 });
```

### IPC Pattern: Backend -> Electron Main

```javascript
// main.js
const backend = spawn(getBinaryPath());
let backendPort = null;

backend.stdout.on('data', (data) => {
  const match = data.toString().match(/PORT:(\d+)/);
  if (match) {
    backendPort = parseInt(match[1], 10);
    mainWindow.webContents.send('backend-ready', backendPort);
  }
});
```

### Frontend Connection

```javascript
// preload.js
contextBridge.exposeInMainWorld('api', {
  onBackendReady: (callback) => ipcRenderer.on('backend-ready', (_, port) => callback(port))
});

// renderer
window.api.onBackendReady((port) => {
  fetch(`http://localhost:${port}/api/...`);
});
```

---

## 5. Recommended Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Electron App                       │
├──────────────┬──────────────┬───────────────────────┤
│  Main Process│  Renderer    │  Backend (Bun compiled)│
│              │  (React)     │                        │
│  - Spawns    │  - UI        │  - HTTP server         │
│    backend   │  - IPC       │  - API endpoints       │
│  - Port mgmt │  - fetch()   │  - LLM integration     │
└──────────────┴──────────────┴───────────────────────┘
```

### Startup Flow
1. Main process spawns compiled backend binary
2. Backend listens on port 0, outputs `PORT:XXXXX`
3. Main parses stdout, sends port to renderer via IPC
4. Renderer connects to `http://localhost:XXXXX`

---

## 6. Alternative: Electrobun

[Electrobun](https://electrobun.dev) is emerging framework using Bun + native webview (not Chromium). Benefits:
- Smaller app size (no bundled Chromium)
- Native webview rendering
- Still experimental, not production-ready

**Recommendation:** Stick with Electron + embedded Bun binary for stability.

---

## Key Recommendations

1. **Use `bun build --compile`** to create single executables per platform
2. **Configure extraResources** with `${os}` variable for platform-specific binaries
3. **Use port 0** for dynamic allocation, parse from stdout
4. **Prefer UtilityProcess** if spawning Node.js; use `spawn` for external binaries
5. **Graceful shutdown** in `app.on('before-quit')`

---

## Unresolved Questions

1. **Code signing:** How to sign compiled Bun executables on macOS/Windows?
2. **Auto-update:** Will electron-updater handle extraResources correctly?
3. **Antivirus:** May compiled Bun executables trigger false positives on Windows?

---

## Sources

- [Electron UtilityProcess Docs](https://electronjs.org)
- [Bun Single Executable Docs](https://bun.com)
- [electron-builder extraResources](https://electron.build)
- [portfinder npm](https://dev.to)
- [Electrobun Framework](https://electrobun.dev)
- [Stack Overflow - extraResources](https://stackoverflow.com)
