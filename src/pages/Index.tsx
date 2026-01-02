import { useState, useEffect } from 'react';
import { Sparkles, Loader2, X, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentInput } from '@/components/slide-prompt/ContentInput';
import { StyleSelector } from '@/components/slide-prompt/StyleSelector';
import { CharacterSelector } from '@/components/slide-prompt/CharacterSelector';
import { PresentationSettings } from '@/components/slide-prompt/PresentationSettings';
import { PromptOutput } from '@/components/slide-prompt/PromptOutput';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';
import { useToast } from '@/hooks/use-toast';
import type {
  ContentInput as ContentInputType,
  SlideStyle,
  PresentationSettings as PresentationSettingsType,
  CharacterSettings,
} from '@/types/slidePrompt';

const defaultContent: ContentInputType = {
  type: 'text',
  text: '',
  topic: '',
  fileContent: '',
  fileName: '',
  url: '',
  urlContent: ''
};

const defaultSettings: PresentationSettingsType = {
  aspectRatio: '16:9',
  slideCount: 10,
  colorPalette: 'auto',
  layoutStructure: 'balanced'
};

export default function Index() {
  const [content, setContent] = useState<ContentInputType>(defaultContent);
  const [style, setStyle] = useState<SlideStyle>('professional');
  const [settings, setSettings] = useState<PresentationSettingsType>(defaultSettings);
  const { toast } = useToast();

  const {
    isGenerating,
    slides,
    error,
    generatedPrompt,
    generate,
    cancel,
  } = useStreamingGeneration();

  const handleGenerate = () => {
    generate({
      content,
      style,
      settings,
    });
  };

  // Show toast on error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Generation Failed',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Show toast on completion
  if (generatedPrompt && !isGenerating && slides.length > 0) {
    // We'll show this via the UI instead of a toast to avoid spam
  }

  // Check if ANY tab has content (all sources will be combined)
  const hasContent =
    content.text.trim() ||
    content.topic ||
    content.fileContent ||
    content.url.trim();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header with Gradient Mesh Background */}
      <header className="relative overflow-hidden border-b border-border/50">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative container mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/5">
                <img src="/logo.svg" alt="Nano Banana Logo" className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                  Nano Banana Slides Prompter
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create optimized prompts for AI-powered slide generation
                </p>
              </div>
            </div>

            <a
              href="https://github.com/nomie7/nano-banana-slides-prompter"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Github className="h-4 w-4" />
                <span className="hidden sm:inline">Star on GitHub</span>
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Inputs */}
          <div className="space-y-8">
            <section className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                  1
                </span>
                <h2 className="text-xl font-semibold text-foreground">Add Your Content</h2>
                <span className="text-xs text-muted-foreground">(all sources combined)</span>
              </div>
              <ContentInput value={content} onChange={setContent} />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                  2
                </span>
                <h2 className="text-xl font-semibold text-foreground">Choose Style</h2>
              </div>
              <StyleSelector value={style} onChange={setStyle} />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                  3
                </span>
                <h2 className="text-xl font-semibold text-foreground">Character Presenter</h2>
                <span className="text-xs text-muted-foreground">(optional)</span>
              </div>
              <CharacterSelector
                value={settings.character}
                onChange={(character) => setSettings({ ...settings, character })}
              />
            </section>

            <section className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                  4
                </span>
                <h2 className="text-xl font-semibold text-foreground">Configure Settings</h2>
              </div>
              <PresentationSettings value={settings} onChange={setSettings} />
            </section>

            {isGenerating ? (
              <Button
                onClick={cancel}
                variant="destructive"
                size="lg"
                className="w-full h-14 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
              >
                <X className="h-5 w-5 mr-2" />
                Cancel Generation
              </Button>
            ) : (
              <Button
                onClick={handleGenerate}
                disabled={!hasContent}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Generate Prompt
              </Button>
            )}
          </div>

          {/* Right Column - Output */}
          <div className="lg:sticky lg:top-8 lg:self-start animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                5
              </span>
              <h2 className="text-xl font-semibold text-foreground">Your Prompt</h2>
            </div>
            <PromptOutput
              prompt={generatedPrompt}
              isStreaming={isGenerating}
              streamingSlides={slides}
              expectedSlideCount={settings.slideCount}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          Nano Banana Slides Prompter v{__APP_VERSION__} - Generate optimized prompts for Nano Banana Pro Slides
        </div>
      </footer>
    </div>
  );
}