---
phase: 1
title: 'Quick Wins'
status: completed
priority: P0
effort: 16h
dependencies: []
completed_at: 2026-01-13
---

# Phase 1: Quick Wins (v1.3.x)

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** None (standalone)

## Overview

| Attribute             | Value        |
| --------------------- | ------------ |
| Version Target        | v1.3.0       |
| Priority              | P0 - Highest |
| Effort                | 16h          |
| Implementation Status | ✅ Completed |
| Review Status         | ✅ Approved  |

High-value, low-complexity features: Template Library, PDF/DOCX Import, PPTX/PDF Export, Batch Processing.

## Key Insights

1. **Template Library** - Already existed (TemplateSelector.tsx)
2. **File Import** - Server-side processing with pdf-parse & mammoth
3. **Export** - Client-side generation with pptxgenjs & @react-pdf/renderer
4. **Batch** - Reused AbortController pattern from `useStreamingGeneration.ts`

## Requirements

### Functional

- [x] FR-16: Load templates by category (Education, Business, Marketing, Tech, Creative)
- [x] FR-17: Import PDF files, extract text content
- [x] FR-18: Import DOCX files, extract text content
- [x] FR-19: Export prompts to PPTX format
- [x] FR-20: Export prompts to PDF format
- [x] FR-21: Batch generate prompts for multiple topics

### Non-Functional

- [x] NFR-06: Import response time < 5s for files < 10MB
- [x] NFR-07: Export generation time < 3s
- [x] NFR-08: Bundle size increase < 500KB (actual: ~500KB for pptxgenjs + react-pdf)

## Architecture

```
src/
├── components/
│   ├── template-library/
│   │   ├── TemplateLibrary.tsx      # Main component
│   │   ├── TemplateCard.tsx         # Individual template
│   │   └── TemplateCategoryTabs.tsx # Category navigation
│   ├── import/
│   │   └── FileImporter.tsx         # PDF/DOCX upload
│   ├── export/
│   │   ├── ExportDropdown.tsx       # Existing, extend
│   │   ├── PptxExporter.tsx         # New
│   │   └── PdfExporter.tsx          # New
│   └── batch/
│       ├── BatchInput.tsx           # Multi-topic input
│       └── BatchProgress.tsx        # Progress tracker

server/src/
├── routes/
│   └── import.ts                    # New: /api/import/*
└── services/
    └── fileParser.ts                # PDF/DOCX parsing
```

## Related Code Files

| File                                           | Purpose         | Action               |
| ---------------------------------------------- | --------------- | -------------------- |
| `src/components/slide-prompt/ContentInput.tsx` | Content input   | Extend with import   |
| `src/components/ui/dropdown-menu.tsx`          | Dropdown UI     | Reuse                |
| `src/lib/api.ts`                               | API client      | Add import endpoints |
| `server/src/index.ts`                          | Server entry    | Mount new routes     |
| `src/hooks/useStreamingGeneration.ts`          | AbortController | Reference for batch  |

## Implementation Steps

### 1.1 Template Library (4h)

```
[ ] 1.1.1 Create template JSON files
    - src/data/templates/education.json
    - src/data/templates/business.json
    - src/data/templates/marketing.json
    - src/data/templates/tech.json
    - src/data/templates/creative.json

[ ] 1.1.2 Create template types
    - src/types/template.ts
    - PromptTemplate interface
    - TemplateCategory enum

[ ] 1.1.3 Create TemplateLibrary component
    - Category tabs (Tabs from shadcn/ui)
    - Template cards grid
    - Apply template → populate form

[ ] 1.1.4 Integrate into Index page
    - Add TemplateLibrary section
    - i18n translations (EN/VI/ZH)
```

### 1.2 PDF/DOCX Import (4h)

```
[ ] 1.2.1 Install server dependencies
    - bun add pdf-parse mammoth

[ ] 1.2.2 Create import routes
    - server/src/routes/import.ts
    - POST /api/import/pdf
    - POST /api/import/docx

[ ] 1.2.3 Create fileParser service
    - server/src/services/fileParser.ts
    - parsePdf(buffer) → text
    - parseDocx(buffer) → text

[ ] 1.2.4 Create FileImporter component
    - src/components/import/FileImporter.tsx
    - File input (accept .pdf,.docx)
    - Upload progress
    - Extracted text preview

[ ] 1.2.5 Integrate into ContentInput
    - Add "Import File" button/tab
    - Populate text field with extracted content
```

### 1.3 PPTX/PDF Export (4h)

```
[ ] 1.3.1 Install client dependencies
    - npm install pptxgenjs jspdf

[ ] 1.3.2 Create export utilities
    - src/lib/exporters/pptxExporter.ts
    - src/lib/exporters/pdfExporter.ts

[ ] 1.3.3 Extend ExportDropdown
    - Add "PowerPoint (.pptx)" option
    - Add "PDF (.pdf)" option

[ ] 1.3.4 Implement PptxExporter
    - Create slides from ParsedSlide[]
    - Title + content layout
    - Download trigger

[ ] 1.3.5 Implement PdfExporter
    - Format prompts as document
    - Slide number headers
    - Download trigger
```

### 1.4 Batch Processing (4h)

```
[ ] 1.4.1 Create batch types
    - src/types/batch.ts
    - BatchJob, BatchState interfaces

[ ] 1.4.2 Create BatchProcessor class
    - src/lib/batchProcessor.ts
    - Queue management
    - Progress callbacks
    - Cancel support

[ ] 1.4.3 Create useBatchGeneration hook
    - src/hooks/useBatchGeneration.ts
    - Wrap BatchProcessor
    - React state integration

[ ] 1.4.4 Create batch UI components
    - BatchInput.tsx (textarea for topics, one per line)
    - BatchProgress.tsx (progress bar, job list)

[ ] 1.4.5 Integrate into Index page
    - Batch mode toggle
    - Show batch UI when enabled
```

## Todo List

- [x] 1.1 Template Library (4h) - Already existed
- [x] 1.2 PDF/DOCX Import (4h)
- [x] 1.3 PPTX/PDF Export (4h)
- [x] 1.4 Batch Processing (4h)

## Success Criteria

| Criteria                        | Validation                   |
| ------------------------------- | ---------------------------- |
| Templates load correctly        | Manual test all 5 categories |
| PDF import extracts text        | Test with 3+ sample PDFs     |
| DOCX import extracts text       | Test with 3+ sample DOCXs    |
| PPTX export opens in PowerPoint | Test on Windows/Mac          |
| PDF export renders correctly    | Test in multiple viewers     |
| Batch processes 10 topics       | Test with timer              |

## Risk Assessment

| Risk                                 | Mitigation                         |
| ------------------------------------ | ---------------------------------- |
| PDF parsing fails on complex layouts | Fallback to raw text, show warning |
| PPTX styling inconsistent            | Use simple layouts initially       |
| Bundle size exceeds limit            | Lazy load export libs              |

## Security Considerations

- File upload size limit (10MB max)
- File type validation (check magic bytes, not just extension)
- Sanitize extracted text before display
- No server-side file storage (process in memory)

## Next Steps

After Phase 1 completion:

1. Update version to 1.3.0
2. Update README with new features
3. Begin Phase 2: Core Integrations
