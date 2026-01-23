# System Architecture

**Version:** 2.0.16 | **Last Updated:** 2026-01-21

## High-Level Overview

Nano Banana Slides Prompter follows a client-server architecture with a React SPA frontend and Hono/Bun backend.

```mermaid
graph TB
    subgraph Client["Frontend (React SPA)"]
        UI[UI Components]
        Store[Zustand Store]
        Hooks[Custom Hooks]
    end

    subgraph Server["Backend (Hono/Bun)"]
        Routes[API Routes]
        Services[Services]
        Prompts[Prompt Engine]
    end

    subgraph External["External Services"]
        LLM[LLM API]
        Web[Web Pages]
    end

    UI --> Store
    UI --> Hooks
    Hooks --> Routes
    Store --> Routes
    Routes --> Services
    Routes --> Prompts
    Services --> LLM
    Services --> Web
```

## Frontend Architecture

### Component Hierarchy

```mermaid
graph TD
    App[App.tsx]
    App --> QCP[QueryClientProvider]
    QCP --> TP[TooltipProvider]
    TP --> Router[BrowserRouter]
    Router --> Index[Index Page]
    Router --> NotFound[404 Page]

    Index --> Header[Header]
    Index --> SessionSidebar[SessionSidebar]
    Index --> ContentInput[ContentInput]
    Index --> StyleSelector[StyleSelector]
    Index --> CharacterSelector[CharacterSelector]
    Index --> PresentationSettings[PresentationSettings]
    Index --> PromptOutput[PromptOutput]

    PromptOutput --> SlideCard[SlideCard x N]
```

### State Management Flow

```mermaid
flowchart LR
    subgraph UI["UI Layer"]
        Components[Components]
    end

    subgraph State["State Layer"]
        Store[(Zustand Store)]
    end

    subgraph API["API Layer"]
        Backend[Backend API]
    end

    Components -->|dispatch actions| Store
    Store -->|subscribe| Components
    Store -->|sync| Backend
    Backend -->|response| Store
```

**Zustand Store Structure**:

| State              | Type                           | Purpose                 |
| ------------------ | ------------------------------ | ----------------------- |
| `sessions`         | `Session[]`                    | All user sessions       |
| `currentSessionId` | `string \| null`               | Active session ID       |
| `abortControllers` | `Map<string, AbortController>` | Cancel ongoing requests |
| `isLoading`        | `boolean`                      | Loading state           |
| `syncTimeoutId`    | `number \| null`               | Debounce sync timer     |

### Data Flow: Prompt Generation

```mermaid
sequenceDiagram
    participant User
    participant UI as ContentInput
    participant Store as sessionStore
    participant Hook as useStreamingGeneration
    participant API as Backend API
    participant LLM as LLM Service

    User->>UI: Enter content
    UI->>Store: updateSessionConfig()
    User->>UI: Click Generate
    UI->>Hook: generate(config)
    Hook->>API: POST /api/generate-prompt-stream
    API->>LLM: Chat completion request
    LLM-->>API: SSE stream
    API-->>Hook: SSE events
    Hook->>Store: updateSessionSlides()
    Store->>UI: Re-render with slides
```

## Backend Architecture

### Request Flow

```mermaid
flowchart TD
    Request[HTTP Request]
    Request --> Logger[Logger Middleware]
    Logger --> CORS[CORS Middleware]
    CORS --> Router{Router}

    Router -->|/api/generate-prompt| Prompt[Prompt Route]
    Router -->|/api/extract-url| Extract[Extract Route]
    Router -->|/api/sessions| Sessions[Sessions Route]
    Router -->|/api/settings| Settings[Settings Route]
    Router -->|/api/optimize-prompt| Optimize[Optimize Route]
    Router -->|/api/regenerate-slide| Regenerate[Regenerate Route]
    Router -->|/health| Health[Health Check]

    Prompt --> LLMService[LLM Service]
    Regenerate --> LLMService
    Extract --> ScraperService[Scraper Service]
    Sessions --> FileStorage[File Storage]
    Optimize --> OptimizerService[Prompt Optimizer Service]

    LLMService --> OpenAI[OpenAI SDK]
    ScraperService --> Cheerio[Cheerio Parser]
    OptimizerService --> OpenAI
```

### API Endpoints

