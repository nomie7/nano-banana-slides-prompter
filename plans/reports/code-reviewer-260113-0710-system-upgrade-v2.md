# Code Review Report: System Upgrade v2

**Report ID:** code-reviewer-260113-0710-system-upgrade-v2
**Date:** 2026-01-13
**Reviewer:** code-reviewer (subagent)

---

## Code Review Summary

### Scope

- **Files reviewed:** 35+ files across 3 phases
- **Lines of code analyzed:** ~3,500 LOC
- **Review focus:** Full implementation review (Export, Preview, Templates, Testing, i18n, CI/CD)

### Overall Assessment

**Overall Score: 7.5/10**

The implementation demonstrates solid architecture with good separation of concerns, comprehensive testing (74 tests passing), and proper i18n support. However, there are notable ESLint errors that need attention, particularly React hooks purity violations and some code quality issues in the server code.

| Area         | Score | Notes                                                    |
| ------------ | ----- | -------------------------------------------------------- |
| Security     | 8/10  | Good sanitization, no major vulnerabilities              |
| Performance  | 7/10  | Lazy loading templates, but some render issues           |
| Architecture | 8/10  | Clean separation, YAGNI/KISS followed                    |
| Code Quality | 7/10  | TypeScript well-used, but 18 lint errors                 |
| Testing      | 9/10  | 74 tests, 97% coverage on core modules                   |
| i18n         | 8/10  | Complete Vietnamese translation, missing `vi` in en.json |

---

## Critical Issues (MUST FIX)

### 1. React Hooks Purity Violations

**File:** `src/components/TemplateSelector.tsx:40`

```typescript
// ERROR: loadCategory accessed before declaration
useEffect(() => {
  if (open) {
    loadCategory(activeCategory);  // <- Error here
  }
}, [open, activeCategory]);

const loadCategory = async (category: TemplateCategory) => { ... }
```

**Impact:** Can cause undefined behavior during renders
**Fix:** Move `loadCategory` definition before `useEffect` or use `useCallback`

**File:** `src/components/SessionSidebar.tsx:66`

```typescript
// ERROR: Date.now() is impure during render
const formatTime = (timestamp: number): string => {
  const diffMins = Math.floor((Date.now() - timestamp) / 60000);
```

**Impact:** Unstable results during re-renders
**Fix:** Use `useMemo` with a stable time reference or move to effect

### 2. setState in Effect Bodies

**Files:**

- `src/components/SettingsDialog.tsx:31`
- `src/components/slide-prompt/PromptOutput.tsx:62, 75`

**Impact:** Can cause cascading renders, performance degradation
**Fix:** Use initialization pattern or lazy initial state

---

## High Priority Findings (SHOULD FIX)

### 1. Server Code Quality Issues

**File:** `server/src/routes/prompt.ts:177-178, 319-320`

```typescript
// Use const instead of let
let generatedCharacter = ...  // Should be const
let slideTypeSequence = ...   // Should be const
```

**File:** `server/src/routes/sessions.ts:86, 106, 121`

```typescript
// Empty catch blocks - should at least log
catch { }  // no-empty violation
```

**Fix:** Add error logging or explicit comments

### 2. TypeScript Strictness

**File:** `src/stores/__tests__/sessionStore.test.ts:218`

```typescript
// @typescript-eslint/no-explicit-any
setAbortController(sessionId, mockAbortController as any);
```

**Fix:** Create proper mock type for AbortController

### 3. Missing i18n Key

**File:** `src/i18n/locales/en.json:232`

```json
"language": {
  "label": "Language",
  "zh": "中文",
  "en": "English"
  // Missing: "vi": "Tiếng Việt"
}
```

**Fix:** Add Vietnamese language option to en.json

---

## Medium Priority Improvements

### 1. Export Function - Memory Leak Prevention

**File:** `src/lib/export.ts:8-18`

```typescript
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  // Good: URL.revokeObjectURL is called for cleanup
  URL.revokeObjectURL(url); // Line 17 - properly handled
}
```

**Status:** Properly implemented with cleanup

### 2. Template Loader Cache

**File:** `src/data/templates/index.ts:3`

```typescript
const templateCache = new Map<TemplateCategory, PromptTemplate[]>();
```

