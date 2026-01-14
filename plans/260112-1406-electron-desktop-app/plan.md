---
title: "Electron Desktop App for Nano Banana Slides Prompter"
description: "Convert React+Bun web app to cross-platform desktop app using Electron with embedded Bun backend"
status: pending
priority: P2
effort: 12h
branch: main
tags: [electron, desktop, cross-platform, ci-cd]
created: 2026-01-12
---

# Electron Desktop App Implementation Plan

## Overview

Convert existing React 19 + Vite 7 frontend and Bun + Hono backend into a cross-platform Electron desktop application with auto-update capability.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Electron App                              │
├─────────────────┬─────────────────┬─────────────────────────┤
│  Main Process   │  Renderer       │  Backend (Bun compiled) │
│  (Node.js)      │  (React 19)     │  (child_process)        │
│                 │                 │                         │
│  - Window mgmt  │  - UI/UX        │  - HTTP API server      │
│  - Backend spawn│  - IPC bridge   │  - LLM integration      │
│  - Port mgmt    │  - fetch()      │  - SSE streaming        │
│  - Auto-update  │                 │                         │
└─────────────────┴─────────────────┴─────────────────────────┘
```

## Phases

| Phase | Title | Effort | Status | File |
|-------|-------|--------|--------|------|
| 1 | Electron Shell Setup | 5h | pending | [phase-01-electron-shell.md](./phase-01-electron-shell.md) |
| 2 | CI/CD Build Pipeline | 4h | pending | [phase-02-build-pipeline.md](./phase-02-build-pipeline.md) |
| 3 | Polish & Production | 3h | pending | [phase-03-polish.md](./phase-03-polish.md) |

## Key Decisions

1. **Framework:** Electron (stability over Tauri's smaller size)
2. **Backend:** Bun compiled binary via `bun build --compile`
3. **Port mgmt:** Dynamic allocation (port 0), stdout parsing
4. **Build tool:** electron-builder with extraResources
5. **Auto-update:** electron-updater + GitHub Releases
6. **Code signing:** Deferred (unsigned for initial release)

## Directory Structure (New)

```
desktop/
├── src/
│   ├── main.ts           # Electron main process
│   ├── preload.ts        # IPC bridge
│   └── backend-manager.ts # Backend lifecycle
├── scripts/
│   └── build-backend.ts  # Compile Bun binaries
├── resources/
│   └── icons/            # App icons
├── package.json
├── electron-builder.yml
└── tsconfig.json
```

## Success Criteria

- [ ] App launches on Windows, macOS, Linux
- [ ] Backend starts automatically, port communicated via IPC
- [ ] All existing features work (prompt generation, URL extraction, sessions)
- [ ] GitHub Actions builds and releases for all platforms
- [ ] Auto-updater checks for new versions

## Unresolved Questions

1. How to handle first-run LLM configuration (no .env in desktop)?
2. Should sessions persist in app data folder or user-selected location?
3. macOS notarization for open-source project without paid Apple Developer account?

## Validation Summary

**Validated:** 2026-01-12
**Questions asked:** 7

### Confirmed Decisions

| Decision | User Choice | Notes |
|----------|-------------|-------|
| First-run LLM config | React-based setup wizard | Full-screen wizard in React, consistent UX |
| Session storage | App data folder | %APPDATA%/nano-banana-slides-prompter |
| macOS builds | Separate builds per arch | arm64 + x64 separate DMGs |
| Auto-updater behavior | Notify only, user decides | No auto-download |
| Versioning strategy | Separate versions | Desktop 1.1.0+, Web stays 1.0.x |
| LLM config injection | Via environment | Main process sets env vars before spawn |
| Dev experience | Full hot-reload | Electron loads localhost:8080 in dev |

### Action Items

- [ ] Add React-based setup wizard component in Phase 3
- [ ] Update backend-manager to accept env vars from config
- [ ] Document separate versioning strategy in README
