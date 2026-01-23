# Project Overview & Product Development Requirements

## Overview

**Nano Banana Slides Prompter** is an AI-powered tool that generates optimized prompts for Nano Banana Pro Slides - an AI slide generation service. The application transforms user content into detailed, structured prompts that produce visually stunning presentations.

| Attribute    | Value                       |
| ------------ | --------------------------- |
| Name         | Nano Banana Slides Prompter |
| Version      | 2.0.16                      |
| License      | GPL-3.0-or-later            |
| Repository   | nano-banana-slides-prompter |
| Last Updated | 2026-01-21                  |

## Target Users

- **Content Creators**: Quickly convert ideas into presentation prompts
- **Educators**: Generate educational slide content with consistent styling
- **Business Professionals**: Create polished business presentations
- **Developers**: Integrate prompt generation into workflows

## Core Features

### 1. Content Input

- **Text Input**: Direct text entry for presentation content
- **URL Extraction**: Automatic content extraction from web pages
- **CSV Upload**: Data-driven presentations from CSV files
- **Topic-Based**: Generate content from topic descriptions

### 2. Visual Styling

- **20 Visual Styles**: Professional, Technical, Creative, Educational, Minimalist, etc.
- **Auto/Custom Mode Toggle**: Generate prompts without style instructions (auto) or with selected style (custom)
- **13 Color Palettes**: Auto, Corporate, Vibrant, Pastel, Dark, etc.
- **Layout Structures**: Balanced, Text-Heavy, Visual-First, Minimal

### 3. Character Presenter (v1.0.4+)

- **8 Render Styles**: Pixar, Real, Anime, Cartoon, Sketch, Chibi, Low-Poly, Mascot
- **Dynamic Generation**: Characters generated based on content and audience (v1.0.6)
- **Non-Human Support**: Animals, robots, mascots, animated objects

### 4. Intelligent Slide Generation (v1.0.6)

- **50+ Slide Templates**: Opening, Concept, Data, Process, Technical, Business, etc.
- **Content-Aware Selection**: LLM analyzes content to select optimal slide types
- **Hybrid Fallback**: Category-based templates if analysis fails

### 5. Session Management (v1.0.5+)

- **Save/Load Sessions**: Persist presentation configurations
- **Multi-Session Support**: Work on multiple presentations
- **Server Sync**: Sessions synchronized with backend

### 6. Internationalization (v1.0.5+)

- **English, Vietnamese & Chinese**: Full UI translation support
- **react-i18next**: Industry-standard i18n framework
- **10 Output Languages**: EN, VI, ZH, JA, KO, TH, ID, FR, DE, ES (v1.2.0+)

### 7. Desktop Application (v1.1.0+)

- **Cross-Platform**: Windows, macOS, Linux support
- **Auto-Updater**: GitHub releases integration
- **Embedded Backend**: Bundled Bun server binary
- **Native Menus**: File, Edit, View, Window, Help

### 8. LLM Configuration

- **Flexible Backend**: OpenAI, OpenRouter, Ollama compatible
- **User Overrides**: Per-user API key and model settings
- **Streaming Support**: Real-time prompt generation via SSE

### 9. Quiz Templates (v2.0.0)

- **4 Quiz Types**: Multiple Choice, True/False, Fill-in-Blank, Matching
- **Pre-configured Styles**: Educational and assessment-focused layouts
- **i18n Support**: Full translations in EN, VI, ZH

### 10. Brand Kit (v2.0.0)

- **Color Configuration**: Primary and secondary brand colors
- **Typography**: Font family and size selection
- **Logo Upload**: Image upload with localStorage persistence
- **Company Branding**: Name and visual identity

### 11. Course Builder Mode (v2.0.0 Beta)

- **Course Structure**: Title, description, lesson organization
- **Lesson Management**: Add, remove, reorder lessons
- **Persistent State**: localStorage for course data

### 12. Security Enhancements (v2.0.0)

- **Input Sanitization**: XSS protection for user inputs
- **Content Validation**: Enhanced validation for all input types

### 13. Gemini Image Generation (v2.0.0+)

