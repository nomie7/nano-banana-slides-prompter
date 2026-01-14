# Brainstorm: System Upgrade Analysis

**Date:** 2026-01-13
**Project:** Nano Banana Slides Prompter
**Current Version:** 1.1.0
**Target:** Personal/Demo use, long-term roadmap

---

## 1. Problem Statement

Hệ thống hiện tại đã hoàn thiện core features (v1.1.0) nhưng thiếu:

- **Testing infrastructure** - 0% test coverage
- **Export capabilities** - không thể tái sử dụng prompts
- **Template system** - phải tạo từ đầu mỗi lần
- **Wider i18n** - chỉ EN/ZH, thiếu VI/JA/KO
- **Developer tooling** - không có CI/CD, lint hooks
- **API efficiency** - session sync không optimal

---

## 2. Current State Analysis

### 2.1 Strengths

| Aspect                 | Status                    |
| ---------------------- | ------------------------- |
| Core prompt generation | ✅ Production-ready       |
| SSE streaming          | ✅ Real-time delivery     |
| Character generation   | ✅ Dynamic, content-aware |
| 50+ slide templates    | ✅ Comprehensive          |
| Session management     | ✅ Functional             |
| Desktop app (Electron) | ✅ Cross-platform         |
| Docker deployment      | ✅ Ready                  |

### 2.2 Gaps Identified

| Gap               | Impact                     | Priority |
| ----------------- | -------------------------- | -------- |
| No tests          | High - fragile refactoring | P1       |
| No export         | Medium - UX friction       | P1       |
| No templates      | Medium - repeated work     | P2       |
| Limited i18n      | Medium - market reach      | P2       |
| No prompt preview | Low - nice-to-have         | P3       |
| Inefficient sync  | Low - personal use         | P3       |

---

## 3. Evaluated Approaches

### 3.1 UX/Features

#### A. Export System

**Option 1: Client-side export (Recommended)**

- Download JSON/Markdown/TXT directly from browser
- Zero backend changes, instant implementation
- Pros: Simple, fast, offline-capable
- Cons: Limited to client-side formats

**Option 2: Server-side export with templates**

- Backend generates formatted exports
- Supports PDF, DOCX via libraries
- Pros: More formats, consistent styling
- Cons: Adds dependencies, complexity

**Recommendation:** Option 1 for MVP, Option 2 for future

#### B. Template Library

**Option 1: Predefined JSON templates (Recommended)**

- Ship 10-15 common presentation templates
- Load on demand, store in `/src/data/templates/`
- Pros: Fast, no backend, easy to extend
- Cons: Static, needs manual updates

**Option 2: User-created templates with persistence**

- Users save their configs as reusable templates
- Store in sessions or dedicated endpoint
- Pros: Personalized, powerful
- Cons: More complex state management

**Recommendation:** Option 1 first, then Option 2

#### C. Language Expansion (VI/JA/KO)

**Approach:**

1. Create `vi.json`, `ja.json`, `ko.json` in `/src/i18n/locales/`
2. Add language picker options
3. Use professional translation (not auto-translate)
4. Update output language options in backend

**Effort:** Low-medium (translation work)

#### D. Prompt Preview

**Approach:**

- Show generated system prompt before LLM call
- Collapsible panel in UI
- Toggle in settings
- Educational value for users learning prompt engineering

**Effort:** Low (UI-only change)

---

### 3.2 Code Quality

#### A. Testing Framework

**Recommended Stack:**

```
Vitest + React Testing Library + MSW
```

| Component       | Tool                   | Purpose            |
| --------------- | ---------------------- | ------------------ |
| Unit tests      | Vitest                 | Fast, Vite-native  |
| Component tests | @testing-library/react | UI behavior        |
| API mocking     | MSW                    | Mock LLM responses |
| Coverage        | c8 (built-in)          | Track coverage     |

**Priority Test Targets:**

1. `promptGenerator.ts` - core logic
2. `sessionStore.ts` - state management
3. `SlideCard.tsx` - copy functionality
4. Backend routes - API contracts

#### B. Lint/Format Setup

**Recommended Config:**

```json
{
  "eslint": "9.x (already present)",
  "prettier": "add with eslint-config-prettier",
  "husky": "pre-commit hooks",
  "lint-staged": "only lint changed files"
}
```

