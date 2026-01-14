---
phase: 3
title: 'Nano Banana API Integration (Gemini Image Generation)'
status: completed
priority: P1
effort: 8h
dependencies: [phase-02]
completed: 2026-01-13
---

# Phase 3: Nano Banana API Integration (v1.5.x)

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** Phase 2 complete
**Status:** ✅ Completed

## Overview

| Attribute             | Value        |
| --------------------- | ------------ |
| Version Target        | v1.5.0       |
| Priority              | P1 - High    |
| Effort                | 8h           |
| Implementation Status | ✅ Completed |
| Review Status         | ✅ Approved  |

Direct integration with Google Gemini API for AI-powered slide image generation.

**Research Finding:** "Nano Banana Pro" uses Google Gemini 3 Pro Image model internally. Implementation uses Google Gemini SDK directly.

## Key Insights

1. **Gemini Image Generation** - Uses `gemini-2.0-flash-preview-image-generation` model
2. **Server-side API key priority** - Security improvement: server key takes precedence
3. **Rate limiting** - 10 requests/minute per IP to prevent abuse
4. **Batch processing** - Generate up to 10 slide images in single request

## Implementation Summary

### Files Created

| File                                           | Purpose                                 |
| ---------------------------------------------- | --------------------------------------- |
| `server/src/services/geminiImageClient.ts`     | Gemini API client with image generation |
| `server/src/routes/gemini.ts`                  | API routes with rate limiting           |
| `src/hooks/useGeminiImage.ts`                  | React hook for image generation         |
| `src/components/gemini/GeminiImagePreview.tsx` | Image preview modal with carousel       |

### Files Modified

| File                                           | Changes                                  |
| ---------------------------------------------- | ---------------------------------------- |
| `server/src/index.ts`                          | Added gemini router                      |
| `server/package.json`                          | Added `@google/generative-ai` dependency |
| `server/.env.example`                          | Added GEMINI_API_KEY, GEMINI_MODEL       |
| `src/stores/settingsStore.ts`                  | Added GeminiSettings interface           |
| `src/components/SettingsDialog.tsx`            | Added Gemini settings section            |
| `src/components/slide-prompt/PromptOutput.tsx` | Added Generate Images button             |
| `src/i18n/locales/*.json`                      | Added gemini translation keys (EN/VI/ZH) |

## Requirements

### Functional

- [x] FR-26: Configure Gemini API credentials in Settings
- [x] FR-27: Send prompts to Gemini for image generation
- [x] FR-28: Preview generated slides in modal with carousel
- [x] FR-29: One-click generate-and-preview flow

### Non-Functional

- [x] NFR-11: Rate limiting (10 req/min per IP)
- [x] NFR-12: Server-side API key priority for security

## Architecture

```
src/
├── components/
│   ├── gemini/
│   │   └── GeminiImagePreview.tsx    # Image carousel modal
│   ├── slide-prompt/
│   │   └── PromptOutput.tsx          # Generate button integration
│   └── SettingsDialog.tsx            # Gemini config section
├── hooks/
│   └── useGeminiImage.ts             # Generation hook
└── stores/
    └── settingsStore.ts              # GeminiSettings state

server/src/
├── routes/
│   └── gemini.ts                     # /api/gemini/* with rate limiting
└── services/
    └── geminiImageClient.ts          # Google Generative AI client
```

## API Endpoints

| Endpoint                      | Method | Purpose                 |
| ----------------------------- | ------ | ----------------------- |
| `/api/gemini/generate-image`  | POST   | Generate single image   |
| `/api/gemini/generate-images` | POST   | Batch generate (max 10) |
| `/api/gemini/test-connection` | POST   | Test API key validity   |
| `/api/gemini/config`          | GET    | Get default config      |

## Security Improvements

1. **API Key Priority**: Server-side `GEMINI_API_KEY` takes precedence over client-provided key
2. **Rate Limiting**: In-memory rate limiter (10 req/min per IP)
3. **Input Validation**: Zod schemas for all endpoints
4. **Error Handling**: Graceful error messages without exposing internals

## Todo List

- [x] 3.1 API Client Setup (3h)
- [x] 3.2 Settings Integration (2h)
- [x] 3.3 Preview & One-Click (3h)

## Success Criteria

| Criteria                     | Status                          |
| ---------------------------- | ------------------------------- |
| API connection works         | ✅ Test connection button works |
| Images generate successfully | ✅ Batch generation working     |
| Preview displays correctly   | ✅ Carousel with download       |
| Error handling works         | ✅ Graceful error messages      |
| Rate limiting active         | ✅ 10 req/min limit             |
| All tests pass               | ✅ 73 tests passed              |

## Code Review Results

- **Score:** 8/10
- **Critical Issues:** 0
- **High Priority Fixed:** 2 (API key security, Rate limiting)
- **Tests:** 73 passed, 96.42% coverage

## Next Steps

After Phase 3 completion:

1. ✅ Update version to 1.5.0
2. 🔲 Create user documentation for Gemini integration
3. 🔲 Begin Phase 4: Education & Business
