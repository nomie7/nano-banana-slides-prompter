# Code Standards & Conventions

**Version:** 2.0.16 | **Last Updated:** 2026-01-21

## Directory Organization

### Frontend (`src/`)

```
src/
├── components/
│   ├── ui/                 # Reusable UI primitives (shadcn/ui)
│   ├── slide-prompt/       # Feature-specific components
│   └── error/              # Error boundary components
├── pages/                  # Route page components
├── stores/                 # Zustand state stores
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions
│   └── utils/              # Specialized utilities
├── types/                  # TypeScript type definitions
└── i18n/                   # Internationalization config
```

### Backend (`server/src/`)

```
server/src/
├── routes/                 # API route handlers
├── services/               # Business logic services
└── prompts/                # LLM prompt templates & types
```

### Desktop (`desktop/`)

```
desktop/
├── src/                    # Electron main process
│   ├── main.ts             # Window, IPC, lifecycle
│   ├── preload.ts          # Context bridge
│   ├── backend-manager.ts  # Spawn/stop backend binary
│   ├── config-manager.ts   # User preferences
│   ├── auto-updater.ts     # GitHub releases updater
│   └── menu.ts             # Native application menu
├── scripts/                # Build scripts
├── resources/              # App icons and assets
└── renderer/               # Built frontend (production)
```

## Naming Conventions

### Files & Directories

| Type             | Convention                    | Example                     |
| ---------------- | ----------------------------- | --------------------------- |
| React Components | PascalCase                    | `ContentInput.tsx`          |
| Hooks            | camelCase with `use` prefix   | `useStreamingGeneration.ts` |
| Stores           | camelCase with `Store` suffix | `sessionStore.ts`           |
| Utilities        | camelCase                     | `promptGenerator.ts`        |
| Types            | camelCase                     | `slidePrompt.ts`            |
| Routes (backend) | kebab-case                    | `sessions.ts`               |

### Code Elements

| Type             | Convention       | Example            |
| ---------------- | ---------------- | ------------------ |
| Components       | PascalCase       | `SlideCard`        |
| Functions        | camelCase        | `generatePrompt()` |
| Variables        | camelCase        | `slideCount`       |
| Constants        | UPPER_SNAKE_CASE | `API_BASE`         |
| Types/Interfaces | PascalCase       | `SessionStore`     |
| Enums            | PascalCase       | `SessionStatus`    |

## TypeScript Patterns

### Type Definitions

```typescript
// Use interfaces for object shapes
interface Session {
  id: string;
  title: string;
  config: SlidePromptConfig;
  status: SessionStatus;
}

// Use type aliases for unions/primitives
type SessionStatus = 'idle' | 'generating' | 'complete' | 'error';

// Use explicit return types for functions
const createSession = (): Session => ({ ... });
```

### Import Organization

```typescript
// 1. React/Framework imports
import { useState, useEffect } from 'react';

// 2. Third-party imports
import { useTranslation } from 'react-i18next';

// 3. Internal imports (absolute paths with @/)
import { Button } from '@/components/ui/button';
import { useSessionStore } from '@/stores/sessionStore';

// 4. Type imports
import type { Session, SlidePromptConfig } from '@/types/slidePrompt';
```

### Path Aliases

```typescript
// Use @/ alias for src/ directory
import { Button } from '@/components/ui/button'; // Good
import { Button } from '../../../components/ui/button'; // Avoid
```

## React Component Patterns

### Functional Components

```typescript
// Use arrow function with explicit types
interface SlideCardProps {
  slide: ParsedSlide;
  index: number;
  defaultOpen?: boolean;
}

const SlideCard = ({ slide, index, defaultOpen = false }: SlideCardProps) => {
  // Component logic
  return <div>...</div>;
};

export default SlideCard;
```

### Hooks Usage

```typescript
// Custom hooks for reusable logic
export const useStreamingGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(async (config: SlidePromptConfig) => {
    // Implementation
  }, []);

  return { isGenerating, generate };
};
```

### State Management (Zustand)

```typescript
// Store definition pattern
interface SessionStore {
  sessions: Session[];
  currentSessionId: string | null;

  // Actions
  loadSessions: () => Promise<void>;
  createSession: () => Promise<string>;
  updateSessionConfig: (id: string, config: Partial<SlidePromptConfig>) => void;
}

export const useSessionStore = create<SessionStore>()((set, get) => ({
  sessions: [],
  currentSessionId: null,

  loadSessions: async () => {
    // Implementation
  },
}));
```

## Styling Patterns

### Tailwind CSS

