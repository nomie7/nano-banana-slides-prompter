## What's New

<!-- Release notes here -->

## Downloads

| Platform | File |
|----------|------|
| Windows | `Nano-Banana-Slides-Prompter-Setup-{version}.exe` |
| macOS (Apple Silicon) | `Nano-Banana-Slides-Prompter-{version}-arm64.dmg` |
| macOS (Intel) | `Nano-Banana-Slides-Prompter-{version}-x64.dmg` |
| Linux | `Nano-Banana-Slides-Prompter-{version}.AppImage` |

## Installation Notes

### Windows
SmartScreen may show warning. Click "More info" → "Run anyway".

### macOS
Gatekeeper may block unsigned app. Go to System Settings → Privacy & Security → "Open Anyway".

### Linux
```bash
chmod +x Nano-Banana-Slides-Prompter-*.AppImage
./Nano-Banana-Slides-Prompter-*.AppImage
```

May require `libfuse2` on some distributions:
```bash
sudo apt install libfuse2
```

## System Requirements

- **Windows**: Windows 10 or later (x64)
- **macOS**: macOS 11 Big Sur or later (Intel or Apple Silicon)
- **Linux**: Ubuntu 20.04+ or equivalent (x64)

## Configuration

1. Launch the application
2. Click Settings (gear icon)
3. Configure your LLM provider:
   - API Base URL (OpenAI, OpenRouter, or Ollama)
   - API Key
   - Model name

## Known Issues

- First launch may take a few seconds while backend initializes
- Antivirus software may flag unsigned binaries (false positive)
