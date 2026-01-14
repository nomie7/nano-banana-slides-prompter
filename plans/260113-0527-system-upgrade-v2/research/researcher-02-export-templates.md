# Research: Export Functionality & Template System

**Date:** 2026-01-13 | **Project:** Nano Banana Slides Prompter

---

## 1. Client-Side Export System

### Core Pattern: Blob + URL.createObjectURL

```typescript
// Reusable export utility
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // CRITICAL: Prevent memory leaks
  URL.revokeObjectURL(url);
}
```

### Format-Specific Exports

```typescript
// JSON Export - formatted for readability
export const exportJSON = (data: object, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  downloadFile(json, `${filename}.json`, 'application/json');
};

// Markdown Export
export const exportMarkdown = (content: string, filename: string) => {
  downloadFile(content, `${filename}.md`, 'text/markdown');
};

// Plain Text Export
export const exportText = (content: string, filename: string) => {
  downloadFile(content, `${filename}.txt`, 'text/plain');
};
```

### React Hook Pattern

```typescript
export function useExport() {
  const exportSession = useCallback((session: Session, format: 'json' | 'md' | 'txt') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `${session.name}-${timestamp}`;

    switch (format) {
      case 'json':
        exportJSON(session, filename);
        break;
      case 'md':
        exportMarkdown(formatAsMarkdown(session), filename);
        break;
      case 'txt':
        exportText(session.prompt, filename);
        break;
    }
  }, []);

  return { exportSession };
}
```

---

## 2. Template Library Design

### JSON Schema Structure

```typescript
interface PromptTemplate {
  id: string;
  name: string;
  category: 'presentation' | 'education' | 'business' | 'creative';
  description: string;
  tags: string[];
  variables: TemplateVariable[];
  template: string;
  createdAt: string;
  version: string;
}

interface TemplateVariable {
  key: string; // e.g., "{{topic}}"
  label: string; // Display name
  type: 'text' | 'select' | 'number';
  required: boolean;
  defaultValue?: string;
  options?: string[]; // For select type
}
```

### Template File Organization

```
src/data/templates/
├── index.ts              # Template registry
├── categories/
│   ├── presentation.json
│   ├── education.json
│   ├── business.json
│   └── creative.json
└── schema.ts             # TypeScript interfaces
```

### Loading & Caching Strategy

```typescript
// Lazy load templates by category
const templateCache = new Map<string, PromptTemplate[]>();

export async function loadTemplates(category: string): Promise<PromptTemplate[]> {
  if (templateCache.has(category)) {
    return templateCache.get(category)!;
  }

  const templates = await import(`./categories/${category}.json`);
  templateCache.set(category, templates.default);
  return templates.default;
}

// Zustand store integration
interface TemplateStore {
  templates: PromptTemplate[];
  selectedTemplate: PromptTemplate | null;
  loadCategory: (category: string) => Promise<void>;
  applyTemplate: (template: PromptTemplate, variables: Record<string, string>) => string;
}
```

---

## 3. i18n Expansion Best Practices

### Adding New Locales (VI, JA, KO)

```
public/locales/
├── en/translation.json   # Existing
├── zh/translation.json   # Existing
├── vi/translation.json   # Vietnamese
├── ja/translation.json   # Japanese
└── ko/translation.json   # Korean
```

### i18n Configuration Update

```typescript
// src/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

export const supportedLanguages = ['en', 'zh', 'vi', 'ja', 'ko'] as const;

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: { escapeValue: false },
  });
```

### Translation File Structure

```json
// vi/translation.json
{
  "app": {
    "title": "Nano Banana Slides Prompter",
    "generate": "Tạo Prompt",
    "export": "Xuất",
    "settings": "Cài đặt"
  },
  "templates": {
    "select": "Chọn mẫu",
    "categories": {
      "presentation": "Thuyết trình",
      "education": "Giáo dục"
    }
  }
}
```

### TypeScript Type Safety

```typescript
// Generate types from translation keys
import en from '../public/locales/en/translation.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof en;
    };
  }
}
```

### RTL Considerations

- Vietnamese, Japanese, Korean: LTR (no RTL handling needed)
- CJK fonts: Consider `font-family` fallbacks for proper rendering
- Text length variation: Japanese/Korean often shorter than English

---

## 4. Implementation Recommendations

| Feature          | Priority | Complexity | Notes                     |
| ---------------- | -------- | ---------- | ------------------------- |
| JSON Export      | High     | Low        | Use existing session data |
| Markdown Export  | High     | Low        | Format prompt output      |
| Text Export      | Medium   | Low        | Simple string export      |
| Template Schema  | High     | Medium     | Define before templates   |
| Template Loading | Medium   | Low        | Dynamic imports           |
| VI/JA/KO Locales | Medium   | Medium     | Need translation work     |

### Suggested File Structure

```
src/
├── lib/
│   └── export.ts           # Export utilities
├── hooks/
│   └── useExport.ts        # Export hook
├── data/
│   └── templates/          # Template library
└── i18n/
    └── config.ts           # Updated i18n config
```

---

## Unresolved Questions

1. **Template Source**: Should templates be bundled or fetched from server?
2. **User Templates**: Allow users to create/save custom templates?
3. **Translation Priority**: Which locale to translate first (VI vs JA vs KO)?
4. **Export Format Selection**: Single button with dropdown or separate buttons?

---

## Sources

- [Stack Overflow - Blob/createObjectURL](https://stackoverflow.com)
- [Medium - React Design Patterns 2025](https://medium.com)
- [UXPin - React Patterns](https://uxpin.com)
- [Dev.to - react-i18next Best Practices](https://dev.to)
- [Centus - i18n Workflow](https://centus.com)
