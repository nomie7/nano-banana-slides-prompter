# Frontend Source Directory Analysis Report

**Scout ID:** a3d7ebb | **Date:** 2026-01-13 09:44
**Scope:** src/ directory analysis

---

## 1. Component Hierarchy and Relationships

```
App.tsx (Root)
+-- QueryClientProvider (React Query)
+-- TooltipProvider
+-- Toaster + Sonner (notifications)
+-- UpdateNotification (Electron)
+-- Router (HashRouter/BrowserRouter)
    +-- Index.tsx (main page)
    |   +-- SessionSidebar + TemplateSelector
    |   +-- SettingsDialog
    |   +-- LanguageSwitcher
    |   +-- ContentInput (Step 1)
    |   +-- StyleSelector (Step 2)
    |   +-- CharacterSelector (Step 3)
    |   +-- PresentationSettings (Step 4)
    |   +-- PromptOutput (Step 5) + SlideCard[]
    |   +-- PromptPreview
    +-- NotFound.tsx
```

### Key Components

| Component            | Purpose              | Props               |
| -------------------- | -------------------- | ------------------- |
| Index.tsx            | Main 5-step wizard   | -                   |
| SessionSidebar       | Session CRUD, export | isOpen              |
| SettingsDialog       | LLM config           | -                   |
| ContentInput         | 4-tab input          | value, onChange     |
| StyleSelector        | 20 styles grid       | value, onChange     |
| CharacterSelector    | Presenter toggle     | value, onChange     |
| PresentationSettings | Settings form        | value, onChange     |
| PromptOutput         | Streaming display    | prompt, isStreaming |
| SlideCard            | Slide with copy      | slide, defaultOpen  |
| PromptPreview        | Formatted/raw view   | prompt, isOpen      |
| TemplateSelector     | Template picker      | onApplyTemplate     |
| LanguageSwitcher     | EN/ZH/VI             | -                   |

---

## 2. State Management (Zustand Stores)

### 2.1 sessionStore.ts - Main Application State

**State:** sessions, currentSessionId, isLoading, showPromptPreview, syncTimeoutId, syncInFlight, abortControllers

**Actions:**

- loadSessions() - fetch from /api/sessions
- createSession() - new session with defaults
- deleteSession(id) - remove + abort if generating
- setCurrentSession(id) - switch active session
- updateSessionConfig/Status/Slides/Prompt/Error/Title()
- syncToServer() - debounced 500ms bulk sync
- get/set/removeAbortController() - cancellation

**Features:** Server sync, debounced 500ms, AbortController per session, auto-title

### 2.2 settingsStore.ts - LLM Settings (Persisted)

**State:** settings (apiKey, baseURL, model)
**Actions:** setSettings(), clearSettings()
**Features:** zustand/persist to localStorage, key: nano-banana-llm-settings

---

## 3. Data Flow Patterns

### 3.1 Generation Flow

User Generate -> syncToServer() -> useStreamingGeneration.generate() -> api.generatePromptStream() SSE -> slide/done/error events -> update session -> PromptOutput renders

### 3.2 Session Sync Flow

User action -> updateSession\*() -> Zustand update -> syncToServer() debounced -> POST /api/sessions/sync

### 3.3 Settings Flow

Dialog opens -> GET /api/settings/llm -> merge with Zustand -> save -> setSettings() -> localStorage -> Index reads via useSettingsStore()

---

## 4. i18n Implementation

**Config:** i18next + react-i18next, resources: zh/en/vi, fallback: en
**Languages:** en (English), zh (中文), vi (Tiếng Việt)

**Translation Keys (~357):**

- app, steps, buttons, contentInput, styleSelector
- characterSelector, presentationSettings, promptOutput
- settings, sidebar, toast, export, templates, promptPreview

**Usage:** t('key'), t('key', {interpolation}), t('nested.key')

---

## 5. Key Features Per Component

### ContentInput

- 4 input modes: text/topic/file/url (tabs)
- File upload: TXT, MD, CSV, PDF (base64 for PDF)
- URL extraction via /api/extract-url
- Character count display

### StyleSelector

- 20 visual styles with preview colors
- Styles: professional, technical, creative, infographic, educational, pixel-art, minimalist, dark-neon, hand-drawn, glassmorphism, vintage, 3d-isometric, watercolor, newspaper, flat-design, gradient-mesh, sci-fi-hud, deep-ocean, dev-console, neon-scientific

