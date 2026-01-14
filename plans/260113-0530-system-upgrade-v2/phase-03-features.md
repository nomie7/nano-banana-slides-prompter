# Phase 3: Features (Expansion)

## Context

- [Brainstorm Report](../reports/brainstorm-260113-0520-system-upgrade-analysis.md)
- [Templates Research](./research/researcher-02-export-templates.md)

---

## Overview

| Attribute   | Value                             |
| ----------- | --------------------------------- |
| Priority    | P2 - Medium                       |
| Status      | pending                           |
| Effort      | 4h                                |
| Description | Template library, Vietnamese i18n |

---

## Requirements

### Functional

1. **Template Library**
   - 10-15 predefined presentation templates
   - Categories: presentation, education, business, creative
   - Load on demand from JSON files
   - Apply template to current session

2. **Vietnamese i18n**
   - Full translation of all UI strings
   - Add to language picker
   - Update output language options

### Non-Functional

- Templates bundled (no server fetch)
- Lazy load by category
- 100% translation coverage for VI

---

## Related Code Files

### Files to Create

```
src/data/templates/
├── index.ts                   # Template registry
├── schema.ts                  # TypeScript interfaces
├── categories/
│   ├── presentation.json      # General presentations
│   ├── education.json         # Educational content
│   ├── business.json          # Business/corporate
│   └── creative.json          # Creative/artistic
public/locales/vi/translation.json   # Vietnamese translations
```

### Files to Modify

```
src/components/TemplateSelector.tsx   # New component
src/components/SessionPanel.tsx       # Add template selector
src/stores/templateStore.ts           # New store (optional)
src/i18n/config.ts                    # Add 'vi' to supported
src/components/LanguageSwitcher.tsx   # Add Vietnamese option
server/src/routes/generate.ts         # Add 'vi' output language
```

---

## Implementation Steps

### 1. Template Schema (0.5h)

Create `src/data/templates/schema.ts`:

```typescript
export interface PromptTemplate {
  id: string;
  name: string;
  nameKey: string; // i18n key
  category: 'presentation' | 'education' | 'business' | 'creative';
  description: string;
  descriptionKey: string; // i18n key
  tags: string[];
  config: Partial<SessionConfig>; // Pre-filled config values
  createdAt: string;
  version: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  nameKey: string;
  icon: string;
  templates: PromptTemplate[];
}
```

### 2. Template Content (1.5h)

Create template JSON files with 10-15 templates:

**presentation.json** (4 templates):

- Startup Pitch Deck
- Product Launch
- Quarterly Review
- Conference Talk

**education.json** (4 templates):

- Lecture Slides
- Tutorial/How-To
- Research Presentation
- Workshop/Training

**business.json** (4 templates):

- Sales Proposal
- Company Overview
- Project Status Update
- Strategy Planning

**creative.json** (3 templates):

- Portfolio Showcase
- Event/Wedding
- Storytelling

Example template structure:

```json
{
  "id": "startup-pitch",
  "name": "Startup Pitch Deck",
  "nameKey": "templates.startup_pitch",
  "category": "presentation",
  "description": "Investor-ready pitch deck with problem, solution, market, traction",
  "descriptionKey": "templates.startup_pitch_desc",
  "tags": ["startup", "pitch", "investor"],
  "config": {
    "style": "professional",
    "slideCount": 12,
    "characterEnabled": false,
    "slideTypes": ["opening", "problem", "solution", "market", "traction", "closing"]
  },
  "version": "1.0.0"
}
```

### 3. Template Loader (0.5h)

Create `src/data/templates/index.ts`:

```typescript
import type { PromptTemplate, TemplateCategory } from './schema';

const templateCache = new Map<string, PromptTemplate[]>();

export async function loadTemplateCategory(category: string): Promise<PromptTemplate[]> {
  if (templateCache.has(category)) {
    return templateCache.get(category)!;
  }

  const module = await import(`./categories/${category}.json`);
  templateCache.set(category, module.default);
  return module.default;
}

export async function getAllTemplates(): Promise<PromptTemplate[]> {
  const categories = ['presentation', 'education', 'business', 'creative'];
  const all = await Promise.all(categories.map(loadTemplateCategory));
  return all.flat();
}

export function applyTemplate(template: PromptTemplate): Partial<SessionConfig> {
  return { ...template.config };
}
```

### 4. Template UI Component (0.5h)

Create `src/components/TemplateSelector.tsx`:

- Dropdown or modal with category tabs
- Search/filter by name or tags
- Preview template config before applying
- "Apply" button updates current session

### 5. Vietnamese i18n (1h)

1. Create `public/locales/vi/translation.json`:
   - Copy structure from en/translation.json
   - Translate all strings to Vietnamese
   - Key sections: app, settings, templates, export, errors

2. Update `src/i18n/config.ts`:

   ```typescript
   export const supportedLanguages = ['en', 'zh', 'vi'] as const;
   ```

3. Update `LanguageSwitcher.tsx`:

   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'zh', name: '中文', flag: '🇨🇳' },
     { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
   ];
   ```

4. Update backend output languages in `server/src/routes/generate.ts`:
   - Add 'vi' to outputLanguage options
   - Update prompt generation to handle Vietnamese output

---

## Todo List

- [ ] Create template schema (schema.ts)
- [ ] Create presentation.json (4 templates)
- [ ] Create education.json (4 templates)
- [ ] Create business.json (4 templates)
- [ ] Create creative.json (3 templates)
- [ ] Create template loader (index.ts)
- [ ] Create TemplateSelector component
- [ ] Integrate into SessionPanel
- [ ] Add template i18n keys to en.json, zh.json
- [ ] Create vi/translation.json (full translation)
- [ ] Update i18n config with 'vi'
- [ ] Update LanguageSwitcher
- [ ] Add 'vi' to backend output languages
- [ ] Test template loading and applying
- [ ] Test Vietnamese UI and output

---

## Success Criteria

1. 10-15 templates available across 4 categories
2. Can apply template to session with one click
3. Vietnamese UI fully translated (100% strings)
4. Can generate prompts with Vietnamese output
5. Language persists across sessions

---

## Risk Assessment

| Risk                     | Likelihood | Impact | Mitigation                       |
| ------------------------ | ---------- | ------ | -------------------------------- |
| Translation quality      | Medium     | Medium | Review by native speaker         |
| Template config mismatch | Low        | Low    | Type-check against SessionConfig |
| Large bundle size        | Low        | Low    | Lazy load by category            |
| Missing i18n keys        | Medium     | Low    | TypeScript type checking         |

---

## Unresolved Questions

1. Template source - bundle vs server fetch?
2. User-created templates - allow in future?
3. Translation review - who validates VI quality?
4. Template versioning - how to handle updates?
