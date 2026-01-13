import { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, FileText, Code, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { SlideCard } from './SlideCard';
import type { GeneratedPrompt, OutputFormat, ParsedSlide } from '@/types/slidePrompt';

interface PromptOutputProps {
  prompt: GeneratedPrompt | null;
  isStreaming?: boolean;
  streamingSlides?: ParsedSlide[];
  expectedSlideCount?: number;
}

function SlideSkeleton() {
  return (
    <div className="border border-border/50 rounded-lg bg-card/50 backdrop-blur-sm overflow-hidden animate-skeleton">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted rounded animate-pulse" />
            <div className="w-32 h-5 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-8 bg-muted rounded animate-pulse" />
      </div>
    </div>
  );
}

export function PromptOutput({
  prompt,
  isStreaming = false,
  streamingSlides = [],
  expectedSlideCount = 10,
}: PromptOutputProps) {
  const { t } = useTranslation();
  const [format, setFormat] = useState<OutputFormat>('text');
  const [copied, setCopied] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);
  const { toast } = useToast();

  const seenSlidesRef = useRef<Set<number>>(new Set());
  const prevStreamingRef = useRef(false);
  const prevSlidesLengthRef = useRef(0);

  // Compute new slides using useMemo instead of useEffect + setState
  const newSlides = useMemo(() => {
    // Reset when streaming starts fresh
    if (isStreaming && streamingSlides.length === 0) {
      seenSlidesRef.current = new Set();
      return new Set<number>();
    }

    // Reset when streaming ends
    if (!isStreaming && prevStreamingRef.current && prompt) {
      seenSlidesRef.current = new Set(prompt.slides.map((s) => s.slideNumber));
      prevStreamingRef.current = false;
      return new Set<number>();
    }

    // Track new slides during streaming
    if (isStreaming) {
      prevStreamingRef.current = true;
      const currentNew = new Set<number>();
      streamingSlides.forEach((slide) => {
        if (!seenSlidesRef.current.has(slide.slideNumber)) {
          currentNew.add(slide.slideNumber);
          seenSlidesRef.current.add(slide.slideNumber);
        }
      });
      return currentNew;
    }

    return new Set<number>();
  }, [isStreaming, streamingSlides, prompt]);

  const displaySlides = isStreaming ? streamingSlides : prompt?.slides || [];
  const hasSlides = displaySlides.length > 0;
  const remainingSkeletons = isStreaming
    ? Math.max(0, Math.min(3, expectedSlideCount - streamingSlides.length))
    : 0;

  if (!prompt && !isStreaming) {
    return (
      <Card className="border-dashed border-2 border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="p-4 rounded-2xl bg-muted/50 mb-4">
            <FileText className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">{t('promptOutput.noPrompt')}</h3>
          <p className="text-sm text-muted-foreground max-w-sm">{t('promptOutput.noPromptHint')}</p>
        </CardContent>
      </Card>
    );
  }

  const handleCopyAll = async () => {
    if (!prompt) return;

    // Always copy the plainText (the visible slide prompts)
    const textToCopy = prompt.plainText;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: t('toast.copiedAll'),
        description: t('toast.copiedAllDesc', { count: prompt.slides.length }),
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

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl shadow-black/5">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isStreaming ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>{t('promptOutput.generating')}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {t('promptOutput.slideCount', {
                    count: streamingSlides.length,
                  })}
                </span>
              </>
            ) : (
              <>
                {t('promptOutput.title')}
                {hasSlides && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    {t('promptOutput.slideCount', {
                      count: displaySlides.length,
                    })}
                  </span>
                )}
              </>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasSlides && format === 'text' && !isStreaming && (
              <Button onClick={() => setAllExpanded(!allExpanded)} variant="ghost" size="sm">
                {allExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    {t('buttons.collapseAll')}
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    {t('buttons.expandAll')}
                  </>
                )}
              </Button>
            )}
            {!isStreaming && prompt && (
              <Button
                onClick={handleCopyAll}
                variant="outline"
                size="sm"
                className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                {copied ? (
                  <Check className="h-4 w-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? t('buttons.copied') : t('buttons.copyAll')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={format} onValueChange={(v) => setFormat(v as OutputFormat)}>
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('promptOutput.tabs.slides')}
            </TabsTrigger>
            <TabsTrigger value="json" className="flex items-center gap-2" disabled={isStreaming}>
              <Code className="h-4 w-4" />
              {t('promptOutput.tabs.raw')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-0">
            {hasSlides || isStreaming ? (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                {displaySlides.map((slide, index) => (
                  <SlideCard
                    key={slide.slideNumber}
                    slide={slide}
                    defaultOpen={allExpanded}
                    isNew={newSlides.has(slide.slideNumber)}
                    animationDelay={index * 50}
                  />
                ))}
                {Array.from({ length: remainingSkeletons }).map((_, i) => (
                  <SlideSkeleton key={`skeleton-${i}`} />
                ))}
              </div>
            ) : (
              <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 max-h-96 overflow-auto border border-border/30">
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {prompt?.plainText}
                </pre>
              </div>
            )}
          </TabsContent>

          <TabsContent value="json" className="mt-0">
            <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 max-h-[70vh] overflow-y-auto pr-1 border border-border/30">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {prompt?.plainText}
              </pre>
            </div>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-muted-foreground mt-4">
          {isStreaming
            ? t('promptOutput.streamingHint')
            : format === 'text'
              ? t('promptOutput.slidesHint')
              : t('promptOutput.rawHint')}
        </p>
      </CardContent>
    </Card>
  );
}
