# Phase 3: API & Server

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 1 (Types)
- **Docs**: [system-architecture.md](../../docs/system-architecture.md)

## Overview

| Field                 | Value                                                 |
| --------------------- | ----------------------------------------------------- |
| Date                  | 2026-01-12                                            |
| Description           | Update API schema and pass language to prompt builder |
| Priority              | P1                                                    |
| Implementation Status | completed                                             |
| Review Status         | completed                                             |
| Effort                | 30min                                                 |

## Key Insights

1. Backend uses Zod for request validation
2. Language param goes through settings object
3. Pass to buildUserPrompt() function

## Requirements

1. Update Zod schema to accept `outputLanguage` in settings
2. Pass language to buildUserPrompt() config
3. Handle missing language (default to 'en')

## Architecture

```
POST /api/generate-prompt-stream
└── Request body: { settings: { outputLanguage?: string } }
    └── Zod validation
        └── buildUserPrompt({ language: body.settings.outputLanguage })
```

## Related Code Files

| File                           | Purpose                  |
| ------------------------------ | ------------------------ |
| `server/src/routes/prompt.ts`  | API route handler        |
| `server/src/prompts/system.ts` | buildUserPrompt function |

## Implementation Steps

### Step 3.1: Update Zod schema

File: `server/src/routes/prompt.ts`

Find `generateSchema` and add outputLanguage to settings:

```typescript
const generateSchema = z.object({
  content: z.object({ ... }),
  style: z.string(),
  settings: z.object({
    aspectRatio: z.string(),
    slideCount: z.number(),
    colorPalette: z.string(),
    layoutStructure: z.string(),
    character: z.object({ ... }).optional(),
    outputLanguage: z.enum(['en', 'vi', 'zh', 'ja', 'ko', 'th', 'id', 'fr', 'de', 'es']).optional(),
  }),
  llmConfig: z.object({ ... }).optional(),
});
```

### Step 3.2: Pass language to buildUserPrompt

File: `server/src/routes/prompt.ts`

In the route handler, update buildUserPrompt call:

```typescript
const userPrompt = buildUserPrompt({
  content: contentText,
  style: body.style,
  colorPalette: body.settings.colorPalette,
  layoutStructure: body.settings.layoutStructure,
  aspectRatio: body.settings.aspectRatio,
  slideCount: body.settings.slideCount,
  character: body.settings.character,
  generatedCharacter,
  slideTypeSequence,
  outputLanguage: body.settings.outputLanguage, // NEW
});
```

### Step 3.3: Update PromptConfig type

File: `server/src/prompts/system.ts`

```typescript
interface PromptConfig {
  content: string;
  style: SlideStyle;
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
  aspectRatio: AspectRatio;
  slideCount: number;
  character?: CharacterSettings;
  generatedCharacter?: GeneratedCharacter;
  slideTypeSequence?: string[];
  outputLanguage?: string; // NEW
}
```

## Todo List

- [x] Update Zod schema with outputLanguage
- [x] Pass outputLanguage to buildUserPrompt
- [x] Update PromptConfig interface
- [x] Test API accepts language param

## Success Criteria

- [x] API accepts outputLanguage in request
- [x] Invalid language codes rejected by Zod
- [x] Language passed to buildUserPrompt correctly
- [x] Missing language defaults gracefully

## Risk Assessment

| Risk                    | Impact | Mitigation             |
| ----------------------- | ------ | ---------------------- |
| Schema validation fails | Medium | Test with Postman/curl |
| Type mismatch           | Low    | Use consistent types   |

## Security Considerations

- Zod validates language against fixed enum - prevents injection
- No user input directly in prompts beyond validated codes

## Next Steps

→ Phase 4: Prompt Engineering
