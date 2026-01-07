import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Link, MessageSquare, Tag, Upload, X, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractUrl } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import type { ContentInput as ContentInputType, ContentInputType as InputType } from '@/types/slidePrompt';

const topicKeys = [
  'businessStrategy',
  'productLaunch',
  'quarterlyReport',
  'teamIntro',
  'techOverview',
  'marketAnalysis',
  'projectProposal',
  'trainingCourse',
  'salesPitch',
  'companyCulture',
  'researchResults',
  'eventDemo'
] as const;

interface ContentInputProps {
  value: ContentInputType;
  onChange: (value: ContentInputType) => void;
}

export function ContentInput({ value, onChange }: ContentInputProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<InputType>(value.type);
  const [isExtracting, setIsExtracting] = useState(false);
  const { toast } = useToast();

  const handleTabChange = (tab: string) => {
    const newType = tab as InputType;
    setActiveTab(newType);
    onChange({ ...value, type: newType });
  };

  const handleTextChange = (text: string) => {
    onChange({ ...value, text });
  };

  const handleTopicChange = (topic: string) => {
    onChange({ ...value, topic });
  };

  const handleUrlChange = (url: string) => {
    onChange({ ...value, url, urlContent: '' });
  };

  const handleExtractUrl = async () => {
    if (!value.url) return;

    setIsExtracting(true);
    try {
      const result = await extractUrl(value.url);
      if (result.success && result.data) {
        onChange({
          ...value,
          urlContent: result.data.content,
        });
        toast({
          title: t('toast.extractSuccess'),
          description: t('toast.extractSuccessDesc', { title: result.data.title || 'Page', count: result.data.content.length }),
        });
      } else {
        toast({
          title: t('toast.extractFailed'),
          description: result.error || t('toast.extractFailedDefault'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('toast.extractFailed'),
        description: error instanceof Error ? error.message : t('toast.connectionFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const clearUrlContent = () => {
    onChange({ ...value, urlContent: '' });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith('.csv');
    const isPdf = fileName.endsWith('.pdf');

    if (isPdf) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onChange({
          ...value,
          fileName: file.name,
          fileContent: dataUrl,
          fileType: 'pdf'
        });
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        let content = event.target?.result as string;

        if (isCsv) {
          content = `[CSV DATA - Parse this tabular data for presentation content]\n${content}`;
        }

        onChange({
          ...value,
          fileName: file.name,
          fileContent: content.slice(0, 15000),
          fileType: isCsv ? 'csv' : 'text'
        });
      };
      reader.readAsText(file);
    }
  };

  const clearFile = () => {
    onChange({ ...value, fileName: '', fileContent: '', fileType: undefined });
  };

  const getFileTypeBadge = () => {
    const ext = value.fileName?.split('.').pop()?.toLowerCase();
    if (ext === 'csv') return 'CSV';
    if (ext === 'pdf') return 'PDF';
    return 'TXT';
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="text" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">{t('contentInput.tabs.text')}</span>
            </TabsTrigger>
            <TabsTrigger value="topic" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">{t('contentInput.tabs.topic')}</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">{t('contentInput.tabs.file')}</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">{t('contentInput.tabs.url')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('contentInput.text.label')}
              </label>
              <Textarea
                placeholder={t('contentInput.text.placeholder')}
                value={value.text}
                onChange={(e) => handleTextChange(e.target.value)}
                className="min-h-[200px] resize-none"
              />
              <p className="text-xs text-muted-foreground">
                {t('contentInput.text.charCount', { count: value.text.length })}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="topic" className="mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                {t('contentInput.topic.label')}
              </label>
              <Select value={value.topic} onValueChange={handleTopicChange}>
                <SelectTrigger>
                  <SelectValue placeholder={t('contentInput.topic.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {topicKeys.map((key) => (
                    <SelectItem key={key} value={t(`contentInput.topic.options.${key}`)}>
                      {t(`contentInput.topic.options.${key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {value.topic && (
                <p className="text-sm text-muted-foreground mt-2">
                  {t('contentInput.topic.hint', { topic: value.topic })}
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="file" className="mt-4">
            <div className="space-y-4">
              <label className="text-sm font-medium text-foreground">
                {t('contentInput.file.label')}
              </label>
              {value.fileName ? (
                <div className="flex items-center justify-between p-4 bg-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-accent-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{value.fileName}</p>
                        <span className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary rounded">
                          {getFileTypeBadge()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {value.fileType === 'pdf'
                          ? t('contentInput.file.pdfReady')
                          : t('contentInput.file.extracted', { count: value.fileContent.length })}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {t('contentInput.file.dropHint')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('contentInput.file.supportedFormats')}
                  </p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".txt,.md,.markdown,.csv,.pdf"
                    onChange={handleFileUpload}
                  />
                </label>
              )}
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t('contentInput.url.label')}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder={t('contentInput.url.placeholder')}
                    value={value.url}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleExtractUrl}
                    disabled={!value.url || isExtracting}
                    variant="secondary"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t('buttons.extracting')}
                      </>
                    ) : (
                      t('buttons.extract')
                    )}
                  </Button>
                </div>
              </div>

              {value.urlContent ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4" />
                      <span>{t('contentInput.url.success')}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearUrlContent}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3 bg-accent rounded-lg max-h-40 overflow-y-auto">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {value.urlContent.slice(0, 500)}
                      {value.urlContent.length > 500 && '...'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('contentInput.url.extracted', { count: value.urlContent.length })}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  {t('contentInput.url.hint')}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
