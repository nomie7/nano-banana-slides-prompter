# Brainstorm Report: Feature Upgrade Roadmap

**Date:** 2026-01-13
**Project:** Nano Banana Slides Prompter
**Version:** 1.2.4 → 2.x Roadmap
**Status:** Approved for Planning

---

## 1. Problem Statement

Nano Banana Slides Prompter đã đạt được các tính năng core ổn định (v1.2.4). Cần xác định hướng phát triển tiếp theo để:

- Mở rộng khả năng tích hợp với các platform/tools khác
- Phục vụ tốt hơn cho nhóm người dùng: Cá nhân/Freelancer, Giáo dục, Doanh nghiệp nhỏ
- Duy trì nguyên tắc KISS (Keep It Simple, Stupid)

---

## 2. Market Research Summary

### 2.1 Competitive Landscape

| Tool             | Strengths                                                  | Weaknesses                          |
| ---------------- | ---------------------------------------------------------- | ----------------------------------- |
| **Gamma**        | 20+ AI models, web-first design, brand guidelines from PDF | Subscription-based, limited offline |
| **Beautiful.ai** | Smart templates, brand kit, native PPTX export             | Premium pricing                     |
| **Tome**         | Narrative-driven, storytelling focus                       | Limited export options              |
| **SlidesAI**     | Google Slides/PPT add-on, quick text-to-slides             | Less customization                  |
| **Plus AI**      | Google Slides native, AI editing features                  | Ecosystem lock-in                   |

### 2.2 Nano Banana Pro Capabilities (2025)

