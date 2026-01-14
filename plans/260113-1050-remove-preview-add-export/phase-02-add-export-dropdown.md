# Phase 2: Add Export Dropdown to PromptOutput

## Context Links

- **Parent Plan:** [plan.md](./plan.md)
- **Phase 1:** [phase-01-remove-prompt-preview.md](./phase-01-remove-prompt-preview.md)
- **Docs:** [Code Standards](../../docs/code-standards.md)

## Overview

| Field                 | Value      |
| --------------------- | ---------- |
| Date                  | 2026-01-13 |
| Priority              | P2         |
| Implementation Status | Pending    |
| Review Status         | Pending    |
| Effort                | 30m        |

**Description:** Add export dropdown button next to "Copy All" in PromptOutput component.

## Key Insights

- Export utilities already exist in `src/lib/export.ts`
- `useExport` hook already implemented in `src/hooks/useExport.ts`
- i18n keys for export already exist in all 3 locales
- shadcn/ui DropdownMenu component available

## Requirements

1. Import DropdownMenu components
2. Import useExport hook
3. Add export dropdown button next to Copy All
4. Support 3 formats: Markdown, Text, JSON
5. Use existing i18n keys

## Architecture

```
PromptOutput Header
├── [Copy All] button (existing)
└── [Export ▼] dropdown (new)
    ├── Markdown (.md)
    ├── Plain Text (.txt)
    └── JSON (.json)
```

## Related Code Files

| File                                           | Action | Purpose          |
| ---------------------------------------------- | ------ | ---------------- |
| `src/components/slide-prompt/PromptOutput.tsx` | EDIT   | Add dropdown     |
| `src/hooks/useExport.ts`                       | READ   | Hook to use      |
| `src/lib/export.ts`                            | READ   | Export functions |
| `src/i18n/locales/en.json`                     | READ   | i18n keys        |

## Implementation Steps

### Step 1: Add Imports to PromptOutput.tsx

```typescript
// Add to existing lucide-react imports
import { Download } from 'lucide-react';

// Add new imports
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useExport } from '@/hooks/useExport';
```

### Step 2: Initialize useExport Hook

Inside component, add after other hooks:

```typescript
const { exportCurrentSession } = useExport();
```

### Step 3: Add Export Dropdown JSX

After the Copy All button (around line 182), add:

```tsx
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button
      variant="outline"
      size="sm"
      className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
    >
      <Download className="h-4 w-4 mr-2" />
      {t('buttons.export')}
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuItem onClick={() => exportCurrentSession('markdown')}>
      {t('export.asMarkdown')}
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => exportCurrentSession('text')}>
      {t('export.asText')}
    </DropdownMenuItem>
    <DropdownMenuItem onClick={() => exportCurrentSession('json')}>
      {t('export.asJSON')}
    </DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Step 4: Add Missing i18n Key (REQUIRED)

`buttons.export` does NOT exist. Add to all 3 locales after `"collapseAll"`:

**en.json** (line 25):

```json
"collapseAll": "Collapse All",
"export": "Export"
```

**vi.json** (line 25):

```json
"collapseAll": "Thu gọn tất cả",
"export": "Xuất"
```

**zh.json** (line 25):

```json
"collapseAll": "全部折叠",
"export": "导出"
```

## Todo List

- [ ] Add imports (lucide Download, DropdownMenu, useExport)
- [ ] Initialize useExport hook
- [ ] Add DropdownMenu JSX after Copy All button
- [ ] Check/add `buttons.export` i18n key
- [ ] Test all 3 export formats

## Success Criteria

- [ ] Export dropdown visible next to Copy All
- [ ] Markdown export downloads .md file
- [ ] Text export downloads .txt file
- [ ] JSON export downloads .json file
- [ ] Toast notifications on success/failure
- [ ] Build passes
- [ ] All tests pass

## Risk Assessment

| Risk                    | Likelihood | Impact | Mitigation                        |
| ----------------------- | ---------- | ------ | --------------------------------- |
| Missing i18n key        | Low        | Low    | Check all 3 locales               |
| Export fails silently   | Low        | Medium | useExport hook has toast handling |
| Button styling mismatch | Low        | Low    | Copy existing button styles       |

## Security Considerations

- Export uses client-side Blob download (no server involvement)
- No sensitive data exposure risk

## Next Steps

After completing both phases:

1. Run `npm run build` to verify
2. Run `npm test` to ensure no regressions
3. Manual testing of export functionality
