---
phase: 2
title: 'Core Integrations'
status: completed
priority: P1
effort: 12h
dependencies: [phase-01]
completed: 2026-01-13
---

# Phase 2: Core Integrations (v1.4.x)

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** Phase 1 complete

## Overview

| Attribute             | Value                     |
| --------------------- | ------------------------- |
| Version Target        | v1.4.0                    |
| Priority              | P1 - High                 |
| Effort                | 12h                       |
| Implementation Status | ✅ Completed (2026-01-13) |
| Review Status         | 🔲 Pending                |

Core differentiating features: Prompt Optimizer, PDF Preview, Design Tools Export.

## Key Insights

1. **Self-Refine pattern** - 2 iterations optimal (quality vs latency tradeoff)
2. **PDF Preview** - Use `@react-pdf/renderer` for styled output
3. **Design exports** - JSON schemas for Canva/Figma compatibility

## Requirements

### Functional

- [ ] FR-22: Optimize prompts via LLM self-critique
- [ ] FR-23: Preview PDF layout before download
- [ ] FR-24: Export to Canva-compatible JSON
- [ ] FR-25: Export to Figma-compatible JSON

### Non-Functional

- [ ] NFR-09: Optimization adds < 5s latency
- [ ] NFR-10: PDF preview renders < 2s

## Architecture

```
src/
├── components/
│   ├── optimizer/
│   │   ├── PromptOptimizer.tsx       # Optimize button + results
│   │   └── OptimizationDiff.tsx      # Before/after comparison
│   ├── preview/
│   │   └── PdfPreview.tsx            # React-PDF viewer
│   └── export/
│       ├── CanvaExporter.tsx         # Canva JSON
│       └── FigmaExporter.tsx         # Figma JSON

server/src/
├── routes/
│   └── optimize.ts                   # /api/optimize-prompt
└── services/
    └── promptOptimizer.ts            # Self-refine logic
```

## Related Code Files

| File                                           | Purpose        | Action                |
| ---------------------------------------------- | -------------- | --------------------- |
| `server/src/services/llm.ts`                   | LLM calls      | Reference pattern     |
| `server/src/prompts/system.ts`                 | System prompts | Add optimizer prompts |
| `src/components/slide-prompt/PromptOutput.tsx` | Output display | Add optimize button   |

## Implementation Steps

### 2.1 Prompt Optimizer (5h)

```
[ ] 2.1.1 Create optimizer system prompts
    - CRITIC_PROMPT: Identify weaknesses
    - REFINER_PROMPT: Apply improvements

[ ] 2.1.2 Create promptOptimizer service
    - server/src/services/promptOptimizer.ts
    - optimizePrompt(prompt, iterations)
    - Return original, refined, improvements

[ ] 2.1.3 Create optimize route
    - POST /api/optimize-prompt
    - Accept: { prompt: string, iterations?: number }
    - Return: OptimizationResult

[ ] 2.1.4 Create usePromptOptimizer hook
    - src/hooks/usePromptOptimizer.ts
    - Loading state, error handling

[ ] 2.1.5 Create optimizer UI
    - "Optimize" button per slide
    - OptimizationDiff component
    - Accept/reject controls
```

### 2.2 PDF Preview (4h)

```
[ ] 2.2.1 Install @react-pdf/renderer
    - npm install @react-pdf/renderer

[ ] 2.2.2 Create PDF document component
    - src/lib/exporters/PdfDocument.tsx
    - Styled layout with react-pdf

[ ] 2.2.3 Create PdfPreview component
    - Modal with PDF viewer
    - Page navigation
    - Download button

[ ] 2.2.4 Integrate into export flow
    - "Preview PDF" option
    - Open preview modal
```

### 2.3 Design Tools Export (3h)

```
[ ] 2.3.1 Research Canva/Figma JSON formats
    - Document expected schemas

[ ] 2.3.2 Create export schemas
    - src/lib/exporters/canvaSchema.ts
    - src/lib/exporters/figmaSchema.ts

[ ] 2.3.3 Create converters
    - slidesToCanvaJson(slides)
    - slidesToFigmaJson(slides)

[ ] 2.3.4 Add to ExportDropdown
    - "Canva JSON" option
    - "Figma JSON" option
```

## Todo List

- [ ] 2.1 Prompt Optimizer (5h)
- [ ] 2.2 PDF Preview (4h)
- [ ] 2.3 Design Tools Export (3h)

## Success Criteria

| Criteria                       | Validation                |
| ------------------------------ | ------------------------- |
| Optimization improves prompts  | A/B test with users       |
| PDF preview renders all slides | Test multi-page documents |
| Canva import works             | Test in Canva editor      |
| Figma import works             | Test in Figma editor      |

## Risk Assessment

| Risk                       | Mitigation               |
| -------------------------- | ------------------------ |
| LLM costs increase         | Make optimization opt-in |
| react-pdf bundle size      | Lazy load component      |
| Design tool format changes | Abstract export layer    |

## Security Considerations

- Rate limit optimization endpoint
- No PII in optimization logs
- Sanitize LLM responses

## Next Steps

After Phase 2 completion:

1. Update version to 1.4.0
2. Add usage analytics for optimization
3. Begin Phase 3: Nano Banana API