Theo [Google Blog](https://blog.google) và [AIFreeAPI](https://aifreeapi.com):

- Instant slide generation from text/docs/URLs/YouTube
- AI visuals & infographics với Gemini 3 Pro Image
- "Beautify This Slide" feature
- Enhanced text rendering (legible, well-placed)
- Multi-image fusion (up to 14 images)
- 4K output support

### 2.3 Industry Trends

- **Voice narration**: Murf AI, Colossyan, Google Vids integration
- **Real-time collaboration**: Pitch, Google Vids, Figma-style editing
- **Prompt optimization**: Tools like Agenta, Mirascope for prompt management
- **Multi-modal input**: PDF, video, audio → slides

---

## 3. User Requirements

| Aspect             | Selection                                                              |
| ------------------ | ---------------------------------------------------------------------- |
| **Priority**       | Mở rộng tích hợp                                                       |
| **Target Users**   | Cá nhân/Freelancer, Giáo dục, Doanh nghiệp nhỏ                         |
| **Complexity**     | Tối giản (KISS)                                                        |
| **Export Formats** | PowerPoint, PDF Preview, Data formats (MD/JSON)                        |
| **Integrations**   | Nano Banana API, Design Tools                                          |
| **Quick Wins**     | Template Library, Prompt Optimizer, More Input Types, Batch Processing |

---

## 4. Proposed Features Roadmap

### Phase 1: Quick Wins (v1.3.x)

| Feature              | Description                                                                      | Effort | Priority |
| -------------------- | -------------------------------------------------------------------------------- | ------ | -------- |
| **Template Library** | 50+ prompt templates theo ngành (Education, Business, Marketing, Tech, Creative) | Low    | P0       |
| **PDF/DOCX Import**  | Import nội dung từ PDF (pdf-parse), DOCX (mammoth.js)                            | Low    | P0       |
| **Batch Processing** | Generate prompts cho nhiều topics cùng lúc với queue                             | Low    | P1       |
| **PPTX Export**      | Export prompts sang PowerPoint template (pptxgenjs)                              | Medium | P1       |

**Technical Stack:**

- `pdf-parse`: PDF text extraction
- `mammoth`: DOCX to HTML/text
- `pptxgenjs`: PowerPoint generation
- UI: New tabs/sections trong existing interface

### Phase 2: Core Integrations (v1.4.x)

| Feature                | Description                                 | Effort | Priority |
| ---------------------- | ------------------------------------------- | ------ | -------- |
| **Prompt Optimizer**   | LLM-powered prompt improvement suggestions  | Low    | P0       |
| **PDF Preview**        | Preview layout trước khi export             | Medium | P1       |
| **Canva JSON Export**  | Export format tương thích Canva import      | Medium | P2       |
| **Figma Plugin Ready** | JSON structure cho Figma plugin integration | Medium | P2       |

**Technical Stack:**

- Prompt optimization: Reuse existing LLM infrastructure
- PDF: `@react-pdf/renderer` hoặc `jspdf`
- JSON schemas: Design tool compatible structures

### Phase 3: Nano Banana Integration (v1.5.x)

| Feature                | Description                                | Effort | Priority |
| ---------------------- | ------------------------------------------ | ------ | -------- |
| **Nano Banana API**    | Direct integration với Nano Banana Pro API | Medium | P0       |
| **Live Preview**       | Preview generated slides trong app         | Medium | P1       |
| **One-Click Generate** | Gửi prompt trực tiếp tới Nano Banana       | Low    | P1       |

**Technical Stack:**

- API client cho Nano Banana Pro
- Preview component (iframe hoặc image gallery)
- Authentication flow (API keys)

### Phase 4: Education & Business Focus (v2.0.x)

| Feature                 | Description                                        | Effort | Priority |
| ----------------------- | -------------------------------------------------- | ------ | -------- |
| **Course Builder Mode** | Chế độ tạo slide cho khóa học với lesson structure | Medium | P1       |
| **Quiz Templates**      | Templates cho câu hỏi, quiz, interactive content   | Low    | P1       |
| **Brand Kit**           | Lưu brand colors, fonts, logos (local storage)     | Low    | P2       |
| **Narration Script**    | Generate thuyết trình script kèm prompts           | Medium | P2       |

**Technical Stack:**

- Course builder: State management với Zustand
- Brand kit: LocalStorage/IndexedDB
- Narration: Additional LLM prompting

### Phase 5: Future Considerations (v2.x+)

| Feature                   | Description                              | Effort | Priority |
| ------------------------- | ---------------------------------------- | ------ | -------- |
| **Team Workspace**        | Shared templates, collaborative editing  | High   | P3       |
| **Analytics Dashboard**   | Usage stats, popular templates           | High   | P3       |
| **LMS Integration**       | Moodle, Canvas API integration           | High   | P3       |
| **Voice-over Generation** | TTS integration (ElevenLabs, OpenAI TTS) | Medium | P3       |

---

## 5. Architecture Considerations

### 5.1 Current Architecture (maintained)

```
Frontend (React/Vite) ←→ Backend (Hono/Bun) ←→ LLM API
         ↓                      ↓
     shadcn/ui              Session Store
```

### 5.2 Extended Architecture (proposed)

```
Frontend (React/Vite)
    ├── Template Library (local JSON)
    ├── File Importers (PDF, DOCX, TXT)
    ├── Export Engines (PPTX, PDF, JSON)
    └── Preview Components

Backend (Hono/Bun)
    ├── Prompt Optimizer Service
    ├── Batch Processing Queue
    ├── Nano Banana API Client
    └── Session Store (existing)
```

### 5.3 KISS Principles Applied

1. **No new databases**: Use existing JSON file storage
2. **No external services** (Phase 1-2): All processing local/in-memory
3. **Progressive enhancement**: Each feature independent, can be disabled
4. **Minimal dependencies**: Only add libs when necessary

---

## 6. Risk Assessment

| Risk                       | Probability | Impact | Mitigation                          |
| -------------------------- | ----------- | ------ | ----------------------------------- |
| Nano Banana API changes    | Medium      | High   | Abstract API layer, version pinning |
| PPTX generation complexity | Low         | Medium | Use battle-tested pptxgenjs         |
| PDF parsing accuracy       | Medium      | Low    | Fallback to text extraction         |
| Scope creep                | High        | Medium | Strict phase boundaries             |

---

## 7. Success Metrics

| Metric                         | Target           | Measurement        |
| ------------------------------ | ---------------- | ------------------ |
| Template usage rate            | >40% sessions    | Analytics tracking |
| Export feature adoption        | >30% users       | Usage logs         |
| Prompt optimization acceptance | >60% suggestions | User clicks        |
| Time to first prompt           | <2 minutes       | Session timing     |

---

## 8. Recommended Next Steps

### Immediate (v1.3.0)

1. **Template Library** - Highest value, lowest effort
2. **PDF/DOCX Import** - Expands input capabilities significantly
3. **Enhanced Export** - PPTX + expanded formats

### Short-term (v1.4.0)

4. **Prompt Optimizer** - Differentiating feature
5. **Batch Processing** - Power user feature

### Medium-term (v1.5.0)

6. **Nano Banana API Integration** - Core value proposition

---

## 9. Decision

**Approved Direction:** Full roadmap implementation with phased approach

**Phase Priority:**

1. Phase 1 (Quick Wins) - Start immediately
2. Phase 2 (Core Integrations) - After Phase 1 complete
3. Phase 3 (Nano Banana) - Depends on API availability
4. Phase 4-5 - Future planning

---

## 10. Sources

- [Beautiful.ai](https://beautiful.ai) - Smart template design
- [Gamma](https://gamma.app) - AI presentation platform
- [SoftTooler](https://softtooler.com) - AI tools comparison
- [Google Blog](https://blog.google) - Nano Banana Pro features
- [AIFreeAPI](https://aifreeapi.com) - Gemini 3 Pro capabilities
- [Colossyan](https://colossyan.com) - AI video/voice features
- [Pitch](https://pitch.com) - Collaboration features
- [Mirascope](https://mirascope.com) - Prompt engineering tools

---

## Unresolved Questions

1. **Nano Banana Pro API**: Cần xác nhận API documentation và authentication method
2. **PPTX Templates**: Cần thiết kế base templates cho export hay dùng generic?
3. **Template Categories**: Cần user research để xác định categories phù hợp nhất
4. **Pricing Model**: Nếu có Nano Banana API costs, cách pass-through cho users?
