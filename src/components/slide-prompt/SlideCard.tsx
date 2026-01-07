import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronRight, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import type { ParsedSlide } from '@/types/slidePrompt';

interface SlideCardProps {
  slide: ParsedSlide;
  defaultOpen?: boolean;
  isNew?: boolean;
  animationDelay?: number;
}

export function SlideCard({ slide, defaultOpen = false, isNew = false, animationDelay = 0 }: SlideCardProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(defaultOpen);

  useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);
  const [copied, setCopied] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(!isNew);
  const { toast } = useToast();

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

  const animationClass = isNew && !hasAnimated
    ? 'animate-slide-up'
    : '';

  const animationStyle = isNew && !hasAnimated
    ? { animationDelay: `${animationDelay}ms` }
    : {};

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
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4">
          <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-lg p-4 border border-border/30">
            <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {slide.prompt}
            </pre>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
