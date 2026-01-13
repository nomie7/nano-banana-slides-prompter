# Codebase Summary

**Version:** 1.2.5 | **Last Updated:** 2026-01-13

## Overview

The Nano Banana Slides Prompter is a full-stack application with a React frontend (~10,000 LOC), Hono backend (~2,553 LOC), and Electron desktop shell (~1,094 LOC). Total codebase is approximately 14,000 LOC.

## Project Structure

```
nano-banana-slides-prompter/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── ui/             # shadcn/ui primitives (48 files)
│   │   ├── slide-prompt/   # Domain components (6 files)
│   │   ├── brand-kit/      # Brand Kit components (1 file)
│   │   └── course-builder/ # Course Builder components (1 file)
│   ├── pages/              # Route pages (2 files)
│   ├── stores/             # Zustand state (4 files)
│   ├── hooks/              # Custom hooks (3 files)
│   ├── lib/                # Utilities (3 files)
│   ├── data/               # Static data files
│   │   └── templates/      # Template definitions
│   │       └── categories/ # Template categories (5 files)
│   ├── types/              # TypeScript types (1 file)
│   └── i18n/               # Internationalization (4 files: index + 3 locales)
├── server/                 # Backend source
│   └── src/
│       ├── prompts/        # System prompts & types
│       ├── routes/         # API route handlers
│       └── services/       # Business logic
├── desktop/                # Electron desktop app
│   ├── src/                # Electron source files
│   │   ├── main.ts         # Main process entry
│   │   ├── preload.ts      # Preload script (IPC bridge)
│   │   ├── backend-manager.ts  # Backend process management
│   │   ├── config-manager.ts   # User preferences
│   │   ├── auto-updater.ts     # GitHub releases updater
│   │   └── menu.ts         # Application menu
│   ├── scripts/            # Build scripts
│   │   └── build-backend.ts    # Compile Bun binary
│   ├── resources/          # App icons and assets
│   └── electron-builder.yml    # Build configuration
├── docs/                   # Documentation
│   └── samples/            # Sample slide images
└── public/                 # Static assets
```

## Frontend Architecture

### Entry Points

| File           | Purpose                                         |
| -------------- | ----------------------------------------------- |
| `src/main.tsx` | React DOM render, i18n initialization           |
| `src/App.tsx`  | Router setup, providers (Query, Tooltip, Toast) |

### Pages

| Page           | Path | Description                      |
| -------------- | ---- | -------------------------------- |
| `Index.tsx`    | `/`  | Main application with 5 sections |
| `NotFound.tsx` | `*`  | 404 error page                   |

### Domain Components (`src/components/slide-prompt/`)

| Component                  | Purpose                            |
| -------------------------- | ---------------------------------- |
| `ContentInput.tsx`         | Text/URL/CSV content input         |
| `StyleSelector.tsx`        | Visual style selection (20 styles) |
| `CharacterSelector.tsx`    | Character presenter options        |
| `PresentationSettings.tsx` | Aspect ratio, slide count, palette |
| `PromptOutput.tsx`         | Generated prompts display          |
| `SlideCard.tsx`            | Individual slide prompt card       |

### UI Components (`src/components/ui/`)

48 shadcn/ui components built on Radix UI primitives:

- Dialog, Sheet, Dropdown, Popover
- Button, Input, Textarea, Select
- Tabs, Accordion, Collapsible
- Toast, Sonner (notifications)
- Card, Badge, Avatar, Label

### State Management

**Zustand Store** (`src/stores/sessionStore.ts`):

- Session CRUD operations
- Current session tracking
- Abort controller management
- Server sync with debouncing

**Settings Store** (`src/stores/settingsStore.ts`):

- LLM configuration settings
- User preferences

**Brand Kit Store** (`src/stores/brandKitStore.ts`):

- Brand colors (primary/secondary)
- Font family and size
- Logo URL (base64)
- Company name
- localStorage persistence

**Course Builder Store** (`src/stores/courseBuilderStore.ts`):

- Course structure (title, description)
- Lesson management (CRUD)
- localStorage persistence

### Custom Hooks

| Hook                        | Purpose                             |
| --------------------------- | ----------------------------------- |
| `useStreamingGeneration.ts` | SSE streaming for prompt generation |
| `usePromptOptimizer.ts`     | Prompt optimization via LLM         |
| `use-toast.ts`              | Toast notification management       |
| `use-mobile.tsx`            | Mobile device detection             |

### Utilities (`src/lib/`)

| File                 | Purpose                                                       |
| -------------------- | ------------------------------------------------------------- |
| `utils.ts`           | Class name merging (clsx + tailwind-merge)                    |
| `api.ts`             | API client functions                                          |
| `promptGenerator.ts` | Prompt generation logic                                       |
| `export.ts`          | Export orchestration (MD, TXT, JSON, PPTX, PDF, Canva, Figma) |

### Exporters (`src/lib/exporters/`)

| File                | Purpose                  |
| ------------------- | ------------------------ |
| `index.ts`          | Re-exports all exporters |
| `canva-exporter.ts` | Canva JSON format export |
| `figma-exporter.ts` | Figma JSON format export |

### Internationalization (`src/i18n/`)

| File              | Purpose                 |
| ----------------- | ----------------------- |
| `index.ts`        | i18next configuration   |
| `locales/en.json` | English translations    |
| `locales/vi.json` | Vietnamese translations |
| `locales/zh.json` | Chinese translations    |

## Backend Architecture

### Entry Point

`server/src/index.ts` - Hono server with:

- CORS middleware for allowed origins
- Request logging
- Route mounting
- Error handling

### Routes (`server/src/routes/`)

