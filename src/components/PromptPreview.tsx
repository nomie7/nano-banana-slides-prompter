import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Copy, Check, Eye, Code } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useToast } from '@/hooks/use-toast';
import type { GeneratedPrompt } from '@/types/slidePrompt';

interface PromptPreviewProps {
  prompt: GeneratedPrompt | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

type PreviewMode = 'formatted' | 'raw';

export function PromptPreview({ prompt, isOpen, onOpenChange }: PromptPreviewProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>('formatted');

  if (!prompt) return null;

  const handleCopy = async () => {
    const textToCopy =
      previewMode === 'raw'
        ? prompt.plainText
        : prompt.slides
            .map((s) => `Slide ${s.slideNumber}: ${s.title}\n${s.prompt}`)
            .join('\n\n---\n\n');

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: t('promptPreview.copied'),
        description: t('promptPreview.copiedDesc'),
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

  const formattedContent = prompt.slides.map((slide) => (
    <div key={slide.slideNumber} className="mb-4 last:mb-0">
      <div className="font-semibold text-sm text-primary mb-1">
        Slide {slide.slideNumber}: {slide.title}
      </div>
      <div className="text-sm text-muted-foreground whitespace-pre-wrap">{slide.prompt}</div>
    </div>
  ));

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-lg">
      <Collapsible open={isOpen} onOpenChange={onOpenChange}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto hover:bg-transparent">
                <CardTitle className="text-base flex items-center gap-2 cursor-pointer">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {t('promptPreview.title')}
                  <span className="text-xs font-normal text-muted-foreground">
                    ({prompt.slides.length} {t('promptPreview.slides')})
                  </span>
                </CardTitle>
              </Button>
            </CollapsibleTrigger>
            {isOpen && (
              <div className="flex items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={previewMode}
                  onValueChange={(value) => value && setPreviewMode(value as PreviewMode)}
                  size="sm"
                >
                  <ToggleGroupItem value="formatted" aria-label={t('promptPreview.formatted')}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {t('promptPreview.formatted')}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="raw" aria-label={t('promptPreview.raw')}>
                    <Code className="h-3.5 w-3.5 mr-1" />
                    {t('promptPreview.raw')}
                  </ToggleGroupItem>
                </ToggleGroup>
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? (
                    <Check className="h-4 w-4 mr-1 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-1" />
                  )}
                  {copied ? t('buttons.copied') : t('buttons.copy')}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="pt-2">
            <div className="bg-muted/30 rounded-lg p-4 max-h-80 overflow-y-auto border border-border/30">
              {previewMode === 'formatted' ? (
                <div className="space-y-4 divide-y divide-border/30">{formattedContent}</div>
              ) : (
                <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                  {prompt.plainText}
                </pre>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t('promptPreview.hint')}</p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
