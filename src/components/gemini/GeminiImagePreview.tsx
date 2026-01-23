import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { GeneratedImage } from '@/hooks/useGeminiImage';

interface GeminiImagePreviewProps {
  images: GeneratedImage[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GeminiImagePreview({ images, open, onOpenChange }: GeminiImagePreviewProps) {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const currentImage = images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = (image: GeneratedImage) => {
    const extension = image.mimeType.split('/')[1] || 'png';
    const link = document.createElement('a');
    link.href = `data:${image.mimeType};base64,${image.data}`;
    link.download = `slide-${image.slideNumber}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    images.forEach((image) => {
      setTimeout(() => handleDownload(image), 100 * image.slideNumber);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle>{t('gemini.preview')}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadAll}>
                <Download className="h-4 w-4 mr-2" />
                {t('gemini.downloadAll')}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center p-4 bg-muted/30">
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          <div className="relative max-w-full max-h-[60vh] overflow-hidden rounded-lg shadow-lg">
            <img
              src={`data:${currentImage.mimeType};base64,${currentImage.data}`}
              alt={`Slide ${currentImage.slideNumber}`}
              className="max-w-full max-h-[60vh] object-contain"
            />
          </div>

          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </div>

        <div className="p-4 pt-2 flex items-center justify-between border-t">
          <span className="text-sm text-muted-foreground">
            {t('gemini.slideOf', { current: currentIndex + 1, total: images.length })}
          </span>
          <Button variant="outline" size="sm" onClick={() => handleDownload(currentImage)}>
            <Download className="h-4 w-4 mr-2" />
            {t('gemini.download')}
          </Button>
        </div>

        {images.length > 1 && (
          <div className="px-4 pb-4 flex gap-2 overflow-x-auto">
            {images.map((image, index) => (
              <button
                key={image.slideNumber}
                onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-12 rounded border-2 overflow-hidden transition-all ${
                  index === currentIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img
                  src={`data:${image.mimeType};base64,${image.data}`}
                  alt={`Thumbnail ${image.slideNumber}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
