# Nano Banana Slides Prompter

Generate optimized prompts for Nano Banana Pro Slides - AI-powered slide generation.

![App Screenshot](./docs/samples/Screenshot.png)

## Features

- **20 Visual Styles**: Professional, Technical, Creative, Educational, and more
- **Character Presenter**: 8 render styles (Pixar, Anime, Cartoon, etc.) with dynamic generation
- **50+ Slide Templates**: Content-aware selection from Opening, Concept, Data, Process, Technical, Business categories
- **Multiple Input Methods**: Text, URL extraction, CSV upload
- **Session Management**: Save, load, and manage multiple presentations
- **Internationalization**: English, Vietnamese, and Chinese support
- **Configurable LLM**: OpenAI, OpenRouter, Ollama compatible

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
    image: ghcr.io/nomie7/nano-banana-slides-prompter-frontend:latest
    ports:
      - '80:80'
    depends_on:
      - backend
    restart: always

  backend:
    image: ghcr.io/nomie7/nano-banana-slides-prompter-backend:latest
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

Download the latest release from [GitHub Releases](https://github.com/nomie7/nano-banana-slides-prompter/releases).

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
| Desktop  | Electron 33, electron-builder, electron-updater                |
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
| `/api/sessions`               | GET/POST | Session management       |
| `/api/settings/llm`           | GET      | LLM configuration        |
| `/health`                     | GET      | Health check             |

## Version

**v1.2.4** - Remove redundant PromptPreview, add export dropdown

### Changelog

| Version | Highlights                                                                                |
| ------- | ----------------------------------------------------------------------------------------- |
| 1.2.4   | Remove redundant PromptPreview component, add export dropdown (MD, TXT, JSON)             |
| 1.2.3   | Fix auto-release workflow for fork compatibility                                          |
| 1.2.2   | Settings hot-reload using Zustand store                                                   |
| 1.2.1   | CI workflow fixes, auto-release                                                           |
| 1.2.0   | System upgrade: Vitest testing, Vietnamese i18n, output language selection (10 languages) |
| 1.1.x   | Desktop app improvements, electron-updater                                                |
| 1.0.6   | Dynamic character generation, 50+ slide templates, content-aware selection                |
| 1.0.5   | i18n (EN/ZH), session management, Zustand state, Vite 7                                   |
| 1.0.4   | Character presenter with 8 render styles                                                  |
| 1.0.3   | Style personas, expanded visual vocabulary, CSV support                                   |

## License

GPL-3.0-or-later

## Credits

- [@movclantian](https://github.com/movclantian) - i18n and session management features