- **Imagen 4 Model**: Text-to-image generation via Google Gemini API
- **Per-Slide Generation**: Generate image for individual slides (v2.0.15+)
- **Batch Generation**: Select multiple slides with checkboxes, generate all at once
- **Thumbnail Preview**: 32px image preview in SlideCard header
- **Regenerate Support**: Regenerate button when image already exists
- **Custom API Base URL**: Configurable Gemini endpoint (v2.0.3)
- **Test Connection**: Verify Gemini API connectivity
- **AbortController**: Fetch cleanup to prevent race conditions (v2.0.16)

### 14. Inline Prompt Editing (v2.0.4)

- **Edit Before Generation**: Modify slide prompts before image generation
- **Direct Editing**: Edit individual slide prompts in PromptOutput

### 15. Slide Regeneration (v2.0.13+)

- **Context-Aware**: Uses previous/next slide context for consistency
- **Custom Instructions**: Optional user instructions for regeneration
- **Single Slide**: Regenerate individual slides without full regeneration

### 16. Drag-and-Drop Reordering (v2.0.13+)

- **dnd-kit Integration**: Accessible drag-and-drop with keyboard support
- **Auto-Renumbering**: Slides renumbered after reorder
- **Visual Feedback**: Drag overlay and opacity changes

### 17. Auto-Save (v2.0.13+)

- **Periodic Backup**: 30-second interval to localStorage
- **Crash Recovery**: Restore draft after crashes
- **Quota Handling**: Graceful handling of localStorage limits

### 18. Error Boundary (v2.0.13+)

- **Graceful Fallback**: Catch JS errors, show user-friendly UI
- **Error Details**: Expandable error message for debugging
- **Retry Option**: Reset error state and retry

### Functional Requirements

| ID    | Requirement                              | Priority | Status |
| ----- | ---------------------------------------- | -------- | ------ |
| FR-01 | Generate slide prompts from text content | High     | Done   |
| FR-02 | Extract content from URLs                | High     | Done   |
| FR-03 | Support CSV file uploads                 | Medium   | Done   |
| FR-04 | Provide 20+ visual style options         | High     | Done   |
| FR-05 | Include character presenter options      | Medium   | Done   |
| FR-06 | Dynamic character generation             | Medium   | Done   |
| FR-07 | Content-aware slide type selection       | Medium   | Done   |
| FR-08 | Session management (CRUD)                | Medium   | Done   |
| FR-09 | Multi-language support (EN/VI/ZH)        | Medium   | Done   |
| FR-10 | Output language selection (10 languages) | Medium   | Done   |
| FR-11 | Configurable LLM backend                 | High     | Done   |
| FR-12 | Streaming prompt generation              | Medium   | Done   |
| FR-13 | Copy individual slide prompts            | High     | Done   |
| FR-14 | Desktop application                      | Medium   | Done   |
| FR-15 | Auto-updater for desktop                 | Low      | Done   |
| FR-16 | Quiz templates (4 types)                 | Medium   | Done   |
| FR-17 | Brand Kit with localStorage persistence  | Medium   | Done   |
| FR-18 | Course Builder Mode (Beta)               | Low      | Done   |
| FR-19 | Input sanitization and security          | High     | Done   |
| FR-20 | Gemini Image Generation                  | Medium   | Done   |
| FR-21 | Custom Gemini API base URL               | Low      | Done   |
| FR-22 | Inline edit for slide prompts            | Medium   | Done   |
| FR-23 | Slide regeneration with context          | Medium   | Done   |
| FR-24 | Drag-and-drop slide reordering           | Medium   | Done   |
| FR-25 | Auto-save to localStorage                | Low      | Done   |
| FR-26 | Error boundary with fallback UI          | High     | Done   |
| FR-27 | Per-slide image generation               | Medium   | Done   |
| FR-28 | Batch image selection and generation     | Medium   | Done   |

### Non-Functional Requirements

| ID     | Requirement                         | Target                        | Status  |
| ------ | ----------------------------------- | ----------------------------- | ------- |
| NFR-01 | Response time for prompt generation | < 30s                         | Met     |
| NFR-02 | Support concurrent users            | 100+                          | Met     |
| NFR-03 | Browser compatibility               | Chrome, Firefox, Safari, Edge | Met     |
| NFR-04 | Mobile responsive design            | Yes                           | Met     |
| NFR-05 | Accessibility (WCAG 2.1)            | AA                            | Partial |

### Technical Constraints

