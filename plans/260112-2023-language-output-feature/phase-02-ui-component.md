# Phase 2: UI Component

## Context

- **Parent Plan**: [plan.md](./plan.md)
- **Dependencies**: Phase 1 (Types & Constants)
- **Docs**: [code-standards.md](../../docs/code-standards.md)

## Overview

| Field                 | Value                                                   |
| --------------------- | ------------------------------------------------------- |
| Date                  | 2026-01-12                                              |
| Description           | Add language dropdown to PresentationSettings component |
| Priority              | P1                                                      |
| Implementation Status | completed                                               |
| Review Status         | completed                                               |
| Effort                | 45min                                                   |

## Key Insights

1. Follow existing dropdown patterns in PresentationSettings (aspectRatio, colorPalette)
2. Use shadcn/ui Select component
3. Display native language names for better UX
4. Add i18n labels for accessibility

## Requirements

1. Add language selector dropdown in PresentationSettings
2. Display native language names (e.g., "Tiếng Việt" not "Vietnamese")
3. Default to English when not set
4. Update session store when language changes
5. Add i18n translation keys

## Architecture

```
PresentationSettings.tsx
├── Import OUTPUT_LANGUAGES from types
├── Add Select component for language
└── Update sessionStore.updateSessionSettings()

i18n/locales/en.json
└── settings.outputLanguage, settings.outputLanguageDescription

i18n/locales/zh.json
└── settings.outputLanguage, settings.outputLanguageDescription
```

## Related Code Files

| File                                                   | Purpose              |
| ------------------------------------------------------ | -------------------- |
| `src/components/slide-prompt/PresentationSettings.tsx` | Main component       |
| `src/i18n/locales/en.json`                             | English translations |
| `src/i18n/locales/zh.json`                             | Chinese translations |
| `src/stores/sessionStore.ts`                           | State management     |

## Implementation Steps

### Step 2.1: Read current PresentationSettings structure

First understand existing patterns in the component.

### Step 2.2: Add language dropdown

File: `src/components/slide-prompt/PresentationSettings.tsx`

```typescript
// Import OUTPUT_LANGUAGES
import { OUTPUT_LANGUAGES } from '@/types/slidePrompt';
import type { OutputLanguage } from '@/types/slidePrompt';

// Inside component, add language selector (after layoutStructure or colorPalette)
<div className="space-y-2">
  <Label>{t('settings.outputLanguage')}</Label>
  <Select
    value={settings.outputLanguage || 'en'}
    onValueChange={(value: OutputLanguage) =>
      updateSessionSettings(currentSessionId, { outputLanguage: value })
    }
  >
    <SelectTrigger>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {OUTPUT_LANGUAGES.map((lang) => (
        <SelectItem key={lang.code} value={lang.code}>
          {lang.nativeLabel}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className="text-xs text-muted-foreground">
    {t('settings.outputLanguageDescription')}
  </p>
</div>
```

### Step 2.3: Add i18n keys (English)

File: `src/i18n/locales/en.json`

```json
{
  "settings": {
    "outputLanguage": "Output Language",
    "outputLanguageDescription": "Language for generated prompts"
  }
}
```

### Step 2.4: Add i18n keys (Chinese)

File: `src/i18n/locales/zh.json`

```json
{
  "settings": {
    "outputLanguage": "输出语言",
    "outputLanguageDescription": "生成提示词的语言"
  }
}
```

## Todo List

- [x] Read PresentationSettings.tsx structure
- [x] Add language selector dropdown
- [x] Add i18n keys to en.json
- [x] Add i18n keys to zh.json
- [x] Test UI renders correctly
- [x] Test language selection updates store

## Success Criteria

- [x] Language dropdown appears in PresentationSettings
- [x] All 10 languages displayed with native names
- [x] Selection updates session config
- [x] Default shows English when not set
- [x] i18n labels display correctly

## Risk Assessment

| Risk                            | Impact | Mitigation                             |
| ------------------------------- | ------ | -------------------------------------- |
| UI layout breaks                | Medium | Test responsive layout                 |
| Select component import missing | Low    | Check existing imports                 |
| Store update fails              | Medium | Verify updateSessionSettings signature |

## Security Considerations

None - UI component with validated language codes only.

## Next Steps

→ Phase 3: API & Server