```typescript
// Use cn() utility for conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  variant === "primary" && "primary-classes"
)}>
```

### shadcn/ui Components

```typescript
// Import from @/components/ui/
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Use component variants
<Button variant="outline" size="sm">Click</Button>
```

## API Patterns

### Backend Routes (Hono)

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

const router = new Hono();

// Schema validation
const createSessionSchema = z.object({
  title: z.string().min(1),
  config: z.object({ ... }),
});

// Route handler
router.post('/sessions', zValidator('json', createSessionSchema), async (c) => {
  const body = c.req.valid('json');
  // Implementation
  return c.json({ success: true, data: result });
});

export { router as sessionsRouter };
```

### API Response Format

```typescript
// Success response
{ success: true, data: { ... } }

// Error response
{ success: false, error: "Error message" }

// List response
{ sessions: [...], currentSessionId: "..." }
```

### Frontend API Calls

```typescript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Fetch pattern
const response = await fetch(`${API_BASE}/api/sessions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});

if (!response.ok) {
  throw new Error('Request failed');
}

const result = await response.json();
```

## Error Handling

### Frontend

```typescript
// Try-catch with user feedback
try {
  await generatePrompt(config);
} catch (error) {
  console.error('Generation failed:', error);
  toast({
    title: t('error.generation'),
    description: error.message,
    variant: 'destructive',
  });
}
```

### Backend

```typescript
// Route-level error handling
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json(
    {
      success: false,
      error: err.message || 'Internal server error',
    },
    500
  );
});
```

## Internationalization

### Translation Keys

```typescript
// Use t() function with namespaced keys
const { t } = useTranslation();

<Button>{t('common.generate')}</Button>
<Label>{t('settings.slideCount')}</Label>
```

### Translation Files

```json
// locales/en.json, locales/vi.json, locales/zh.json
{
  "common": {
    "generate": "Generate",
    "cancel": "Cancel"
  },
  "settings": {
    "slideCount": "Number of Slides"
  },
  "styleSelector": {
    "autoMode": "Auto",
    "customMode": "Custom",
    "autoHint": "Let AI decide the best style"
  }
}
```

**Supported Languages:**

- UI Languages: English (en), Vietnamese (vi), Chinese (zh)
- Output Languages: EN, VI, ZH, JA, KO, TH, ID, FR, DE, ES

## Electron/IPC Patterns

### Preload Script (Context Bridge)

```typescript
// desktop/src/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getBackendPort: () => ipcRenderer.invoke('get-backend-port'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateStatus: (callback: (status: UpdateStatus) => void) =>
    ipcRenderer.on('update-status', (_event, status) => callback(status)),
});
```

### IPC Handler Registration (Main Process)

```typescript
// desktop/src/main.ts
import { ipcMain } from 'electron';

ipcMain.handle('get-backend-port', () => backendManager.getPort());
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('check-for-updates', () => autoUpdater.checkForUpdates());
```

### Security Best Practices

| Setting            | Value   | Purpose                       |
| ------------------ | ------- | ----------------------------- |
| `contextIsolation` | `true`  | Isolate preload from renderer |
| `nodeIntegration`  | `false` | Prevent Node.js in renderer   |
| `sandbox`          | `true`  | Additional process isolation  |

## Testing Guidelines

### Test Framework

- **Vitest**: Fast unit test runner with native ESM support
- **Testing Library**: React component testing
- **Configuration**: `vitest.config.ts` at project root

### File Naming

```
ComponentName.test.tsx    # Component tests
functionName.test.ts      # Unit tests
api.integration.test.ts   # Integration tests
```

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';

describe('ComponentName', () => {
  it('should render correctly', () => {
    // Test implementation
  });

  it('should handle user interaction', () => {
    // Test implementation
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Git Conventions

### Commit Messages

```
feat: add dynamic character generation
fix: resolve session sync race condition
refactor: simplify prompt generation logic
docs: update API documentation
chore: bump dependencies
```

### Branch Naming

```
feature/character-presenter
fix/session-sync-bug
refactor/state-management
```

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001
```

### Backend (`server/.env`)

```env
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o
PORT=3001
GEMINI_API_KEY=your-gemini-key
GEMINI_API_BASE=https://generativelanguage.googleapis.com
```

## Code Quality Tools

| Tool       | Purpose       | Config File               |
| ---------- | ------------- | ------------------------- |
| ESLint     | Linting       | `eslint.config.js`        |
| TypeScript | Type checking | `tsconfig.json`           |
| Prettier   | Formatting    | `.prettierrc` (if exists) |
| Vite       | Build & Dev   | `vite.config.ts`          |
