/**
 * BatchInput Component
 * Input for multiple topics (one per line) with validation
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ListPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MAX_BATCH_TOPICS } from '@/types/batch';

interface BatchInputProps {
  onAddTopics: (topics: string[]) => boolean;
  currentCount: number;
  disabled?: boolean;
}

export function BatchInput({ onAddTopics, currentCount, disabled }: BatchInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const remainingSlots = MAX_BATCH_TOPICS - currentCount;
  const topics = input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const handleAddTopics = () => {
    setError(null);

    if (topics.length === 0) {
      setError(t('batch.errorEmpty', 'Please enter at least one topic'));
      return;
    }

    if (topics.length > remainingSlots) {
      setError(
        t('batch.errorTooMany', {
          count: remainingSlots,
          defaultValue: `Maximum ${remainingSlots} more topics allowed`,
        })
      );
      return;
    }

    const success = onAddTopics(topics);
    if (success) {
      setInput('');
    } else {
      setError(t('batch.errorAddFailed', 'Failed to add topics'));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ListPlus className="h-4 w-4" />
          {t('batch.inputTitle', 'Batch Topics')}
        </CardTitle>
        <CardDescription>
          {t('batch.inputDescription', 'Enter multiple topics, one per line (max {{max}})', {
            max: MAX_BATCH_TOPICS,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(
            'batch.inputPlaceholder',
            'Business Strategy\nProduct Launch\nQuarterly Report'
          )}
          className="min-h-[120px] resize-none"
          disabled={disabled || remainingSlots === 0}
        />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t('batch.topicCount', '{{count}} topics entered', { count: topics.length })}
            {currentCount > 0 && (
              <span className="ml-2">
                ({t('batch.slotsRemaining', '{{count}} slots remaining', { count: remainingSlots })}
                )
              </span>
            )}
          </div>

          <Button
            onClick={handleAddTopics}
            disabled={disabled || topics.length === 0 || remainingSlots === 0}
            size="sm"
          >
            <ListPlus className="h-4 w-4 mr-2" />
            {t('batch.addTopics', 'Add Topics')}
          </Button>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
