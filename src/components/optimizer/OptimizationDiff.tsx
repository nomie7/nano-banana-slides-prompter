/**
 * OptimizationDiff Component
 * Shows before/after comparison of optimized prompts
 */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, X, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { OptimizationResult } from '@/hooks/usePromptOptimizer';

interface OptimizationDiffProps {
  result: OptimizationResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: (optimizedPrompt: string) => void;
  onReject: () => void;
}

export function OptimizationDiff({
  result,
  open,
  onOpenChange,
  onAccept,
  onReject,
}: OptimizationDiffProps) {
  const { t } = useTranslation();
  const [view, setView] = useState<'side-by-side' | 'optimized'>('side-by-side');

  const handleAccept = () => {
    onAccept(result.optimized);
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('optimizer.title', 'Prompt Optimization')}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span>{t('optimizer.reviewChanges', 'Review the suggested improvements')}</span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-mono">
                {result.score.before}/10
              </Badge>
              <ArrowRight className="h-3 w-3 text-muted-foreground" />
              <Badge variant="default" className="font-mono bg-green-600">
                {result.score.after}/10
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* View toggle */}
          <div className="flex gap-2">
            <Button
              variant={view === 'side-by-side' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('side-by-side')}
            >
              {t('optimizer.sideBySide', 'Side by Side')}
            </Button>
            <Button
              variant={view === 'optimized' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setView('optimized')}
            >
              {t('optimizer.optimizedOnly', 'Optimized Only')}
            </Button>
          </div>

          {/* Improvements list */}
          {result.improvements.length > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
              <h4 className="text-sm font-medium mb-2">
                {t('optimizer.improvements', 'Improvements Made')}:
              </h4>
              <ul className="space-y-1">
                {result.improvements.map((improvement, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <Check className="h-3 w-3 mt-1 text-green-500 shrink-0" />
                    <span>{improvement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Content comparison */}
          {view === 'side-by-side' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {t('optimizer.original', 'Original')}
                </h4>
                <div className="bg-muted/50 rounded-lg p-3 border border-border/30 max-h-64 overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{result.original}</pre>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-green-600">
                  {t('optimizer.optimized', 'Optimized')}
                </h4>
                <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/30 max-h-64 overflow-auto">
                  <pre className="text-sm whitespace-pre-wrap font-mono">{result.optimized}</pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-600">
                {t('optimizer.optimized', 'Optimized')}
              </h4>
              <div className="bg-green-500/5 rounded-lg p-3 border border-green-500/30 max-h-80 overflow-auto">
                <pre className="text-sm whitespace-pre-wrap font-mono">{result.optimized}</pre>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleReject}>
            <X className="h-4 w-4 mr-2" />
            {t('optimizer.reject', 'Keep Original')}
          </Button>
          <Button onClick={handleAccept} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            {t('optimizer.accept', 'Use Optimized')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
