# Prompt Optimization & Template Library Research

**Date:** 2026-01-13 | **Project:** Nano Banana Slides Prompter

---

## 1. Prompt Optimization Patterns

### 1.1 Self-Refine Prompting (Recommended)

LLM iteratively improves own output: generate -> critique -> refine.

**Implementation:**

```typescript
// services/promptOptimizer.ts
interface OptimizationResult {
  original: string;
  refined: string;
  iterations: number;
  improvements: string[];
}

async function optimizePrompt(prompt: string, maxIterations = 2): Promise<OptimizationResult> {
  let current = prompt;
  const improvements: string[] = [];

  for (let i = 0; i < maxIterations; i++) {
    const critique = await llm.complete({
      system:
        'You are a prompt critic. Identify weaknesses in clarity, specificity, visual detail.',
      user: `Critique this slide prompt:\n${current}\n\nList 3 specific improvements.`,
    });

    const refined = await llm.complete({
      system: 'You are a prompt refiner. Apply improvements while keeping style.',
      user: `Original:\n${current}\n\nImprovements:\n${critique}\n\nOutput refined prompt.`,
    });

    improvements.push(critique);
    current = refined;
  }

  return { original: prompt, refined: current, iterations: maxIterations, improvements };
}
```

**Pros:** +15-30% quality improvement, no training needed, works with any LLM
**Cons:** 2-3x API calls, added latency (~2-5s per iteration)

### 1.2 Few-Shot Enhancement

Inject high-quality examples for consistent output style.

```typescript
const EXEMPLAR_PROMPTS = {
  professional: `Slide: "Q3 Revenue Growth"\nVisual: Split-screen composition...`,
  creative: `Slide: "Innovation Unleashed"\nVisual: Explosive particle burst...`,
};

function enhanceWithExamples(prompt: string, style: SlideStyle): string {
  return `Example of excellent ${style} slide prompt:\n${EXEMPLAR_PROMPTS[style]}\n\n---\nNow generate:\n${prompt}`;
}
```

**Pros:** Consistent quality, minimal overhead
**Cons:** Requires curated examples, may limit creativity

### 1.3 Chain-of-Thought for Complex Slides

Break generation into reasoning steps.

```typescript
const COT_SYSTEM = `Before generating the slide prompt:
1. Identify key message
2. Choose visual metaphor
3. Plan component placement
4. Draft visual description
5. Output final prompt`;
```

**Pros:** Better for data/technical slides
**Cons:** Verbose output needs parsing

---

## 2. Template Library Architecture

### 2.1 Current State Analysis

Project already has solid foundation:

- `PromptTemplate` interface with `id`, `name`, `category`, `config`, `version`
- Category-based JSON files: business, education, creative, presentation
- Lazy loading with cache (`templateCache`)

### 2.2 Recommended Enhancements

**A. Add Marketing & Tech Categories**

```json
// categories/marketing.json
{
  "category": "marketing",
  "templates": [
    {
      "id": "product-launch",
      "name": "Product Launch",
      "tags": ["launch", "announcement", "product"],
      "config": { "style": "gradient-mesh", "colorPalette": "vibrant-gradient" },
      "version": "1.0.0"
    }
  ]
}
```

**B. Template Customization Layer**

```typescript
// types/template.ts
interface CustomizedTemplate extends PromptTemplate {
  baseTemplateId: string;
  customizations: Partial<TemplateConfig>;
  createdAt: Date;
  userId?: string;
}

// Store user customizations in localStorage/IndexedDB
function saveCustomTemplate(
  base: PromptTemplate,
  overrides: Partial<TemplateConfig>
): CustomizedTemplate {
  return {
    ...base,
    id: `custom-${base.id}-${Date.now()}`,
    baseTemplateId: base.id,
    customizations: overrides,
    createdAt: new Date(),
  };
}
```

**C. Semantic Versioning for Templates**

```typescript
// Already has version field - extend with migration support
interface TemplateMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (config: TemplateConfig) => TemplateConfig;
}

const migrations: TemplateMigration[] = [
  {
    fromVersion: '1.0.0',
    toVersion: '1.1.0',
    migrate: (config) => ({ ...config, outputLanguage: config.outputLanguage ?? 'en' }),
  },
];
```

