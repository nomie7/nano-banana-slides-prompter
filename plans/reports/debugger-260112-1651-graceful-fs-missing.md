# Debug Report: graceful-fs Missing in Packaged Electron App

**Report ID:** debugger-260112-1651-graceful-fs-missing
**Date:** 2026-01-12
**Issue:** `Cannot find module 'graceful-fs'` at runtime in installed Windows app

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** The `electron-builder.yml` configuration excludes all `node_modules` then selectively re-includes only `electron-updater/**/*` and `electron-log/**/*`. However, `graceful-fs` is hoisted to the root `node_modules/` directory (not nested inside `electron-updater/node_modules/`), so it gets excluded from the asar archive.

| Component                                | Status                                     |
| ---------------------------------------- | ------------------------------------------ |
| `electron-updater`                       | Included in asar                           |
| `electron-updater/node_modules/fs-extra` | Included (nested)                          |
| `graceful-fs`                            | **EXCLUDED** (hoisted to root, not nested) |

---

## Technical Analysis

### 1. Dependency Chain

```
electron-updater@6.7.3 (production dep)
└── fs-extra@10.1.0 (nested in electron-updater/node_modules/)
    ├── graceful-fs@4.2.11 (HOISTED to root node_modules/)
    ├── jsonfile@6.2.0 (nested in electron-updater/node_modules/)
    │   └── graceful-fs (optional, deduped to root)
    └── universalify@2.0.1 (nested in electron-updater/node_modules/)
```

### 2. Current electron-builder.yml Configuration

```yaml
files:
  - dist/**/*
  - renderer/**/*
  - resources/**/*
  - '!node_modules/**/*' # Excludes ALL node_modules
  - node_modules/electron-updater/**/* # Re-includes electron-updater
  - node_modules/electron-log/**/* # Re-includes electron-log
```

### 3. Problem Explanation

NPM uses **dependency hoisting** to deduplicate packages. When multiple packages depend on the same version of a module, npm installs it once at the root `node_modules/` level.

**What's in `electron-updater/node_modules/`:**

- `builder-util-runtime/`
- `fs-extra/`
- `jsonfile/`
- `semver/`
- `universalify/`

**What's NOT in `electron-updater/node_modules/` (hoisted to root):**

- `graceful-fs` - hoisted because it's shared with devDeps

### 4. Module Resolution at Runtime

When packaged app runs:

```
fs-extra/lib/fs/index.js:5 → require('graceful-fs')
```

Node.js resolution path in asar:

1. `electron-updater/node_modules/fs-extra/node_modules/graceful-fs` - NOT FOUND
2. `electron-updater/node_modules/graceful-fs` - NOT FOUND
3. `node_modules/graceful-fs` - NOT FOUND (excluded by !node_modules/\*\*)

**Result:** `Cannot find module 'graceful-fs'`

### 5. Verification Evidence

```bash
# graceful-fs exists at root (hoisted)
$ ls node_modules/graceful-fs/
clone.js  graceful-fs.js  legacy-streams.js  LICENSE  package.json  polyfills.js  README.md

# graceful-fs NOT nested in electron-updater
$ ls node_modules/electron-updater/node_modules/
.bin/  builder-util-runtime/  fs-extra/  jsonfile/  semver/  universalify/
# No graceful-fs!

# npm confirms hoisting
$ npm ls graceful-fs --omit=dev
└─┬ electron-updater@6.7.3
  └─┬ fs-extra@10.1.0
    ├── graceful-fs@4.2.11      # Hoisted to root
    └─┬ jsonfile@6.2.0
      └── graceful-fs@4.2.11 deduped
```

---

## Other Missing Dependencies (Same Pattern)

Based on the hoisting analysis, these are also likely missing:

| Package       | Required By          | Location       |
| ------------- | -------------------- | -------------- |
| `graceful-fs` | fs-extra, jsonfile   | root (hoisted) |
| `debug`       | builder-util-runtime | likely root    |
| `ms`          | debug                | likely root    |
| `sax`         | builder-util-runtime | likely root    |
| `argparse`    | js-yaml              | likely root    |

---

## Recommended Fix Options

### Option A: Include All Production Dependencies (Recommended)

Change `electron-builder.yml` to include all transitive deps:

```yaml
files:
  - dist/**/*
  - renderer/**/*
  - resources/**/*
  - '!node_modules/**/*'
  - node_modules/electron-updater/**/*
  - node_modules/electron-log/**/*
  # Add hoisted dependencies
  - node_modules/graceful-fs/**/*
  - node_modules/fs-extra/**/*
  - node_modules/jsonfile/**/*
  - node_modules/universalify/**/*
  - node_modules/debug/**/*
  - node_modules/ms/**/*
  - node_modules/sax/**/*
  - node_modules/js-yaml/**/*
  - node_modules/argparse/**/*
  - node_modules/lazy-val/**/*
  - node_modules/lodash.escaperegexp/**/*
  - node_modules/lodash.isequal/**/*
  - node_modules/semver/**/*
  - node_modules/tiny-typed-emitter/**/*
  - node_modules/builder-util-runtime/**/*
```

### Option B: Use asarUnpack for Native Modules Pattern

```yaml
files:
  - dist/**/*
  - renderer/**/*
  - resources/**/*
  # Include all production dependencies
  - node_modules/**/*
  # Exclude devDependencies explicitly
  - '!node_modules/electron/**'
  - '!node_modules/electron-builder/**'
  - '!node_modules/typescript/**'
  - '!node_modules/ts-node/**'
  - '!node_modules/@types/**'
  # ... other devDeps
```

### Option C: Simplest - Remove Exclusion

```yaml
files:
  - dist/**/*
  - renderer/**/*
  - resources/**/*
  # Don't exclude node_modules, let electron-builder handle it
  # electron-builder automatically excludes devDependencies
```

**Note:** Option C relies on electron-builder's built-in devDependency detection, which uses `package.json` to determine what to exclude.

---

## Why This Wasn't Caught Earlier

1. **Works in development** - `npm run dev` has full node_modules available
2. **Works during build** - electron-builder runs from full node_modules
3. **Fails only at runtime** - packaged app has incomplete node_modules in asar
4. **Error appears on import** - `electron-updater` is imported at app startup

---

## Validation Steps After Fix

1. Apply fix to `electron-builder.yml`
2. Run local build: `cd desktop && npm run build`
3. Check asar contents:
   ```bash
   npx asar list release/win-unpacked/resources/app.asar | grep graceful
   ```
4. Install and run the packaged app
5. Verify auto-updater initializes without error

---

## Root Cause Summary

| Factor            | Description                                      |
| ----------------- | ------------------------------------------------ |
| **Mechanism**     | npm dependency hoisting                          |
| **Configuration** | Overly aggressive `!node_modules/**/*` exclusion |
| **Missing**       | Hoisted production dependencies not re-included  |
| **Symptom**       | Runtime module resolution failure                |

---

## Unresolved Questions

1. **Which other hoisted deps are missing?** - Need to audit full production dependency tree and compare with asar contents
2. **Should we switch to bundling?** - Using esbuild/webpack to bundle main process would avoid this entirely
3. **Why is graceful-fs hoisted?** - It's shared between production (electron-updater) and dev deps (electron-builder uses same version), npm optimizes by hoisting

---

## References

- electron-builder files config: https://www.electron.build/contents
- npm hoisting: https://docs.npmjs.com/cli/v8/configuring-npm/package-lock-json#packages
- Node.js module resolution: https://nodejs.org/api/modules.html#all-together