| Endpoint                      | Method | Description         | Request                          | Response                         |
| ----------------------------- | ------ | ------------------- | -------------------------------- | -------------------------------- |
| `/health`                     | GET    | Health check        | -                                | `{ status, timestamp, version }` |
| `/api/generate-prompt`        | POST   | Generate prompts    | `SlidePromptConfig`              | `{ slides: ParsedSlide[] }`      |
| `/api/generate-prompt-stream` | POST   | Stream prompts      | `SlidePromptConfig`              | SSE stream                       |
| `/api/extract-url`            | POST   | Extract URL content | `{ url }`                        | `{ title, content }`             |
| `/api/optimize-prompt`        | POST   | Optimize prompt     | `{ prompt, context }`            | `{ optimizedPrompt, changes }`   |
| `/api/regenerate-slide`       | POST   | Regenerate slide    | `RegenerateRequest`              | `{ success, slide }`             |
| `/api/sessions`               | GET    | List sessions       | -                                | `{ sessions, currentSessionId }` |
| `/api/sessions`               | POST   | Create session      | `Session`                        | `{ success, session }`           |
| `/api/sessions/:id`           | PUT    | Update session      | `Partial<Session>`               | `{ success }`                    |
| `/api/sessions/:id`           | DELETE | Delete session      | -                                | `{ success }`                    |
| `/api/sessions/current/:id`   | PUT    | Set current session | -                                | `{ success }`                    |
| `/api/sessions/sync`          | POST   | Bulk sync           | `{ sessions, currentSessionId }` | `{ success }`                    |
| `/api/settings/llm`           | GET    | Get LLM config      | -                                | `{ baseUrl, model }`             |
| `/api/gemini/generate-image`  | POST   | Generate image  | `{ prompt, config }`             | `{ imageUrl, base64 }`           |
| `/api/gemini/generate-images` | POST   | Batch image gen | `{ prompts[], config }`          | `{ images[] }`                   |
| `/api/gemini/test-connection` | POST   | Test Gemini     | `{ apiKey, apiBase, model }`     | `{ success, model }`             |
| `/api/gemini/config`          | GET    | Get Gemini cfg  | -                                | `{ apiBase, model }`             |
| `/api/upload/pdf`             | POST   | Upload PDF      | `multipart/form-data`            | `{ content, pages }`             |
| `/api/upload/docx`            | POST   | Upload DOCX         | `multipart/form-data`            | `{ content }`                    |

### Service Layer

```mermaid
classDiagram
    class LLMService {
        +generatePrompt(config) Promise~string~
        +streamPrompt(config) AsyncGenerator
        -buildSystemPrompt(style, character)
        -buildUserPrompt(content, settings)
    }

    class ScraperService {
        +extractUrl(url) Promise~ExtractedContent~
        -fetchPage(url) Promise~string~
        -parseHtml(html) ExtractedContent
    }

    class SessionService {
        +loadSessions() Promise~SessionData~
        +saveSession(session) Promise~void~
        +deleteSession(id) Promise~void~
        +syncSessions(data) Promise~void~
    }

    class PromptOptimizerService {
        +optimize(prompt, context) Promise~OptimizedResult~
        -analyzePrompt(prompt) PromptAnalysis
        -generateImprovement(analysis) string
    }

    class RegenerateService {
        +regenerateSlide(context) Promise~SlideResult~
        -buildPrompt(context) string
        -parseResponse(response) ParsedSlide
    }
```

### Prompt Engine

The prompt engine (`server/src/prompts/`) contains:

| Component            | Description                                                       |
| -------------------- | ----------------------------------------------------------------- |
| **Visual Styles**    | 20 styles (Professional, Technical, Creative, etc.) + 'auto' mode |
| **Color Palettes**   | 13 palettes (Auto, Corporate, Vibrant, etc.)                      |
| **Character Styles** | 8 render styles (Pixar, Anime, Cartoon, etc.)                     |
| **Slide Templates**  | 50+ templates across 10 categories                                |
| **Style Personas**   | Creative identities for each style                                |

**Auto Mode**: When style is set to 'auto', no visual style instructions are included in the prompt, allowing the LLM to determine the best style based on content.

**Slide Type Categories**:

| Category    | Templates                                |
| ----------- | ---------------------------------------- |
| Opening     | Title, Hook, Problem Statement           |
| Concept     | Diagram, Metaphor, Breakdown, Ecosystem  |
| Data        | Chart, Dashboard, Trends, Correlation    |
| Process     | Timeline, Flowchart, Flywheel, Journey   |
| Technical   | Architecture, Stack, API, Infrastructure |
| Business    | Strategy, ROI, Market, Roadmap           |
| Comparison  | Side-by-side, Before/After, Matrix       |
| Examples    | Case Study, Testimonial, Demo            |
| Educational | Definition, Example, Quiz                |
| Closing     | Summary, CTA, Q&A                        |

## Data Models

### Session Model

