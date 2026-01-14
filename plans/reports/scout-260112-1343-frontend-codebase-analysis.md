# Frontend Codebase Analysis Report

**Project:** Nano Banana Slides Prompter  
**Version:** v1.0.6  
**Date:** 2026-01-12  
**Scout ID:** ae7ed8f

---

## 1. Directory Structure

src/
- main.tsx - Entry point, React DOM render
- App.tsx - Root component, routing setup
- App.css - App-level styles (minimal)
- index.css - Global CSS, Tailwind, design tokens
- vite-env.d.ts - Vite TypeScript declarations
- components/ - React components
  - ui/ - shadcn/ui primitives (48 files)
  - slide-prompt/ - Domain-specific components (6 files)
  - LanguageSwitcher.tsx - i18n language dropdown
  - NavLink.tsx - Navigation link component
  - SessionSidebar.tsx - Session management sidebar
  - SettingsDialog.tsx - LLM settings dialog
- pages/ - Route pages
  - Index.tsx - Main application page
  - NotFound.tsx - 404 page
- stores/ - State management
  - sessionStore.ts - Zustand session store
- hooks/ - Custom React hooks
  - use-mobile.tsx - Mobile detection hook
  - use-toast.ts - Toast notification hook
  - useStreamingGeneration.ts - SSE streaming hook
- lib/ - Utilities
  - api.ts - API client (REST + SSE)
  - promptGenerator.ts - Prompt generation logic
  - utils.ts - cn() utility (clsx + tailwind-merge)
- types/ - TypeScript types
  - slidePrompt.ts - All domain types
- i18n/ - Internationalization
  - index.ts - i18next config
  - locales/en.json - English translations
  - locales/zh.json - Chinese translations

---

## 2. Key Components

### 2.1 Domain Components (src/components/slide-prompt/)

| File | Purpose | Key Features |
|------|---------|--------------|
| ContentInput.tsx | Multi-source content input | 4 tabs: Text, Topic, File (TXT/CSV/PDF), URL extraction |
| StyleSelector.tsx | Visual style picker | 20 styles with preview colors, icons |
| CharacterSelector.tsx | Character presenter config | 8 render styles, 3 gender options, toggle on/off |
| PresentationSettings.tsx | Slide settings | Aspect ratio, slide count (1-20), color palette, layout |
| PromptOutput.tsx | Generated prompts display | Streaming support, expand/collapse, copy all |
| SlideCard.tsx | Individual slide card | Collapsible, copy button, animation on new slides |

### 2.2 App-Level Components (src/components/)

| File | Purpose |
|------|---------|
| SessionSidebar.tsx | Session list, create/delete/rename sessions |
| SettingsDialog.tsx | LLM config (API key, base URL, model) stored in localStorage |
| LanguageSwitcher.tsx | EN/ZH language toggle dropdown |

### 2.3 UI Components (src/components/ui/)

48 shadcn/ui primitives based on Radix UI:
- Layout: card, dialog, sheet, drawer, tabs, accordion, collapsible
- Form: button, input, textarea, select, checkbox, switch, slider, label
- Feedback: toast, toaster, sonner, alert, skeleton, progress
- Navigation: dropdown-menu, menubar, navigation-menu, breadcrumb
- Display: avatar, badge, tooltip, hover-card, popover

---

## 3. Pages

### src/pages/Index.tsx (Main Page)
- Layout: 2-column grid (inputs left, output right)
- Sections: Content Input, Style Selector, Character Presenter, Presentation Settings, Prompt Output
- Features: Session sidebar, LLM settings dialog, language switcher, GitHub link
- State: Uses useSessionStore + useStreamingGeneration

### src/pages/NotFound.tsx
- Simple 404 page with return home link

---

## 4. State Management (src/stores/sessionStore.ts - Zustand)

State Shape:
- sessions: Session[]
- currentSessionId: string | null
- abortControllers: Map for cancel support
- isLoading, syncTimeoutId, syncInFlight

Key Actions:
- loadSessions() - Fetch from server
- createSession() - New session with defaults
- deleteSession(id) - Remove + abort generation
- setCurrentSession(id) - Switch active session
- updateSession* - Granular updates
- syncToServer() - Debounced sync (500ms)

Persistence: Server-side via REST API (/api/sessions)

---

## 5. Custom Hooks

### useStreamingGeneration.ts
- Handle SSE streaming for prompt generation
- Manages isGenerating, slides, error, generatedPrompt
- Supports cancel via AbortController
- Syncs with session store
- Auto-updates session title from first slide

### use-mobile.tsx
- Detect mobile viewport (<768px)

### use-toast.ts
- Toast notification system with reducer pattern

---

## 6. Types (src/types/slidePrompt.ts)

Core Types:
- ContentInputType = text | topic | file | url
- SlideStyle = 20 visual styles
- AspectRatio = 16:9 | 4:3 | 1:1 | 9:16
- LayoutStructure = visual-heavy | text-heavy | balanced
- ColorPalette = auto + 12 custom options
- RenderStyle = 8 character render styles
- CharacterGender = none | male | female
- SessionStatus = idle | generating | completed | error

Key Interfaces:
- ContentInput, CharacterSettings, PresentationSettings
- SlidePromptConfig, ParsedSlide, GeneratedPrompt, Session

---

## 7. Utilities (src/lib/)

### api.ts
- generatePrompt(request) - POST /api/generate-prompt
- generatePromptStream(request, signal) - SSE streaming
- extractUrl(url) - POST /api/extract-url

### promptGenerator.ts
- generatePrompt(config) - Build prompt from config
- Style/color/layout descriptions

### utils.ts
- cn(...inputs) - clsx + tailwind-merge

---

## 8. Internationalization (src/i18n/)

Setup: i18next + react-i18next
Languages: en, zh (fallback: en)
Persistence: localStorage

Translation Keys (229 in en.json):
- app.*, steps.*, buttons.*, contentInput.*
- styleSelector.*, characterSelector.*, presentationSettings.*
- promptOutput.*, settings.*, sidebar.*, toast.*, errors.*

---

## 9. Styling (src/index.css)

Fonts: Lato, EB Garamond, Fira Code, Source Sans/Serif/Code Pro
Tailwind: base, components, utilities layers
Design System: HSL CSS variables for light/dark themes

Color Tokens (Light):
- Primary: 37 92% 50% (orange/banana)
- Background: 60 4% 95% (warm cream)

Custom Animations: slide-up-fade-in, shimmer, pulse-glow, skeleton-pulse

---

## 10. Entry Points

### src/main.tsx
- Imports: createRoot, App, index.css, i18n
- DOM patching for browser extension compatibility
- Renders App to root element

### src/App.tsx
- Providers: QueryClientProvider, TooltipProvider, Toaster, Sonner, BrowserRouter
- Routes: / -> Index, * -> NotFound

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total Files | 77 |
| Components (domain) | 10 |
| UI Components | 48 |
| Pages | 2 |
| Hooks | 3 |
| Stores | 1 |
| Types Files | 1 |
| i18n Locales | 2 |
| Lib Utilities | 3 |

---

## Key Dependencies

- React 18 + TypeScript
- Vite 7 - Build tool
- Tailwind CSS - Styling
- shadcn/ui + Radix UI - Components
- Zustand - State management
- react-i18next - Internationalization
- TanStack Query - Data fetching
- React Router - Routing
- lucide-react - Icons

---

## Unresolved Questions

None - codebase analysis complete.

