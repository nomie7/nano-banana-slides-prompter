import { useTranslation } from 'react-i18next';
import { Sparkles, User, Star, Palette, Pencil, Heart, Diamond, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { RenderStyle, CharacterGender, CharacterSettings } from '@/types/slidePrompt';

interface RenderStyleOption {
  id: RenderStyle;
  icon: typeof Sparkles;
  gradient: string;
}

const renderStyleOptions: RenderStyleOption[] = [
  { id: 'pixar', icon: Sparkles, gradient: 'from-amber-400 to-orange-500' },
  { id: 'real', icon: User, gradient: 'from-slate-400 to-slate-600' },
  { id: 'anime', icon: Star, gradient: 'from-pink-400 to-rose-500' },
  { id: 'cartoon', icon: Palette, gradient: 'from-blue-400 to-cyan-500' },
  { id: 'sketch', icon: Pencil, gradient: 'from-stone-400 to-stone-600' },
  { id: 'chibi', icon: Heart, gradient: 'from-pink-300 to-purple-400' },
  { id: 'low-poly', icon: Diamond, gradient: 'from-emerald-400 to-teal-500' },
  { id: 'mascot', icon: Users, gradient: 'from-violet-400 to-purple-500' },
];

const genderKeys: CharacterGender[] = ['none', 'male', 'female'];

interface CharacterSelectorProps {
  value: CharacterSettings | undefined;
  onChange: (value: CharacterSettings | undefined) => void;
}

export function CharacterSelector({ value, onChange }: CharacterSelectorProps) {
  const { t } = useTranslation();
  const isEnabled = value?.enabled ?? false;
  const selectedStyle = value?.renderStyle ?? 'pixar';
  const selectedGender = value?.gender ?? 'none';

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({ enabled: true, renderStyle: selectedStyle, gender: 'none' });
    } else {
      onChange(undefined);
    }
  };

  const handleStyleChange = (renderStyle: RenderStyle) => {
    onChange({ enabled: true, renderStyle, gender: selectedGender });
  };

  const handleGenderChange = (gender: CharacterGender) => {
    onChange({ enabled: true, renderStyle: selectedStyle, gender });
  };

  return (
    <Card className="backdrop-blur-sm bg-card/80 border-border/50 shadow-xl shadow-black/5 transition-all duration-300 hover:shadow-2xl hover:shadow-black/10">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{t('characterSelector.title')}</h3>
            <p className="text-sm text-muted-foreground">{t('characterSelector.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="character-toggle" className="text-sm text-muted-foreground">
              {isEnabled ? t('characterSelector.toggle.on') : t('characterSelector.toggle.off')}
            </Label>
            <Switch
              id="character-toggle"
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>
        </div>

        {isEnabled && (
          <div className="space-y-5 pt-2 border-t border-border/50">
            <div className="pt-3">
              <Label className="text-sm font-medium block mb-3">{t('characterSelector.styleLabel')}</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {renderStyleOptions.map((style) => {
                  const isSelected = selectedStyle === style.id;
                  const Icon = style.icon;

                  return (
                    <button
                      key={style.id}
                      onClick={() => handleStyleChange(style.id)}
                      className={cn(
                        'group relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300',
                        'hover:shadow-lg hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                          : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-accent/50'
                      )}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 bg-gradient-to-br',
                        style.gradient
                      )}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>

                      <span className={cn(
                        'font-medium text-sm transition-colors duration-300',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {t(`characterSelector.renderStyles.${style.id}.name`)}
                      </span>

                      <span className="text-xs text-muted-foreground text-center mt-0.5 line-clamp-1">
                        {t(`characterSelector.renderStyles.${style.id}.description`)}
                      </span>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium block mb-3">
                {t('characterSelector.genderLabel')} <span className="text-muted-foreground font-normal">{t('characterSelector.genderOptional')}</span>
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {genderKeys.map((gender) => {
                  const isSelected = selectedGender === gender;

                  return (
                    <button
                      key={gender}
                      onClick={() => handleGenderChange(gender)}
                      className={cn(
                        'relative flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-300',
                        'hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
                          : 'border-border/50 bg-card/50 hover:border-primary/50 hover:bg-accent/50'
                      )}
                    >
                      <span className={cn(
                        'font-medium text-sm transition-colors duration-300',
                        isSelected ? 'text-primary' : 'text-foreground'
                      )}>
                        {t(`characterSelector.genders.${gender}.name`)}
                      </span>

                      <span className="text-xs text-muted-foreground text-center mt-0.5">
                        {t(`characterSelector.genders.${gender}.description`)}
                      </span>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-muted-foreground italic">
              {t('characterSelector.note')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
