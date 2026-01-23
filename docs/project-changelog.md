# Project Changelog

All notable changes to Nano Banana Slides Prompter are documented here.

---

## [2.0.16] - 2026-01-21

### Added

- Per-slide image generation with Generate Image button on each SlideCard
- Batch image selection with checkboxes and "Generate Selected" button
- 32px thumbnail preview in SlideCard header when image exists
- AbortController for fetch cleanup to prevent race conditions
- Silent ignore AbortError during component unmount

### Changed

- PromptOutput now supports batch selection mode for image generation
- SlideCard displays image thumbnail when generated

---

## [2.0.15] - 2026-01-21

### Added

- Generate Image button on individual slides
- Regenerate button when slide already has an image
- useGeminiImage hook for single/batch image generation

### Changed

- Improved image generation UX with loading states

---

## [2.0.14] - 2026-01-21

### Fixed

- Gemini model selection now works in test connection (was hardcoded to `gemini-1.5-flash`)
- Frontend now sends selected model to backend when testing connection

---

## [2.0.13] - 2026-01-21

### Added

- Slide regeneration feature with dedicated API endpoint (`/api/regenerate-slide`)
- Drag-and-drop slide reordering using dnd-kit library
- Auto-save functionality (30s interval to localStorage)
- Error boundary components for graceful error handling

### Changed

- Updated documentation with new features and architecture

---

## [2.0.12] - 2026-01-21

### Added

- Visual Style toggle (auto/custom mode) - allows generating prompts without visual style instructions
- Translations for style selector modes (EN, VI, ZH): `styleSelector.autoMode`, `styleSelector.customMode`, `styleSelector.autoHint`

### Changed

- Increased slide count limit from 20 to 200

---

## [2.0.10] - 2026-01-14

### Fixed - Bun Double Server Startup Bug

- Remove export default to prevent Bun from starting server twice
- Fixes duplicate port binding issues in development

---

## [2.0.9] - 2026-01-14

### Added - Gemini Config Persistence

- Gemini configuration now persisted to Electron storage
- Disable auto-updater temporarily for stability

---

## [2.0.8] - 2026-01-14

### Fixed - Dynamic Port Resolution

- Use dynamic port resolution for backend
- Persist port to Electron storage for consistent access

---

## [2.0.7] - 2026-01-14

### Changed - Repository URLs

- Update URLs to forked repository
- Add v2.0.5-2.0.6 changelog to documentation

---

## [2.0.6] - 2026-01-14

### Fixed - Port Binding Reliability

- Add port retry logic with up to 5 attempts
- Fix race condition in port binding
- Improved backend startup reliability

---

## [2.0.5] - 2026-01-14

### Fixed - PDF Compatibility

- Add DOMMatrix polyfill for pdfjs-dist compatibility
- Resolves PDF rendering in Electron environment

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
