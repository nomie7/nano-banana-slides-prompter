# GitHub Actions for Electron Cross-Platform Builds

**Date:** 2026-01-12 | **Task:** Research electron-builder CI/CD

---

## 1. Matrix Strategy for Multi-OS Builds

### Recommended Workflow Structure

```yaml
name: Build Electron App

on:
  push:
    tags: ['v*']
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      fail-fast: false
      matrix:
        include:
          - os: ubuntu-latest
            platform: linux
          - os: windows-latest
            platform: win
          - os: macos-13
            platform: mac
            arch: x64
          - os: macos-latest
            platform: mac
            arch: arm64

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Electron app
        uses: DarkGuy10/action-electron-builder@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          release: ${{ startsWith(github.ref, 'refs/tags/v') }}
```

### Key Points
- Use `fail-fast: false` to complete all platform builds even if one fails
- macOS: `macos-13` for Intel x64, `macos-latest` for ARM64
- Action `DarkGuy10/action-electron-builder@v1` handles build + release

---

## 2. Caching Strategies

### Multi-Layer Caching

```yaml
steps:
  - uses: actions/setup-node@v4
    with:
      node-version: 20
      cache: 'npm'  # Auto-cache npm dependencies

  - name: Cache Electron
    uses: actions/cache@v4
    with:
      path: ~/.cache/electron
      key: ${{ runner.os }}-electron-${{ hashFiles('**/package-lock.json') }}
      restore-keys: ${{ runner.os }}-electron-

  - name: Cache Electron-Builder
    uses: actions/cache@v4
    with:
      path: ~/.cache/electron-builder
      key: ${{ runner.os }}-electron-builder-${{ hashFiles('**/package-lock.json') }}
      restore-keys: ${{ runner.os }}-electron-builder-
```

### Cache Paths by OS
| OS | Electron Cache | Builder Cache |
|---|---|---|
| Linux | `~/.cache/electron` | `~/.cache/electron-builder` |
| macOS | `~/Library/Caches/electron` | `~/Library/Caches/electron-builder` |
| Windows | `%LOCALAPPDATA%\electron\Cache` | `%LOCALAPPDATA%\electron-builder\Cache` |

**Tip:** Use `npm ci` instead of `npm install` for faster, reproducible builds.

---

## 3. Unsigned Builds Considerations

### macOS Gatekeeper
- Unsigned apps blocked by default
- Users must: System Settings > Privacy & Security > "Open Anyway"
- **For dev builds:** Provide clear instructions in README
- Production requires: Code signing + Apple notarization

### Windows SmartScreen
- Shows "Windows protected your PC" warning
- Users click "More info" > "Run anyway"
- **Mitigations:**
  - Code signing reduces warnings
  - EV certificates bypass immediately
  - Azure Trusted Signing alternative to EV

### Linux AppImage
- No signing requirement for execution
- May need `chmod +x` permission
- Some distros require `libfuse2` for AppImage

### Recommendation for Dev/Internal Builds
```yaml
# In electron-builder config, skip signing for dev
mac:
  identity: null  # Skip signing on macOS
win:
  sign: false     # Skip signing on Windows (electron-builder 24+)
```

---

## 4. Auto-Updater with GitHub Releases

### electron-builder publish config (package.json)

```json
{
  "build": {
    "appId": "com.yourorg.slidespromter",
    "publish": {
      "provider": "github",
      "owner": "your-username",
      "repo": "nano-banana-slides-prompter"
    }
  }
}
```

### Main Process Integration

```javascript
const { autoUpdater } = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

app.whenReady().then(() => {
  // Check updates after window ready
  autoUpdater.checkForUpdatesAndNotify();
});

autoUpdater.on('update-downloaded', (info) => {
  // Prompt user or auto-install
  autoUpdater.quitAndInstall();
});
```

### Release Asset Naming (auto-generated)
| Platform | Files |
|---|---|
| Windows | `App-Setup-1.0.0.exe`, `latest.yml` |
| macOS | `App-1.0.0.dmg`, `App-1.0.0-mac.zip`, `latest-mac.yml` |
| Linux | `App-1.0.0.AppImage`, `latest-linux.yml` |

### Draft Releases for Testing
```yaml
- name: Build/release
  uses: DarkGuy10/action-electron-builder@v1
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    release: true
  env:
    EP_DRAFT: true  # Create draft release
```

---

## 5. Build Artifacts & Optimization

### Upload Artifacts for PR Builds

```yaml
- name: Upload artifacts
  uses: actions/upload-artifact@v4
  if: ${{ !startsWith(github.ref, 'refs/tags/') }}
  with:
    name: build-${{ matrix.platform }}-${{ matrix.arch || 'x64' }}
    path: |
      dist/*.exe
      dist/*.dmg
      dist/*.AppImage
      dist/*.deb
    retention-days: 7
```

### Build Time Optimization
1. **Use `npm ci`** - faster than `npm install`
2. **Cache aggressively** - electron binaries are large (~150MB)
3. **Conditional builds** - only build on tags for releases
4. **Parallel jobs** - matrix runs concurrently

### Platform-Specific Configs (electron-builder.yml)

```yaml
appId: com.yourorg.app
productName: SlidesPrompter

mac:
  target:
    - target: dmg
      arch: [x64, arm64]
    - target: zip
      arch: [x64, arm64]
  category: public.app-category.productivity

win:
  target:
    - target: nsis
      arch: [x64]
  artifactName: ${productName}-Setup-${version}.${ext}

linux:
  target:
    - AppImage
    - deb
  category: Utility

nsis:
  oneClick: false
  allowToChangeInstallationDirectory: true
```

---

## Summary Recommendations

| Aspect | Recommendation |
|---|---|
| Action | `DarkGuy10/action-electron-builder@v1` |
| Node | v20 LTS |
| Caching | setup-node cache + electron/electron-builder cache |
| Unsigned dev | Provide user bypass instructions |
| Auto-update | `electron-updater` + GitHub Releases |
| Release flow | Tag push triggers release; PR builds upload artifacts |

---

## Unresolved Questions

1. **macOS notarization in CI** - Requires Apple Developer account ($99/year); how to handle for open-source project?
2. **Windows EV certificate** - Cost ~$300-500/year; is Azure Trusted Signing a viable free alternative?
3. **Auto-update for Linux** - AppImage auto-update requires different mechanism; worth implementing?

---

## Sources

- [GitHub - action-electron-builder](https://github.com/DarkGuy10/action-electron-builder)
- [Electron Builder - Auto Update](https://electron.build/auto-update)
- [Electron.js - Code Signing](https://electronjs.org/docs/tutorial/code-signing)
- [Dev.to - Electron GitHub Actions](https://dev.to)
- [Stack Overflow - Electron Caching](https://stackoverflow.com)
