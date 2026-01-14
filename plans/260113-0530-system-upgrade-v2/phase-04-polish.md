# Phase 4: Polish (Optional)

## Context

- [Brainstorm Report](../reports/brainstorm-260113-0520-system-upgrade-analysis.md)

---

## Overview

| Attribute   | Value                                           |
| ----------- | ----------------------------------------------- |
| Priority    | P3 - Low                                        |
| Status      | pending                                         |
| Effort      | 1h (estimated, expand if pursued)               |
| Description | API optimization, additional locales (optional) |

**Note:** This phase is optional and should only be pursued after Phases 1-3 are stable.

---

## Requirements

### Functional

1. **API Delta Sync** (Optional)
   - Only sync changed fields instead of full session
   - Reduce network payload
   - Batch multiple updates

2. **Additional Locales** (Optional)
   - Japanese (ja.json)
   - Korean (ko.json)
   - Requires native speaker translation

### Non-Functional

- Delta sync backward compatible with current API
- Locales follow same structure as existing translations

---

## Related Code Files

### Files to Create (if pursued)

```
public/locales/ja/translation.json   # Japanese (optional)
public/locales/ko/translation.json   # Korean (optional)
```

### Files to Modify (if pursued)

```
src/stores/sessionStore.ts           # Delta sync logic
src/hooks/useSessionSync.ts          # Sync optimization
server/src/routes/sessions.ts        # Handle delta updates
src/i18n/config.ts                   # Add ja, ko
src/components/LanguageSwitcher.tsx  # Add JA, KO options
```

---

## Implementation Steps

### 1. API Delta Sync (If Pursued)

**Current Implementation:**

```typescript
// Full session sync on every change
syncToServer({ sessions, currentSessionId });
```

**Proposed Delta Sync:**

```typescript
interface DeltaUpdate {
  sessionId: string;
  timestamp: number;
  changes: Partial<Session>;
}

// Track changes since last sync
const pendingChanges = new Map<string, Partial<Session>>();

// Debounced delta sync
function syncDelta(sessionId: string, changes: Partial<Session>) {
  const existing = pendingChanges.get(sessionId) || {};
  pendingChanges.set(sessionId, { ...existing, ...changes });

  debouncedFlush();
}

async function flushChanges() {
  const updates = Array.from(pendingChanges.entries()).map(([sessionId, changes]) => ({
    sessionId,
    changes,
  }));

  await api.post('/sessions/batch-update', { updates });
  pendingChanges.clear();
}
```

**Backend Changes:**

```typescript
// New endpoint
app.post('/api/sessions/batch-update', async (c) => {
  const { updates } = await c.req.json();

  for (const { sessionId, changes } of updates) {
    await updateSession(sessionId, changes);
  }

  return c.json({ success: true });
});
```

### 2. Japanese/Korean Locales (If Pursued)

1. Create `public/locales/ja/translation.json`:
   - Copy structure from en/translation.json
   - Professional Japanese translation required

2. Create `public/locales/ko/translation.json`:
   - Copy structure from en/translation.json
   - Professional Korean translation required

3. Update config:

   ```typescript
   export const supportedLanguages = ['en', 'zh', 'vi', 'ja', 'ko'] as const;
   ```

4. Update LanguageSwitcher:

   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'zh', name: '中文', flag: '🇨🇳' },
     { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
     { code: 'ja', name: '日本語', flag: '🇯🇵' },
     { code: 'ko', name: '한국어', flag: '🇰🇷' },
   ];
   ```

5. Update backend output language options

---

## Todo List

### Delta Sync (Optional)

- [ ] Implement change tracking in sessionStore
- [ ] Create delta sync hook
- [ ] Add batch-update endpoint to server
- [ ] Test with rapid config changes
- [ ] Measure payload reduction

### JA/KO Locales (Optional)

- [ ] Find Japanese translator
- [ ] Find Korean translator
- [ ] Create ja/translation.json
- [ ] Create ko/translation.json
- [ ] Update i18n config
- [ ] Update LanguageSwitcher
- [ ] Add to backend output languages
- [ ] Test both locales

---

## Success Criteria

### Delta Sync

1. Network payload reduced by 50%+ for config updates
2. No regression in sync reliability
3. Backward compatible with existing sessions

### JA/KO Locales

1. 100% translation coverage
2. Native speaker validated
3. Proper CJK font rendering

---

## Risk Assessment

| Risk                       | Likelihood | Impact | Mitigation                     |
| -------------------------- | ---------- | ------ | ------------------------------ |
| Delta sync race conditions | Medium     | High   | Use timestamps, server-wins    |
| Translation quality        | High       | Medium | Native speaker review required |
| Scope creep                | Medium     | Medium | Keep optional, defer if needed |
| CJK rendering issues       | Low        | Low    | Test font fallbacks            |

---

## Decision Criteria

**Pursue Delta Sync if:**

- Performance issues observed with current sync
- Multiple concurrent users (not personal use)
- Network latency is a concern

**Pursue JA/KO if:**

- Native translators available
- Target market includes Japan/Korea
- VI translation successful as template

---

## Unresolved Questions

1. Delta sync complexity worth it for personal project?
2. Translation resources for JA/KO available?
3. Should this be v1.3.0 or separate release?
4. Priority order: Delta sync first or locales first?
