/**
 * BatchPanel Component
 * Collapsible panel for batch processing, integrates with main page
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { BatchInput } from './BatchInput';
import { BatchProgress } from './BatchProgress';
import { useBatchGeneration } from '@/hooks/useBatchGeneration';
import type { SlideStyle, PresentationSettings } from '@/types/slidePrompt';
import type { LLMConfig } from '@/lib/api';

interface BatchPanelProps {
  style: SlideStyle;
  settings: PresentationSettings;
  llmConfig?: LLMConfig;
}

export function BatchPanel({ style, settings, llmConfig }: BatchPanelProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const { state, addTopics, start, cancel, reset, isProcessing } = useBatchGeneration({
    config: { style, settings },
    llmConfig,
  });

  const hasJobs = state.totalJobs > 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>{t('batch.panelTitle', 'Batch Processing')}</span>
            {hasJobs && (
              <Badge variant="secondary" className="ml-2">
                {state.completedJobs}/{state.totalJobs}
              </Badge>
            )}
            {isProcessing && (
              <Badge variant="default" className="ml-1 animate-pulse">
                {t('batch.processing', 'Processing...')}
              </Badge>
            )}
          </div>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-4 space-y-4">
        <BatchInput
          onAddTopics={addTopics}
          currentCount={state.totalJobs}
          disabled={isProcessing}
        />
        <BatchProgress state={state} onStart={start} onCancel={cancel} onReset={reset} />
      </CollapsibleContent>
    </Collapsible>
  );
}
