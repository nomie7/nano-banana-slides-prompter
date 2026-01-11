import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, RotateCcw, Save, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, '');
const STORAGE_KEY = 'nano-banana-llm-settings';

export interface LLMSettings {
  apiKey: string;
  baseURL: string;
  model: string;
}

export function useLLMSettings() {
  const [settings, setSettings] = useState<LLMSettings | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSettings(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  return { settings };
}

export function SettingsDialog() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [defaultConfig, setDefaultConfig] = useState<{ baseURL: string; model: string } | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch(`${API_BASE}/api/settings/llm`)
      .then(res => res.ok ? res.json() : Promise.reject(new Error(`${res.status}`)))
      .then(data => {
        setDefaultConfig(data);
        try {
          const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
          setApiKey(parsed.apiKey || '');
          setBaseURL(parsed.baseURL || data.baseURL || '');
          setModel(parsed.model || data.model || '');
        } catch {
          setApiKey('');
          setBaseURL(data.baseURL || '');
          setModel(data.model || '');
        }
      })
      .catch(() => {
        toast({ title: t('settings.error'), description: t('settings.loadFailed', 'Failed to load default LLM settings.'), variant: 'destructive' });
      });
  }, [open, toast, t]);

  const handleSave = () => {
    if (!baseURL.trim() || !model.trim()) {
      toast({ title: t('settings.error'), description: t('settings.fillAll'), variant: 'destructive' });
      return;
    }
    try { new URL(baseURL.trim()); } catch {
      toast({ title: t('settings.error'), description: t('settings.invalidURL', 'Invalid base URL format'), variant: 'destructive' });
      return;
    }
    if (!/^[\w\u4e00-\u9fff\[\]][\w\u4e00-\u9fff\-_.:\/\[\] ]*$/.test(model.trim())) {
      toast({ title: t('settings.error'), description: t('settings.invalidModel', 'Invalid model identifier'), variant: 'destructive' });
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ apiKey: apiKey.trim(), baseURL: baseURL.trim(), model: model.trim() }));
    toast({ title: t('settings.saved') });
    setOpen(false);
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKey('');
    setBaseURL(defaultConfig?.baseURL || '');
    setModel(defaultConfig?.model || '');
    toast({ title: t('settings.reset') });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('settings.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t('settings.baseURL')}</Label>
            <Input
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="https://api.openai.com"
            />
            <p className="text-xs text-muted-foreground">
              {t('settings.baseURLHint', { default: defaultConfig?.baseURL || 'https://api.openai.com' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t('settings.model')}</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-4o"
            />
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
            <p className="text-[11px] text-muted-foreground">
              {t('settings.securityNote', 'Your key is stored locally in this browser only. Clear storage to remove it.')}
            </p>
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
