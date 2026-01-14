---
title: 'System Upgrade v2'
description: 'Add testing, export, templates, and i18n expansion for v1.2.0'
status: completed
priority: P2
effort: 12h
branch: main
tags: [testing, export, i18n, infrastructure, templates]
created: 2026-01-13
---

# System Upgrade v2 - Implementation Plan

## Overview

Nang cap he thong tu v1.1.0 len v1.2.0 voi cac tinh nang moi: export, testing infrastructure, template library, va mo rong i18n.

## Phase Summary

| Phase | Name                                   | Status       | Effort | Description                         |
| ----- | -------------------------------------- | ------------ | ------ | ----------------------------------- |
| 1     | [Foundation](./phase-01-foundation.md) | ✅ completed | 3h     | Export, Prompt Preview, Lint/Format |
| 2     | [Testing](./phase-02-testing.md)       | ✅ completed | 4h     | Vitest, Core Tests, CI Pipeline     |
| 3     | [Features](./phase-03-features.md)     | ✅ completed | 4h     | Template Library, Vietnamese i18n   |
| 4     | [Polish](./phase-04-polish.md)         | ⏭️ skipped   | 1h     | Delta Sync, JA/KO (optional)        |

## Dependencies

```
Phase 1 (Foundation) ─┬─> Phase 2 (Testing)
                      └─> Phase 3 (Features)
                                 │
                                 v
                          Phase 4 (Polish)
```

## Key Deliverables

1. **Export System** - JSON/MD/TXT client-side export
2. **Prompt Preview** - Show generated prompt before LLM call
3. **Lint/Format** - Prettier + Husky + lint-staged
4. **Testing** - Vitest + 60% coverage for core modules
5. **CI Pipeline** - GitHub Actions workflow
6. **Template Library** - 10-15 predefined templates
7. **Vietnamese i18n** - Full vi.json translation

## Success Metrics

| Metric               | Target            |
| -------------------- | ----------------- |
| Test coverage (core) | >80%              |
| CI pass rate         | >95%              |
| i18n completeness    | 100% VI strings   |
| Export formats       | 3 (JSON, MD, TXT) |
| Template count       | 20+ templates     |

## Related Research

- [Testing & CI/CD](./research/researcher-01-testing-ci-cd.md)
- [Export & Templates](./research/researcher-02-export-templates.md)

## Quick Start

```bash
# Phase 1: Start with export system
# See phase-01-foundation.md for details
```

---

## Validation Summary

**Validated:** 2026-01-13
**Questions asked:** 8

### Confirmed Decisions

| Decision              | User Choice                              |
| --------------------- | ---------------------------------------- |
| Export UI placement   | Session Panel dropdown                   |
| Prompt Preview format | Both raw + formatted (toggle)            |
| Test coverage target  | **80%** (increased from 60%)             |
| MSW for API mocking   | Skip for now                             |
| Template source       | Bundled JSON                             |
| Template count        | **20+ templates** (increased from 10-15) |
| i18n priority         | Vietnamese first                         |
| Phase execution order | Testing → Features (sequential)          |

### Action Items (Plan Changes Needed)

- [ ] Update Phase 2: coverage target from 60% → 80%
- [ ] Update Phase 1: Prompt Preview needs raw/formatted toggle
- [ ] Update Phase 3: template count from 10-15 → 20+

---

## Unresolved Questions

1. Translation resources for VI/JA/KO - native speakers available?
2. ~~Template content - which presentation types to include?~~ (Resolved: 20+ diverse templates)
3. ~~Coverage threshold - 60% sufficient?~~ (Resolved: 80% target)
