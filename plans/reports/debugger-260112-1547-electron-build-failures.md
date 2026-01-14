# Electron Build CI/CD Failures - Debug Report

**Report ID:** debugger-260112-1547-electron-build-failures
**Date:** 2026-01-12
**Workflow:** `.github/workflows/electron-build.yml`
**Repository:** xuan2261/nano-banana-slides-prompter (fork of nomie7/nano-banana-slides-prompter)

---

## Executive Summary

All 4 matrix builds in the Electron build workflow failed. Root cause identified: **missing `desktop/package-lock.json`** causing `npm ci` to fail on all platforms.

| Platform    | Runner         | Status    | Failed Step                  |
| ----------- | -------------- | --------- | ---------------------------- |
| Linux       | ubuntu-latest  | FAILURE   | Install desktop dependencies |
| Windows     | windows-latest | FAILURE   | Install desktop dependencies |
| macOS x64   | macos-13       | CANCELLED | (runner retired)             |
| macOS arm64 | macos-latest   | FAILURE   | Install desktop dependencies |

---

## Root Cause Analysis

### Issue #1: Missing `desktop/package-lock.json` (CRITICAL)

**Evidence from CI logs:**

```
npm error code EUSAGE
npm error The `npm ci` command can only install with an existing package-lock.json or
npm error npm-shrinkwrap.json with lockfileVersion >= 1. Run an install with npm@5 or
npm error later to generate a package-lock.json file, then try again.
```

**Affected Step:** `Install desktop dependencies` (line 78 in workflow)

```yaml
- name: Install desktop dependencies
  run: cd desktop && npm ci
```

**Why it fails:**

- `npm ci` requires `package-lock.json` to exist
- `desktop/package-lock.json` is NOT tracked in git (verified locally)
- Git tracked lock files: `package-lock.json` (root), `server/bun.lock`, `bun.lockb`

**Impact:** ALL platforms fail at this step (Linux, Windows, macOS arm64)

---

### Issue #2: macOS-13 Runner Retired (HIGH)

**Status:** The `macos-13` runner image was retired on December 4, 2025.

**Evidence:**

- Job `build (macos-13, mac, x64, bun-darwin-x64)` was immediately CANCELLED
- Job duration: 0 seconds (started_at == completed_at)
- No steps executed

**Current matrix entry:**

```yaml
- os: macos-13
  platform: mac
  arch: x64
  bun-target: bun-darwin-x64
```

**User Request:** Skip macOS builds entirely (remove both mac entries from matrix)

---

### Issue #3: Workflow Not Active on Origin Remote

**Observation:**

- Workflow file exists in git: `.github/workflows/electron-build.yml`
- Local commits not pushed to origin/main:
  - `edebe2c feat(desktop): add app icons for all platforms`
  - `066c02a feat: add Electron desktop app with cross-platform builds`
- Workflow only running on fork repo (xuan2261/nano-banana-slides-prompter)

---

## Technical Analysis

### Workflow Step Flow (where failure occurs)

```
1. Checkout                        [OK]
2. Setup Node.js                   [OK]
3. Setup Bun                       [OK]
4. Cache Electron                  [OK]
5. Cache Electron-Builder          [OK]
6. Install root dependencies       [OK]  <- npm ci (root package-lock.json exists)
7. Install server dependencies     [OK]  <- bun install (server/bun.lock exists)
8. Install desktop dependencies    [FAIL] <- npm ci (desktop/package-lock.json MISSING)
9. Build frontend                  [SKIPPED]
10. Copy frontend to desktop       [SKIPPED]
11. Build backend binary           [SKIPPED]
12. Compile Electron TypeScript    [SKIPPED]
13. Build Electron app             [SKIPPED]
14. Upload artifacts               [SKIPPED]
```

### File Structure Analysis

