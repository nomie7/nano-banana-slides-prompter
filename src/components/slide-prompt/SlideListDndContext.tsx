import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableSlideCard } from './SortableSlideCard';
import { SlideCard } from './SlideCard';
import { reorderSlides } from '@/lib/utils/reorder-slides';
import type { ParsedSlide } from '@/types/slidePrompt';

interface SlideListDndContextProps {
  slides: ParsedSlide[];
  onSlidesReorder: (slides: ParsedSlide[]) => void;
  onPromptUpdate?: (slideNumber: number, newPrompt: string) => void;
  disabled?: boolean;
}

/**
 * Provides drag-and-drop context for reordering slides.
 * Uses dnd-kit for accessible, performant drag operations.
 */
export function SlideListDndContext({
  slides,
  onSlidesReorder,
  onPromptUpdate,
  disabled,
}: SlideListDndContextProps) {
  const [activeSlide, setActiveSlide] = useState<ParsedSlide | null>(null);

  // Configure sensors for pointer, touch, and keyboard interactions
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const slide = slides.find((s) => `slide-${s.slideNumber}` === event.active.id);
    setActiveSlide(slide || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSlide(null);

    if (over && active.id !== over.id) {
      const reordered = reorderSlides(slides, active.id as string, over.id as string);
      onSlidesReorder(reordered);
    }
  };

  const handleDragCancel = () => {
    setActiveSlide(null);
  };

  const slideIds = slides.map((s) => `slide-${s.slideNumber}`);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-3 pl-8">
          {slides.map((slide) => (
            <SortableSlideCard
              key={`slide-${slide.slideNumber}`}
              slide={slide}
              onPromptUpdate={onPromptUpdate}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>

      {/* Ghost preview during drag */}
      <DragOverlay>
        {activeSlide && (
          <div className="opacity-90 shadow-2xl rotate-1 scale-[1.02]">
            <SlideCard slide={activeSlide} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
