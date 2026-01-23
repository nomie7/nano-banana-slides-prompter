/**
 * Batch Processing Types
 * Types for batch prompt generation
 */
import type { SlideStyle, PresentationSettings, ParsedSlide } from './slidePrompt';

export type BatchJobStatus = 'pending' | 'processing' | 'completed' | 'error' | 'cancelled';

export interface BatchJob {
  id: string;
  topic: string;
  status: BatchJobStatus;
  progress: number;
  slides: ParsedSlide[];
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

export interface BatchConfig {
  style: SlideStyle;
  settings: PresentationSettings;
}

export interface BatchState {
  jobs: BatchJob[];
  isProcessing: boolean;
  currentJobIndex: number;
  totalJobs: number;
  completedJobs: number;
  failedJobs: number;
}

export interface BatchProgress {
  jobId: string;
  progress: number;
  status: BatchJobStatus;
  slides?: ParsedSlide[];
  error?: string;
}

export const MAX_BATCH_TOPICS = 10;