**Observation:** Good caching strategy, but no cache invalidation mechanism
**Suggestion:** Add `clearTemplateCache()` call on language change if templates are i18n-dependent

### 3. Session Store Sync Debouncing

**File:** `src/stores/sessionStore.ts:246-269`

```typescript
syncToServer: async () => {
  const { syncTimeoutId } = get();
  if (syncTimeoutId) clearTimeout(syncTimeoutId);
  // 500ms debounce - good pattern
  const timeoutId = setTimeout(async () => { ... }, 500);
```

**Status:** Well implemented with proper debouncing

### 4. UI Component Warnings

Multiple shadcn/ui components trigger `react-refresh/only-export-components` warnings:

- `badge.tsx`, `button.tsx`, `form.tsx`, `sidebar.tsx`, etc.

**Impact:** Development-only warnings, no production impact
**Fix:** Consider extracting variants to separate files (low priority)

---

## Low Priority Suggestions

### 1. Test Console Output

Tests produce console.error output for expected error cases:

```
Failed to save session: Error: Network error
Failed to load sessions: Error: Network error
```

**Suggestion:** Mock console.error in error handling tests

### 2. Tailwind Config

**File:** `tailwind.config.ts:134`

```typescript
// @typescript-eslint/no-require-imports
require('tailwindcss-animate');
```

**Fix:** Use ESM import syntax

### 3. Empty Interface

**File:** `src/components/ui/command.tsx:24`, `src/components/ui/textarea.tsx:5`

```typescript
interface CommandInputProps extends ... {}  // Empty interface
```

**Fix:** Use type alias instead: `type CommandInputProps = ...`

---

## Positive Observations

### 1. Excellent Test Coverage

- 74 tests passing across 3 test files
- Core modules (promptGenerator, export, sessionStore) have 97% coverage
- Comprehensive edge case testing

### 2. Clean Architecture

- Well-organized template system with lazy loading
- Proper separation between data, hooks, and components
- Type-safe schema definitions (`src/data/templates/schema.ts`)

### 3. i18n Implementation

- Complete Vietnamese translation (353 lines)
- Consistent key naming convention
- Proper interpolation usage (`{{count}}`, `{{format}}`)

### 4. CI/CD Pipeline

- Proper workflow with typecheck, lint, test, build steps
- Bun caching for faster builds
- Frozen lockfile for reproducibility

### 5. Export System

- Clean implementation with proper blob cleanup
- Support for JSON, Markdown, and Text formats
- Proper filename sanitization (Unicode support)

### 6. Template System

- Lazy loading with dynamic imports
- 20 templates across 4 categories
- Proper caching mechanism

---

## Recommended Actions

### Immediate (Before Merge)

1. Fix `TemplateSelector.tsx` - move `loadCategory` before `useEffect`
2. Fix `SessionSidebar.tsx` - wrap `formatTime` in `useMemo` or use stable reference
3. Add `"vi": "Tiếng Viet"` to `en.json` language section
4. Fix server `prefer-const` issues (4 occurrences)

### Short-term

5. Address `setState` in effect issues in SettingsDialog and PromptOutput
6. Add error logging to empty catch blocks in sessions.ts
7. Replace `any` type in test file with proper mock type

### Optional/Low Priority

8. Extract shadcn/ui variants to separate files
9. Suppress expected console.error in tests
10. Convert tailwind require() to ESM import

---

## Metrics

| Metric            | Value | Status |
| ----------------- | ----- | ------ |
| TypeScript Errors | 0     | PASS   |
| ESLint Errors     | 18    | FAIL   |
| ESLint Warnings   | 8     | WARN   |
| Test Files        | 3     | -      |
| Tests Passed      | 74/74 | PASS   |
| Test Duration     | 5.29s | OK     |
| Coverage (core)   | ~97%  | PASS   |

---

## Unresolved Questions

1. Should template JSON files be validated against schema at build time?
2. Is the 500ms sync debounce optimal for UX vs data consistency?
3. Should `clearTemplateCache()` be called on language change?

---

**Review Status:** CONDITIONAL PASS
**Condition:** Fix Critical Issues #1 and #2 before merge