### CharacterSelector

- Toggle on/off, 8 render styles: pixar/real/anime/cartoon/sketch/chibi/low-poly/mascot
- 3 genders: none/male/female

### PresentationSettings

- Aspect ratio: 16:9, 4:3, 1:1, 9:16
- Slide count: 1-20 slider
- Color palette: auto + 12 custom
- Layout: visual-heavy/balanced/text-heavy
- Output language: 10 languages (en, vi, zh, ja, ko, th, id, fr, de, es)

### PromptOutput

- Streaming with skeletons, Tabs: Slides/Raw
- Expand/Collapse all, Copy all, SlideCard per slide

### SessionSidebar

- Fixed left w-64, collapsible, status icons
- Inline title edit, export dropdown, template selector

---

## 6. Templates and Data Structures

### Template System

Categories: presentation, education, business, creative
Lazy-loaded via dynamic import with cache

```typescript
interface PromptTemplate {
  id;
  name;
  nameKey;
  category;
  description;
  descriptionKey;
  tags;
  config;
  version;
}
interface TemplateConfig {
  style?;
  aspectRatio?;
  slideCount?;
  colorPalette?;
  layoutStructure?;
  character?;
  outputLanguage?;
}
```

### Core Types (src/types/slidePrompt.ts)

- ContentInputType: text | topic | file | url
- SlideStyle: 20 values
- AspectRatio: 16:9 | 4:3 | 1:1 | 9:16
- LayoutStructure: visual-heavy | text-heavy | balanced
- ColorPalette: auto + 12 custom
- RenderStyle: 8 values
- CharacterGender: none | male | female
- OutputLanguage: 10 languages
- SessionStatus: idle | generating | completed | error

```typescript
interface Session {
  id;
  title;
  isDefaultTitle?;
  createdAt;
  updatedAt;
  config: SlidePromptConfig;
  status;
  slides: ParsedSlide[];
  generatedPrompt: GeneratedPrompt | null;
  error: string | null;
}
interface ParsedSlide {
  slideNumber;
  title;
  prompt;
}
interface GeneratedPrompt {
  plainText;
  slides;
  jsonFormat;
}
```

---

## 7. API Integration (src/lib/api.ts)

### Endpoints

| Method | Endpoint                    | Purpose                  |
| ------ | --------------------------- | ------------------------ |
| POST   | /api/generate-prompt        | Non-streaming generation |
| POST   | /api/generate-prompt-stream | SSE streaming generation |
| POST   | /api/extract-url            | URL content extraction   |
| GET    | /api/sessions               | Load all sessions        |
| POST   | /api/sessions               | Create session           |
| DELETE | /api/sessions/:id           | Delete session           |
| PUT    | /api/sessions/current/:id   | Set current session      |
| POST   | /api/sessions/sync          | Bulk sync sessions       |
| GET    | /api/settings/llm           | Get default LLM config   |

### Electron Support

- Dynamic port via window.electronAPI.getBackendPort()
- Cached port, fallback to VITE_API_BASE env var

---

## 8. Hooks Summary

| Hook                   | Purpose                  | Returns                                                               |
| ---------------------- | ------------------------ | --------------------------------------------------------------------- |
| useStreamingGeneration | SSE streaming with abort | isGenerating, slides, error, generatedPrompt, generate, cancel, reset |
| useExport              | Session export to file   | exportCurrentSession, exportSessionById                               |
| useToast               | Toast notifications      | toasts, toast, dismiss                                                |

---

## 9. Export Formats (src/lib/export.ts)

- JSON: Full session data with config, slides, prompt
- Markdown: Header + slides with ## formatting
- Text: Plain text with --- separators

---

## 10. Prompt Generator (src/lib/promptGenerator.ts)

- Generates system + user prompts for LLM
- Style descriptions (20), color palette descriptions (13)
- Layout descriptions (3), aspect ratio descriptions (4)
- Component/visual system instructions
- Slide template guides

---

## Unresolved Questions

1. zh.json locale exists but not read - structure assumed similar to en.json
2. Template JSON files in categories/ not read - inferred from schema
3. UI components in components/ui/ not analyzed - assumed shadcn/ui