- **Frontend**: React 19+, TypeScript, Vite 7
- **Backend**: Bun runtime, Hono framework
- **Desktop**: Electron 32, electron-builder
- **LLM**: OpenAI SDK compatible APIs
- **Deployment**: Docker containers, GHCR images

## Architecture Summary

```
+------------------+     +------------------+     +------------------+
|    Frontend      | --> |     Backend      | --> |    LLM API       |
|  React + Vite    |     |   Hono + Bun     |     | OpenAI/OpenRouter|
+------------------+     +------------------+     +------------------+
        |                        |
        v                        v
+------------------+     +------------------+
|   shadcn/ui      |     |  Session Store   |
|   Radix UI       |     |   (JSON files)   |
+------------------+     +------------------+

+------------------+
|  Desktop Shell   |
|  Electron 32     |
+------------------+
        |
        +--- Main Process (window, IPC, menu)
        +--- Preload (context bridge)
        +--- Backend Manager (spawn Bun binary)
        +--- Auto-Updater (GitHub releases)
```

## Version History

| Version | Date    | Highlights                                                  |
| ------- | ------- | ----------------------------------------------------------- |
| 2.0.16  | 2026-01 | Per-slide image gen, batch selection, thumbnail preview     |
| 2.0.15  | 2026-01 | Generate Image button per slide, regenerate support         |
| 2.0.14  | 2026-01 | Fix Gemini model selection in test connection               |
| 2.0.13  | 2026-01 | Slide regeneration, drag-drop, auto-save, error boundary    |
| 2.0.12  | 2026-01 | Visual Style toggle (auto/custom), slide count limit 200    |
| 2.0.10  | 2026-01 | Fix Bun double server startup bug                           |
| 2.0.9   | 2026-01 | Gemini config persistence, disable auto-updater temporarily |
| 2.0.8   | 2026-01 | Dynamic port resolution with Electron storage               |
| 2.0.7   | 2026-01 | Update URLs to fork, add v2.0.5-2.0.6 changelog             |
| 2.0.6   | 2026-01 | Port retry logic, fix race condition in port binding        |
| 2.0.5   | 2026-01 | DOMMatrix polyfill for pdfjs-dist compatibility             |
| 2.0.4   | 2026-01 | Inline edit for slide prompts before image generation       |
| 2.0.3   | 2026-01 | Custom API base URL for Gemini Image Generation             |
| 2.0.2   | 2026-01 | DOMMatrix polyfill for Electron PDF compatibility           |
| 2.0.0   | 2026-01 | Quiz Templates, Brand Kit, Course Builder, Gemini, Security |
| 1.2.5   | 2026-01 | PDF/DOCX import, PPTX/PDF export, batch processing          |
| 1.2.2   | 2026-01 | Settings hot-reload using Zustand store                     |
| 1.2.1   | 2026-01 | CI workflow fixes, auto-release                             |
| 1.2.0   | 2026-01 | Vitest testing, Vietnamese i18n, output language (10 langs) |
| 1.1.x   | 2025-12 | Desktop app, electron-updater, backend manager              |
| 1.0.6   | 2025-01 | Dynamic character generation, content-aware slides          |
| 1.0.5   | 2025-01 | i18n support (EN/ZH), session management                    |
| 1.0.4   | 2024-12 | Character presenter feature                                 |
| 1.0.3   | 2024-12 | Style personas, expanded visual vocabulary                  |
| 1.0.0   | 2024-11 | Initial release                                             |

## Success Metrics

- **User Engagement**: Sessions created per day
- **Prompt Quality**: User satisfaction with generated prompts
- **Performance**: Average generation time
- **Reliability**: Uptime percentage, error rate

## Future Roadmap

- [x] Vietnamese language support (Done in v1.2.0)
- [x] Output language selection (Done in v1.2.0)
- [x] Desktop application (Done in v1.1.x)
- [x] Quiz Templates (Done in v2.0.0)
- [x] Brand Kit (Done in v2.0.0)
- [x] Course Builder Mode (Done in v2.0.0)
- [x] Slide Regeneration (Done in v2.0.13)
- [x] Drag-and-Drop Reordering (Done in v2.0.13)
- [x] Auto-Save (Done in v2.0.13)
- [x] Error Boundary (Done in v2.0.13)
- [ ] Template library with pre-built configurations
- [ ] Export prompts to various formats (JSON, Markdown)
- [ ] Team collaboration features
- [ ] Analytics dashboard for usage insights
