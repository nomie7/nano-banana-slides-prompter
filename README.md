# Nano Banana Slides Prompter

Generate optimized prompts for Nano Banana Pro Slides - AI-powered slide generation.

![App Screenshot](./docs/samples/Screenshot.png)

## Features

- **20 Visual Styles**: Professional, Technical, Creative, Educational, and more
- **Character Presenter**: 8 render styles (Pixar, Anime, Cartoon, etc.) with dynamic generation
- **50+ Slide Templates**: Content-aware selection from Opening, Concept, Data, Process, Technical, Business categories
- **Multiple Input Methods**: Text, URL extraction, CSV/PDF/DOCX upload
- **Gemini Image Generation**: AI-powered image generation with Imagen 4 model
- **Inline Prompt Editing**: Edit slide prompts before image generation (v2.0.4)
- **Session Management**: Save, load, and manage multiple presentations
- **Internationalization**: English, Vietnamese, and Chinese support
- **Configurable LLM**: OpenAI, OpenRouter, Ollama compatible
- **Quiz Templates**: Multiple Choice, True/False, Fill-in-Blank, Matching
- **Brand Kit**: Custom colors, fonts, logo for consistent branding
- **Course Builder**: Organize lessons and course structure (Beta)

## Sample Slides

<p>
  <img src="./docs/samples/sample27.jpeg" width="180" alt="Sample"/>
  <img src="./docs/samples/sample28.jpeg" width="180" alt="Sample"/>
  <img src="./docs/samples/sample29.jpeg" width="180" alt="Sample"/>
  <img src="./docs/samples/sample30.png" width="180" alt="Sample"/>
</p>
<p>
  <img src="./docs/samples/sample21.png" width="180" alt="Sample"/>
  <img src="./docs/samples/sample22.png" width="180" alt="Sample"/>
  <img src="./docs/samples/sample9.png" width="180" alt="Sample"/>
  <img src="./docs/samples/sample10.jpeg" width="180" alt="Sample"/>
</p>

## Quick Start

### Prerequisites

- Node.js 18+
- Bun runtime (for backend)
- OpenAI-compatible API key

### Installation

```sh
# Install frontend dependencies
npm install

# Install backend dependencies
cd server && bun install && cd ..
```

### Configuration

Create `/server/.env` from the example:

```sh
cp server/.env.example server/.env
```

Edit the `.env` file:

```env
OPENAI_API_BASE=https://api.openai.com/v1
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o
PORT=3001
GEMINI_API_KEY=your-gemini-key
GEMINI_API_BASE=https://generativelanguage.googleapis.com
```

### Development

```sh
# Run both frontend and backend
npm run dev
```

- Frontend: http://localhost:8080
- Backend: http://localhost:3001

## Docker Deployment

### Local Development

```sh
docker-compose up --build
```

Access at http://localhost:8080

### Production (GHCR Images)

Create `docker-compose.yml`:

```yaml
services:
  frontend:
    image: ghcr.io/xuan2261/nano-banana-slides-prompter-frontend:latest
    ports:
      - '80:80'
    depends_on:
      - backend
    restart: always

  backend:
    image: ghcr.io/xuan2261/nano-banana-slides-prompter-backend:latest
    environment:
      - PORT=3001
      - OPENAI_API_BASE=${OPENAI_API_BASE:-https://api.openai.com/v1}
      - OPENAI_API_KEY=your-api-key-here
      - OPENAI_MODEL=gpt-4o
    restart: always
```

Run:

```sh
docker-compose up -d
```

## Desktop App

The application is also available as a cross-platform desktop app.

### Download

