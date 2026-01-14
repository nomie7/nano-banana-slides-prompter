# Brainstorm Report: Language Output Feature

**Date**: 2026-01-12
**Status**: Analyzed
**Scope**: Add output language selection to Generate Prompt flow

---

## Problem Statement

Hiện tại luồng Generate Prompt không hỗ trợ:

1. **Output Language Selection** - chọn ngôn ngữ xuất ra prompt
2. **Pass-through Mode** - giữ nguyên thuật ngữ/từ gốc trong content nguồn

User expectation: Prompt output được dịch TOÀN BỘ (cả labels như "Background:", "Title:" và content) sang ngôn ngữ đích.

---

## Current Architecture Analysis

### Data Flow (Simplified)

```
PresentationSettings → useStreamingGeneration → POST /api/generate-prompt-stream
                                                        ↓
                                              buildUserPrompt(config)
                                                        ↓
                                              LLM generates → SSE stream
```

### Key Files Affected

| Layer          | File                                                   | Change Required             |
| -------------- | ------------------------------------------------------ | --------------------------- |
| Types          | `src/types/slidePrompt.ts`                             | Add `outputLanguage` field  |
| UI             | `src/components/slide-prompt/PresentationSettings.tsx` | Add language dropdown       |
| i18n           | `src/i18n/locales/*.json`                              | Add language option labels  |
| API            | `src/lib/api.ts`                                       | Include language in request |
| Server Schema  | `server/src/routes/prompt.ts`                          | Validate language param     |
| Prompt Builder | `server/src/prompts/system.ts`                         | Inject language instruction |

---

## Requirements Confirmed

| Requirement     | Decision                           |
| --------------- | ---------------------------------- |
| Scope           | Full translate (labels + content)  |
| Source language | Pass-through mode (preserve terms) |
| Language list   | Fixed: 5-10 languages              |
| UI position     | Inside PresentationSettings        |

---

## Evaluated Approaches

### Option A: LLM-driven Translation ⭐ RECOMMENDED

**Approach**: Add language param + instruction block to prompt. Let LLM handle all translation.

```typescript
// Inject vào buildUserPrompt()
const languageInstruction =
  config.outputLanguage && config.outputLanguage !== 'en'
    ? `## OUTPUT LANGUAGE REQUIREMENT
Generate ALL slide content in ${languageLabel}. This includes:
- Slide titles and descriptions
- All labels (Background, Character, Layout, etc.)
- Technical explanations

IMPORTANT: Preserve technical terms, proper nouns, and domain-specific vocabulary from the source content in their original form.
`
    : '';
```

**Pros**:

- Minimal code changes (~50 LOC)
- No template maintenance per language
- Modern LLMs handle multilingual well
- Pass-through mode via instruction

**Cons**:

- Output consistency depends on LLM
- May need prompt tuning per language

**Effort**: Low

---

### Option B: Template-based Translation

**Approach**: Create translated prompt templates, load based on language.

**Pros**:

- 100% consistent output
- Full control over labels

**Cons**:

- ~2000 LOC per language
- Maintenance nightmare (update all when template changes)
- Violates DRY

**Effort**: High

---

### Option C: Hybrid (Server-side i18n + LLM content)

**Approach**: Labels from i18n files, LLM generates content only.

**Pros**:

- Consistent labels
- Flexible content

**Cons**:

- Complex implementation
- Need prompt restructuring
- Still need i18n files for server

**Effort**: Medium-High

---

## Recommended Solution: Option A

### Why?

1. **KISS**: Single instruction block, minimal code
2. **YAGNI**: No need for complex translation infrastructure
3. **LLM Capability**: GPT-4o/Claude handles multilingual excellently
4. **Maintainability**: One place to change prompt structure

### Supported Languages (Initial)

| Code | Language   | Native Name      |
| ---- | ---------- | ---------------- |
| `en` | English    | English          |
| `vi` | Vietnamese | Tiếng Việt       |
| `zh` | Chinese    | 中文             |
| `ja` | Japanese   | 日本語           |
| `ko` | Korean     | 한국어           |
| `th` | Thai       | ภาษาไทย          |
| `id` | Indonesian | Bahasa Indonesia |
| `fr` | French     | Français         |
| `de` | German     | Deutsch          |
| `es` | Spanish    | Español          |

---

## Implementation Plan

### Phase 1: Types & UI

1. Add `outputLanguage?: OutputLanguage` to `PresentationSettings` type
2. Create `OutputLanguage` type with fixed language codes
3. Add language dropdown to `PresentationSettings.tsx`
4. Add i18n labels for language options

### Phase 2: API & Server

5. Update Zod schema in `prompt.ts` to validate language
6. Pass language through to `buildUserPrompt()`

### Phase 3: Prompt Engineering

7. Add language instruction block to `buildUserPrompt()`
8. Include pass-through instruction for technical terms
9. Test with different languages

### Phase 4: Testing

10. Test English (default, no change)
11. Test Vietnamese output
12. Test Chinese output
13. Test with character presenter enabled
14. Test with different content types (text/URL/file)

---

## Risks & Mitigations

| Risk                              | Impact | Mitigation                                |
| --------------------------------- | ------ | ----------------------------------------- |
| LLM translation quality varies    | Medium | Test with target LLMs, refine instruction |
| Labels inconsistent across slides | Low    | Add explicit label list in instruction    |
| Pass-through not working          | Medium | Add examples in instruction               |
| Performance impact                | None   | No extra API calls                        |

---

## Success Metrics

1. ✅ User can select output language from PresentationSettings
2. ✅ Generated prompts in target language (labels + content)
3. ✅ Technical terms preserved from source
4. ✅ Works with all 20 visual styles
5. ✅ Works with character presenter

---

## Open Questions

None - all requirements clarified.

---

## Next Steps

Ready for implementation plan. Estimated scope: ~100-150 LOC across 5-6 files.
