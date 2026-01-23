/**
 * useBatchGeneration Hook
 * React hook for batch prompt generation
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { BatchProcessor } from '@/lib/batch-processor';
import type { BatchState, BatchConfig } from '@/types/batch';
import { MAX_BATCH_TOPICS } from '@/types/batch';
import type { LLMConfig } from '@/types/slidePrompt';

const MAX_TOPICS = MAX_BATCH_TOPICS;

interface UseBatchGenerationOptions {
  config: BatchConfig;
  llmConfig?: LLMConfig;
}

interface UseBatchGenerationReturn {
  state: BatchState;
  addTopics: (topics: string[]) => boolean;
  start: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
  isProcessing: boolean;
  canAddMore: boolean;
}

const initialState: BatchState = {
  jobs: [],
  isProcessing: false,
  currentJobIndex: -1,
  totalJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
};

export function useBatchGeneration(options: UseBatchGenerationOptions): UseBatchGenerationReturn {
  const [state, setState] = useState<BatchState>(initialState);
  const processorRef = useRef<BatchProcessor | null>(null);
  const configRef = useRef(options.config);
  const llmConfigRef = useRef(options.llmConfig);

  // Reset processor when config changes (Fix: MEMORY issue)
  useEffect(() => {
    const configChanged = JSON.stringify(configRef.current) !== JSON.stringify(options.config);
    const llmConfigChanged =
      JSON.stringify(llmConfigRef.current) !== JSON.stringify(options.llmConfig);

    if ((configChanged || llmConfigChanged) && processorRef.current && !state.isProcessing) {
      processorRef.current = null;
      configRef.current = options.config;
      llmConfigRef.current = options.llmConfig;
    }
  }, [options.config, options.llmConfig, state.isProcessing]);

  const getOrCreateProcessor = useCallback(() => {
    if (!processorRef.current) {
      processorRef.current = new BatchProcessor(options.config, options.llmConfig);
      processorRef.current.setCallbacks(
        (newState) => setState(newState),
        () => {} // Job update callback (optional)
      );
    }
    return processorRef.current;
  }, [options.config, options.llmConfig]);

  const addTopics = useCallback(
    (topics: string[]): boolean => {
      const processor = getOrCreateProcessor();
      const currentCount = processor.getState().totalJobs;
      const validTopics = topics.filter((t) => t.trim().length > 0);

      if (currentCount + validTopics.length > MAX_TOPICS) {
        return false;
      }

      processor.addTopics(validTopics);
      setState(processor.getState());
      return true;
    },
    [getOrCreateProcessor]
  );

  const start = useCallback(async () => {
    const processor = getOrCreateProcessor();
    await processor.start();
    setState(processor.getState());
  }, [getOrCreateProcessor]);

  const cancel = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.cancel();
      setState(processorRef.current.getState());
    }
  }, []);

  const reset = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.reset();
      setState(processorRef.current.getState());
    }
    processorRef.current = null;
    setState(initialState);
  }, []);

  return {
    state,
    addTopics,
    start,
    cancel,
    reset,
    isProcessing: state.isProcessing,
    canAddMore: state.totalJobs < MAX_TOPICS,
  };
}
