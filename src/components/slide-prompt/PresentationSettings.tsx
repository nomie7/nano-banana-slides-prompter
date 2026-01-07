import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { PresentationSettings as PresentationSettingsType, AspectRatio, ColorPalette, LayoutStructure } from '@/types/slidePrompt';

const aspectRatioValues: AspectRatio[] = ['16:9', '4:3', '1:1', '9:16'];

const colorPaletteValues: { value: ColorPalette; colors: string[] }[] = [
  { value: 'corporate-blue', colors: ['hsl(210 60% 25%)', 'hsl(210 70% 55%)', 'hsl(210 20% 90%)'] },
  { value: 'modern-purple', colors: ['hsl(270 60% 40%)', 'hsl(270 80% 65%)', 'hsl(270 30% 95%)'] },
  { value: 'nature-green', colors: ['hsl(140 50% 25%)', 'hsl(140 60% 65%)', 'hsl(40 30% 95%)'] },
  { value: 'warm-orange', colors: ['hsl(25 80% 45%)', 'hsl(25 90% 60%)', 'hsl(40 30% 95%)'] },
  { value: 'elegant-monochrome', colors: ['hsl(0 0% 10%)', 'hsl(0 0% 50%)', 'hsl(0 0% 95%)'] },
  { value: 'vibrant-gradient', colors: ['hsl(180 80% 50%)', 'hsl(280 80% 60%)', 'hsl(320 80% 60%)'] },
  { value: 'ocean-teal', colors: ['hsl(172 66% 30%)', 'hsl(168 80% 60%)', 'hsl(45 40% 90%)'] },
  { value: 'sunset-pink', colors: ['hsl(330 80% 55%)', 'hsl(40 90% 55%)', 'hsl(15 80% 90%)'] },
  { value: 'forest-earth', colors: ['hsl(30 75% 25%)', 'hsl(35 80% 50%)', 'hsl(80 30% 45%)'] },
  { value: 'royal-gold', colors: ['hsl(225 70% 35%)', 'hsl(40 95% 50%)', 'hsl(220 30% 95%)'] },
  { value: 'arctic-frost', colors: ['hsl(200 90% 60%)', 'hsl(215 20% 60%)', 'hsl(270 30% 95%)'] },
  { value: 'neon-night', colors: ['hsl(270 80% 60%)', 'hsl(140 70% 50%)', 'hsl(330 90% 60%)'] }
];

const layoutStructureValues: LayoutStructure[] = ['visual-heavy', 'balanced', 'text-heavy'];

interface PresentationSettingsProps {
  value: PresentationSettingsType;
  onChange: (value: PresentationSettingsType) => void;
}

export function PresentationSettings({ value, onChange }: PresentationSettingsProps) {
  const { t } = useTranslation();

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
      <CardContent className="pt-6 space-y-6">
        <h3 className="text-lg font-semibold text-foreground">{t('presentationSettings.title')}</h3>

        <div className="space-y-3">
          <Label>{t('presentationSettings.aspectRatio')}</Label>
          <div className="flex gap-3">
            {aspectRatioValues.map((ratio) => (
              <button
                key={ratio}
                onClick={() => onChange({ ...value, aspectRatio: ratio })}
                className={cn(
                  'group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300 flex-1',
                  'hover:-translate-y-0.5 hover:shadow-md',
                  value.aspectRatio === ratio
                    ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                    : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
                )}
              >
                <div
                  className={cn(
                    'bg-gradient-to-br from-muted to-muted/50 rounded border border-border/50 mb-2 transition-transform duration-300 group-hover:scale-105',
                    ratio === '16:9' && 'w-12 h-7',
                    ratio === '4:3' && 'w-10 h-8',
                    ratio === '1:1' && 'w-8 h-8',
                    ratio === '9:16' && 'w-5 h-9'
                  )}
                />
                <span className="text-xs font-medium">{ratio}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between">
            <Label>{t('presentationSettings.slideCount')}</Label>
            <span className="text-sm font-medium text-primary">{value.slideCount}</span>
          </div>
          <Slider
            value={[value.slideCount]}
            onValueChange={([count]) => onChange({ ...value, slideCount: count })}
            min={1}
            max={20}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('presentationSettings.colorPalette')}</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {value.colorPalette === 'auto' ? t('presentationSettings.colorAuto') : t('presentationSettings.colorCustom')}
              </span>
              <Switch
                checked={value.colorPalette !== 'auto'}
                onCheckedChange={(checked) =>
                  onChange({ ...value, colorPalette: checked ? 'corporate-blue' : 'auto' })
                }
              />
            </div>
          </div>

          {value.colorPalette === 'auto' ? (
            <div className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-border/50 bg-muted/30">
              <Sparkles className="h-5 w-5 text-primary" />
              <p className="text-sm text-muted-foreground">
                {t('presentationSettings.colorAutoHint')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorPaletteValues.map((palette) => (
                <button
                  key={palette.value}
                  onClick={() => onChange({ ...value, colorPalette: palette.value })}
                  className={cn(
                    'group flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300',
                    'hover:-translate-y-0.5 hover:shadow-md',
                    value.colorPalette === palette.value
                      ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                      : 'border-border/50 hover:border-primary/50 hover:bg-accent/50'
                  )}
                >
                  <div className="flex gap-1.5 mb-2">
                    {palette.colors.map((color, i) => (
                      <div
                        key={i}
                        className="w-5 h-5 rounded-full ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-center">{t(`presentationSettings.palettes.${palette.value}`)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>{t('presentationSettings.layoutStructure')}</Label>
          <Select
            value={value.layoutStructure}
            onValueChange={(v: LayoutStructure) => onChange({ ...value, layoutStructure: v })}
          >
            <SelectTrigger className="transition-all duration-300 hover:border-primary/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {layoutStructureValues.map((layout) => (
                <SelectItem key={layout} value={layout}>
                  <div className="flex items-center gap-2">
                    <span>{t(`presentationSettings.layouts.${layout}.label`)}</span>
                    <span className="text-muted-foreground">- {t(`presentationSettings.layouts.${layout}.description`)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
