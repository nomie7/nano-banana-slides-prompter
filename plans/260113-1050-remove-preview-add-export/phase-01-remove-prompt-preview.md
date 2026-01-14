# Phase 1: Remove PromptPreview Component

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Docs:** [Codebase Summary](../docs/codebase-summary.md)

## Overview

| Field                 | Value      |
| --------------------- | ---------- |
| Date                  | 2026-01-13 |
| Priority              | P2         |
| Implementation Status | Pending    |
| Review Status         | Pending    |
| Effort                | 15m        |

**Description:** Remove redundant PromptPreview component and clean up related code in sessionStore.

## Key Insights

- PromptPreview duplicates PromptOutput functionality
- `showPromptPreview` state in sessionStore only used by PromptPreview
- Component only used in Index.tsx (lines 12, 303-311)

## Requirements

1. Delete PromptPreview.tsx file
2. Remove import from Index.tsx
3. Remove JSX usage from Index.tsx
4. Remove showPromptPreview state from sessionStore
5. Remove setShowPromptPreview action from sessionStore

## Related Code Files

| File                               | Action | Lines               |
| ---------------------------------- | ------ | ------------------- |
| `src/components/PromptPreview.tsx` | DELETE | All (123 lines)     |
| `src/pages/Index.tsx`              | EDIT   | 12, 56-57, 303-311  |
| `src/stores/sessionStore.ts`       | EDIT   | 51, 65, 79, 289-291 |

## Implementation Steps

### Step 1: Delete PromptPreview.tsx

```bash
rm src/components/PromptPreview.tsx
```

### Step 2: Edit Index.tsx

Remove import (line 12):

```typescript
// DELETE: import { PromptPreview } from '@/components/PromptPreview';
```

Remove from destructuring (lines 56-57):

```typescript
// DELETE: showPromptPreview,
// DELETE: setShowPromptPreview,
```

Remove JSX (lines 303-311):

```tsx
// DELETE the entire block:
// {generatedPrompt && !isGenerating && (
//   <div className="mt-4">
//     <PromptPreview ... />
//   </div>
// )}
```

### Step 3: Edit sessionStore.ts

Remove from interface (line 51):

```typescript
// DELETE: showPromptPreview: boolean;
```

Remove action signature (line 65):

```typescript
// DELETE: setShowPromptPreview: (show: boolean) => void;
```

Remove initial state (line 79):

```typescript
// DELETE: showPromptPreview: true,
```

Remove action implementation (lines 289-291):

```typescript
// DELETE: setShowPromptPreview: (show) => {
//   set({ showPromptPreview: show });
// },
```

## Todo List

- [ ] Delete PromptPreview.tsx
- [ ] Edit Index.tsx - remove import
- [ ] Edit Index.tsx - remove from destructuring
- [ ] Edit Index.tsx - remove JSX block
- [ ] Edit sessionStore.ts - remove state and action

## Success Criteria

- [ ] PromptPreview.tsx file deleted
- [ ] No import/export errors
- [ ] No reference to PromptPreview in codebase
- [ ] Build passes
- [ ] App runs without errors

## Risk Assessment

| Risk                      | Likelihood | Impact | Mitigation                              |
| ------------------------- | ---------- | ------ | --------------------------------------- |
| Missing reference cleanup | Low        | Low    | Grep for "PromptPreview" after deletion |
| Test failures             | Low        | Medium | Run tests after changes                 |

## Security Considerations

None - removing unused code.

## Next Steps

After completing, proceed to [Phase 2](./phase-02-add-export-dropdown.md).
