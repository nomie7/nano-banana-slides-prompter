import { useTranslation } from 'react-i18next';
import { Palette, RotateCcw, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useBrandKitStore, FONT_FAMILIES, FONT_SIZES } from '@/stores/brandKitStore';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function BrandKitEditor() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { brandKit, isEnabled, updateBrandKit, setEnabled, resetToDefaults } = useBrandKitStore();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: t('brandKit.invalidType', 'Invalid file type'),
        description: t(
          'brandKit.invalidTypeDesc',
          'Please upload an image file (PNG, JPG, or SVG).'
        ),
      });
      return;
    }

    // Validate file size (max 500KB)
    if (file.size > 500 * 1024) {
      toast({
        variant: 'destructive',
        title: t('brandKit.fileTooLarge', 'File too large'),
        description: t('brandKit.fileTooLargeDesc', 'Maximum file size is 500KB.'),
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateBrandKit({ logoUrl: reader.result as string });
    };
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: t('brandKit.readError', 'Read Error'),
        description: t('brandKit.readErrorDesc', 'Failed to read the file. Please try again.'),
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateBrandKit({ logoUrl: '' });
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between gap-2">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{t('brandKit.title', 'Brand Kit')}</span>
          </div>
          <Switch
            checked={isEnabled}
            onCheckedChange={(checked) => {
              setEnabled(checked);
              if (checked) setIsOpen(true);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <Label>{t('brandKit.companyName', 'Company Name')}</Label>
          <Input
            value={brandKit.companyName}
            onChange={(e) => updateBrandKit({ companyName: e.target.value })}
            placeholder={t('brandKit.companyNamePlaceholder', 'Your Company')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('brandKit.primaryColor', 'Primary Color')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={brandKit.primaryColor}
                onChange={(e) => updateBrandKit({ primaryColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={brandKit.primaryColor}
                onChange={(e) => updateBrandKit({ primaryColor: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('brandKit.secondaryColor', 'Secondary Color')}</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={brandKit.secondaryColor}
                onChange={(e) => updateBrandKit({ secondaryColor: e.target.value })}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={brandKit.secondaryColor}
                onChange={(e) => updateBrandKit({ secondaryColor: e.target.value })}
                placeholder="#1e40af"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('brandKit.fontFamily', 'Font Family')}</Label>
            <Select
              value={brandKit.fontFamily}
              onValueChange={(value) => updateBrandKit({ fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('brandKit.fontSize', 'Font Size')}</Label>
            <Select
              value={brandKit.fontSize}
              onValueChange={(value: 'small' | 'medium' | 'large') =>
                updateBrandKit({ fontSize: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_SIZES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {t(`brandKit.fontSizes.${size.value}`, size.label)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t('brandKit.logo', 'Logo')}</Label>
          {brandKit.logoUrl ? (
            <div className="flex items-center gap-4">
              <img
                src={brandKit.logoUrl}
                alt="Logo preview"
                className="h-12 w-auto object-contain rounded border"
              />
              <Button variant="outline" size="sm" onClick={handleRemoveLogo}>
                {t('brandKit.removeLogo', 'Remove')}
              </Button>
            </div>
          ) : (
            <div>
              <Input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {t('brandKit.logoHint', 'Max 500KB, PNG/JPG/SVG')}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {t('brandKit.reset', 'Reset')}
          </Button>
        </div>

        {isEnabled && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Palette className="h-4 w-4" />
              <span className="font-medium">{t('brandKit.preview', 'Preview')}</span>
            </div>
            <div
              className="mt-2 p-2 rounded"
              style={{
                background: `linear-gradient(135deg, ${brandKit.primaryColor}20, ${brandKit.secondaryColor}20)`,
                borderLeft: `3px solid ${brandKit.primaryColor}`,
              }}
            >
              <p style={{ fontFamily: brandKit.fontFamily }} className="font-medium">
                {brandKit.companyName || t('brandKit.companyNamePlaceholder', 'Your Company')}
              </p>
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
