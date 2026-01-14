# Code Review Report: Phase 2 - Core Integrations

**Date:** 2026-01-13 16:32
**Reviewer:** code-reviewer-a909a3b
**Scope:** Phase 2 new files and modifications
**Test Results:** 73/73 passed, TypeCheck passed, Build passed

---

## Score: 8/10

Overall solid implementation following YAGNI/KISS/DRY principles. Minor issues identified but no critical security vulnerabilities.

---

## Files Reviewed

### New Files (8)

1. `server/src/prompts/optimizer.ts` - 65 lines
2. `server/src/services/promptOptimizer.ts` - 122 lines
3. `server/src/routes/optimize.ts` - 91 lines
4. `src/hooks/usePromptOptimizer.ts` - 115 lines
5. `src/components/optimizer/OptimizationDiff.tsx` - 152 lines
6. `src/components/preview/PdfPreview.tsx` - 250 lines
7. `src/lib/exporters/canva-exporter.ts` - 131 lines
8. `src/lib/exporters/figma-exporter.ts` - 176 lines

### Modified Files (5)

1. `server/src/index.ts` - Added optimize router
2. `src/components/slide-prompt/SlideCard.tsx` - Added Optimize button
3. `src/lib/exporters/index.ts` - Re-exported new exporters
4. `src/lib/export.ts` - Added canva/figma formats
5. `src/components/SessionSidebar.tsx` - Added Canva/Figma export options

**Total LOC analyzed:** ~1100 lines

---

## Critical Issues (0)

None identified.

---

## Warnings (Should Fix) (4)

### W1. Unused Lazy Imports in PdfPreview.tsx

**File:** `src/components/preview/PdfPreview.tsx` (lines 18-35)
**Issue:** Lazy-loaded `PDFViewer`, `Document`, `Page`, `Text`, `View`, `StyleSheet` from `@react-pdf/renderer` are never used. Component uses `require()` inside `PreviewDocument` instead.
**Impact:** Dead code, increased bundle size
**Fix:** Remove unused lazy imports or use them consistently

```tsx
// Lines 18-35 - REMOVE these unused imports:
const PDFViewer = lazy(() => ...);
const Document = lazy(() => ...);
// etc.
```

### W2. Synchronous require() in React Component

**File:** `src/components/preview/PdfPreview.tsx` (line 52)
**Issue:** Using `require('@react-pdf/renderer')` inside component defeats lazy loading purpose
**Impact:** Bundle splitting not working as intended
**Fix:** Use dynamic import with Suspense or remove the PreviewDocument function entirely since it's not rendered

### W3. Math.random() for ID Generation

**File:** `src/lib/exporters/figma-exporter.ts` (lines 65-67)
**Issue:** `Math.random().toString(36).substring(2, 11)` for IDs
**Impact:** Collision risk for large exports, not cryptographically secure
**Fix:** Use `crypto.randomUUID()` or nanoid for production

```ts
// Current
function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Recommended
function generateId(): string {
  return crypto.randomUUID();
}
```

### W4. Score Calculation Logic

**File:** `server/src/services/promptOptimizer.ts` (lines 100-103)
**Issue:** After multi-iteration, score is `Math.min(10, initialScore + allImprovements.length)` - arbitrary calculation not based on actual LLM assessment
**Impact:** Misleading score display
**Fix:** Use last iteration's actual score instead

---

## Suggestions (Nice to Have) (5)

### S1. Input Validation Could Be Stricter

**File:** `server/src/routes/optimize.ts`
**Current:** Validates prompt length (5000 chars) and batch size (10)
**Suggestion:** Add rate limiting middleware to prevent abuse

### S2. Type Duplication

**Files:** `src/hooks/usePromptOptimizer.ts` and `server/src/services/promptOptimizer.ts`
**Issue:** `OptimizationResult` interface defined twice
**Suggestion:** Share types via `@/types` or generate from API schema

### S3. PreviewDocument Component Unused

**File:** `src/components/preview/PdfPreview.tsx` (lines 45-124)
**Issue:** `PreviewDocument` function defined but never called - component uses HTML preview
**Suggestion:** Remove dead code or implement actual PDF rendering

### S4. Hardcoded Colors in Exporters

**Files:** `canva-exporter.ts`, `figma-exporter.ts`
**Issue:** Colors like `#3b82f6`, `#1a1a1a` hardcoded
**Suggestion:** Extract to constants or use theme values

### S5. Missing Error Boundary

**File:** `src/components/preview/PdfPreview.tsx`
**Suggestion:** Add error boundary around Suspense for graceful failure

---

## Positive Observations

1. **Good Input Validation** - API routes validate prompt length, batch size, iterations cap
2. **Proper Error Handling** - Try-catch blocks with fallback responses
3. **i18n Support** - All UI text uses `useTranslation()` with fallbacks
4. **Clean Separation** - Service layer separate from routes
5. **Memory Cleanup** - Blob URLs revoked after download (`URL.revokeObjectURL`)
6. **Type Safety** - Proper TypeScript interfaces throughout
7. **Self-Refine Pattern** - Well-implemented LLM optimization loop
8. **CORS Config** - Proper origin validation including Electron support

---

## Architecture Assessment

| Aspect                 | Rating | Notes                           |
| ---------------------- | ------ | ------------------------------- |
| Separation of Concerns | Good   | Service/Route/Hook layers clear |
| DRY                    | Good   | Some type duplication (minor)   |
| KISS                   | Good   | Simple implementations          |
| YAGNI                  | Good   | No over-engineering             |
| Security               | Good   | Input validation present        |
| Performance            | Fair   | Unused code in PdfPreview       |
| Maintainability        | Good   | Code readable, well-commented   |

---

## Summary

Phase 2 implementation is production-ready with minor cleanup needed:

1. **Must fix:** Remove unused lazy imports in PdfPreview.tsx (dead code)
2. **Should fix:** Replace Math.random() with crypto.randomUUID() for IDs
3. **Consider:** Share OptimizationResult type between client/server

All tests pass, build succeeds. Code follows project standards.

---

## Unresolved Questions

1. Is `PreviewDocument` component intended for future use or should it be removed?
2. Should Canva/Figma export schemas match official API specs for direct import?