Download the latest release from [GitHub Releases](https://github.com/xuan2261/nano-banana-slides-prompter/releases).

| Platform              | File                                                       |
| --------------------- | ---------------------------------------------------------- |
| Windows               | `Nano-Banana-Slides-Prompter-{version}-win-x64.exe`        |
| macOS (Apple Silicon) | `Nano-Banana-Slides-Prompter-{version}-mac-arm64.dmg`      |
| macOS (Intel)         | `Nano-Banana-Slides-Prompter-{version}-mac-x64.dmg`        |
| Linux                 | `Nano-Banana-Slides-Prompter-{version}-linux-x64.AppImage` |

### Desktop Development

```sh
# Install all dependencies
npm install
cd server && bun install && cd ..
cd desktop && npm install && cd ..

# Run desktop app in dev mode
npm run electron:dev
```

### Building Desktop App

```sh
cd desktop && npm run build
```

Output files are generated in `desktop/release/`.

## Tech Stack

| Layer    | Technologies                                                   |
| -------- | -------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS, shadcn/ui, Zustand |
| Backend  | Bun, Hono, OpenAI SDK, Cheerio                                 |
| Desktop  | Electron 32, electron-builder, electron-updater                |
| UI       | Radix UI primitives, lucide-react icons                        |
| i18n     | react-i18next (EN/VI/ZH)                                       |

## Documentation

- [Project Overview & PDR](./docs/project-overview-pdr.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Code Standards](./docs/code-standards.md)
- [System Architecture](./docs/system-architecture.md)

## API Endpoints

| Endpoint                      | Method   | Description              |
| ----------------------------- | -------- | ------------------------ |
| `/api/generate-prompt-stream` | POST     | Generate prompts (SSE)   |
| `/api/extract-url`            | POST     | Extract content from URL |
| `/api/optimize-prompt`        | POST     | Optimize prompt via LLM  |
| `/api/sessions`               | GET/POST | Session management       |
| `/api/settings/llm`           | GET      | LLM configuration        |
| `/api/gemini/generate-image`  | POST     | Single image generation  |
| `/api/gemini/generate-images` | POST     | Batch image generation   |
| `/api/gemini/test-connection` | POST     | Test Gemini API          |
| `/api/regenerate-slide`       | POST     | Regenerate single slide  |
| `/health`                     | GET      | Health check             |

## Version

**v2.0.16** - Per-slide image generation with batch selection

### Changelog

| Version | Highlights                                                                      |
| ------- | ------------------------------------------------------------------------------- |
| 2.0.16  | Per-slide image generation, batch selection, thumbnail preview, AbortController |
| 2.0.15  | Generate Image button per slide, regenerate when image exists                   |
| 2.0.14  | Fix Gemini model selection in test connection                                   |
| 2.0.13  | Slide regeneration, drag-drop reordering, auto-save, error boundary             |
| 2.0.12  | Visual Style toggle (auto/custom), slide count limit 200                        |
| 2.0.11  | Fix image generation button state not resetting after new prompt generation     |
| 2.0.10  | Fix Bun double server startup bug (remove export default)                       |
| 2.0.9   | Gemini config persistence, disable auto-updater temporarily                     |
| 2.0.8   | Dynamic port resolution with Electron storage                                   |
| 2.0.6   | Fix backend port conflict with retry logic, update auto-updater config          |
| 2.0.4   | Inline edit for slide prompts before image generation                           |
| 2.0.3   | Custom API base URL for Gemini Image Generation                                 |
| 2.0.0   | Quiz Templates (4 types), Brand Kit, Course Builder (Beta), Gemini integration  |
| 1.2.5   | Prompt Optimizer (self-refine), PDF Preview modal, Canva/Figma JSON export      |
| 1.2.3   | PDF/DOCX import, PPTX/PDF export, batch processing                              |
| 1.2.0   | System upgrade: Vitest testing, Vietnamese i18n, output language (10 languages) |
| 1.1.x   | Desktop app improvements, electron-updater                                      |
| 1.0.6   | Dynamic character generation, 50+ slide templates, content-aware selection      |

## License

GPL-3.0-or-later

## Credits

- [@movclantian](https://github.com/movclantian) - i18n and session management features
