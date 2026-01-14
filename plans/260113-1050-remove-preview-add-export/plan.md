---
title: 'Remove PromptPreview & Add Export Dropdown'
description: 'Remove redundant PromptPreview component and add export dropdown to PromptOutput'
status: completed
priority: P2
effort: 1h
branch: main
tags: [ui, refactor, feature]
created: 2026-01-13
---

# Remove PromptPreview & Add Export Dropdown

## Overview

Remove redundant `PromptPreview` component and add export dropdown button next to "Copy All" in `PromptOutput`.

**Source:** [Brainstorm Report](../reports/brainstorm-260113-1050-prompt-preview-export.md)

## Problem Statement

1. **Redundancy:** PromptPreview shows same content as PromptOutput (slides + raw text)
2. **Missing Feature:** Export functionality exists in code but has no UI buttons

## Implementation Phases

| Phase                                          | Description                                 | Status    | Progress |
| ---------------------------------------------- | ------------------------------------------- | --------- | -------- |
| [Phase 1](./phase-01-remove-prompt-preview.md) | Remove PromptPreview component and clean up | Completed | 100%     |
| [Phase 2](./phase-02-add-export-dropdown.md)   | Add export dropdown to PromptOutput         | Completed | 100%     |

## Files Changed

### Delete

- `src/components/PromptPreview.tsx`

### Modify

- `src/pages/Index.tsx` - Remove PromptPreview import/usage
- `src/components/slide-prompt/PromptOutput.tsx` - Add export dropdown
- `src/stores/sessionStore.ts` - Remove showPromptPreview state

## Success Criteria

- [x] PromptPreview component removed
- [x] No references to PromptPreview in codebase
- [x] Export dropdown visible next to Copy All
- [x] All 3 formats exportable (MD, TXT, JSON)
- [x] Build passes without errors
- [x] Tests pass (73/73)

## Dependencies

- shadcn/ui DropdownMenu component (already available)
- useExport hook (already implemented)
- i18n export keys (already exist)