```
nano-banana-slides-prompter/
├── package.json              [EXISTS]
├── package-lock.json         [EXISTS, TRACKED]
├── bun.lockb                 [EXISTS, TRACKED]
├── server/
│   ├── package.json          [EXISTS]
│   └── bun.lock              [EXISTS, TRACKED]
└── desktop/
    ├── package.json          [EXISTS]
    └── package-lock.json     [MISSING, NOT TRACKED] <-- ROOT CAUSE
```

### Desktop Dependencies (from desktop/package.json)

```json
{
  "dependencies": {
    "electron-updater": "^6.3.0",
    "electron-log": "^5.2.0"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.1.0",
    "typescript": "^5.9.3",
    "ts-node": "^10.9.2",
    "@types/node": "^22.0.0"
  }
}
```

---

## Recommendations

### Priority 1: Fix Missing Lock File (CRITICAL)

**Option A: Generate and commit package-lock.json**

```bash
cd desktop
npm install
git add package-lock.json
git commit -m "chore: add desktop package-lock.json for CI"
```

**Option B: Change workflow to use `npm install` instead of `npm ci`**

```yaml
# Change line 78 from:
- name: Install desktop dependencies
  run: cd desktop && npm ci

# To:
- name: Install desktop dependencies
  run: cd desktop && npm install
```

Note: `npm install` is less strict but works without lock file. `npm ci` is preferred for CI as it ensures reproducible builds.

### Priority 2: Remove macOS Builds (Per User Request)

Remove both macOS matrix entries from workflow:

```yaml
# REMOVE these entries from matrix.include:
- os: macos-13
  platform: mac
  arch: x64
  bun-target: bun-darwin-x64

- os: macos-latest
  platform: mac
  arch: arm64
  bun-target: bun-darwin-arm64
```

Also remove macOS-specific steps:

- Lines 118-128: "Build Electron app (macOS x64)" and "Build Electron app (macOS arm64)"
- Lines 151-160: "Upload artifacts (macOS)"

### Priority 3: Update electron-builder.yml

If removing macOS builds, consider removing `mac:` section from `desktop/electron-builder.yml` to avoid confusion:

```yaml
# Remove lines 31-39:
mac:
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  icon: resources/icons/icon.icns
  category: public.app-category.productivity
  artifactName: ${productName}-${version}-mac-${arch}.${ext}
```

### Priority 4: Push to Origin Remote

After fixes, push commits to origin/main so workflow runs on the main repo.

---

## Workflow Matrix After Fixes

```yaml
matrix:
  include:
    - os: ubuntu-latest
      platform: linux
      bun-target: bun-linux-x64
    - os: windows-latest
      platform: win
      bun-target: bun-windows-x64
```

---

## Verification Steps

After implementing fixes:

1. Run `npm ci` locally in `desktop/` to verify lock file works
2. Push changes and trigger workflow via `workflow_dispatch`
3. Monitor all steps complete successfully
4. Verify artifacts are uploaded (Linux: AppImage/deb, Windows: exe)

---

## Unresolved Questions

1. **Why was `desktop/package-lock.json` not generated/committed initially?**
   - Possible: Developer used `bun install` or `npm install` without committing lock file
   - Possible: `.gitignore` previously excluded it (currently does not)

2. **Should `desktop/` also use Bun instead of npm for consistency?**
   - Server uses `bun install` with `bun.lock`
   - Desktop uses `npm ci` with `package-lock.json`
   - Electron-builder has better npm support, so npm is reasonable choice

3. **Is macOS x64 (Intel) support needed long-term?**
   - GitHub retiring x86_64 macOS runners in Fall 2027
   - If macOS support is needed later, only arm64 should be targeted

---

## References

- [GitHub Actions macOS-13 Retirement](https://github.blog/changelog/2024-10-01-macos-13-and-macos-14-xlarge-runners-will-move-to-apple-silicon/)
- Workflow Run: https://github.com/xuan2261/nano-banana-slides-prompter/actions/runs/20912998147
- npm ci documentation: https://docs.npmjs.com/cli/v10/commands/npm-ci