```typescript
interface Session {
  id: string;
  title: string;
  isDefaultTitle: boolean;
  createdAt: number;
  updatedAt: number;
  config: SlidePromptConfig;
  status: SessionStatus;
  slides: ParsedSlide[];
  generatedPrompt: GeneratedPrompt | null;
  error: string | null;
}

type SessionStatus = 'idle' | 'generating' | 'complete' | 'error';
```

### Slide Prompt Config

```typescript
interface SlidePromptConfig {
  content: ContentConfig;
  style: VisualStyle;
  character?: CharacterConfig;
  settings: PresentationSettings;
}

interface ContentConfig {
  type: 'text' | 'url' | 'file';
  text: string;
  topic: string;
  fileContent: string;
  fileName: string;
  url: string;
  urlContent: string;
}

interface PresentationSettings {
  aspectRatio: '16:9' | '4:3' | '1:1';
  slideCount: number; // 1-200
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
}

type SlideStyle = 'auto' | 'professional' | 'technical' | 'creative' | 'educational' | 'minimalist' | /* ... 15 more styles */;
```

## Deployment Architecture

### Docker Compose

```mermaid
graph TB
    subgraph Docker["Docker Compose"]
        Frontend[Frontend Container<br/>Nginx:80]
        Backend[Backend Container<br/>Bun:3001]
    end

    User[User Browser]
    LLM[LLM API]

    User -->|:8080| Frontend
    Frontend -->|/api/*| Backend
    Backend --> LLM
```

### Container Configuration

| Container | Base Image   | Port                          | Purpose                       |
| --------- | ------------ | ----------------------------- | ----------------------------- |
| frontend  | nginx:alpine | 80 (internal), 8080 (exposed) | Serve static files, proxy API |
| backend   | oven/bun     | 3001                          | API server                    |

### Environment Variables

**Backend** (`server/.env`):

| Variable          | Description         | Default                                   |
| ----------------- | ------------------- | ----------------------------------------- |
| `PORT`            | Server port         | 3001                                      |
| `OPENAI_API_BASE` | LLM API base URL    | https://api.openai.com/v1                 |
| `OPENAI_API_KEY`  | API key             | (required)                                |
| `OPENAI_MODEL`    | Model name          | gpt-4o                                    |
| `GEMINI_API_KEY`  | Gemini API key      | (optional)                                |
| `GEMINI_API_BASE` | Gemini API base URL | https://generativelanguage.googleapis.com |

**Frontend** (build-time):

| Variable       | Description     | Default               |
| -------------- | --------------- | --------------------- |
| `VITE_API_URL` | Backend API URL | http://localhost:3001 |

## Security Considerations

| Aspect           | Implementation                  |
| ---------------- | ------------------------------- |
| CORS             | Whitelist specific origins      |
| API Keys         | Server-side only, env variables |
| User Overrides   | Optional client-side storage    |
| Input Validation | Zod schemas on backend          |
| Error Handling   | Sanitized error messages        |

## Performance Optimizations

| Optimization        | Implementation                 |
| ------------------- | ------------------------------ |
| SSE Streaming       | Real-time prompt delivery      |
| Debounced Sync      | 500ms delay for session sync   |
| Optimistic Updates  | UI updates before API response |
| Abort Controllers   | Cancel ongoing requests        |
| Parallel Processing | Character + content analysis   |

## Scalability Considerations

| Aspect          | Current         | Future                |
| --------------- | --------------- | --------------------- |
| Session Storage | File-based JSON | Database (PostgreSQL) |
| Caching         | None            | Redis for prompts     |
| Load Balancing  | Single instance | Nginx/HAProxy         |
| Rate Limiting   | None            | Per-user limits       |

## Testing Infrastructure

### Test Stack

| Tool            | Purpose                        |
| --------------- | ------------------------------ |
| Vitest          | Unit/integration test runner   |
| Testing Library | React component testing        |
| jsdom           | Browser environment simulation |

### Test Configuration

- Config file: `vitest.config.ts`
- Test directory: `src/__tests__/`
- Coverage: V8 provider

### Running Tests

```bash
npm test              # Run all tests
npm run test:coverage # With coverage report
npm run test:watch    # Watch mode
```

## Desktop Application Architecture (Electron)

### Process Model

```mermaid
graph TB
    subgraph Electron["Electron Application"]
        Main[Main Process<br/>main.ts]
        Renderer[Renderer Process<br/>React SPA]
        Preload[Preload Script<br/>preload.ts]
    end

    subgraph Backend["Backend Process"]
        BunBinary[Bun Binary<br/>Compiled Server]
    end

    Main -->|IPC| Preload
    Preload -->|Context Bridge| Renderer
    Main -->|Spawn/Manage| BunBinary
    Renderer -->|HTTP/SSE| BunBinary
```

