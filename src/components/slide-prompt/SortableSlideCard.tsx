import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { SlideCard } from './SlideCard';
import type { ParsedSlide } from '@/types/slidePrompt';

interface SortableSlideCardProps {
  slide: ParsedSlide;
  onPromptUpdate?: (slideNumber: number, newPrompt: string) => void;
  disabled?: boolean;
  // Image generation props
  onGenerateImage?: (slideNumber: number) => void;
  isGeneratingImage?: boolean;
  generatedImageUrl?: string;
  showImageButton?: boolean;
  // Checkbox props
  isSelected?: boolean;
  onSelectChange?: (slideNumber: number, selected: boolean) => void;
  showCheckbox?: boolean;
}

/**
 * Wrapper component that makes SlideCard draggable using dnd-kit.
 * Provides drag handle and visual feedback during drag operations.
 */
export function SortableSlideCard({
  slide,
  onPromptUpdate,
  disabled,
  onGenerateImage,
  isGeneratingImage,
  generatedImageUrl,
  showImageButton,
  isSelected,
  onSelectChange,
  showCheckbox,
}: SortableSlideCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `slide-${slide.slideNumber}`,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag Handle - visible on hover */}
      <button
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8
                   p-1.5 opacity-0 group-hover:opacity-100 transition-opacity
                   cursor-grab active:cursor-grabbing touch-none
                   rounded hover:bg-muted/50"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <SlideCard
        slide={slide}
        onPromptUpdate={onPromptUpdate}
        onGenerateImage={onGenerateImage}
        isGeneratingImage={isGeneratingImage}
        generatedImageUrl={generatedImageUrl}
        showImageButton={showImageButton}
        isSelected={isSelected}
        onSelectChange={onSelectChange}
        showCheckbox={showCheckbox}
      />
    </div>
  );
}
