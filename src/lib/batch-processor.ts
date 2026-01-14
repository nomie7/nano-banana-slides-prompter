/**
 * Batch Processor
 * Manages batch processing of multiple topics
 */
import type { BatchJob, BatchConfig, BatchState, BatchJobStatus } from '@/types/batch';
import type { ParsedSlide, LLMConfig } from '@/types/slidePrompt';
import { generatePromptStream } from '@/lib/api';

type ProgressCallback = (state: BatchState) => void;
type JobUpdateCallback = (job: BatchJob) => void;

export class BatchProcessor {
  private jobs: BatchJob[] = [];
  private config: BatchConfig;
  private llmConfig?: LLMConfig;
  private abortController: AbortController | null = null;
  private isProcessing = false;
  private onProgress?: ProgressCallback;
  private onJobUpdate?: JobUpdateCallback;

  constructor(config: BatchConfig, llmConfig?: LLMConfig) {
    this.config = config;
    this.llmConfig = llmConfig;
  }

  setCallbacks(onProgress?: ProgressCallback, onJobUpdate?: JobUpdateCallback): void {
    this.onProgress = onProgress;
    this.onJobUpdate = onJobUpdate;
  }

  addTopics(topics: string[]): void {
    const newJobs: BatchJob[] = topics.map((topic, index) => ({
      id: `batch-${Date.now()}-${index}`,
      topic: topic.trim(),
      status: 'pending' as BatchJobStatus,
      progress: 0,
      slides: [],
    }));
    this.jobs = [...this.jobs, ...newJobs];
    this.notifyProgress();
  }

  getState(): BatchState {
    return {
      jobs: [...this.jobs],
      isProcessing: this.isProcessing,
      currentJobIndex: this.jobs.findIndex((j) => j.status === 'processing'),
      totalJobs: this.jobs.length,
      completedJobs: this.jobs.filter((j) => j.status === 'completed').length,
      failedJobs: this.jobs.filter((j) => j.status === 'error').length,
    };
  }

  async start(): Promise<void> {
    if (this.isProcessing) return;

    this.isProcessing = true;
    this.abortController = new AbortController();

    for (let i = 0; i < this.jobs.length; i++) {
      if (this.abortController.signal.aborted) break;

      const job = this.jobs[i];
      if (job.status !== 'pending') continue;

      await this.processJob(job, i);
    }

    this.isProcessing = false;
    this.abortController = null;
    this.notifyProgress();
  }

  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }

    // Mark pending jobs as cancelled
    this.jobs = this.jobs.map((job) =>
      job.status === 'pending' || job.status === 'processing'
        ? { ...job, status: 'cancelled' as BatchJobStatus }
        : job
    );

    this.isProcessing = false;
    this.notifyProgress();
  }

  reset(): void {
    this.jobs = [];
    this.isProcessing = false;
    this.abortController = null;
    this.notifyProgress();
  }

  private async processJob(job: BatchJob, index: number): Promise<void> {
    // Update job status to processing
    this.updateJob(index, { status: 'processing', startedAt: Date.now() });

    try {
      const slides: ParsedSlide[] = [];

      const request = {
        content: {
          type: 'topic' as const,
          text: '',
          topic: job.topic,
          fileContent: '',
          fileName: '',
          url: '',
          urlContent: '',
        },
        style: this.config.style,
        settings: this.config.settings,
        llmConfig: this.llmConfig,
      };

      for await (const event of generatePromptStream(request, this.abortController?.signal)) {
        if (event.type === 'slide') {
          slides.push(event.data as ParsedSlide);
          const progress = Math.min((slides.length / this.config.settings.slideCount) * 100, 100);
          this.updateJob(index, { slides: [...slides], progress });
        } else if (event.type === 'done') {
          this.updateJob(index, {
            status: 'completed',
            progress: 100,
            slides,
            completedAt: Date.now(),
          });
        } else if (event.type === 'error') {
          const errorData = event.data as { error: string };
          this.updateJob(index, {
            status: 'error',
            error: errorData.error,
            completedAt: Date.now(),
          });
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.updateJob(index, { status: 'cancelled', completedAt: Date.now() });
      } else {
        this.updateJob(index, {
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: Date.now(),
        });
      }
    }
  }

  private updateJob(index: number, updates: Partial<BatchJob>): void {
    this.jobs[index] = { ...this.jobs[index], ...updates };
    this.onJobUpdate?.(this.jobs[index]);
    this.notifyProgress();
  }

  private notifyProgress(): void {
    this.onProgress?.(this.getState());
  }
}
