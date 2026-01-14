# Research: Testing Infrastructure & CI/CD Pipeline

## 1. Vitest Setup for React + Bun

### Installation

```bash
bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

### Configuration (`vitest.config.ts`)

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
  },
});
```

### Setup File (`vitest-setup.ts`)

```typescript
import '@testing-library/jest-dom/vitest';
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage"
  }
}
```

### Example Test

```typescript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import MyComponent from './MyComponent';

test('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

---

## 2. GitHub Actions CI Pipeline

### Workflow (`.github/workflows/ci.yml`)

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

      - name: Build
        run: bun run build
```

### Caching Notes (2025)

- `actions/cache@v4` integrates with new cache backend (rolled out Feb 2025)
- Cache key uses `bun.lockb` hash for dependency changes
- Path `~/.bun/install/cache` is Bun's default cache location

---

## 3. Pre-commit Hooks with Husky

### Installation

```bash
bun add -D husky lint-staged
bunx husky init
```

### Husky Hook (`.husky/pre-commit`)

```bash
bunx lint-staged
```

### lint-staged Config (`package.json`)

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

### ESLint 9 Flat Config (`eslint.config.js`)

```javascript
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { react, 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  prettier, // Must be last to disable conflicting rules
];
```

### Prettier Config (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## Summary Table

| Tool           | Purpose                 | Key Config                 |
| -------------- | ----------------------- | -------------------------- |
| Vitest         | Unit/component testing  | `vitest.config.ts`         |
| RTL            | React component testing | Setup via vitest-setup.ts  |
| GitHub Actions | CI automation           | `.github/workflows/ci.yml` |
| Husky          | Git hooks               | `.husky/pre-commit`        |
| lint-staged    | Staged file linting     | `package.json`             |
| ESLint 9       | Code linting            | `eslint.config.js` (flat)  |
| Prettier       | Code formatting         | `.prettierrc`              |

---

## Sources

- [Vitest Documentation](https://vitest.dev)
- [Testing Library](https://testing-library.com)
- [GitHub Actions Cache](https://github.blog)
- [ESLint 9 Flat Config Guide](https://dev.to)

---

## Unresolved Questions

1. MSW (Mock Service Worker) setup not covered - need separate research for API mocking
2. Coverage thresholds - what % is appropriate for this project?
3. Electron-specific test considerations - does jsdom suffice or need electron testing?