**New Rules to Add:**

- `@typescript-eslint/strict`
- `react-hooks/exhaustive-deps`
- `import/order` for consistent imports

#### C. CI Pipeline (GitHub Actions)

**Workflow:**

```yaml
name: CI
on: [push, pull_request]
jobs:
  lint:
    - npm run lint
  test:
    - npm run test
  build:
    - npm run build
    - npm run build:server
  type-check:
    - tsc --noEmit
```

**Benefits:**

- Catch errors before merge
- Enforce code standards
- Build verification

---

### 3.3 Performance

#### API Optimization

**Current Issues:**

1. Session sync on every change (debounced 500ms but still frequent)
2. Full session array sent on sync
3. No request deduplication

**Recommended Improvements:**

| Improvement                      | Impact | Effort |
| -------------------------------- | ------ | ------ |
| Delta sync (only changed fields) | High   | Medium |
| Batch multiple updates           | Medium | Low    |
| Request deduplication            | Medium | Low    |
| Optimistic UI with rollback      | Low    | Medium |

**Implementation:**

```typescript
// Current: Full sync
syncToServer({ sessions, currentSessionId });

// Proposed: Delta sync
syncToServer({
  sessionId,
  changes: { config: { style: 'new-style' } },
});
```

---

## 4. Recommended Solution

### Phase 1: Foundation (Quick Wins)

1. **Export System** - Client-side JSON/MD/TXT export
2. **Lint/Format** - Add Prettier, Husky, lint-staged
3. **Prompt Preview** - Show generated prompt in UI

### Phase 2: Quality (Testing)

4. **Vitest Setup** - Testing infrastructure
5. **Core Tests** - promptGenerator, sessionStore
6. **CI Pipeline** - GitHub Actions workflow

### Phase 3: Features (Expansion)

7. **Template Library** - 10-15 predefined templates
8. **Vietnamese i18n** - Add vi.json translations
9. **Japanese/Korean** - Add ja.json, ko.json

### Phase 4: Polish (Optimization)

10. **API Delta Sync** - Only sync changed fields
11. **Request Batching** - Combine multiple updates
12. **Component Tests** - UI behavior tests

---

## 5. Implementation Considerations

### Risks

| Risk                | Mitigation                                  |
| ------------------- | ------------------------------------------- |
| Translation quality | Use native speakers or professional service |
| Test maintenance    | Keep tests simple, focused                  |
| Breaking changes    | CI catches regressions                      |

### Dependencies

- Vitest requires Vite 4+ (already on Vite 7)
- Husky requires Git hooks permission
- MSW requires service worker setup

### Success Metrics

| Metric            | Target                       |
| ----------------- | ---------------------------- |
| Test coverage     | >60% for core modules        |
| CI pass rate      | >95%                         |
| Export usage      | Track via analytics (future) |
| i18n completeness | 100% strings translated      |

---

## 6. Recommended Priority Order

```
┌─────────────────────────────────────────────────────────┐
│  HIGH IMPACT + LOW EFFORT (Do First)                    │
├─────────────────────────────────────────────────────────┤
│  1. Export System (client-side)                         │
│  2. Prompt Preview                                      │
│  3. Lint/Format setup (Prettier + Husky)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  HIGH IMPACT + MEDIUM EFFORT (Foundation)               │
├─────────────────────────────────────────────────────────┤
│  4. Testing setup (Vitest)                              │
│  5. Core module tests                                   │
│  6. CI Pipeline (GitHub Actions)                        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  MEDIUM IMPACT + MEDIUM EFFORT (Features)               │
├─────────────────────────────────────────────────────────┤
│  7. Template Library                                    │
│  8. Vietnamese i18n                                     │
│  9. Japanese/Korean i18n                                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│  POLISH (When stable)                                   │
├─────────────────────────────────────────────────────────┤
│  10. API Delta Sync                                     │
│  11. Request Batching                                   │
│  12. Comprehensive UI Tests                             │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Next Steps

1. Review and approve this analysis
2. Create detailed implementation plan for Phase 1
3. Start with Export System as first deliverable

---

## Unresolved Questions

1. **Translation resources:** Có sẵn người dịch native cho VI/JA/KO không?
2. **Analytics:** Có cần tracking usage cho demo không?
3. **Template content:** Những loại presentation nào nên có sẵn templates?
