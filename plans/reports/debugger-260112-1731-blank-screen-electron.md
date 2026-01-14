# Electron Blank Screen - Root Cause Analysis Report

**Report ID:** debugger-260112-1731-blank-screen-electron
**Date:** 2026-01-12
**Issue:** Packaged Electron app shows blank/black screen on Windows

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** The frontend assets use **absolute paths** (`/assets/...`) which fail to resolve when loaded via `file://` protocol in packaged Electron app.

| Factor                                  | Impact                           | Severity |
| --------------------------------------- | -------------------------------- | -------- |
| Absolute asset paths in index.html      | Assets fail to load              | CRITICAL |
| BrowserRouter incompatible with file:// | Routing fails silently           | HIGH     |
| No Vite `base` config for Electron      | Paths resolve to filesystem root | HIGH     |

---

## Technical Analysis

### Issue #1: Absolute Asset Paths (CRITICAL)

**Location:** `desktop/renderer/index.html` (built from Vite)

```html
<script type="module" crossorigin src="/assets/index-0RmQ_VsT.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-CWeDAASG.css" />
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

**Problem:**

- Vite builds with `base: '/'` by default
- When Electron loads `file:///path/to/renderer/index.html`:
  - `/assets/index-0RmQ_VsT.js` resolves to `file:///assets/index-0RmQ_VsT.js` (filesystem root)
  - Correct path should be `file:///path/to/renderer/assets/index-0RmQ_VsT.js`
- **Result:** JS/CSS fail to load, React never mounts, screen stays blank

**Evidence:**

- `vite.config.ts` has no `base` configuration
- Built `index.html` uses absolute paths starting with `/`

### Issue #2: BrowserRouter Incompatible with file:// (HIGH)

**Location:** `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
// ...
<BrowserRouter>
  <Routes>
    <Route path="/" element={<Index />} />
  </Routes>
</BrowserRouter>;
```

**Problem:**

- `BrowserRouter` uses HTML5 History API
- `file://` protocol doesn't support History API properly
- Even if assets loaded, routing would fail

**Solution Required:** Use `HashRouter` for Electron production builds

### Issue #3: Path Resolution in Main Process (VERIFIED CORRECT)

**Location:** `desktop/src/main.ts:76-77`

```typescript
const indexPath = path.join(__dirname, '../renderer/index.html');
await mainWindow.loadFile(indexPath);
```

**Analysis:**

- `__dirname` in packaged app = `resources/app.asar/dist/`
- `../renderer/index.html` = `resources/app.asar/renderer/index.html`
- Path resolution is CORRECT per electron-builder config
- Issue is in the HTML content, not the loading mechanism

---

## Build Process Analysis

### electron-builder.yml Configuration

```yaml
files:
  - dist/**/* # Compiled Electron main process
  - renderer/**/* # Frontend build output
  - resources/**/* # Icons, etc.
```

**Build Flow:**

1. `npm run build` -> Vite builds to `dist/`
2. `cp -r dist/* desktop/renderer/` -> Copy to renderer folder
3. `npx tsc` -> Compile Electron TypeScript to `desktop/dist/`
4. `electron-builder` -> Package into ASAR

**ASAR Structure (Packaged):**

```
resources/app.asar/
├── dist/           # main.js, preload.js (Electron main)
├── renderer/       # index.html, assets/ (Frontend)
│   ├── index.html  # <-- Uses absolute paths (BUG)
│   └── assets/
│       ├── index-xxx.js
│       └── index-xxx.css
└── resources/
```

---

## Root Cause Chain

```
1. Vite builds with base: '/' (default)
   ↓
2. index.html has absolute paths: src="/assets/..."
   ↓
3. Electron loads: file:///...app.asar/renderer/index.html
   ↓
4. Browser resolves "/assets/..." to file:///assets/...
   ↓
5. Assets NOT FOUND (wrong path)
   ↓
6. React never loads, #root stays empty
   ↓
7. BLACK SCREEN (only background color shows)
```

---

## Recommended Fixes

### Fix #1: Set Vite `base` for Electron Build (REQUIRED)

**File:** `vite.config.ts`

```typescript
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? './' : '/', // Relative paths for production
  // ... rest of config
}));
```

**Result:** Built index.html will have:

```html
<script type="module" crossorigin src="./assets/index-xxx.js"></script>
```

### Fix #2: Use HashRouter for Electron (REQUIRED)

**File:** `src/App.tsx`

```tsx
// Option A: Conditional router
const Router = window.electronAPI ? HashRouter : BrowserRouter;

// Option B: Always use HashRouter (simpler)
import { HashRouter } from 'react-router-dom';
```

### Fix #3: Add File-Based Logging for Debugging (RECOMMENDED)

**Current State:** `electron-log` is configured but logs may not persist on crash

**Recommendation:** Add startup diagnostics:

```typescript
// In main.ts after createWindow
log.info('Index path:', indexPath);
log.info('Index exists:', fs.existsSync(indexPath));
log.info('App path:', app.getAppPath());
log.info('Resources path:', process.resourcesPath);
```

**Log Location:** `%APPDATA%/Nano Banana Slides Prompter/logs/main.log`

---

## Verification Steps

After implementing fixes:

1. Build frontend: `npm run build`
2. Check `dist/index.html` uses relative paths (`./assets/...`)
3. Copy to renderer: `npm run build:desktop:copy`
4. Build Electron: `cd desktop && npm run build`
5. Install and run packaged app
6. Verify UI loads correctly
7. Check logs at `%APPDATA%/Nano Banana Slides Prompter/logs/`

---

## Secondary Issues Discovered

### Auto-Updater Crash in Dev Mode

**Error:**

```
TypeError: Cannot read properties of undefined (reading 'getVersion')
at get version (electron-updater/out/ElectronAppAdapter.js:14:25)
```

**Cause:** `electron-updater` imported at module level before `app` is ready

**Impact:** Dev mode crashes immediately (not related to blank screen in production)

**Fix:** Lazy-load auto-updater or guard with `app.isPackaged` check

---

## Unresolved Questions

1. **Why wasn't this caught during development?**
   - Dev mode uses `loadURL('http://localhost:8080')` which works with absolute paths
   - Production uses `loadFile()` which exposes the path issue

2. **Should the build script auto-detect Electron target?**
   - Currently requires manual `base` configuration
   - Could use env variable or separate build config

3. **Are there other file:// related issues?**
   - CORS for backend API calls (appears handled via origin check)
   - Web fonts loading (needs verification)

---

## References

- Vite base config: https://vite.dev/config/shared-options.html#base
- React Router file:// support: https://reactrouter.com/en/main/routers/create-hash-router
- Electron file protocol: https://www.electronjs.org/docs/latest/api/protocol
