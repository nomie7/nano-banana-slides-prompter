import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, X, Github, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { cn } from '@/lib/utils';
import { ContentInput } from '@/components/slide-prompt/ContentInput';
import { StyleSelector } from '@/components/slide-prompt/StyleSelector';
import { CharacterSelector } from '@/components/slide-prompt/CharacterSelector';
import { PresentationSettings } from '@/components/slide-prompt/PresentationSettings';
import { PromptOutput } from '@/components/slide-prompt/PromptOutput';
import { SessionSidebar } from '@/components/SessionSidebar';
import { SettingsDialog } from '@/components/SettingsDialog';
import { BatchPanel } from '@/components/batch';
import { useStreamingGeneration } from '@/hooks/useStreamingGeneration';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useBrandKitStore } from '@/stores/brandKitStore';
import { useToast } from '@/hooks/use-toast';
import type {
  ContentInput as ContentInputType,
  SlideStyle,
  PresentationSettings as PresentationSettingsType,
} from '@/types/slidePrompt';

const defaultContent: ContentInputType = {
  type: 'text',
  text: '',
  topic: '',
  fileContent: '',
  fileName: '',
  url: '',
  urlContent: '',
};
const defaultSettings: PresentationSettingsType = {
  aspectRatio: '16:9',
  slideCount: 10,
  colorPalette: 'auto',
  layoutStructure: 'balanced',
};

export default function Index() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { settings: llmSettings } = useSettingsStore();
  const { getBrandPromptText } = useBrandKitStore();

  const {
    sessions,
    currentSessionId,
    getCurrentSession,
    createSession,
    updateSessionConfig,
    loadSessions,
    isLoading,
    syncToServer,
  } = useSessionStore();

  const currentSession = getCurrentSession();

  useEffect(() => {
    loadSessions().catch(() => {
      toast({
        variant: 'destructive',
        title: t('errors.loadSessionsTitle', 'Failed to load sessions'),
        description: t(
          'errors.loadSessionsDescription',
          'An error occurred while loading your sessions. Please try again.'
        ),
      });
    });
  }, [loadSessions, toast, t]);

  useEffect(() => {
    if (!isLoading && sessions.length === 0) {
      createSession();
    }
  }, [isLoading, sessions.length, createSession]);

  const content = currentSession?.config.content ?? defaultContent;
  const style = currentSession?.config.style ?? 'professional';
  const settings = currentSession?.config.settings ?? defaultSettings;

  const setContent = (newContent: ContentInputType) => {
    if (currentSessionId) {
      updateSessionConfig(currentSessionId, { content: newContent });
    }
  };

  const setStyle = (newStyle: SlideStyle) => {
    if (currentSessionId) {
      updateSessionConfig(currentSessionId, { style: newStyle });
    }
  };

  const setSettings = (newSettings: PresentationSettingsType) => {
    if (currentSessionId) {
      updateSessionConfig(currentSessionId, { settings: newSettings });
    }
  };

  const { isGenerating, slides, error, generatedPrompt, generate, cancel, updateSlides } =
    useStreamingGeneration();

  const handleGenerate = async () => {
    if (!currentSessionId) return;

    await syncToServer();

    // Include brand kit text in content if enabled
    const brandText = getBrandPromptText();
    const contentWithBrand = brandText ? { ...content, text: content.text + brandText } : content;

    generate({
      content: contentWithBrand,
      style,
      settings,
      llmConfig: llmSettings || undefined,
    });
  };

  useEffect(() => {
    if (error) {
      toast({
        title: t('toast.generateFailed'),
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast, t]);

  const hasContent =
    content.text.trim() || content.topic || content.fileContent || content.url.trim();

  return (
    <div className="min-h-screen bg-background">
      <SessionSidebar isOpen={sidebarOpen} />

      <div
        className={cn(
          'flex flex-col min-h-screen transition-all duration-300 ease-in-out',
          sidebarOpen ? 'ml-64' : 'ml-0'
        )}
      >
        <header className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px',
            }}
          />

          <div className="relative container mx-auto px-4 py-10 md:py-14">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="shrink-0"
                >
                  {sidebarOpen ? (
                    <PanelLeftClose className="h-5 w-5" />
                  ) : (
                    <PanelLeft className="h-5 w-5" />
                  )}
                </Button>
                <div className="p-3 rounded-2xl bg-primary/10 backdrop-blur-sm border border-primary/20 shadow-lg shadow-primary/5">
                  <img src="/logo.svg" alt="Nano Banana Logo" className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                    {t('app.title')}
                  </h1>
                  <p className="text-muted-foreground mt-1">{t('app.subtitle')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <SettingsDialog />
                <LanguageSwitcher />
                <a
                  href="https://github.com/nomie7/nano-banana-slides-prompter"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    className="gap-2 bg-background/50 backdrop-blur-sm border-primary/20 hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  >
                    <Github className="h-4 w-4" />
                    <span className="hidden sm:inline">GitHub</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 md:py-12 flex-1">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-8">
              <section className="animate-fade-in" style={{ animationDelay: '0ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                    1
                  </span>
                  <h2 className="text-xl font-semibold text-foreground">{t('steps.addContent')}</h2>
                  <span className="text-xs text-muted-foreground">
                    {t('steps.allSourcesCombined')}
                  </span>
                </div>
                <ContentInput value={content} onChange={setContent} />
              </section>

              <section className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                    2
                  </span>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t('steps.selectStyle')}
                  </h2>
                </div>
                <StyleSelector value={style} onChange={setStyle} />
              </section>

              <section className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                    3
                  </span>
                  <h2 className="text-xl font-semibold text-foreground">
                    {t('steps.characterHost')}
                  </h2>
                  <span className="text-xs text-muted-foreground">{t('steps.optional')}</span>
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
                  <h2 className="text-xl font-semibold text-foreground">
                    {t('steps.configureSettings')}
                  </h2>
                </div>
                <PresentationSettings value={settings} onChange={setSettings} />
              </section>

              <Button
                onClick={isGenerating ? cancel : handleGenerate}
                disabled={!isGenerating && !hasContent}
                variant={isGenerating ? 'destructive' : 'default'}
                size="lg"
                className={`w-full h-14 text-lg font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 ${
                  !isGenerating
                    ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-primary/25 hover:shadow-primary/30'
                    : ''
                }`}
              >
                {isGenerating ? (
                  <>
                    <X className="h-5 w-5 mr-2" />
                    {t('buttons.cancel')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t('buttons.generate')}
                  </>
                )}
              </Button>

              <section className="animate-fade-in mt-6" style={{ animationDelay: '250ms' }}>
                <BatchPanel
                  style={style}
                  settings={settings}
                  llmConfig={llmSettings || undefined}
                />
              </section>
            </div>

            <div
              className="lg:sticky lg:top-8 lg:self-start animate-fade-in"
              style={{ animationDelay: '300ms' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/25">
                  5
                </span>
                <h2 className="text-xl font-semibold text-foreground">
                  {t('steps.generatedPrompt')}
                </h2>
              </div>
              <PromptOutput
                prompt={generatedPrompt}
                isStreaming={isGenerating}
                streamingSlides={slides}
                expectedSlideCount={settings.slideCount}
                onSlidesUpdate={updateSlides}
              />
            </div>
          </div>
        </main>

        <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm mt-16">
          <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
            {t('app.footer', { version: __APP_VERSION__ })}
          </div>
        </footer>
      </div>
    </div>
  );
}
