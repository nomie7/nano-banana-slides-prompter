---
title: 'Language Output Feature'
description: 'Add output language selection and pass-through mode to Generate Prompt flow'
status: completed
priority: P2
effort: 3h
branch: main
tags: [i18n, prompt-generation, ux]
created: 2026-01-12
reviewed: 2026-01-12
---

# Language Output Feature Implementation Plan

## Overview

Add output language selection to the Generate Prompt flow, enabling users to generate slide prompts in their preferred language while preserving technical terms from source content.

## Problem Statement

Current system generates prompts only in English. Users need:

1. **Output Language Selection** - choose prompt output language (10 languages)
2. **Pass-through Mode** - preserve technical terms/proper nouns from source

## Solution Approach

**LLM-driven Translation** - inject language instruction into prompt. Minimal code changes (~100-150 LOC), leverages LLM multilingual capabilities.

## Supported Languages

| Code | Language   | Native           |
| ---- | ---------- | ---------------- |
| en   | English    | English          |
| vi   | Vietnamese | Tiếng Việt       |
| zh   | Chinese    | 中文             |
| ja   | Japanese   | 日本語           |
| ko   | Korean     | 한국어           |
| th   | Thai       | ภาษาไทย          |
| id   | Indonesian | Bahasa Indonesia |
| fr   | French     | Français         |
| de   | German     | Deutsch          |
| es   | Spanish    | Español          |

## Implementation Phases

| Phase | Description        | Status    | File                                                               |
| ----- | ------------------ | --------- | ------------------------------------------------------------------ |
| 1     | Types & Constants  | completed | [phase-01-types-constants.md](./phase-01-types-constants.md)       |
| 2     | UI Component       | completed | [phase-02-ui-component.md](./phase-02-ui-component.md)             |
| 3     | API & Server       | completed | [phase-03-api-server.md](./phase-03-api-server.md)                 |
| 4     | Prompt Engineering | completed | [phase-04-prompt-engineering.md](./phase-04-prompt-engineering.md) |

## Files to Modify

| File                                                   | Changes                        |
| ------------------------------------------------------ | ------------------------------ |
| `src/types/slidePrompt.ts`                             | Add `OutputLanguage` type      |
| `src/components/slide-prompt/PresentationSettings.tsx` | Add language dropdown          |
| `src/i18n/locales/en.json`                             | Add language option labels     |
| `src/i18n/locales/zh.json`                             | Add language option labels     |
| `server/src/routes/prompt.ts`                          | Update Zod schema              |
| `server/src/prompts/system.ts`                         | Add language instruction block |

## Success Criteria

- [x] User can select output language in PresentationSettings
- [x] Generated prompts in target language (labels + content)
- [x] Technical terms preserved from source content
- [x] Works with all 20 visual styles
- [x] Works with character presenter enabled

## References

- Brainstorm Report: [brainstorm-260112-2023-language-output-feature.md](../reports/brainstorm-260112-2023-language-output-feature.md)
- System Architecture: [system-architecture.md](../../docs/system-architecture.md)
- Code Standards: [code-standards.md](../../docs/code-standards.md)
