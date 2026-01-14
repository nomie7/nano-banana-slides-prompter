import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, RotateCcw, Save, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Get API base URL dynamically - uses Electron backend port if available
 */
async function getApiBase(): Promise<string> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    const port = await window.electronAPI.getBackendPort();
    if (port) return `http://localhost:${port}`;
  }
  return (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
}

export function SettingsDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const {
    settings: storedSettings,
    geminiSettings: storedGeminiSettings,
    setSettings,
    setGeminiSettings,
    clearSettings,
    clearGeminiSettings,
  } = useSettingsStore();

  const [open, setOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState<{ baseURL: string; model: string } | null>(
    null
  );
  const [geminiDefaultConfig, setGeminiDefaultConfig] = useState<{
    model: string;
    hasApiKey: boolean;
  } | null>(null);

  // LLM Settings
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [model, setModel] = useState('');

  // Gemini Settings
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [geminiModel, setGeminiModel] = useState('');
  const [geminiEnabled, setGeminiEnabled] = useState(false);
  const [geminiBaseURL, setGeminiBaseURL] = useState('');

  // Cache API base URL
  const apiBaseRef = useRef<string | null>(null);
  const getApiBaseUrl = useCallback(async (): Promise<string> => {
    if (apiBaseRef.current) return apiBaseRef.current;
    apiBaseRef.current = await getApiBase();
    return apiBaseRef.current;
  }, []);

  // Load settings from Electron on mount (persistent storage)
  useEffect(() => {
    async function loadFromElectron() {
      if (!window.electronAPI) return;
      try {
        // Load LLM config
        const config = await window.electronAPI.getLLMConfig();
        if (config?.apiKey || config?.apiBase || config?.model) {
          const current = useSettingsStore.getState().settings;
          if (!current?.apiKey && !current?.baseURL && !current?.model) {
            setSettings({
              apiKey: config.apiKey || '',
              baseURL: config.apiBase || '',
              model: config.model || '',
            });
          }
        }
        // Load Gemini config
        const geminiConfig = await window.electronAPI.getGeminiConfig();
        if (geminiConfig?.apiKey || geminiConfig?.model || geminiConfig?.enabled) {
          const currentGemini = useSettingsStore.getState().geminiSettings;
          if (!currentGemini?.apiKey && !currentGemini?.model) {
            setGeminiSettings({
              apiKey: geminiConfig.apiKey || '',
              model: geminiConfig.model || '',
              enabled: geminiConfig.enabled ?? false,
              baseURL: geminiConfig.baseURL || undefined,
            });
          }
        }
      } catch (e) {
        console.warn('Failed to load settings from Electron:', e);
      }
    }
    loadFromElectron();
  }, [setSettings, setGeminiSettings]);

  // Load default settings when dialog opens
  useEffect(() => {
    if (!open) return;

    async function loadSettings() {
      const apiBase = await getApiBaseUrl();

      // Load LLM settings
      fetch(`${apiBase}/api/settings/llm`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
        .then((data) => {
          setDefaultConfig(data);
          setApiKey(storedSettings?.apiKey || '');
          setBaseURL(storedSettings?.baseURL || data.baseURL || '');
          setModel(storedSettings?.model || data.model || '');
        })
        .catch(() => {
          toast({
            title: t('settings.error'),
            description: t('settings.loadFailed', 'Failed to load default LLM settings.'),
            variant: 'destructive',
          });
        });

      // Load Gemini settings
      fetch(`${apiBase}/api/gemini/config`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status}`))))
        .then((data) => {
          setGeminiDefaultConfig(data);
          setGeminiApiKey(storedGeminiSettings?.apiKey || '');
          setGeminiModel(storedGeminiSettings?.model || data.model || '');
          setGeminiEnabled(storedGeminiSettings?.enabled ?? false);
          setGeminiBaseURL(storedGeminiSettings?.baseURL || '');
        })
        .catch(() => {
          // Gemini config optional, ignore errors
          setGeminiDefaultConfig({
            model: 'gemini-2.0-flash-preview-image-generation',
            hasApiKey: false,
          });
        });
    }
    loadSettings();
  }, [open, toast, t, storedSettings, storedGeminiSettings, getApiBaseUrl]);

  const handleSave = async () => {
    if (!baseURL.trim() || !model.trim()) {
      toast({
        title: t('settings.error'),
        description: t('settings.fillAll'),
        variant: 'destructive',
      });
      return;
    }
    try {
      new URL(baseURL.trim());
    } catch {
      toast({
        title: t('settings.error'),
        description: t('settings.invalidURL', 'Invalid base URL format'),
        variant: 'destructive',
      });
      return;
    }
    if (!/^[a-zA-Z0-9][a-zA-Z0-9\-_.:/]*$/.test(model.trim())) {
      toast({
        title: t('settings.error'),
        description: t('settings.invalidModel', 'Invalid model identifier'),
        variant: 'destructive',
      });
      return;
    }

    // Save LLM settings to Zustand (session storage)
    setSettings({
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: model.trim(),
    });

    // Save Gemini settings to Zustand (session storage)
    setGeminiSettings({
      apiKey: geminiApiKey.trim(),
      model: geminiModel.trim() || geminiDefaultConfig?.model || '',
      enabled: geminiEnabled,
      baseURL: geminiBaseURL.trim() || undefined,
    });

    // Also persist to Electron file storage for cross-session persistence
    if (window.electronAPI) {
      try {
        await window.electronAPI.setLLMConfig({
          apiKey: apiKey.trim(),
          apiBase: baseURL.trim(),
          model: model.trim(),
        });
        // Also persist Gemini settings
        await window.electronAPI.setGeminiConfig({
          apiKey: geminiApiKey.trim(),
          model: geminiModel.trim() || geminiDefaultConfig?.model || '',
          enabled: geminiEnabled,
          baseURL: geminiBaseURL.trim() || undefined,
        });
      } catch (e) {
        console.warn('Failed to persist settings to Electron:', e);
      }
    }

    toast({ title: t('settings.saved') });
    setOpen(false);
  };

  const handleReset = () => {
    clearSettings();
    clearGeminiSettings();
    setApiKey('');
    setBaseURL(defaultConfig?.baseURL || '');
    setModel(defaultConfig?.model || '');
    setGeminiApiKey('');
    setGeminiModel(geminiDefaultConfig?.model || '');
    setGeminiEnabled(false);
    setGeminiBaseURL('');
    toast({ title: t('settings.reset') });
  };

  const handleTestGeminiConnection = async () => {
    if (!geminiApiKey.trim()) {
      toast({
        title: t('gemini.testFailed'),
        description: t('gemini.noApiKey'),
        variant: 'destructive',
      });
      return;
    }

    setTestingConnection(true);
    try {
      const apiBase = await getApiBaseUrl();
      const response = await fetch(`${apiBase}/api/gemini/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: geminiApiKey.trim(),
          baseURL: geminiBaseURL.trim() || undefined,
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast({ title: t('gemini.testSuccess') });
      } else {
        toast({
          title: t('gemini.testFailed'),
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('gemini.testFailed'),
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* LLM Settings */}
          <div className="space-y-2">
            <Label>{t('settings.baseURL')}</Label>
            <Input
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.baseURLHint', {
                default: defaultConfig?.baseURL || 'https://api.openai.com',
              })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.model')}</Label>
            <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="gpt-4o" />
            <p className="text-xs text-muted-foreground">
              {t('settings.modelHint', { default: defaultConfig?.model || 'gpt-4o' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.apiKey')}</Label>
            <div className="relative">
              <Input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{t('settings.apiKeyHint')}</p>
          </div>

          <Separator className="my-4" />

          {/* Gemini Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h4 className="font-medium">{t('gemini.title')}</h4>
            </div>
            <p className="text-xs text-muted-foreground">{t('gemini.description')}</p>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t('gemini.enabled')}</Label>
                <p className="text-xs text-muted-foreground">{t('gemini.enabledHint')}</p>
              </div>
              <Switch checked={geminiEnabled} onCheckedChange={setGeminiEnabled} />
            </div>

            <div className="space-y-2">
              <Label>{t('gemini.apiKey')}</Label>
              <div className="relative">
                <Input
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AIza..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">{t('gemini.apiKeyHint')}</p>
            </div>

            <div className="space-y-2">
              <Label>{t('gemini.model')}</Label>
              <Input
                value={geminiModel}
                onChange={(e) => setGeminiModel(e.target.value)}
                placeholder={
                  geminiDefaultConfig?.model || 'gemini-2.0-flash-preview-image-generation'
                }
              />
              <p className="text-xs text-muted-foreground">
                {t('gemini.modelHint', {
                  default:
                    geminiDefaultConfig?.model || 'gemini-2.0-flash-preview-image-generation',
                })}
              </p>
            </div>

            <div className="space-y-2">
              <Label>{t('gemini.baseURL')}</Label>
              <Input
                value={geminiBaseURL}
                onChange={(e) => setGeminiBaseURL(e.target.value)}
                placeholder="https://generativelanguage.googleapis.com"
              />
              <p className="text-xs text-muted-foreground">{t('gemini.baseURLHint')}</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleTestGeminiConnection}
              disabled={testingConnection || !geminiApiKey.trim()}
              className="w-full"
            >
              {testingConnection ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('gemini.testing')}
                </>
              ) : (
                t('gemini.testConnection')
              )}
            </Button>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              {t('settings.save')}
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('settings.resetDefault')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
