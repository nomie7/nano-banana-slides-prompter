# Debug Report: Backend Startup Timeout in Electron Desktop App

**Report ID:** debugger-260113-2106-backend-startup-timeout
**Date:** 2026-01-13
**Status:** Root Cause Identified
**Severity:** Critical (app cannot start)

---

## Executive Summary

User installs and runs the Electron desktop app, receives error: "Failed to start the backend server - Backend startup timeout". Investigation identified **multiple root causes** preventing backend startup in production builds.

**Primary Issues:**

1. Backend binary not built/bundled (missing `desktop/backend/` directory)
2. Critical bug: Server outputs PORT before actually binding (PORT=0 issue)
3. Bun runtime not available on end-user systems for dev mode fallback

---

## Technical Analysis

### 1. Backend Binary Missing (Production Build)

**Location:** `desktop/electron-builder.yml` lines 14-18, `desktop/scripts/build-backend.ts`

**Problem:**

```yaml
extraResources:
  - from: backend/
    to: backend/
    filter:
      - '**/*'
```

The `electron-builder.yml` expects a `desktop/backend/` directory containing compiled backend binary. However:

- Directory `desktop/backend/` does **NOT exist** in the codebase
- The `build-backend.ts` script creates binaries in `desktop/backend/` but must be run manually via `npm run build:backend`
- **prebuild hook exists** in `desktop/package.json` but only runs during `npm run build`, not during development

**Evidence:**

```
> dir "d:\NCKH_2025\nano-banana-slides-prompter\desktop\backend"
Backend directory not found
```

### 2. Dynamic Port Allocation Bug (Critical)

**Location:** `server/src/index.ts` lines 52-66

**Problem:** Server outputs `PORT:{port}` BEFORE the server actually starts listening.

```typescript
const port = Number(process.env.PORT) || 3001; // Line 52
console.log(`Starting server on port ${port}...`); // Line 53

const server = {
  port,
  fetch: app.fetch,
  idleTimeout: 255,
};

// BUG: This outputs PORT:0 when PORT=0 is set, before server binds to actual port
console.log(`PORT:${port}`); // Line 64 - Outputs "PORT:0" not actual port!

export default server; // Line 66
```

**BackendManager expects:** `PORT:XXXXX` pattern where XXXXX is actual bound port
**Server outputs:** `PORT:0` when `PORT=0` env var is set

**Root Cause Flow:**

1. `BackendManager` sets `PORT=0` for dynamic allocation (line 70)
2. Server reads `process.env.PORT` as `0`
3. Server outputs `PORT:0` immediately (not the actual allocated port)
4. Bun's `export default server` pattern relies on Bun runtime to call `Bun.serve(server)` implicitly
5. When compiled to standalone binary, this implicit behavior may not work correctly
6. BackendManager never receives valid port, times out after 10 seconds

### 3. Bun Runtime Not Available (Development Mode)

**Location:** `desktop/src/backend-manager.ts` lines 18-24, 38-48

**Problem:** In development mode (`!app.isPackaged`), BackendManager tries to spawn `bun` directly:

```typescript
if (isDev) {
  return 'bun'; // Assumes bun is in PATH
}
```

**Evidence:**

```
> where bun
Bun not found in PATH
```

End users typically don't have Bun installed. Even developers may not have it in PATH.

### 4. Path Resolution Issues (Production)

**Location:** `desktop/src/backend-manager.ts` lines 26-32

```typescript
const resourcesPath = process.resourcesPath;
const binaryName = `backend${ext}`;
return path.join(resourcesPath, 'backend', binaryName);
```

In packaged app:

- `process.resourcesPath` points to `resources/` inside the app bundle
- Expects `resources/backend/backend.exe` (Windows)
- This path is correct IF the binary was built and bundled

---

## Code Locations Summary

| Issue                     | File                             | Lines | Severity |
| ------------------------- | -------------------------------- | ----- | -------- |
| Missing backend binary    | `desktop/backend/`               | N/A   | Critical |
| PORT output before bind   | `server/src/index.ts`            | 52-66 | Critical |
| PORT=0 handling           | `server/src/index.ts`            | 52    | Critical |
| Bun not in PATH           | `desktop/src/backend-manager.ts` | 21-23 | High     |
| Build script not auto-run | `desktop/package.json`           | 16    | Medium   |

---

## Potential Fixes (Do NOT Implement)

### Fix 1: Correct Dynamic Port Allocation (Critical)

The server must use `Bun.serve()` explicitly and output the actual bound port:

```typescript
// Instead of export default server, use:
const instance = Bun.serve({
  port: 0, // Let OS assign port
  fetch: app.fetch,
  idleTimeout: 255,
});

// Output ACTUAL port after server starts
console.log(`PORT:${instance.port}`);
```

### Fix 2: Ensure Backend Binary is Built

Add to build process:

1. Run `npm run build:backend` before `electron-builder`
2. Verify `desktop/backend/backend.exe` exists before packaging
3. Add CI/CD step to build backend for all platforms

### Fix 3: Bundle Bun Runtime or Use Node Fallback

Options:

- Bundle Bun runtime with the app (increases size ~90MB)
- Compile backend to standalone binary (current approach, needs fix)
- Add Node.js fallback for when Bun is unavailable

### Fix 4: Improve Error Handling in BackendManager

Add better diagnostics:

```typescript
this.process.on('error', (error) => {
  if (error.code === 'ENOENT') {
    log.error(`Backend binary not found at: ${backendPath}`);
  }
  // ... existing handling
});
```

### Fix 5: Increase Timeout and Add Retry Logic

Current: 10 seconds, no retry
Suggested: 30 seconds with 3 retries, exponential backoff

---

## Verification Steps (For Testing Fixes)

1. Build backend: `cd desktop && npm run build:backend`
2. Verify binary exists: `dir desktop\backend\backend.exe`
3. Test binary standalone: `desktop\backend\backend.exe`
4. Check stdout for `PORT:XXXXX` with actual port number
5. Run Electron dev: `npm run electron:dev`
6. Build full package: `cd desktop && npm run build`
7. Install and test packaged app

---

## Unresolved Questions

1. **Bun standalone binary behavior:** Does `export default server` pattern work correctly when compiled with `bun build --compile`? Need to verify Bun's implicit `Bun.serve()` call works in standalone mode.

2. **Cross-platform builds:** The `build-backend.ts` only builds for current platform. How are cross-platform releases handled in CI/CD?

3. **User environment:** Does the app work if user has Bun installed but backend binary fails? Is there fallback logic needed?

4. **Antivirus interference:** Could Windows Defender or other AV software block the spawned backend binary?

5. **Port conflicts:** If port 0 allocation fails, what error message does user see? Should add specific handling.

---

## Appendix: Key Files Reference

- `desktop/src/backend-manager.ts` - Backend process management
- `desktop/src/main.ts` - Electron main process, window creation
- `desktop/scripts/build-backend.ts` - Backend binary compilation
- `desktop/electron-builder.yml` - Packaging configuration
- `server/src/index.ts` - Backend server entry point
- `desktop/package.json` - Build scripts and dependencies