### Component Overview

| Component       | File                             | Responsibility                             |
| --------------- | -------------------------------- | ------------------------------------------ |
| Main Process    | `desktop/src/main.ts`            | Window management, IPC handlers, lifecycle |
| Backend Manager | `desktop/src/backend-manager.ts` | Spawn/stop backend, port discovery         |
| Config Manager  | `desktop/src/config-manager.ts`  | User preferences, persistent settings      |
| Auto Updater    | `desktop/src/auto-updater.ts`    | GitHub releases, download/install updates  |
| Menu            | `desktop/src/menu.ts`            | Application menu (File, Edit, View, Help)  |
| Preload         | `desktop/src/preload.ts`         | Secure IPC bridge to renderer              |

### Backend Process Management

```mermaid
sequenceDiagram
    participant Main as Main Process
    participant BM as BackendManager
    participant Backend as Backend Binary

    Main->>BM: start()
    BM->>Backend: spawn(binary, PORT=0)
    Backend-->>BM: stdout: "PORT:3XXX"
    BM-->>Main: resolve(port)
    Main->>Renderer: loadURL/loadFile
    Renderer->>Backend: HTTP requests to localhost:port

    Note over Main,Backend: On app quit
    Main->>BM: stop()
    BM->>Backend: SIGTERM
    Backend-->>BM: exit
```

**Key Features**:

- Dynamic port allocation (`PORT=0`)
- Port discovery via stdout parsing (`PORT:XXXXX`)
- Graceful shutdown with SIGTERM, force kill after 5s
- Development mode uses `bun run`, production uses compiled binary

### Auto-Updater Flow

```mermaid
sequenceDiagram
    participant App as Electron App
    participant Updater as electron-updater
    participant GitHub as GitHub Releases
    participant User as User

    App->>Updater: checkForUpdates()
    Updater->>GitHub: GET /releases/latest
    GitHub-->>Updater: release info

    alt Update Available
        Updater-->>App: update-available event
        App-->>User: Show notification
        User->>App: Download update
        App->>Updater: downloadUpdate()
        Updater->>GitHub: Download assets
        Updater-->>App: update-downloaded
        User->>App: Install & Restart
        App->>Updater: quitAndInstall()
    else No Update
        Updater-->>App: update-not-available
    end
```

**Update Configuration**:

- Provider: GitHub Releases
- Auto-download: Disabled (user-initiated)
- Auto-install on quit: Enabled
- Check on startup: Configurable via settings

### IPC Communication

| Channel                     | Direction        | Purpose               |
| --------------------------- | ---------------- | --------------------- |
| `get-backend-port`          | Renderer -> Main | Get backend API port  |
| `get-app-version`           | Renderer -> Main | Get app version       |
| `check-for-updates`         | Renderer -> Main | Trigger update check  |
| `download-update`           | Renderer -> Main | Start update download |
| `install-update`            | Renderer -> Main | Install and restart   |
| `update-status`             | Main -> Renderer | Update state changes  |
| `update-progress`           | Main -> Renderer | Download progress %   |
| `get-config` / `set-config` | Bidirectional    | User preferences      |

### Build & Distribution

```mermaid
graph LR
    subgraph Build["Build Process"]
        TS[TypeScript] --> Compile[tsc]
        Compile --> Dist[dist/]
        Vite[Vite Build] --> Renderer[renderer/]
        Bun[Bun Compile] --> Binary[backend/]
    end

    subgraph Package["electron-builder"]
        Dist --> NSIS[Windows NSIS]
        Dist --> DMG[macOS DMG]
        Dist --> AppImage[Linux AppImage]
    end

    subgraph Release["GitHub Release"]
        NSIS --> Assets[Release Assets]
        DMG --> Assets
        AppImage --> Assets
    end
```

**Build Targets**:

| Platform | Target         | Architectures |
| -------- | -------------- | ------------- |
| Windows  | NSIS installer | x64           |
| macOS    | DMG            | x64, arm64    |
| Linux    | AppImage, deb  | x64           |

### Security Measures

| Measure           | Implementation                    |
| ----------------- | --------------------------------- |
| Context Isolation | `contextIsolation: true`          |
| Node Integration  | `nodeIntegration: false`          |
| Sandbox           | `sandbox: true`                   |
| Window Open       | Denied via `setWindowOpenHandler` |
| External URLs     | Validated (http/https only)       |
| Preload Script    | Minimal IPC bridge exposure       |
