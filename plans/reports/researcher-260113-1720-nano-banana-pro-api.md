# Research Report: Nano Banana Pro API for Slide Generation

**Date:** 2026-01-13
**Researcher ID:** a87b22a
**Status:** Complete

---

## Executive Summary

"Nano Banana Pro" is the informal name for **Google's Gemini 3 Pro Image model** - NOT a separate third-party API. Released Nov-Dec 2025, it's Google's highest quality image generation model with advanced slide/infographic capabilities.

---

## 1. Official Documentation

### Primary Sources

- **Google AI for Developers:** [ai.google.dev](https://ai.google.dev)
- **Google AI Studio:** API key management, testing, documentation
- **Vertex AI:** Enterprise-grade access via GCP

### Model Identifiers

| Model ID                     | Status          | Notes                 |
| ---------------------------- | --------------- | --------------------- |
| `gemini-3-pro-image-preview` | Recommended     | Released Nov 20, 2025 |
| `gemini-3-pro-latest`        | Latest stable   | Auto-updates          |
| `gemini-2.5-flash-image`     | Stable fallback | Lower cost            |

---

## 2. API Endpoints & Authentication

### Base Endpoint

```
https://generativelanguage.googleapis.com/v1beta/models/
```

### Authentication Methods

1. **API Key (Recommended for dev)**
   - Obtain from Google AI Studio
   - Pass via `x-goog-api-key` header or query param
   - Restrict by IP/HTTP referrer for security

2. **OAuth/Vertex AI (Enterprise)**
   - Service account authentication
   - GCP project with billing enabled

### SDK Installation

```bash
# Python
pip install google-generativeai

# JavaScript/Node
npm install @google/generative-ai
```

---

## 3. Request/Response Format

### Python SDK Example

```python
import google.generativeai as genai
from google.generativeai import types
import base64

# Configure
client = genai.Client(http_options={'api_version': 'v1alpha'})

# Generate image with text
response = client.models.generate_content(
    model="gemini-3-pro-image-preview",
    contents=[
        types.Content(
            parts=[
                types.Part(text="Create a professional slide about AI trends"),
            ]
        )
    ],
    generation_config={
        "response_modalities": ["TEXT", "IMAGE"]
    }
)
```

### Image Input Specs

| Parameter         | Value                       |
| ----------------- | --------------------------- |
| Max images/prompt | 14                          |
| Inline data limit | 7 MB                        |
| GCS file limit    | 30 MB                       |
| Supported formats | PNG, JPEG, WebP, HEIC, HEIF |

### Image Output Specs

| Parameter         | Value                                         |
| ----------------- | --------------------------------------------- |
| Max output tokens | 32,768                                        |
| Resolutions       | 1K, 2K, 4K (1024-4096px)                      |
| Aspect ratios     | 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9 |
| Output format     | Base64 encoded string                         |

### media_resolution Parameter

Controls vision processing detail:

- `media_resolution_low` - Fast, fewer tokens
- `media_resolution_medium` - Balanced
- `media_resolution_high` - Detailed
- `media_resolution_ultra_high` - Maximum detail

**Note:** Requires `v1alpha` API version.

---

## 4. Rate Limits & Pricing

### Free Tier

| Platform             | Daily Limit     |
| -------------------- | --------------- |
| AI Studio Web        | 500-1000 images |
| Gemini Developer API | 100-500 images  |
| Reset time           | Midnight UTC    |

### Paid Tier Pricing

| Model              | Resolution | Price         |
| ------------------ | ---------- | ------------- |
| Gemini 3 Pro Image | 1K-2K      | $0.134/image  |
| Gemini 3 Pro Image | 4K         | $0.24/image   |
| Image input        | -          | $0.0011/image |
| Imagen 3 Fast      | -          | $0.02/image   |
| Imagen 3 Standard  | -          | $0.04/image   |

### Rate Limit Tiers

| Tier   | Requirement            |
| ------ | ---------------------- |
| Free   | Eligible countries     |
| Tier 1 | Paid billing account   |
| Tier 2 | $250+ spend, 30+ days  |
| Tier 3 | $1000+ spend, 30+ days |

**Note:** $300 free credits for new GCP accounts (90 days).

---

## 5. Third-Party API Gateways

Alternative access points with OpenAI-compatible endpoints:

| Provider    | Features                   |
| ----------- | -------------------------- |
| CometAPI    | OpenAI-compatible endpoint |
| OpenRouter  | Multi-model gateway        |
| laozhang.ai | Per-image pricing          |
| APIYI       | Chinese market access      |
| GlobalGPT   | No API setup required      |

---

## 6. GitHub & Open Source

### Banana Slides (by @Anionex)

- **Type:** Open-source AI PPT generator
- **Tech:** Python, Flask, google-genai, openai, pydantic
- **Features:**
  - PDF/MD/Word input parsing
  - Natural language slide editing
  - PPTX/PDF export
  - Uses Nano Banana Pro for generation

### Current Project Context

The `nano-banana-slides-prompter` project generates optimized prompts for Nano Banana Pro - it does NOT directly call the image API but creates prompts users copy to Gemini/AI Studio.

---

## 7. Integration Options for Direct API

### Option A: Google AI SDK (Recommended)

```python
# Direct integration via google-generativeai
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-3-pro-image-preview")
response = model.generate_content(prompt)
```

### Option B: OpenAI-Compatible Proxy

```python
# Via third-party gateway
from openai import OpenAI
client = OpenAI(
    base_url="https://cometapi.com/v1",
    api_key="your-key"
)
```

### Option C: REST API Direct

```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent?key=API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"prompt"}]}]}'
```

---

## 8. Key Capabilities for Slides

- **Text rendering:** Industry-leading legibility
- **Infographics:** Charts, diagrams, data visualization
- **Consistent branding:** Visual style coherence
- **Multi-turn editing:** Iterative refinement
- **Smart reasoning:** Complex prompt understanding
- **"Beautify this slide":** Auto-enhance existing slides

---

## 9. Recommendations for Project

### For nano-banana-slides-prompter:

1. **Current approach is valid** - Generate prompts, user copies to AI Studio
2. **Optional direct integration:**
   - Add `google-generativeai` to backend
   - Store API key in `.env`
   - Call API directly, return base64 image
3. **Cost consideration:** $0.134-0.24/image for production

### Implementation Priority:

1. Keep prompt generation as primary feature
2. Add optional "Generate with API" button
3. Display generated image preview
4. Allow download as PNG/JPEG

---

## Sources

- [Google AI for Developers](https://ai.google.dev)
- [Google AI Studio](https://aistudio.google.com)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [CometAPI](https://cometapi.com)
- [APIYI](https://apiyi.com)
- [Banana Slides GitHub](https://github.com/Anionex/banana-slides)
- [Plus AI](https://plusai.com)
- [Google Blog - Gemini Updates](https://blog.google)

---

## Unresolved Questions

1. **Thought Signatures:** API requires encrypted "thought signatures" for image gen - exact implementation unclear from public docs
2. **Slide deck generation:** Single API call = single image; multi-slide decks require multiple calls + assembly
3. **Rate limit dynamics:** Free tier limits "dynamic based on server demand" - actual limits may vary
4. **v1alpha stability:** media_resolution requires alpha API - stability for production unclear
