# Code Review Report: Phase 4 - Education & Business

**Date:** 2026-01-13
**Reviewer:** Code Reviewer Agent
**Phase:** 4 - Education & Business Focus (v2.0.x)
**Score:** 8.5/10

---

## Code Review Summary

### Scope

- Files reviewed: 9 files
  - `src/data/templates/categories/quiz.json`
  - `src/stores/brandKitStore.ts`
  - `src/components/brand-kit/BrandKitEditor.tsx`
  - `src/stores/courseBuilderStore.ts`
  - `src/components/course-builder/CourseBuilderToggle.tsx`
  - `src/components/slide-prompt/PresentationSettings.tsx`
  - `src/i18n/locales/en.json`
  - `src/i18n/locales/vi.json`
  - `src/i18n/locales/zh.json`
- Lines of code analyzed: ~1,200
- Review focus: Phase 4 Education & Business features

### Test Results

- Tests: 73/73 passed
- TypeScript: No errors
- Build: Success (warning about chunk size)

---

## Overall Assessment

Phase 4 implementation is **well-executed** with clean architecture, proper state management using Zustand with persistence, and comprehensive i18n support across 3 languages. Code follows established patterns and maintains consistency with existing codebase.

**Strengths:**

- Clean separation of concerns (stores vs components)
- Proper TypeScript typing throughout
- Comprehensive i18n translations (EN, VI, ZH)
- Good UX with collapsible sections and live preview
- File upload validation (type + size) in BrandKitEditor

---

## Critical Issues

**None identified.**

---

## High Priority Findings

### 1. Missing Input Sanitization for Brand Kit Text Fields

**File:** `src/stores/brandKitStore.ts` (lines 52-74)
**Issue:** `getBrandPromptText()` directly interpolates user input (companyName, colors) into prompt text without sanitization.

```typescript
// Current (line 59)
parts.push(`Company: ${brandKit.companyName}`);
```

**Risk:** While not XSS (server-side prompt), malicious prompt injection possible.
**Recommendation:** Add basic sanitization or length limits for companyName field.

### 2. Color Input Validation Missing

**File:** `src/components/brand-kit/BrandKitEditor.tsx` (lines 98-106)
**Issue:** Text input for colors accepts any string without hex validation.

```typescript
// Line 103 - no validation
onChange={(e) => updateBrandKit({ primaryColor: e.target.value })}
```

**Recommendation:** Add hex color regex validation: `/^#[0-9A-Fa-f]{6}$/`

---

## Medium Priority Improvements

### 1. Course Builder - Missing Lesson Title Sanitization

**File:** `src/components/course-builder/CourseBuilderToggle.tsx` (line 22)
**Issue:** Lesson title only trimmed, not sanitized for special characters.

```typescript
title: newLessonTitle.trim(), // No sanitization
```

### 2. Quiz Templates - Hardcoded Slide Counts

**File:** `src/data/templates/categories/quiz.json`
**Issue:** Slide counts (8-10) are hardcoded. Consider making configurable or documenting why.

### 3. Logo Storage as Base64

**File:** `src/components/brand-kit/BrandKitEditor.tsx` (lines 52-56)
**Issue:** Logo stored as base64 in localStorage via Zustand persist. For 500KB limit, this could consume ~680KB localStorage space after encoding.

**Recommendation:** Consider URL.createObjectURL for session-only storage or reduce max size.

### 4. Missing Error Boundary

**Files:** BrandKitEditor.tsx, CourseBuilderToggle.tsx
**Issue:** No error boundary for FileReader failures or crypto.randomUUID unavailability.

---

## Low Priority Suggestions

### 1. DRY Opportunity - Color Picker Component

**File:** `src/components/brand-kit/BrandKitEditor.tsx` (lines 91-127)
**Issue:** Primary and secondary color pickers duplicate same UI pattern.

```typescript
// Lines 94-107 and 112-125 are nearly identical
```

**Recommendation:** Extract to `<ColorPickerInput />` component.

### 2. Magic Numbers

**File:** `src/components/brand-kit/BrandKitEditor.tsx`

- Line 43: `500 * 1024` - Consider constant `MAX_LOGO_SIZE_BYTES`
- Line 12: Height classes like `h-12`, `w-12` - Consider design tokens

### 3. Accessibility

**File:** `src/components/course-builder/CourseBuilderToggle.tsx`

- Line 82: `cursor-grab` on GripVertical but no drag-and-drop implementation yet
- Missing aria-labels on some interactive elements

### 4. Future-Proofing Course Builder

**File:** `src/stores/courseBuilderStore.ts`

- `objectives: string[]` defined but never used in UI
- Consider removing unused fields (YAGNI) or implementing

---

## Positive Observations

1. **Excellent i18n Coverage:** All 3 locales (EN, VI, ZH) fully translated with consistent key structure
2. **Smart UX Patterns:**
   - Auto-expand when enabling features (lines 74-75 BrandKitEditor)
   - Live preview with gradient background
   - Beta badge for Course Mode
3. **Proper Zustand Patterns:**
   - Persist middleware with version control
   - Clean selector patterns
   - Immutable state updates
4. **File Validation:** BrandKitEditor validates both file type and size before processing
5. **Consistent Code Style:** Follows existing codebase patterns perfectly

---

## Recommended Actions

1. **[High]** Add hex color validation for brand color inputs
2. **[High]** Sanitize companyName before including in prompt text
3. **[Medium]** Add error handling for FileReader.onerror
4. **[Medium]** Consider reducing logo size limit or using alternative storage
5. **[Low]** Extract ColorPickerInput component for DRY
6. **[Low]** Add constants for magic numbers

---

## Metrics

| Metric         | Value                   |
| -------------- | ----------------------- |
| Type Coverage  | 100% (no `any` types)   |
| Test Coverage  | 73/73 tests passing     |
| Linting Issues | 0 errors                |
| Build Status   | Success                 |
| Bundle Impact  | +1.69KB (quiz.js chunk) |

---

## Security Checklist

| Check            | Status                                 |
| ---------------- | -------------------------------------- |
| XSS Prevention   | Partial (color input needs validation) |
| Input Validation | Partial (file validated, text not)     |
| OWASP Top 10     | No critical issues                     |
| Sensitive Data   | No secrets exposed                     |
| CORS/CSP         | N/A (client-side only)                 |

---

## Unresolved Questions

1. Should Course Builder `objectives` field be removed since it's not used in UI?
2. Is 500KB logo limit appropriate given localStorage constraints?
3. Should drag-and-drop for lessons be implemented now or deferred to v2.1?