| File          | Endpoints                                                       | Description            |
| ------------- | --------------------------------------------------------------- | ---------------------- |
| `prompt.ts`   | `POST /api/generate-prompt`, `POST /api/generate-prompt-stream` | Prompt generation      |
| `extract.ts`  | `POST /api/extract-url`                                         | URL content extraction |
| `sessions.ts` | `GET/POST /api/sessions`, `PUT/DELETE /api/sessions/:id`        | Session CRUD           |
| `settings.ts` | `GET /api/settings/llm`                                         | LLM configuration      |
| `optimize.ts` | `POST /api/optimize-prompt`                                     | Prompt optimization    |

### Services (`server/src/services/`)

| File                 | Purpose                               |
| -------------------- | ------------------------------------- |
| `llm.ts`             | OpenAI SDK wrapper, streaming support |
| `scraper.ts`         | Web scraping with Cheerio             |
| `promptOptimizer.ts` | Self-refine prompt optimization       |

### Prompts (`server/src/prompts/`)

| File           | Purpose                           | LOC    |
| -------------- | --------------------------------- | ------ |
| `system.ts`    | System prompts, styles, templates | ~1,300 |
| `types.ts`     | Type definitions                  | ~280   |
| `optimizer.ts` | Optimizer system prompts          | ~100   |

**System Prompt Features**:

- 20 visual styles with personas
- 13 color palettes
- 8 character render styles
- 50+ slide type templates
- Chain-of-thought prompting

## Key Data Flows

### 1. Prompt Generation Flow

```
User Input → ContentInput → sessionStore.updateConfig
    ↓
Generate Button → useStreamingGeneration
    ↓
POST /api/generate-prompt-stream → LLM Service
    ↓
SSE Stream → Parse Slides → Update sessionStore
    ↓
PromptOutput → SlideCard (display)
```

### 2. Session Management Flow

```
App Load → sessionStore.loadSessions → GET /api/sessions
    ↓
Create/Update/Delete → Optimistic Update → Debounced Sync
    ↓
POST /api/sessions/sync → File-based Storage
```

### 3. URL Extraction Flow

```
URL Input → POST /api/extract-url
    ↓
Scraper Service (Cheerio) → Extract Title/Content
    ↓
Return Structured Content → Update ContentInput
```

## Dependencies Summary

### Frontend

| Category  | Packages                          |
| --------- | --------------------------------- |
| Framework | React 19, React Router 7          |
| Build     | Vite 7, TypeScript 5              |
| Styling   | Tailwind CSS, tailwind-merge      |
| UI        | Radix UI, shadcn/ui, lucide-react |
| State     | Zustand, TanStack Query           |
| i18n      | i18next, react-i18next            |
| Forms     | react-hook-form, zod              |

### Backend

| Category   | Packages   |
| ---------- | ---------- |
| Runtime    | Bun        |
| Framework  | Hono       |
| LLM        | OpenAI SDK |
| Scraping   | Cheerio    |
| Validation | Zod        |

## File Count Summary

| Directory                        | Files | Purpose                 |
| -------------------------------- | ----- | ----------------------- |
| `src/components/ui/`             | 48    | UI primitives           |
| `src/components/slide-prompt/`   | 6     | Domain components       |
| `src/components/brand-kit/`      | 1     | Brand Kit editor        |
| `src/components/course-builder/` | 1     | Course Builder toggle   |
| `src/components/`                | 4     | App components          |
| `src/pages/`                     | 2     | Route pages             |
| `src/stores/`                    | 4     | State stores            |
| `src/hooks/`                     | 3     | Custom hooks            |
| `src/lib/`                       | 3     | Utilities               |
| `src/data/templates/categories/` | 5     | Template categories     |
| `src/types/`                     | 1     | Type definitions        |
| `src/i18n/`                      | 4     | i18n config + 3 locales |
| `server/src/routes/`             | 5     | API routes              |
| `server/src/services/`           | 3     | Services                |
| `server/src/prompts/`            | 3     | Prompt logic            |
| `desktop/src/`                   | 6     | Electron main process   |
| `desktop/scripts/`               | 1     | Build scripts           |

## Desktop Architecture

### Entry Point

`desktop/src/main.ts` - Electron main process with:

- BrowserWindow management (1400x900, min 1024x768)
- IPC handler registration
- Backend process lifecycle
- Auto-updater initialization
- Security configurations

### Desktop Components

| File                 | Purpose                                          |
| -------------------- | ------------------------------------------------ |
| `main.ts`            | Window creation, IPC setup, app lifecycle        |
| `preload.ts`         | Context bridge for secure renderer communication |
| `backend-manager.ts` | Spawn/stop backend binary, port discovery        |
| `config-manager.ts`  | Persistent user preferences (JSON file)          |
| `auto-updater.ts`    | GitHub releases integration, download/install    |
| `menu.ts`            | Native application menu (File, Edit, View, Help) |

### Build Scripts

| File                       | Purpose                                 |
| -------------------------- | --------------------------------------- |
| `scripts/build-backend.ts` | Compile Bun server to standalone binary |

### Desktop Dependencies

| Category | Packages            |
| -------- | ------------------- |
| Runtime  | Electron 33         |
| Build    | electron-builder 25 |
| Updates  | electron-updater 6  |
| Logging  | electron-log 5      |

### Key Data Flows (Desktop)

**App Startup Flow**:

```
app.whenReady() → setupIPC() → createWindow()
    ↓
BackendManager.start() → spawn binary → parse PORT
    ↓
loadURL (dev) or loadFile (prod)
    ↓
ready-to-show → checkForUpdates()
```

**Update Flow**:

```
checkForUpdates() → GitHub API
    ↓
update-available → User notification
    ↓
downloadUpdate() → update-downloaded
    ↓
quitAndInstall() → Restart with new version
```
