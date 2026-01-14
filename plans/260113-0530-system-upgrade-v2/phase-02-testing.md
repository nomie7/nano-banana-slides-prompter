# Phase 2: Testing Infrastructure

## Context

- [Brainstorm Report](../reports/brainstorm-260113-0520-system-upgrade-analysis.md)
- [Testing Research](./research/researcher-01-testing-ci-cd.md)

---

## Overview

| Attribute   | Value                                              |
| ----------- | -------------------------------------------------- |
| Priority    | P1 - High                                          |
| Status      | pending                                            |
| Effort      | 4h                                                 |
| Description | Vitest setup, core module tests, GitHub Actions CI |

---

## Requirements

### Functional

1. **Vitest Setup**
   - Configure for React + TypeScript
   - jsdom environment for DOM testing
   - Coverage reporting with c8

2. **Core Module Tests**
   - `promptGenerator.ts` - prompt building logic
   - `sessionStore.ts` - Zustand state management
   - Export utilities from Phase 1

3. **CI Pipeline**
   - Run on push/PR to main
   - Type check, lint, test, build
   - Bun package caching

### Non-Functional

- Test execution <30s for unit tests
- Coverage threshold: 60% for core modules
- CI workflow <5min total

---

## Related Code Files

### Files to Create

```
vitest.config.ts               # Vitest configuration
vitest-setup.ts                # Test setup (jest-dom)
src/lib/__tests__/promptGenerator.test.ts
src/lib/__tests__/export.test.ts
src/stores/__tests__/sessionStore.test.ts
.github/workflows/ci.yml       # GitHub Actions
```

### Files to Modify

```
package.json                   # Add test scripts
tsconfig.json                  # Add vitest types (if needed)
```

---

## Implementation Steps

### 1. Vitest Setup (1h)

1. Install dependencies:

   ```bash
   bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
   ```

2. Create `vitest.config.ts`:

   ```typescript
   import { defineConfig } from 'vitest/config';
   import react from '@vitejs/plugin-react';
   import tsconfigPaths from 'vite-tsconfig-paths';

   export default defineConfig({
     plugins: [tsconfigPaths(), react()],
     test: {
       environment: 'jsdom',
       setupFiles: ['./vitest-setup.ts'],
       globals: true,
       css: true,
       include: ['src/**/*.test.{ts,tsx}'],
       coverage: {
         provider: 'v8',
         reporter: ['text', 'html'],
         include: ['src/lib/**', 'src/stores/**'],
         exclude: ['**/__tests__/**'],
       },
     },
   });
   ```

3. Create `vitest-setup.ts`:

   ```typescript
   import '@testing-library/jest-dom/vitest';
   ```

4. Add scripts to `package.json`:
   ```json
   {
     "scripts": {
       "test": "vitest",
       "test:run": "vitest run",
       "test:coverage": "vitest run --coverage"
     }
   }
   ```

### 2. Core Module Tests (2h)

#### promptGenerator.test.ts

```typescript
import { describe, it, expect } from 'vitest';
import { buildSystemPrompt, buildUserPrompt } from '../promptGenerator';

describe('promptGenerator', () => {
  describe('buildSystemPrompt', () => {
    it('includes style when provided', () => {
      const result = buildSystemPrompt({ style: 'professional' });
      expect(result).toContain('professional');
    });

    it('includes character when enabled', () => {
      const result = buildSystemPrompt({
        characterEnabled: true,
        characterStyle: 'pixar',
      });
      expect(result).toContain('character');
    });
  });

  describe('buildUserPrompt', () => {
    it('formats topic correctly', () => {
      const result = buildUserPrompt({ topic: 'AI Ethics' });
      expect(result).toContain('AI Ethics');
    });
  });
});
```

#### sessionStore.test.ts

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useSessionStore } from '../sessionStore';

describe('sessionStore', () => {
  beforeEach(() => {
    useSessionStore.setState({ sessions: [], currentSessionId: null });
  });

  it('creates new session', () => {
    const { createSession } = useSessionStore.getState();
    createSession('Test Session');

    const { sessions } = useSessionStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].name).toBe('Test Session');
  });

  it('updates session config', () => {
    const { createSession, updateSessionConfig } = useSessionStore.getState();
    createSession('Test');

    const { sessions } = useSessionStore.getState();
    updateSessionConfig(sessions[0].id, { style: 'creative' });

    const updated = useSessionStore.getState().sessions[0];
    expect(updated.config.style).toBe('creative');
  });
});
```

#### export.test.ts

```typescript
import { describe, it, expect, vi } from 'vitest';
import { downloadFile, exportJSON } from '../export';

describe('export utilities', () => {
  it('creates blob with correct mime type', () => {
    const createObjectURL = vi.fn(() => 'blob:url');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    downloadFile('content', 'test.txt', 'text/plain');

    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url');
  });

  it('exportJSON formats with 2 spaces', () => {
    const spy = vi.spyOn(JSON, 'stringify');
    exportJSON({ key: 'value' }, 'test');

    expect(spy).toHaveBeenCalledWith({ key: 'value' }, null, 2);
  });
});
```

### 3. GitHub Actions CI (1h)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Cache Bun dependencies
        uses: actions/cache@v4
        with:
          path: ~/.bun/install/cache
          key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
          restore-keys: |
            ${{ runner.os }}-bun-

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Type check
        run: bun run typecheck

      - name: Lint
        run: bun run lint

      - name: Test
        run: bun run test:run

      - name: Build frontend
        run: bun run build

      - name: Build server
        run: bun run build:server
```

---

## Todo List

- [ ] Install vitest and testing-library dependencies
- [ ] Create vitest.config.ts
- [ ] Create vitest-setup.ts
- [ ] Add test scripts to package.json
- [ ] Write promptGenerator.test.ts (5+ test cases)
- [ ] Write sessionStore.test.ts (5+ test cases)
- [ ] Write export.test.ts (3+ test cases)
- [ ] Create .github/workflows/ci.yml
- [ ] Run tests locally, ensure passing
- [ ] Push and verify CI workflow runs
- [ ] Add coverage badge to README (optional)

---

## Success Criteria

1. `npm run test` runs all tests successfully
2. `npm run test:coverage` shows >60% for core modules
3. CI workflow passes on push to main
4. CI workflow blocks PR merge on failure
5. Test execution <30s locally

---

## Risk Assessment

| Risk                       | Likelihood | Impact | Mitigation                       |
| -------------------------- | ---------- | ------ | -------------------------------- |
| Zustand testing complexity | Medium     | Low    | Use getState() for direct access |
| DOM mocking issues         | Low        | Medium | Use jsdom + testing-library      |
| CI timeout                 | Low        | Low    | Bun is fast, cache deps          |
| Flaky tests                | Low        | Medium | Avoid async timing issues        |

---

## Unresolved Questions

1. MSW for API mocking - needed for this phase or defer?
2. Component tests - include in Phase 2 or Phase 4?
3. Electron-specific tests - jsdom sufficient?
