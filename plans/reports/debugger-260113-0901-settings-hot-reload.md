# Debugger Report: Settings Hot-Reload Issue

**ID:** debugger-260113-0901-settings-hot-reload
**Date:** 2026-01-13
**Status:** Root Cause Identified

---

## Executive Summary

**Issue:** When user changes LLM settings (API Key, Base URL, Model) and saves them, the new settings are NOT applied immediately. App restart required.

**Root Cause:** The `useLLMSettings()` hook reads from `localStorage` only ONCE on mount (inside `useEffect` with empty dependency array `[]`). There is NO mechanism to re-read settings when they change.

**Impact:** Poor UX - users expect settings to apply immediately after saving.

---

## Technical Analysis

### 1. Settings Storage Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     CURRENT FLOW (BROKEN)                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [App Start] ──► useLLMSettings() ──► localStorage.getItem()    │
│                      │                                          │
│                      ▼                                          │
│              settings state (cached)                            │
│                      │                                          │
│                      ▼                                          │
│              Index.tsx uses llmSettings ──► generate()          │
│                                                                 │
│  [User Saves Settings]                                          │
│       │                                                         │
│       ▼                                                         │
│  SettingsDialog.handleSave() ──► localStorage.setItem()         │
│       │                                                         │
│       ▼                                                         │
│  Dialog closes... BUT useLLMSettings() NEVER RE-READS!          │
│                                                                 │
│  ❌ llmSettings in Index.tsx still has OLD values               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Key Files & Code Locations

#### A. `src/components/SettingsDialog.tsx`

**Lines 25-38 - The `useLLMSettings` hook (PROBLEM SOURCE):**

```typescript
export function useLLMSettings() {
  const [settings, setSettings] = useState<LLMSettings | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch {
      /* ignore */
    }
  }, []); // ⚠️ EMPTY DEPENDENCY ARRAY = runs ONLY on mount

  return { settings }; // ⚠️ No way to trigger re-read
}
```

**Lines 78-111 - The `handleSave` function:**

```typescript
const handleSave = () => {
  // ... validation ...
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ apiKey: apiKey.trim(), baseURL: baseURL.trim(), model: model.trim() })
  );
  toast({ title: t('settings.saved') });
  setOpen(false);
  // ⚠️ NO notification to other components that settings changed!
};
```

#### B. `src/pages/Index.tsx`

**Line 44 - Consuming the hook:**

```typescript
const { settings: llmSettings } = useLLMSettings();
```

**Lines 110-116 - Using settings for generation:**

```typescript
generate({
  content,
  style,
  settings,
  llmConfig: llmSettings || undefined, // Uses stale cached value
});
```

### 3. Why It Breaks

| Step | What Happens                            | Problem                                      |
| ---- | --------------------------------------- | -------------------------------------------- |
| 1    | App loads, `useLLMSettings()` runs      | Reads localStorage once, stores in state     |
| 2    | User opens Settings dialog              | Dialog has its own local state               |
| 3    | User changes values and saves           | `localStorage.setItem()` called              |
| 4    | Dialog closes                           | Toast shows "Saved"                          |
| 5    | User clicks Generate                    | `llmSettings` still has **old cached value** |
| 6    | Generation uses wrong API key/URL/model | **BUG!**                                     |

### 4. Missing Mechanism

There are **3 possible solutions** that are NOT implemented:

1. **Storage event listener** - Listen for `window.addEventListener('storage', ...)`
   - Only works cross-tab, NOT same-tab changes

2. **Zustand/global state** - Store settings in Zustand store with proper reactivity
   - Would require refactoring

3. **Callback/event pattern** - `useLLMSettings` exposes a `refresh()` function or the dialog triggers a re-render
   - Simplest fix

---

## Files Requiring Modification

| File                                | Line(s) | Change Required                                        |
| ----------------------------------- | ------- | ------------------------------------------------------ |
| `src/components/SettingsDialog.tsx` | 25-38   | Add mechanism to notify consumers when settings change |
| `src/components/SettingsDialog.tsx` | 105-110 | After `localStorage.setItem`, trigger state update     |
| `src/pages/Index.tsx`               | 44      | May need to consume updated hook                       |

---

## Recommended Fix Approaches

### Option A: Add refresh callback to hook (Simplest)

```typescript
// SettingsDialog.tsx
export function useLLMSettings() {
  const [settings, setSettings] = useState<LLMSettings | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setSettings(JSON.parse(stored));
  }, [refreshKey]);

  const refresh = () => setRefreshKey((k) => k + 1);
  return { settings, refresh };
}
```

Problem: Still need way to call `refresh()` from SettingsDialog.

### Option B: Use Zustand store for settings (Recommended)

Create `src/stores/settingsStore.ts`:

- Store LLM settings in Zustand
- Persist to localStorage via middleware
- All consumers auto-update when state changes

### Option C: Custom event pattern

```typescript
// After save in handleSave():
window.dispatchEvent(new CustomEvent('llm-settings-changed'));

// In useLLMSettings:
useEffect(() => {
  const handler = () => {
    /* re-read localStorage */
  };
  window.addEventListener('llm-settings-changed', handler);
  return () => window.removeEventListener('llm-settings-changed', handler);
}, []);
```

---

## Additional Context

### Desktop (Electron) Settings

The desktop app has a **separate** config system:

- `desktop/src/config-manager.ts` - File-based JSON config
- Uses IPC handlers: `get-config`, `set-config`, `get-llm-config`, `set-llm-config`
- `desktop/src/preload.ts` exposes `window.electronAPI.getLLMConfig()` etc.

**However**, the web frontend (`src/components/SettingsDialog.tsx`) does NOT use Electron IPC at all - it only uses browser `localStorage`. This means:

- In Electron desktop app, there are TWO config systems that may conflict
- The hot-reload issue affects both web and desktop builds

---

## Unresolved Questions

1. Should Electron desktop use `window.electronAPI.setLLMConfig()` instead of localStorage?
2. Is there intentional separation between web localStorage and Electron file config?
3. Should settings be migrated to Zustand store for consistency with session management?

---

## Summary

| Aspect                | Details                                                                                           |
| --------------------- | ------------------------------------------------------------------------------------------------- |
| **Root Cause**        | `useLLMSettings()` hook has empty `useEffect` dependency array - reads localStorage only on mount |
| **Location**          | `src/components/SettingsDialog.tsx:25-38`                                                         |
| **Why no hot-reload** | No event/callback mechanism exists to notify consumers when settings are saved                    |
| **Recommended Fix**   | Option B (Zustand store) for consistency with existing architecture                               |
| **Effort Estimate**   | ~1-2 hours for Zustand approach, ~30 min for event pattern approach                               |
