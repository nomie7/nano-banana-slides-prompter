# Development Journal - Plans Archive

**Date:** 2026-01-22

## Completed Plans Summary

### 1. Language Output Feature
- **Status:** Completed
- **Period:** 2026-01-12
- **Key Changes:**
  - Added output language selection (10 languages: EN, VI, ZH, JA, KO, TH, ID, FR, DE, ES)
  - Implemented pass-through mode for technical terms preservation
  - LLM-driven translation via prompt injection
- **Impact:** Users can generate slide prompts in preferred language while preserving technical terminology.

---

### 2. System Upgrade v2
- **Status:** Completed
- **Period:** 2026-01-13
- **Key Changes:**
  - Export system (JSON/MD/TXT client-side)
  - Testing infrastructure (Vitest, 80% coverage target)
  - CI/CD pipeline via GitHub Actions
  - Template library (20+ templates)
  - Vietnamese i18n (full translation)
- **Impact:** Major infrastructure upgrade from v1.1.0 to v1.2.0 with testing, export, and i18n foundations.

---

### 3. Remove PromptPreview & Add Export Dropdown
- **Status:** Completed
- **Period:** 2026-01-13
- **Key Changes:**
  - Removed redundant PromptPreview component
  - Added export dropdown next to "Copy All" button
  - Cleaned up sessionStore state
- **Impact:** Simplified UI by removing duplicate content display, added accessible export functionality (MD/TXT/JSON).

---

### 4. Feature Upgrade Roadmap v1.3.x - v2.x
- **Status:** Completed
- **Period:** 2026-01-13
- **Key Changes:**
  - Phase 1: Template Library, File Import/Export (PDF, DOCX, PPTX)
  - Phase 2: Prompt Optimizer, Batch Processing
  - Phase 3: Nano Banana API / Gemini Image Generation
  - Phase 4: Education & Business features (Quiz, Brand Kit)
- **Impact:** Comprehensive upgrade from v1.2.4 to v2.x with 40h effort. All 4 phases delivered, ready for v2.0.0 release.

---

### 5. Per-Slide Image Generation
- **Status:** Completed (implemented this session)
- **Period:** 2026-01-21
- **Key Changes:**
  - Added "Generate Image" button per SlideCard
  - Implemented checkbox selection + "Generate Selected" batch
  - 32px thumbnail preview in slide header
  - Button changes to "Regenerate" when image exists
  - Fixed AbortError handling
- **Impact:** Users can generate images individually or in batch, with inline previews and better control over image generation workflow.

---

## Archive Notes

All plans above have been successfully completed and validated. Code changes have been merged to main branch. Documentation updated accordingly.
