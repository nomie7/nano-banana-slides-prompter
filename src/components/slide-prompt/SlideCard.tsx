import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Check, Copy, Sparkles, Loader2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { usePromptOptimizer } from '@/hooks/usePromptOptimizer';
import { OptimizationDiff } from '@/components/optimizer/OptimizationDiff';
import type { ParsedSlide } from '@/types/slidePrompt';

interface SlideCardProps {
  slide: ParsedSlide;
  defaultOpen?: boolean;
  isNew?: boolean;
  animationDelay?: number;
  onPromptUpdate?: (slideNumber: number, newPrompt: string) => void;
}

export function SlideCard({
  slide,
  defaultOpen = false,
  isNew = false,
  animationDelay = 0,
  onPromptUpdate,
}: SlideCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isEditing, setIsEditing] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState(slide.prompt);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  // Sync editedPrompt with slide.prompt when slide changes
  useEffect(() => {
    setEditedPrompt(slide.prompt);
  }, [slide.prompt]);

  const [copied, setCopied] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(!isNew);
  const [showOptimizationDiff, setShowOptimizationDiff] = useState(false);
  const { toast } = useToast();
  const { isOptimizing, result, optimize, reset } = usePromptOptimizer();

  useEffect(() => {
    if (isNew && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 500 + animationDelay);
      return () => clearTimeout(timer);
    }
  }, [isNew, hasAnimated, animationDelay]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();

    try {
      await navigator.clipboard.writeText(slide.prompt);
      setCopied(true);
      toast({
        title: t('toast.copiedSlide'),
        description: t('slideCard.copiedSlide', { number: slide.slideNumber }),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('toast.copyFailed'),
        description: t('toast.copyFailedHint'),
        variant: 'destructive',
      });
    }
  };

  const animationClass = isNew && !hasAnimated ? 'animate-slide-up' : '';

  const animationStyle = isNew && !hasAnimated ? { animationDelay: `${animationDelay}ms` } : {};

  const handleOptimize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await optimize(slide.prompt);
    if (result) {
      setShowOptimizationDiff(true);
    }
  };

  const handleAcceptOptimization = (optimizedPrompt: string) => {
    if (onPromptUpdate) {
      onPromptUpdate(slide.slideNumber, optimizedPrompt);
    }
    reset();
  };

  const handleRejectOptimization = () => {
    reset();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setIsOpen(true);
    // Focus textarea after render
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSaveEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onPromptUpdate && editedPrompt.trim() !== slide.prompt) {
      onPromptUpdate(slide.slideNumber, editedPrompt.trim());
      toast({
        title: t('slideCard.editSaved', 'Saved'),
        description: t('slideCard.editSavedDesc', 'Prompt updated successfully'),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedPrompt(slide.prompt);
    setIsEditing(false);
  };

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-200 hover:border-border ${animationClass}`}
      style={animationStyle}
    >
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              {slide.slideNumber}
            </div>
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">{slide.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Edit button - only show when onPromptUpdate is provided */}
            {onPromptUpdate && !isEditing && (
              <Button
                onClick={handleEdit}
                variant="ghost"
                size="sm"
                className="h-8 px-3 opacity-70 hover:opacity-100 transition-opacity"
              >
                <Pencil className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                <span className="text-xs">{t('buttons.edit', 'Edit')}</span>
              </Button>
            )}
            <Button
              onClick={handleOptimize}
              variant="ghost"
              size="sm"
              className="h-8 px-3 opacity-70 hover:opacity-100 transition-opacity"
              disabled={isOptimizing || isEditing}
            >
              {isOptimizing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  <span className="text-xs">{t('buttons.optimizing', 'Optimizing...')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-yellow-500" />
                  <span className="text-xs">{t('buttons.optimize', 'Optimize')}</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleCopy}
              variant="ghost"
              size="sm"
              className="h-8 px-3 opacity-70 hover:opacity-100 transition-opacity"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                  <span className="text-xs">{t('buttons.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  <span className="text-xs">{t('buttons.copy')}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                ref={textareaRef}
                value={editedPrompt}
                onChange={(e) => setEditedPrompt(e.target.value)}
                className="min-h-[200px] font-mono text-sm resize-y"
                placeholder={t('slideCard.editPlaceholder', 'Enter your prompt...')}
              />
              <div className="flex justify-end gap-2">
                <Button onClick={handleCancelEdit} variant="outline" size="sm" className="h-8">
                  <X className="h-3.5 w-3.5 mr-1.5" />
                  {t('buttons.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleSaveEdit} variant="default" size="sm" className="h-8">
                  <Check className="h-3.5 w-3.5 mr-1.5" />
                  {t('buttons.save', 'Save')}
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 border border-border/30">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {slide.prompt}
              </pre>
            </div>
          )}
        </div>
      </CollapsibleContent>

      {/* Optimization diff dialog */}
      {result && (
        <OptimizationDiff
          result={result}
          open={showOptimizationDiff}
          onOpenChange={setShowOptimizationDiff}
          onAccept={handleAcceptOptimization}
          onReject={handleRejectOptimization}
        />
      )}
    </Collapsible>
  );
}
