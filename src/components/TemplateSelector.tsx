import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Presentation,
  GraduationCap,
  Briefcase,
  Palette,
  LayoutTemplate,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { loadTemplatesByCategory, TEMPLATE_CATEGORIES } from '@/data/templates';
import type { PromptTemplate, TemplateCategory } from '@/data/templates';
import type { SlidePromptConfig } from '@/types/slidePrompt';

const categoryIcons: Record<TemplateCategory, React.ReactNode> = {
  presentation: <Presentation className="h-4 w-4" />,
  education: <GraduationCap className="h-4 w-4" />,
  business: <Briefcase className="h-4 w-4" />,
  creative: <Palette className="h-4 w-4" />,
  quiz: <HelpCircle className="h-4 w-4" />,
};

interface TemplateSelectorProps {
  onApplyTemplate: (config: Partial<SlidePromptConfig>) => void;
}

export function TemplateSelector({ onApplyTemplate }: TemplateSelectorProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<TemplateCategory>('presentation');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const loadCategory = useCallback(async (category: TemplateCategory) => {
    setLoading(true);
    try {
      const data = await loadTemplatesByCategory(category);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
    setLoading(false);
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      loadCategory(activeCategory);
    }
  };

  const handleCategoryChange = (category: string) => {
    const newCategory = category as TemplateCategory;
    setActiveCategory(newCategory);
    loadCategory(newCategory);
  };

  const handleApplyTemplate = (template: PromptTemplate) => {
    const config: Partial<SlidePromptConfig> = {};

    if (template.config.style) {
      config.style = template.config.style;
    }

    config.settings = {};
    if (template.config.aspectRatio) {
      config.settings.aspectRatio = template.config.aspectRatio;
    }
    if (template.config.slideCount) {
      config.settings.slideCount = template.config.slideCount;
    }
    if (template.config.colorPalette) {
      config.settings.colorPalette = template.config.colorPalette;
    }
    if (template.config.layoutStructure) {
      config.settings.layoutStructure = template.config.layoutStructure;
    }
    if (template.config.character) {
      config.settings.character = {
        enabled: template.config.character.enabled,
        renderStyle: template.config.character.renderStyle || 'pixar',
        gender: template.config.character.gender || 'none',
      };
    }
    if (template.config.outputLanguage) {
      config.settings.outputLanguage = template.config.outputLanguage;
    }

    onApplyTemplate(config);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">{t('templates.button')}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('templates.title')}</DialogTitle>
        </DialogHeader>
        <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                {categoryIcons[cat.id]}
                <span className="hidden sm:inline">{t(cat.labelKey)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TEMPLATE_CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="mt-4">
              <ScrollArea className="h-[50vh]">
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                    {templates.map((template) => (
                      <Card
                        key={template.id}
                        className="cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => handleApplyTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {t(template.nameKey, { defaultValue: template.name })}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {t(template.descriptionKey, { defaultValue: template.description })}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {template.config.style && (
                              <Badge variant="secondary" className="text-xs">
                                {t(`styleSelector.styles.${template.config.style}.name`, {
                                  defaultValue: template.config.style,
                                })}
                              </Badge>
                            )}
                            {template.config.slideCount && (
                              <Badge variant="outline" className="text-xs">
                                {template.config.slideCount} {t('templates.slides')}
                              </Badge>
                            )}
                            {template.config.character?.enabled && (
                              <Badge variant="outline" className="text-xs">
                                {t('characterSelector.title')}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
