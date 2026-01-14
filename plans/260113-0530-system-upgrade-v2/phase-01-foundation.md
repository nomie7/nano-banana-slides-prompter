# Phase 1: Foundation (Quick Wins)

## Context

- [Brainstorm Report](../reports/brainstorm-260113-0520-system-upgrade-analysis.md)
- [Export Research](./research/researcher-02-export-templates.md)

---

## Overview

| Attribute   | Value                                            |
| ----------- | ------------------------------------------------ |
| Priority    | P1 - High                                        |
| Status      | pending                                          |
| Effort      | 3h                                               |
| Description | Export system, prompt preview, lint/format setup |

---

## Requirements

### Functional

1. **Export System**
   - Export session/prompt as JSON (formatted, 2-space indent)
   - Export as Markdown (structured with headers)
   - Export as Plain Text (prompt only)
   - Download via browser (no server changes)

2. **Prompt Preview**
   - Show generated system prompt before LLM call
   - Collapsible panel in UI
   - Toggle visibility in settings

3. **Lint/Format**
   - Prettier for consistent formatting
   - Husky pre-commit hooks
   - lint-staged for changed files only

### Non-Functional

- Zero backend changes for export
- No new runtime dependencies (dev deps only for lint)
- Works offline (client-side export)

---

## Related Code Files

### Files to Create

```
src/lib/export.ts              # Export utilities
src/hooks/useExport.ts         # React hook for export
src/components/PromptPreview.tsx  # Preview component
.prettierrc                    # Prettier config
.husky/pre-commit              # Git hook
```

### Files to Modify

```
src/components/SessionPanel.tsx   # Add export buttons
src/components/PromptOutput.tsx   # Add preview toggle
src/stores/settingsStore.ts       # Add showPromptPreview setting
package.json                      # Add scripts, lint-staged config
eslint.config.js                  # Add prettier integration
```

---

## Implementation Steps

### 1. Export System (1.5h)

1. Create `src/lib/export.ts`:

   ```typescript
   export function downloadFile(content: string, filename: string, mimeType: string) {
     const blob = new Blob([content], { type: mimeType });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = filename;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
   }

   export const exportJSON = (data: object, filename: string) => {
     downloadFile(JSON.stringify(data, null, 2), `${filename}.json`, 'application/json');
   };

   export const exportMarkdown = (content: string, filename: string) => {
     downloadFile(content, `${filename}.md`, 'text/markdown');
   };

   export const exportText = (content: string, filename: string) => {
     downloadFile(content, `${filename}.txt`, 'text/plain');
   };
   ```

2. Create `src/hooks/useExport.ts` with format conversion logic

3. Add export dropdown to `SessionPanel.tsx`:
   - Button with dropdown menu
   - Options: JSON, Markdown, Text
   - Use session name + date for filename

4. Add i18n keys for export labels

### 2. Prompt Preview (0.5h)

1. Add `showPromptPreview` to settings store

2. Create `PromptPreview.tsx`:
   - Collapsible card component
   - Syntax highlighting (optional)
   - Copy button

3. Integrate into prompt output area

4. Add i18n keys

### 3. Lint/Format Setup (1h)

1. Install dev dependencies:

   ```bash
   bun add -D prettier eslint-config-prettier husky lint-staged
   ```

2. Create `.prettierrc`:

   ```json
   {
     "semi": true,
     "singleQuote": true,
     "tabWidth": 2,
     "trailingComma": "es5"
   }
   ```

3. Update `eslint.config.js` - add prettier as last config

4. Initialize Husky:

   ```bash
   bunx husky init
   ```

5. Configure `.husky/pre-commit`:

   ```bash
   bunx lint-staged
   ```

6. Add to `package.json`:
   ```json
   {
     "lint-staged": {
       "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.{json,md,css}": ["prettier --write"]
     },
     "scripts": {
       "format": "prettier --write .",
       "format:check": "prettier --check ."
     }
   }
   ```

---

## Todo List

- [ ] Create `src/lib/export.ts` with downloadFile, exportJSON, exportMarkdown, exportText
- [ ] Create `src/hooks/useExport.ts` hook
- [ ] Add export dropdown to SessionPanel
- [ ] Add export i18n keys (en.json, zh.json)
- [ ] Add showPromptPreview to settingsStore
- [ ] Create PromptPreview component
- [ ] Integrate preview into PromptOutput
- [ ] Install prettier, husky, lint-staged
- [ ] Create .prettierrc config
- [ ] Update eslint.config.js with prettier
- [ ] Initialize husky and pre-commit hook
- [ ] Add lint-staged config to package.json
- [ ] Run format on existing codebase
- [ ] Test export functionality manually
- [ ] Test pre-commit hook

---

## Success Criteria

1. Can export session as JSON, MD, TXT from UI
2. Prompt preview toggle works in settings
3. Pre-commit hook runs lint-staged on commit
4. `npm run format` formats entire codebase
5. No lint errors on CI

---

## Risk Assessment

| Risk                           | Likelihood | Impact | Mitigation                                  |
| ------------------------------ | ---------- | ------ | ------------------------------------------- |
| Prettier conflicts with ESLint | Low        | Low    | eslint-config-prettier disables conflicts   |
| Husky not working on Windows   | Medium     | Low    | Test on Windows, use cross-platform scripts |
| Large format diff              | Low        | Low    | Single commit for initial format            |

---

## Unresolved Questions

1. Export button placement - session panel or toolbar?
2. Prompt preview - show raw or formatted?