**Pros:** Backward compatible, user personalization, easy expansion
**Cons:** Storage management for custom templates

---

## 3. Batch Processing Patterns

### 3.1 Queue-Based Generation (Recommended)

```typescript
// lib/batchQueue.ts
interface BatchJob {
  id: string;
  topic: string;
  config: SlidePromptConfig;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: GeneratedPrompt;
  error?: string;
}

interface BatchState {
  jobs: BatchJob[];
  currentIndex: number;
  isRunning: boolean;
  abortController: AbortController | null;
}

class BatchProcessor {
  private state: BatchState = {
    jobs: [],
    currentIndex: 0,
    isRunning: false,
    abortController: null,
  };
  private onProgress?: (completed: number, total: number, current: BatchJob) => void;

  addJobs(topics: string[], baseConfig: SlidePromptConfig): void {
    const newJobs = topics.map((topic, i) => ({
      id: `batch-${Date.now()}-${i}`,
      topic,
      config: { ...baseConfig, content: { type: 'topic' as const, topic } },
      status: 'pending' as const,
    }));
    this.state.jobs.push(...newJobs);
  }

  async start(): Promise<BatchJob[]> {
    this.state.isRunning = true;
    this.state.abortController = new AbortController();

    for (let i = this.state.currentIndex; i < this.state.jobs.length; i++) {
      if (!this.state.isRunning) break;

      const job = this.state.jobs[i];
      job.status = 'processing';
      this.onProgress?.(i, this.state.jobs.length, job);

      try {
        job.result = await generatePrompt(job.config, this.state.abortController.signal);
        job.status = 'completed';
      } catch (err) {
        job.status = 'failed';
        job.error = err instanceof Error ? err.message : 'Unknown error';
      }

      this.state.currentIndex = i + 1;
    }

    this.state.isRunning = false;
    return this.state.jobs;
  }

  cancel(): void {
    this.state.isRunning = false;
    this.state.abortController?.abort();
  }

  getProgress(): { completed: number; total: number; percentage: number } {
    const completed = this.state.jobs.filter((j) => j.status === 'completed').length;
    return {
      completed,
      total: this.state.jobs.length,
      percentage: (completed / this.state.jobs.length) * 100,
    };
  }
}
```

### 3.2 React Hook Integration

```typescript
// hooks/useBatchGeneration.ts
function useBatchGeneration() {
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const processorRef = useRef<BatchProcessor>(new BatchProcessor());

  const startBatch = async (topics: string[], config: SlidePromptConfig) => {
    processorRef.current.addJobs(topics, config);
    processorRef.current.onProgress = (completed, total, current) => {
      setProgress({ completed, total });
      setJobs([...processorRef.current.state.jobs]);
    };
    await processorRef.current.start();
  };

  const cancelBatch = () => processorRef.current.cancel();

  return { jobs, progress, startBatch, cancelBatch };
}
```

**Pros:** Controlled concurrency, resume capability, clear progress tracking
**Cons:** More complex state management

---

## 4. Recommendations Summary

| Feature                | Approach                       | Priority | Effort |
| ---------------------- | ------------------------------ | -------- | ------ |
| Prompt Optimization    | Self-Refine (2 iterations)     | High     | Medium |
| Template Categories    | Add Marketing, Tech JSON files | Medium   | Low    |
| Template Customization | LocalStorage-based overrides   | Medium   | Medium |
| Batch Processing       | Queue with AbortController     | High     | Medium |

### Integration with Existing Code

Current `useStreamingGeneration.ts` already has:

- AbortController pattern (line 102)
- Session-based state tracking
- Error handling

Batch processing can reuse this infrastructure by wrapping multiple sessions.

---

## Unresolved Questions

1. Should prompt optimization be opt-in (toggle) or always-on?
2. Max batch size limit? (suggest 10-20 topics)
3. Store batch results in sessions or separate storage?

---

**Sources:**

- [Learn Prompting - Self-Refine](https://learnprompting.org)
- [Mirascope - Prompt Engineering](https://mirascope.com)
- [BullMQ - Queue Processing](https://bullmq.io)
- [Medium - Batch Processing Patterns](https://medium.com)
