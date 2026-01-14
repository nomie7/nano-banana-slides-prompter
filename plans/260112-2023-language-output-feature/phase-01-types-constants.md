# Phase 1: Types & Constants

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: None
- **Docs**: [code-standards.md](../../docs/code-standards.md)

## Overview

| Field                 | Value                                          |
| --------------------- | ---------------------------------------------- |
| Date                  | 2026-01-12                                     |
| Description           | Define TypeScript types and language constants |
| Priority              | P1                                             |
| Implementation Status | completed                                      |
| Review Status         | completed                                      |
| Effort                | 30min                                          |

## Key Insights

1. Follow existing type patterns in `slidePrompt.ts`
2. Use union types for fixed language list (matches `SlideStyle`, `AspectRatio` patterns)
3. Language labels need both native name and English for i18n

## Requirements

1. Define `OutputLanguage` type with 10 language codes
2. Define `OUTPUT_LANGUAGES` constant with code, label, nativeLabel
3. Add `outputLanguage?: OutputLanguage` to `PresentationSettings` interface
4. Server-side: mirror types in `server/src/prompts/types.ts`

## Architecture

```
src/types/slidePrompt.ts
└── OutputLanguage (union type)
└── PresentationSettings.outputLanguage

server/src/prompts/types.ts (optional - can infer from zod)
```

## Related Code Files

| File                          | Purpose                  |
| ----------------------------- | ------------------------ |
| `src/types/slidePrompt.ts`    | Frontend types           |
| `server/src/prompts/types.ts` | Server types (if needed) |

## Implementation Steps

### Step 1.1: Add OutputLanguage type

File: `src/types/slidePrompt.ts`

```typescript
// After line 42 (after ColorPalette type)
export type OutputLanguage = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'th' | 'id' | 'fr' | 'de' | 'es';

export const OUTPUT_LANGUAGES: { code: OutputLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'th', label: 'Thai', nativeLabel: 'ภาษาไทย' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
];
```

### Step 1.2: Update PresentationSettings interface

File: `src/types/slidePrompt.ts`

```typescript
// Update PresentationSettings (around line 73)
export interface PresentationSettings {
  aspectRatio: AspectRatio;
  slideCount: number;
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
  character?: CharacterSettings;
  outputLanguage?: OutputLanguage; // NEW: Optional, defaults to 'en'
}
```

## Todo List

- [x] Add OutputLanguage type
- [x] Add OUTPUT_LANGUAGES constant
- [x] Update PresentationSettings interface
- [x] Verify TypeScript compilation

## Success Criteria

- [x] Types compile without errors
- [x] OUTPUT_LANGUAGES exportable and usable
- [x] PresentationSettings accepts optional outputLanguage

## Risk Assessment

| Risk                   | Impact | Mitigation                 |
| ---------------------- | ------ | -------------------------- |
| Type naming conflict   | Low    | Check existing types first |
| Breaking existing code | None   | Field is optional          |

## Security Considerations

None - type definitions only.

## Next Steps

→ Phase 2: UI Component
