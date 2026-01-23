# Code Review Report: Phase 3 - Gemini Image Generation

**Date:** 2026-01-13 17:55
**Reviewer:** code-reviewer agent
**Score:** 8/10

---

## Scope

- **Files reviewed:** 10 files (4 new, 6 modified)
- **Lines analyzed:** ~650 LOC
- **Focus:** Phase 3 - Gemini Image Generation integration

### Files Reviewed

| File                                           | Type     | LOC |
| ---------------------------------------------- | -------- | --- |
| `server/src/services/geminiImageClient.ts`     | NEW      | 133 |
| `server/src/routes/gemini.ts`                  | NEW      | 95  |
| `server/src/index.ts`                          | MODIFIED | 67  |
| `server/.env.example`                          | MODIFIED | 14  |
| `src/stores/settingsStore.ts`                  | MODIFIED | 51  |
| `src/hooks/useGeminiImage.ts`                  | NEW      | 186 |
| `src/components/gemini/GeminiImagePreview.tsx` | NEW      | 136 |
| `src/components/SettingsDialog.tsx`            | MODIFIED | 326 |
| `src/components/slide-prompt/PromptOutput.tsx` | MODIFIED | 287 |
| `src/i18n/locales/*.json`                      | MODIFIED | ~75 |

---

## Overall Assessment

Good implementation of Gemini Image Generation feature. Code follows project standards, uses proper TypeScript types, and integrates well with existing architecture. Some security and performance improvements recommended.

---

## Critical Issues (0)

None identified.

---

## High Priority Findings (2)

### 1. API Key Transmitted Over Network

**Location:** `src/hooks/useGeminiImage.ts:64`, `src/hooks/useGeminiImage.ts:117-120`

**Issue:** Client sends API key in request body to backend. While using HTTPS in production mitigates risk, storing/transmitting API keys from client-side is a security concern.

**Impact:** API key exposure if HTTPS not enforced or if logs capture request bodies.

**Recommendation:** Consider server-side API key storage only, or add warning in UI about client-stored keys.

### 2. No Rate Limiting on Image Generation

**Location:** `server/src/routes/gemini.ts`

**Issue:** No rate limiting on `/generate-image` and `/generate-images` endpoints. Batch endpoint allows up to 10 images per request.

**Impact:** Potential API abuse, cost overruns, or denial of service.

**Recommendation:** Add rate limiting middleware (e.g., `hono/rate-limiter`).

---

## Medium Priority Improvements (4)

### 1. Sequential Batch Processing

**Location:** `server/src/services/geminiImageClient.ts:96-107`

**Issue:** `generateSlideImages` processes prompts sequentially in a for-loop.

**Impact:** Slow batch generation (N sequential API calls).

**Suggestion:** Consider `Promise.all` with concurrency limit (e.g., p-limit) for parallel processing.

```typescript
// Current: Sequential
for (let i = 0; i < prompts.length; i++) {
  const result = await generateSlideImage(prompts[i], config);
  ...
}

// Better: Parallel with limit
import pLimit from 'p-limit';
const limit = pLimit(3); // 3 concurrent
const results = await Promise.all(
  prompts.map(p => limit(() => generateSlideImage(p, config)))
);
```

### 2. Missing Request Timeout

**Location:** `server/src/services/geminiImageClient.ts:57`

**Issue:** No timeout on Gemini API call. Image generation can be slow.

**Impact:** Long-running requests could hang indefinitely.

**Suggestion:** Add timeout using AbortController or Gemini SDK options.

### 3. Large Base64 Images in Memory

**Location:** `src/hooks/useGeminiImage.ts`, `src/components/gemini/GeminiImagePreview.tsx`

**Issue:** Base64 images stored in React state. Multiple large images could cause memory pressure.

**Impact:** Performance degradation on low-memory devices.

**Suggestion:** Consider blob URLs or lazy loading for image preview.

### 4. Preview Modal State Not Reset

