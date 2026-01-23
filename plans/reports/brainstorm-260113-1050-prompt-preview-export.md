# Brainstorm: Prompt Preview Redundancy & Export Feature

**Date:** 2026-01-13
**Status:** Agreed
**Type:** UI/UX Optimization

---

## Problem Statement

1. **PromptPreview redundancy**: Component hiển thị nội dung trùng lặp với PromptOutput
2. **Missing export buttons**: Chức năng export đã code sẵn nhưng không có UI

## Analysis

### Current State - PromptPreview vs PromptOutput

| Aspect     | PromptOutput              | PromptPreview         |
| ---------- | ------------------------- | --------------------- |
| Location   | Main display              | Below PromptOutput    |
| Content    | SlideCard components      | Same slides formatted |
| Modes      | Slides/Raw tabs           | Formatted/Raw toggle  |
| Copy       | Copy All button           | Copy button           |
| Visibility | Always when prompt exists | Collapsible           |

**Verdict:** Significant redundancy - same content, same features, unnecessary complexity.

### Current State - Export

- `src/lib/export.ts` - Full implementation: JSON, Markdown, Text
- `src/hooks/useExport.ts` - Ready-to-use hook
- **Problem:** No UI buttons call these functions

## Agreed Solution

### 1. Remove PromptPreview Component

**Actions:**

- Delete `src/components/PromptPreview.tsx`
- Remove import and usage from `src/pages/Index.tsx` (lines 12, 303-311)
- Remove `showPromptPreview` and `setShowPromptPreview` from sessionStore if unused elsewhere

**Rationale:**

- PromptOutput already provides full functionality
- SlideCard expandable design is superior UX
- Reduces code maintenance burden
- Cleaner, less confusing UI

### 2. Add Export Dropdown Next to Copy All

**Location:** `src/components/slide-prompt/PromptOutput.tsx`

**Design:**

```
[Copy All] [Export ▼]
             ├─ Markdown (.md)
             ├─ Plain Text (.txt)
             └─ JSON (.json)
```

**Implementation approach:**

- Add DropdownMenu component from shadcn/ui
- Use existing `useExport` hook
- Place dropdown button next to "Copy All" button
- Icons: FileText for MD, FileCode for JSON, File for TXT

## Files to Modify

1. **DELETE:** `src/components/PromptPreview.tsx`
2. **EDIT:** `src/pages/Index.tsx` - Remove PromptPreview usage
3. **EDIT:** `src/components/slide-prompt/PromptOutput.tsx` - Add export dropdown
4. **EDIT:** `src/stores/sessionStore.ts` - Remove unused showPromptPreview state (if applicable)
5. **EDIT:** `src/i18n/locales/*.json` - Add export menu labels if needed

## Success Metrics

- [ ] No redundant preview component
- [ ] Export button visible and functional
- [ ] All 3 formats (MD, TXT, JSON) downloadable
- [ ] Clean UI with single source of truth for prompt display

## Risks & Mitigations

| Risk                       | Mitigation                            |
| -------------------------- | ------------------------------------- |
| Users expect PromptPreview | PromptOutput has same/better features |
| Export button clutter      | Use compact dropdown design           |
| i18n keys missing          | Check/add keys for export menu        |

---

## Next Steps

Proceed with implementation via `/plan:fast` if approved.
