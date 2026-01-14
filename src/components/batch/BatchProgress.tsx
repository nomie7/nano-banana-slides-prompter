/**
 * BatchProgress Component
 * Displays batch processing progress and job status
 */
import { useTranslation } from 'react-i18next';
import { Loader2, CheckCircle, XCircle, Clock, Ban, Play, Square, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import type { BatchState, BatchJob, BatchJobStatus } from '@/types/batch';

interface BatchProgressProps {
  state: BatchState;
  onStart: () => void;
  onCancel: () => void;
  onReset: () => void;
}

const statusIcons: Record<BatchJobStatus, React.ReactNode> = {
  pending: <Clock className="h-4 w-4 text-muted-foreground" />,
  processing: <Loader2 className="h-4 w-4 text-primary animate-spin" />,
  completed: <CheckCircle className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-destructive" />,
  cancelled: <Ban className="h-4 w-4 text-muted-foreground" />,
};

const statusColors: Record<BatchJobStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  processing: 'bg-primary/10 text-primary',
  completed: 'bg-green-500/10 text-green-600',
  error: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
};

function JobItem({ job }: { job: BatchJob }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card/50">
      {statusIcons[job.status]}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{job.topic}</p>
        {job.status === 'processing' && <Progress value={job.progress} className="h-1 mt-1" />}
        {job.status === 'completed' && (
          <p className="text-xs text-muted-foreground">
            {t('batch.slidesGenerated', '{{count}} slides', { count: job.slides.length })}
          </p>
        )}
        {job.status === 'error' && job.error && (
          <p className="text-xs text-destructive truncate">{job.error}</p>
        )}
      </div>
      <Badge variant="secondary" className={statusColors[job.status]}>
        {t(`batch.status.${job.status}`, job.status)}
      </Badge>
    </div>
  );
}

export function BatchProgress({ state, onStart, onCancel, onReset }: BatchProgressProps) {
  const { t } = useTranslation();

  const overallProgress =
    state.totalJobs > 0
      ? Math.round(((state.completedJobs + state.failedJobs) / state.totalJobs) * 100)
      : 0;

  const canStart = state.totalJobs > 0 && !state.isProcessing;
  const isComplete =
    state.totalJobs > 0 && state.completedJobs + state.failedJobs === state.totalJobs;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{t('batch.progressTitle', 'Batch Progress')}</CardTitle>
          <div className="flex items-center gap-2">
            {!state.isProcessing && canStart && !isComplete && (
              <Button onClick={onStart} size="sm">
                <Play className="h-4 w-4 mr-2" />
                {t('batch.start', 'Start')}
              </Button>
            )}
            {state.isProcessing && (
              <Button onClick={onCancel} variant="destructive" size="sm">
                <Square className="h-4 w-4 mr-2" />
                {t('batch.cancel', 'Cancel')}
              </Button>
            )}
            {(isComplete || state.totalJobs === 0) && (
              <Button onClick={onReset} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                {t('batch.reset', 'Reset')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.totalJobs > 0 && (
          <>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {t('batch.overallProgress', 'Overall Progress')}
                </span>
                <span className="font-medium">
                  {state.completedJobs + state.failedJobs} / {state.totalJobs}
                </span>
              </div>
              <Progress value={overallProgress} />
            </div>

            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>
                  {state.completedJobs} {t('batch.completed', 'completed')}
                </span>
              </div>
              {state.failedJobs > 0 && (
                <div className="flex items-center gap-1">
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span>
                    {state.failedJobs} {t('batch.failed', 'failed')}
                  </span>
                </div>
              )}
            </div>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pr-4">
                {state.jobs.map((job) => (
                  <JobItem key={job.id} job={job} />
                ))}
              </div>
            </ScrollArea>
          </>
        )}

        {state.totalJobs === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>{t('batch.noJobs', 'No topics added yet')}</p>
            <p className="text-sm">
              {t('batch.addTopicsHint', 'Add topics to start batch processing')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
