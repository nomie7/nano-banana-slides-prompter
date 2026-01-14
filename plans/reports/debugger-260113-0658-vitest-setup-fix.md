# Debugger Report: Vitest Setup Fix

**ID:** 260113-0658
**Date:** 2026-01-13
**Status:** RESOLVED

## Executive Summary

- **Issue:** Vitest tests failing with "failed to find the runner" and "No test suite found" errors
- **Root Cause:** Top-level `vi` imports and usage in setup and test files
- **Resolution:** Moved all `vi.fn()` and `vi.stubGlobal()` calls from top-level into `beforeEach` blocks

## Problem Analysis

### Error Messages

1. `Error: Vitest failed to find the runner`
2. `Error: No test suite found in file`

### Root Cause

Vitest's `vi` object is only available within test context (inside `describe`/`it`/`beforeEach` blocks). Using `vi` at module top-level causes initialization errors because:

- Setup files run before Vitest runner is fully initialized
- Test file top-level code executes during module loading, before test context exists

### Affected Files

1. `vitest-setup.ts` - imported `vi` from 'vitest' and used `vi.fn()`, `vi.stubGlobal()`
2. `src/lib/__tests__/export.test.ts` - used `vi.fn()` at top-level (lines 6-9)
3. `src/stores/__tests__/sessionStore.test.ts` - used `vi.fn()` and `vi.stubGlobal()` at top-level (lines 6-12)

## Changes Made

### 1. vitest-setup.ts

**Before:**

```typescript
import { vi } from 'vitest';
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
vi.stubGlobal('import.meta', { ... });
```

**After:**

```typescript
// No vitest import - use native functions
global.URL.createObjectURL = (() => 'blob:mock-url') as typeof URL.createObjectURL;
global.URL.revokeObjectURL = (() => {}) as typeof URL.revokeObjectURL;
```

### 2. export.test.ts

**Before:**

```typescript
const mockCreateElement = vi.fn(); // top-level - ERROR
```

**After:**

```typescript
let mockCreateElement: ReturnType<typeof vi.fn>; // declaration only
beforeEach(() => {
  mockCreateElement = vi.fn(); // initialized inside beforeEach - OK
});
```

### 3. sessionStore.test.ts

**Before:**

```typescript
const mockFetch = vi.fn(); // top-level - ERROR
vi.stubGlobal('fetch', mockFetch); // top-level - ERROR
```

**After:**

```typescript
let mockFetch: ReturnType<typeof vi.fn>; // declaration only
describe('sessionStore', () => {
  beforeEach(() => {
    mockFetch = vi.fn(); // initialized inside beforeEach - OK
    vi.stubGlobal('fetch', mockFetch);
  });
});
```

## Test Results

```
Test Files  3 passed (3)
     Tests  75 passed (75)
  Duration  4.42s
```

All 75 tests now pass successfully:

- `promptGenerator.test.ts`: 13 tests
- `export.test.ts`: 22 tests
- `sessionStore.test.ts`: 40 tests

## Key Takeaways

1. **Never import `vi` in setup files** - use native JavaScript functions instead
2. **Never use `vi.fn()` at top-level in test files** - declare variables and initialize inside `beforeEach`
3. **`vi.stubGlobal()` must be called inside test context** - not at module top-level

## Unresolved Questions

None - all issues resolved.