**Location:** `src/components/slide-prompt/PromptOutput.tsx:112-115`

**Issue:** `handleGenerateImages` sets `previewOpen(true)` after `generateImages()`, but checks `images.length > 0` which may be stale.

**Impact:** Preview might not open if state hasn't updated yet.

**Suggestion:** Use effect to open preview when images change:

```typescript
useEffect(() => {
  if (images.length > 0) setPreviewOpen(true);
}, [images]);
```

---

## Low Priority Suggestions (3)

### 1. ts-expect-error Comment

**Location:** `server/src/services/geminiImageClient.ts:52`

**Issue:** `@ts-expect-error` for `responseModalities` - valid but undocumented.

**Suggestion:** Add comment explaining when this can be removed (SDK update).

### 2. Magic Number for Download Delay

**Location:** `src/components/gemini/GeminiImagePreview.tsx:47`

**Issue:** `setTimeout(() => handleDownload(image), 100 * image.slideNumber)` uses magic number.

**Suggestion:** Extract to constant: `const DOWNLOAD_DELAY_MS = 100;`

### 3. Duplicate getBaseUrl Function

**Location:** `src/hooks/useGeminiImage.ts:27-33`

**Issue:** Similar pattern exists in other hooks. Violates DRY.

**Suggestion:** Extract to shared utility in `src/lib/api.ts`.

---

## Positive Observations

1. **Type Safety:** Good TypeScript interfaces (`GeneratedImage`, `GeminiImageConfig`, etc.)
2. **Error Handling:** Comprehensive try-catch with user-friendly toast messages
3. **i18n Support:** All 3 languages (EN, VI, ZH) have complete Gemini translations
4. **Validation:** Zod schemas on all API endpoints
5. **Safety Settings:** Proper Gemini content safety configuration
6. **Clean Architecture:** Clear separation - service layer, routes, hooks, components
7. **UI/UX:** Nice image carousel with thumbnails, download options

---

## YAGNI/KISS/DRY Compliance

| Principle | Status | Notes                                    |
| --------- | ------ | ---------------------------------------- |
| YAGNI     | PASS   | No over-engineering, minimal feature set |
| KISS      | PASS   | Simple, straightforward implementation   |
| DRY       | MINOR  | `getBaseUrl` duplicated (low priority)   |

---

## TypeScript & Linting

| Check              | Status |
| ------------------ | ------ |
| Frontend typecheck | PASS   |
| Server typecheck   | PASS   |
| ESLint (new files) | PASS   |

_Note: Existing linting issues in `prompt.ts` (prefer-const) unrelated to Phase 3._

---

## Security Checklist

| Item                   | Status | Notes                           |
| ---------------------- | ------ | ------------------------------- |
| Input validation       | PASS   | Zod schemas on all endpoints    |
| Error message exposure | PASS   | Generic errors, no stack traces |
| API key handling       | WARN   | Keys transmitted from client    |
| CORS                   | PASS   | Proper origin validation        |
| Rate limiting          | FAIL   | Not implemented                 |

---

## Recommended Actions

1. **[HIGH]** Add rate limiting to Gemini endpoints
2. **[HIGH]** Consider server-only API key storage option
3. **[MED]** Implement parallel batch processing with concurrency limit
4. **[MED]** Add request timeout for Gemini API calls
5. **[LOW]** Extract `getBaseUrl` to shared utility
6. **[LOW]** Add effect to auto-open preview when images ready

---

## Metrics Summary

| Metric          | Value |
| --------------- | ----- |
| **Score**       | 8/10  |
| Critical Issues | 0     |
| High Priority   | 2     |
| Medium Priority | 4     |
| Low Priority    | 3     |
| Type Coverage   | 100%  |
| New Files Lint  | Clean |

---

## Unresolved Questions

1. Should API key be stored server-side only for enhanced security?
2. Is 10-image batch limit appropriate for typical use cases?
3. Should image generation have a timeout configured?
