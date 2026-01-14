---
phase: 4
title: 'Education & Business Focus'
status: completed
priority: P2
effort: 4h
dependencies: [phase-01]
---

# Phase 4: Education & Business Focus (v2.0.x)

**Parent Plan:** [plan.md](./plan.md)
**Dependencies:** Phase 1 complete (template infrastructure)

## Overview

| Attribute             | Value                     |
| --------------------- | ------------------------- |
| Version Target        | v2.0.0                    |
| Priority              | P2 - Medium               |
| Effort                | 4h                        |
| Implementation Status | ✅ Completed (2026-01-13) |
| Review Status         | ✅ Passed (9.5/10)        |

Specialized features for education and small business users: Course Builder, Quiz Templates, Brand Kit.

## Key Insights

1. **Course Builder** - Extend template system with lesson structure
2. **Quiz Templates** - Special slide types for interactive content
3. **Brand Kit** - LocalStorage-based brand persistence

## Requirements

### Functional

- [ ] FR-30: Course Builder mode with lesson structure
- [ ] FR-31: Quiz/Assessment slide templates
- [ ] FR-32: Brand Kit (colors, fonts, logo storage)
- [ ] FR-33: Narration script generation (optional)

### Non-Functional

- [ ] NFR-13: Brand Kit loads < 100ms
- [ ] NFR-14: Course structure persists across sessions

## Architecture

```
src/
├── components/
│   ├── course-builder/
│   │   ├── CourseBuilder.tsx         # Main view
│   │   ├── LessonList.tsx            # Lesson navigation
│   │   └── LessonEditor.tsx          # Per-lesson settings
│   ├── quiz/
│   │   └── QuizTemplates.tsx         # Quiz slide options
│   └── brand-kit/
│       ├── BrandKitEditor.tsx        # Edit brand settings
│       └── BrandKitPreview.tsx       # Brand preview
├── stores/
│   └── brandKitStore.ts              # Brand persistence
└── data/
    └── templates/
        └── quiz.json                 # Quiz templates
```

## Related Code Files

| File                         | Purpose        | Action             |
| ---------------------------- | -------------- | ------------------ |
| `src/stores/sessionStore.ts` | Session state  | Reference pattern  |
| `src/data/templates/*.json`  | Template data  | Add quiz templates |
| `src/types/template.ts`      | Template types | Extend for courses |

## Implementation Steps

### 4.1 Quiz Templates (1h)

```
[ ] 4.1.1 Create quiz template data
    - Multiple choice layout
    - True/False layout
    - Fill-in-blank layout
    - Matching layout

[ ] 4.1.2 Add to template library
    - New "Quiz" category
    - i18n translations
```

### 4.2 Brand Kit (2h)

```
[ ] 4.2.1 Create brandKitStore
    - src/stores/brandKitStore.ts
    - primaryColor, secondaryColor
    - fontFamily, fontSize
    - logoUrl (base64 or URL)
    - Persist to localStorage

[ ] 4.2.2 Create BrandKitEditor
    - Color pickers
    - Font selector
    - Logo upload
    - Reset to defaults

[ ] 4.2.3 Integrate with prompt generation
    - Include brand info in prompts
    - Apply to PPTX/PDF exports
```

### 4.3 Course Builder Mode (1h)

```
[ ] 4.3.1 Define course structure
    - Course → Lessons → Slides
    - Lesson metadata (title, duration, objectives)

[ ] 4.3.2 Create basic UI
    - Course toggle in settings
    - Lesson sidebar
    - Per-lesson generation

[ ] 4.3.3 (Future) Full course builder
    - Marked as future enhancement
    - Document requirements for v2.1
```

## Todo List

- [x] 4.1 Quiz Templates (1h)
- [x] 4.2 Brand Kit (2h)
- [x] 4.3 Course Builder Mode (1h)

## Success Criteria

| Criteria                          | Validation                 |
| --------------------------------- | -------------------------- |
| Quiz templates generate correctly | Test all 4 types           |
| Brand Kit persists                | Reload page, verify values |
| Brand applies to exports          | Check PPTX/PDF output      |
| Course mode toggles               | UI changes appropriately   |

## Risk Assessment

| Risk                 | Mitigation                   |
| -------------------- | ---------------------------- |
| Feature creep        | Scope to MVP only            |
| Storage limits       | Compress logo, warn on limit |
| Complex course needs | Document as v2.1 enhancement |

## Security Considerations

- Validate uploaded logo (file type, size)
- Sanitize brand text inputs
- No sensitive data in brand kit

## Next Steps

After Phase 4 completion:

1. Update version to 2.0.0
2. Major version bump (breaking changes possible)
3. Evaluate Phase 5 priorities (Team, Analytics, LMS)
4. User feedback collection

## Future Enhancements (v2.x+)

| Feature               | Description                             | Priority |
| --------------------- | --------------------------------------- | -------- |
| Team Workspace        | Shared templates, collaborative editing | P3       |
| Analytics Dashboard   | Usage stats, popular templates          | P3       |
| LMS Integration       | Moodle, Canvas API                      | P3       |
| Voice-over Generation | TTS integration                         | P3       |
| Narration Script      | Speaking notes per slide                | P3       |
