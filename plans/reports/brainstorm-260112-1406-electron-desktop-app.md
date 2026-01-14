# Brainstorm Report: Electron Desktop App + CI/CD

**Date:** 2026-01-12
**Status:** Agreed
**Scope:** Add Electron desktop app with embedded Bun backend, cross-platform builds, GitHub Actions CI/CD

---

## Problem Statement

Need to package Nano Banana Slides Prompter as a standalone desktop application that:
- Runs on Windows, macOS, and Linux
- Bundles both frontend and backend into single distributable
- Builds automatically via GitHub Actions
- Supports auto-updates via GitHub Releases

---

## Current State

| Component | Technology | Notes |
|-----------|------------|-------|
| Frontend | React 19 + Vite 7 | Standard web app |
| Backend | Bun + Hono | **No Bun-specific APIs** - Node.js compatible |
| CI/CD | Docker publish only | `docker-publish.yml` |
| Distribution | Docker images | ghcr.io hosted |

---

## Agreed Solution

### Architecture

```
┌─────────────────────────────────────────────────┐
│                  Electron App                    │
├─────────────────────────────────────────────────┤
│  Main Process (Node.js)                         │
│  ├── Window management                          │
│  ├── IPC handlers                               │
│  ├── Auto-updater                               │
│  └── Child Process Manager ──┐                  │
│                              │                  │
│  ┌───────────────────────────▼───────────────┐  │
│  │  Bun Backend (child process)              │  │
│  │  └── Hono server on localhost:3001        │  │
│  └───────────────────────────────────────────┘  │
│                                                 │
│  Renderer Process (Chromium)                    │
│  └── React frontend (prebuilt)                  │
└─────────────────────────────────────────────────┘
```

### Key Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | **Electron** | Mature, wide support, team familiarity |
| Backend bundling | **Embedded Bun binary** | Full compatibility, reliable |
| Directory structure | **`desktop/` folder** | Clean separation from web app |
| Platforms | **Win + Mac + Linux** | Full cross-platform |
| Code signing | **Deferred** | Add later when certificates available |
| Auto-update | **GitHub Releases** | Free, built-in electron-updater support |
| Build tool | **electron-builder** | Industry standard, GitHub Actions support |

### Directory Structure

```
nano-banana-slides-prompter/
├── src/                    # Frontend source (existing)
├── server/                 # Backend source (existing)
├── desktop/                # NEW: Electron app
│   ├── package.json        # Electron dependencies
│   ├── electron-builder.yml
│   ├── src/
│   │   ├── main.ts         # Main process
│   │   ├── preload.ts      # Preload script
│   │   └── backend-manager.ts  # Bun process manager
│   ├── resources/          # App icons, assets
│   │   ├── icon.icns       # macOS
│   │   ├── icon.ico        # Windows
│   │   └── icon.png        # Linux
│   └── scripts/
│       └── download-bun.js # Download platform-specific Bun
├── .github/workflows/
│   ├── docker-publish.yml  # Existing
│   └── electron-build.yml  # NEW: Desktop builds
└── package.json            # Root (existing)
```

### CI/CD Workflow

**New file:** `.github/workflows/electron-build.yml`

```yaml
# Triggers
- Push tags: v*.*.*
- Manual dispatch

# Jobs (parallel matrix)
- build-windows (windows-latest)
- build-macos (macos-latest)
- build-linux (ubuntu-latest)

# Artifacts
- Windows: .exe installer, portable .exe
- macOS: .dmg, .zip (unsigned initially)
- Linux: .AppImage, .deb

# Release
- Upload to GitHub Releases (draft)
- Generate changelog from commits
```

### Backend Embedding Strategy

1. **Build phase:**
   - Download platform-specific Bun binary (~80MB)
   - Build backend with `bun build --compile` → single executable
   - Include in Electron's `extraResources`

2. **Runtime:**
   - Main process spawns backend as child process
   - Backend listens on `localhost:3001`
   - Frontend connects via existing API
   - Graceful shutdown on app exit

3. **IPC (optional enhancement):**
   - Can add direct IPC for faster communication
   - Fallback to HTTP for compatibility

---

## Evaluated Alternatives

### Backend Bundling

| Approach | Bundle Size | Complexity | Chosen |
|----------|-------------|------------|--------|
| Embed Bun binary | +80MB | Medium | ✅ Yes |
| Transpile to Node.js | +5MB | High | No |
| Separate portable server | +80MB | Low | No |

**Rationale:** Embedding Bun ensures identical behavior to development. Transpilation risk breaking edge cases.

### Framework Alternatives

| Framework | Bundle Size | Performance | Ecosystem |
|-----------|-------------|-------------|-----------|
| Electron | ~150MB | Good | Excellent |
| Tauri | ~10MB | Excellent | Growing |
| Neutralino | ~5MB | Good | Limited |

**Rationale:** Electron chosen for maturity and Bun child process simplicity. Tauri's Rust sidecar would add complexity.

---

## Implementation Phases

### Phase 1: Electron Shell (MVP)
- [ ] Create `desktop/` structure
- [ ] Basic Electron main/renderer setup
- [ ] Embed prebuilt frontend
- [ ] Spawn Bun backend as child process
- [ ] Test locally on Windows

### Phase 2: Build Pipeline
- [ ] Add electron-builder config
- [ ] Create `electron-build.yml` workflow
- [ ] Build unsigned installers for all platforms
- [ ] Upload to GitHub Releases

### Phase 3: Polish
- [ ] App icons for all platforms
- [ ] Auto-updater integration
- [ ] Graceful error handling
- [ ] First-run setup wizard (optional)

### Phase 4: Production (Future)
- [ ] Apple Developer enrollment + notarization
- [ ] Windows code signing certificate
- [ ] Signed builds in CI

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Bun binary size (+80MB) | Medium | Accept trade-off for reliability |
| macOS Gatekeeper warnings | High | Document manual bypass; add signing later |
| Windows SmartScreen warnings | High | Document manual bypass; add signing later |
| Backend port conflicts | Low | Auto-find available port |
| Child process crashes | Medium | Auto-restart with backoff |

---

## Success Metrics

- [ ] Single installer works on Win/Mac/Linux
- [ ] App launches and generates prompts successfully
- [ ] Auto-updater detects new GitHub releases
- [ ] CI builds complete in <15 minutes per platform
- [ ] Bundle size <250MB (Electron + Bun + app)

---

## Dependencies

- **electron**: ^28.0.0
- **electron-builder**: ^24.0.0
- **electron-updater**: ^6.0.0
- **Bun binaries**: Downloaded per-platform during build

---

## Sources

- [Electron Process Model](https://www.electronjs.org/docs/latest/tutorial/process-model)
- [electron-builder GitHub Actions](https://github.com/samuelmeuli/action-electron-builder)
- [Bun spawn best practices](https://bun.sh/docs/runtime/shell)
- [Cross-platform code signing](https://dev.to/nickmessing/electron-signing-and-notarizing)

---

## Next Steps

1. Create detailed implementation plan with `/plan:hard`
2. Implement Phase 1 (Electron shell)
3. Test on all platforms
4. Set up CI workflow
