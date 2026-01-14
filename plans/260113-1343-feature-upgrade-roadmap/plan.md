---
title: 'Feature Upgrade Roadmap v1.3.x - v2.x'
description: 'Full roadmap: Template Library, File Import/Export, Prompt Optimizer, Nano Banana API Integration'
status: completed
priority: P1
effort: 40h
branch: main
tags: [feature, roadmap, integration, export, template]
created: 2026-01-13
updated: 2026-01-13
---

# Feature Upgrade Roadmap

**Version:** 1.2.4 → 2.x | **Target:** Integration-focused expansion

## Overview

Comprehensive upgrade plan expanding Nano Banana Slides Prompter capabilities through:

- Enhanced input/output formats (PDF, DOCX, PPTX)
- Template library with 50+ pre-built configurations
- Prompt optimization via LLM self-refinement
- Batch processing for power users
- Future Nano Banana API direct integration

## Target Users

| Segment               | Needs                           |
| --------------------- | ------------------------------- |
| Individual/Freelancer | Quick exports, template variety |
| Education             | Course builder, quiz templates  |
| Small Business        | Brand kit, batch processing     |

## Phases Overview

| Phase | Name                 | Status       | Effort | Files                                                              |
| ----- | -------------------- | ------------ | ------ | ------------------------------------------------------------------ |
| 1     | Quick Wins           | ✅ Completed | 16h    | [phase-01-quick-wins.md](./phase-01-quick-wins.md)                 |
| 2     | Core Integrations    | ✅ Completed | 12h    | [phase-02-core-integrations.md](./phase-02-core-integrations.md)   |
| 3     | Nano Banana API      | ✅ Completed | 8h     | [phase-03-nano-banana-api.md](./phase-03-nano-banana-api.md)       |
| 4     | Education & Business | ✅ Completed | 4h     | [phase-04-education-business.md](./phase-04-education-business.md) |

## Architecture Impact

```
Frontend (React/Vite)
├── Template Library (JSON-based)
├── File Importers (PDF, DOCX) → API calls
├── Export Engines (PPTX, PDF) → Client-side
└── Batch Processing UI

Backend (Hono/Bun)
├── /api/import/pdf, /api/import/docx → New
├── /api/optimize-prompt → New
├── /api/batch/* → New
└── /api/nano-banana/* → Phase 3
```

## Key Dependencies

| Dependency            | Version | Purpose              | Bundle Impact |
| --------------------- | ------- | -------------------- | ------------- |
| `pdf-parse`           | latest  | PDF import (server)  | Server only   |
| `mammoth`             | latest  | DOCX import (server) | Server only   |
| `pptxgenjs`           | latest  | PPTX export (client) | ~350 KB       |
| `@react-pdf/renderer` | latest  | PDF export (client)  | ~150 KB       |

**Total Frontend Bundle Impact:** ~500 KB (within limit)

## Research & References

- [Brainstorm Report](../reports/brainstorm-260113-1343-feature-upgrade-roadmap.md)
- [File Import/Export Research](./research/researcher-01-file-import-export.md)
- [Prompt Optimization Research](./research/researcher-02-prompt-optimization.md)
- [Codebase Summary](../../docs/codebase-summary.md)
- [System Architecture](../../docs/system-architecture.md)

## Success Metrics

| Metric                         | Target           | Phase   |
| ------------------------------ | ---------------- | ------- |
| Template usage rate            | >40% sessions    | Phase 1 |
| Export adoption                | >30% users       | Phase 1 |
| Prompt optimization acceptance | >60% suggestions | Phase 2 |
| Batch processing usage         | >15% power users | Phase 2 |

## Risk Assessment

| Risk                 | Probability | Impact | Mitigation                 |
| -------------------- | ----------- | ------ | -------------------------- |
| Bundle size increase | High        | Medium | Tree-shaking, lazy loading |
| API breaking changes | Medium      | High   | Abstract API layer         |
| Scope creep          | High        | Medium | Strict phase boundaries    |

## Validation Summary

**Validated:** 2026-01-13
**Questions asked:** 6

### Confirmed Decisions

| Decision         | User Choice                         | Impact                                         |
| ---------------- | ----------------------------------- | ---------------------------------------------- |
| Template storage | JSON trong source                   | No change needed                               |
| PDF export style | Styled layout (@react-pdf/renderer) | Update Phase 1: use react-pdf instead of jspdf |
| Batch limit      | 10 topics max                       | Add validation in BatchProcessor               |
| Prompt Optimizer | Opt-in (click to activate)          | Add "Optimize" button per slide                |
| Phase 3 timing   | Start immediately                   | Research API in parallel with Phase 1-2        |
| i18n scope       | 3 languages (EN/VI/ZH)              | No additional translations                     |

### Action Items

- [ ] **Phase 1**: Replace `jspdf` with `@react-pdf/renderer` for styled PDF export
- [ ] **Phase 1**: Add 10-topic limit validation in batch processing
- [ ] **Phase 3**: Begin API research in parallel, don't wait for Phase 2
- [ ] Update bundle size estimate: ~396KB → ~472KB (react-pdf larger)

---

## Next Steps

1. ✅ Research complete
2. ✅ Validation complete
3. ✅ Phase 1: Quick Wins (Template Library, Import/Export)
4. ✅ Phase 2: Core Integrations (Prompt Optimizer, Design Tools)
5. ✅ Phase 3: Nano Banana API (Gemini Image Generation)
6. ✅ Phase 4: Education & Business (Quiz, Brand Kit, Course Builder)

**Roadmap Complete** - All 4 phases delivered. Ready for v2.0.0 release.
