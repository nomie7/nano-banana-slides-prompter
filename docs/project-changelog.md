# Project Changelog

All notable changes to Nano Banana Slides Prompter are documented here.

---

## [2.0.4] - 2026-01-14

### Added - Inline Edit for Slide Prompts

- Inline editing for slide prompts before image generation
- Users can modify individual slide prompts directly in PromptOutput
- Desktop version synced to 2.0.4

---

## [2.0.3] - 2026-01-14

### Added - Custom Gemini API Base URL

- Custom API base URL configuration for Gemini Image Generation
- New `GEMINI_API_BASE` environment variable support
- Flexible Gemini endpoint configuration in SettingsDialog

---

## [2.0.2] - 2026-01-14

### Fixed - Electron PDF Compatibility

- DOMMatrix polyfill for pdfjs-dist compatibility in Electron
- Resolved PDF rendering issues in desktop application

---

## [2.0.1] - 2026-01-13

### Fixed

- Minor bug fixes and stability improvements
- Performance optimizations for streaming generation

---

## [2.0.0] - 2026-01-13

### Added - Phase 4: Education & Business Focus

**Quiz Templates**

- Multiple Choice Quiz template with interactive options
- True/False Quiz template for simple assessments
- Fill-in-the-Blank template for vocabulary/learning
- Matching Quiz template for pairing exercises
- New template category file: `src/data/templates/categories/quiz.json`

**Brand Kit**

- Brand Kit Editor component with collapsible UI
- Primary and secondary color configuration with color picker
- Font family selection (10 professional fonts)
- Font size options (small, medium, large)
- Logo upload with file validation (max 500KB, image types)
- Company name input for branding
- localStorage persistence via Zustand persist middleware
- Live preview of brand settings
- Reset to defaults functionality
- New store: `src/stores/brandKitStore.ts`
- New component: `src/components/brand-kit/BrandKitEditor.tsx`

**Course Builder Mode (Beta)**

- Course structure management with title and description
- Lesson CRUD operations (add, remove, update)
- Lesson properties: title, duration, objectives, slide count
- Collapsible UI toggle for course mode
- localStorage persistence for course data
- New store: `src/stores/courseBuilderStore.ts`
- New component: `src/components/course-builder/CourseBuilderToggle.tsx`

**Gemini Image Generation**

- Integration with Google Gemini API for image generation
- Imagen 4 model support for text-to-image
- Batch image generation support
- Test connection endpoint for Gemini API

**Internationalization**

- Full i18n support for Quiz Templates (EN, VI, ZH)
- Full i18n support for Brand Kit (EN, VI, ZH)
- Full i18n support for Course Builder (EN, VI, ZH)

**Security Enhancements**

- Input sanitization for XSS protection
- Enhanced content validation for all input types

---

## [1.2.5] - 2026-01-13

### Added - Phase 4: Education & Business Focus

**Quiz Templates**

- Multiple Choice Quiz template with interactive options
- True/False Quiz template for simple assessments
- Fill-in-the-Blank template for vocabulary/learning
- Matching Quiz template for pairing exercises
- New template category file: `src/data/templates/categories/quiz.json`

**Brand Kit**

- Brand Kit Editor component with collapsible UI
- Primary and secondary color configuration with color picker
- Font family selection (10 professional fonts)
- Font size options (small, medium, large)
- Logo upload with file validation (max 500KB, image types)
- Company name input for branding
- localStorage persistence via Zustand persist middleware
- Live preview of brand settings
- Reset to defaults functionality
- New store: `src/stores/brandKitStore.ts`
- New component: `src/components/brand-kit/BrandKitEditor.tsx`

**Course Builder Mode (Beta)**

- Course structure management with title and description
- Lesson CRUD operations (add, remove, update)
- Lesson properties: title, duration, objectives, slide count
- Collapsible UI toggle for course mode
- localStorage persistence for course data
- New store: `src/stores/courseBuilderStore.ts`
- New component: `src/components/course-builder/CourseBuilderToggle.tsx`

**Internationalization**

- Full i18n support for Quiz Templates (EN, VI, ZH)
- Full i18n support for Brand Kit (EN, VI, ZH)
- Full i18n support for Course Builder (EN, VI, ZH)

---

## [1.2.4] - 2026-01-13

### Added - Gemini Image Generation

- Integration with Google Gemini API for image generation
- Imagen 4 model support for text-to-image

---

## [1.2.3] - 2026-01-13

### Added - Document Processing & Export

- PDF import functionality
- DOCX import functionality
- PPTX export capability
- PDF export capability
- Batch processing for multiple files
- Prompt Optimizer feature
- PDF Preview component
- Design Tools Export (Canva JSON, Figma JSON)

---

## [1.2.2] - 2026-01-12

### Changed

- Settings hot-reload using Zustand store
- Improved state management for user preferences

---

## [1.2.1] - 2026-01-12

### Fixed

- CI workflow fixes
- Auto-release configuration

---

## [1.2.0] - 2026-01-12

### Added

- Vietnamese language support (full UI translation)
- Output language selection (10 languages: EN, VI, ZH, JA, KO, TH, ID, FR, DE, ES)
- Vitest testing infrastructure

---

## [1.1.x] - 2025-12

### Added

- Electron desktop application
- Cross-platform support (Windows, macOS, Linux)
- Auto-updater with GitHub releases integration
- Embedded Bun server binary
- Native application menus

---

## [1.0.6] - 2025-01

### Added

- Dynamic character generation based on content
- Content-aware slide type selection
- 50+ slide type templates

---

## [1.0.5] - 2025-01

### Added

- Internationalization support (EN, ZH)
- Session management with server sync
- Multi-session support

---

## [1.0.4] - 2024-12

### Added

- Character presenter feature
- 8 render styles (Pixar, Real, Anime, Cartoon, Sketch, Chibi, Low-Poly, Mascot)

---

## [1.0.3] - 2024-12

### Added

- Style personas for visual styles
- Expanded visual vocabulary

---

## [1.0.0] - 2024-11

### Added

- Initial release
- Core prompt generation engine
- 20 visual styles
- 13 color palettes
- URL extraction
- CSV upload support
