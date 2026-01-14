# Phase 4: Prompt Engineering

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 3 (API passes language)
- **Docs**: [system-architecture.md](../../docs/system-architecture.md)

## Overview

| Field                 | Value                                             |
| --------------------- | ------------------------------------------------- |
| Date                  | 2026-01-12                                        |
| Description           | Add language instruction block to buildUserPrompt |
| Priority              | P1                                                |
| Implementation Status | completed                                         |
| Review Status         | completed                                         |
| Effort                | 45min                                             |

## Key Insights

1. LLM instruction injection is simplest approach
2. Need explicit instruction for labels AND content
3. Pass-through instruction for technical terms
4. Position instruction early in prompt for visibility

## Requirements

1. Create language instruction block
2. Include full translate directive (labels + content)
3. Include pass-through directive for technical terms
4. Add language labels mapping for native names
5. Only inject when language !== 'en'

## Architecture

```
buildUserPrompt(config)
├── Check outputLanguage
├── Build languageInstruction block
└── Inject at top of prompt (after style identity)
```

## Related Code Files

| File                           | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `server/src/prompts/system.ts` | buildUserPrompt function (line ~1108) |

## Implementation Steps

### Step 4.1: Add language labels constant

File: `server/src/prompts/system.ts`

```typescript
// Near top of file, after other constants
const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  vi: 'Vietnamese (Tiếng Việt)',
  zh: 'Chinese (中文)',
  ja: 'Japanese (日本語)',
  ko: 'Korean (한국어)',
  th: 'Thai (ภาษาไทย)',
  id: 'Indonesian (Bahasa Indonesia)',
  fr: 'French (Français)',
  de: 'German (Deutsch)',
  es: 'Spanish (Español)',
};
```

### Step 4.2: Build language instruction block

File: `server/src/prompts/system.ts`

Inside `buildUserPrompt()` function, after extracting config:

```typescript
export function buildUserPrompt(config: PromptConfig): string {
  const {
    content,
    style,
    // ... existing destructuring
    outputLanguage,
  } = config;

  // NEW: Build language instruction
  const languageLabel = outputLanguage ? LANGUAGE_LABELS[outputLanguage] : null;
  const languageInstruction = outputLanguage && outputLanguage !== 'en'
    ? `
---

## OUTPUT LANGUAGE REQUIREMENT

**CRITICAL**: Generate ALL output in ${languageLabel}.

This includes:
- All slide titles and descriptions
- All labels (Background, Character, Layout, Title, etc.)
- All explanatory text and annotations
- All formatting markers and section headers

**PRESERVE TECHNICAL TERMS**: Keep technical terminology, proper nouns, brand names, and domain-specific vocabulary from the source content in their original form. Do not translate these.

Examples of what to preserve:
- Technology names: "Machine Learning", "API", "Docker"
- Brand names: "Nano Banana Pro", "OpenAI"
- Acronyms: "AI", "UI/UX", "ROI"

---
`
    : '';

  // ... rest of function
```

### Step 4.3: Inject instruction into prompt

File: `server/src/prompts/system.ts`

In the return statement of buildUserPrompt(), add after style identity:

```typescript
return `## YOUR CREATIVE IDENTITY
${persona}

You are creating a ${styleLabel} presentation. EVERY visual decision must reflect ${styleLabel} aesthetics.
${languageInstruction}${characterBlock}
---

Generate ${slideCount} CINEMATICALLY RICH...
```

### Step 4.4: Alternative injection point

If above disrupts flow, inject after "Source Content" section:

```typescript
## Source Content to Transform Into Slides
${content}
${languageInstruction}
IMPORTANT: Create prompts worthy of a TED talk...
```

## Todo List

- [x] Add LANGUAGE_LABELS constant
- [x] Update PromptConfig destructuring
- [x] Build languageInstruction block
- [x] Inject into prompt template
- [x] Test with Vietnamese output
- [x] Test with Chinese output
- [x] Test pass-through of technical terms
- [x] Test with character presenter

## Success Criteria

- [x] English output unchanged (no instruction injected)
- [x] Vietnamese prompts have Vietnamese labels
- [x] Chinese prompts have Chinese labels
- [x] Technical terms preserved in all languages
- [x] Character descriptions translated appropriately
- [x] Prompt structure remains valid

## Risk Assessment

| Risk                    | Impact | Mitigation                               |
| ----------------------- | ------ | ---------------------------------------- |
| LLM ignores instruction | Medium | Test with different LLMs, refine wording |
| Labels inconsistent     | Medium | Add explicit label list if needed        |
| Prompt too long         | Low    | Instruction is ~150 words only           |
| Pass-through fails      | Medium | Add more examples if needed              |

## Security Considerations

- Language code validated by Zod in Phase 3
- No raw user input in instruction block
- LANGUAGE_LABELS is hardcoded constant

## Testing Scenarios

### Test 1: Vietnamese Output

- Input: English content about AI
- Output Language: vi
- Expected: Labels in Vietnamese, "AI" term preserved

### Test 2: Chinese with Character

- Input: Topic about business strategy
- Output Language: zh
- Character: Enabled (Pixar style)
- Expected: All labels in Chinese, character descriptions in Chinese

### Test 3: English (no change)

- Input: Any content
- Output Language: en (or undefined)
- Expected: No language instruction, normal English output

## Next Steps

→ Manual testing with different language/content combinations
→ Iterate on instruction wording if quality issues
