import { useTranslation } from 'react-i18next';
import {
  Briefcase, Cpu, Palette, BarChart3, GraduationCap, Gamepad2,
  Minus, Zap, PenTool, Layers, Clock, Box, Droplets, Newspaper,
  Square, Blend, Crosshair, Waves, Terminal, Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SlideStyle } from '@/types/slidePrompt';

interface StyleOption {
  id: SlideStyle;
  icon: React.ElementType;
  previewColors: string[];
}

const styleOptions: StyleOption[] = [
  { id: 'professional', icon: Briefcase, previewColors: ['hsl(var(--primary))', 'hsl(var(--muted))', 'hsl(var(--card))'] },
  { id: 'technical', icon: Cpu, previewColors: ['hsl(210 100% 50%)', 'hsl(210 50% 80%)', 'hsl(210 20% 95%)'] },
  { id: 'creative', icon: Palette, previewColors: ['hsl(330 80% 60%)', 'hsl(280 70% 60%)', 'hsl(200 80% 60%)'] },
  { id: 'infographic', icon: BarChart3, previewColors: ['hsl(150 60% 50%)', 'hsl(200 70% 50%)', 'hsl(40 90% 60%)'] },
  { id: 'educational', icon: GraduationCap, previewColors: ['hsl(220 60% 50%)', 'hsl(45 90% 60%)', 'hsl(0 0% 95%)'] },
  { id: 'pixel-art', icon: Gamepad2, previewColors: ['hsl(280 70% 50%)', 'hsl(180 70% 50%)', 'hsl(60 90% 60%)'] },
  { id: 'minimalist', icon: Minus, previewColors: ['hsl(0 0% 10%)', 'hsl(0 0% 50%)', 'hsl(0 0% 98%)'] },
  { id: 'dark-neon', icon: Zap, previewColors: ['hsl(280 100% 60%)', 'hsl(180 100% 50%)', 'hsl(240 10% 10%)'] },
  { id: 'hand-drawn', icon: PenTool, previewColors: ['hsl(30 60% 40%)', 'hsl(40 40% 70%)', 'hsl(45 30% 95%)'] },
  { id: 'glassmorphism', icon: Layers, previewColors: ['hsl(210 100% 60% / 0.5)', 'hsl(280 80% 60% / 0.3)', 'hsl(0 0% 100% / 0.8)'] },
  { id: 'vintage', icon: Clock, previewColors: ['hsl(25 80% 50%)', 'hsl(45 70% 60%)', 'hsl(15 30% 85%)'] },
  { id: '3d-isometric', icon: Box, previewColors: ['hsl(200 70% 50%)', 'hsl(200 50% 70%)', 'hsl(200 30% 90%)'] },
  { id: 'watercolor', icon: Droplets, previewColors: ['hsl(340 60% 70%)', 'hsl(200 60% 70%)', 'hsl(50 50% 90%)'] },
  { id: 'newspaper', icon: Newspaper, previewColors: ['hsl(0 0% 10%)', 'hsl(0 0% 40%)', 'hsl(45 30% 95%)'] },
  { id: 'flat-design', icon: Square, previewColors: ['hsl(200 80% 55%)', 'hsl(350 80% 60%)', 'hsl(45 90% 55%)'] },
  { id: 'gradient-mesh', icon: Blend, previewColors: ['hsl(280 80% 60%)', 'hsl(200 90% 60%)', 'hsl(330 80% 60%)'] },
  { id: 'sci-fi-hud', icon: Crosshair, previewColors: ['hsl(185 100% 50%)', 'hsl(25 100% 55%)', 'hsl(220 30% 8%)'] },
  { id: 'deep-ocean', icon: Waves, previewColors: ['hsl(180 100% 40%)', 'hsl(210 50% 20%)', 'hsl(210 60% 12%)'] },
  { id: 'dev-console', icon: Terminal, previewColors: ['hsl(45 100% 50%)', 'hsl(0 0% 70%)', 'hsl(0 0% 8%)'] },
  { id: 'neon-scientific', icon: Sparkles, previewColors: ['hsl(190 100% 50%)', 'hsl(25 100% 60%)', 'hsl(220 50% 8%)'] }
];

interface StyleSelectorProps {
  value: SlideStyle;
  onChange: (value: SlideStyle) => void;
}

export function StyleSelector({ value, onChange }: StyleSelectorProps) {
  const { t } = useTranslation();

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
      <CardContent className="pt-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">{t('styleSelector.title')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styleOptions.map((style) => {
            const Icon = style.icon;
            const isSelected = value === style.id;

            return (
              <button
                key={style.id}
                onClick={() => onChange(style.id)}
                className={cn(
                  'group relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-300',
                  'hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                    : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-accent/50'
                )}
              >
                <div className="flex gap-1 mb-3">
                  {style.previewColors.map((color, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full ring-1 ring-black/10 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>

                <Icon className={cn(
                  'h-7 w-7 mb-2 transition-all duration-300',
                  isSelected ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground group-hover:scale-105'
                )} />

                <span className={cn(
                  'font-medium text-sm transition-colors duration-300',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                  {t(`styleSelector.styles.${style.id}.name`)}
                </span>

                <span className="text-xs text-muted-foreground text-center mt-1 line-clamp-1">
                  {t(`styleSelector.styles.${style.id}.description`)}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-primary shadow-lg shadow-primary/50" />
                )}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
