import type { ParsedSlide } from '@/types/slidePrompt';

/**
 * Reorders slides array based on drag and drop action.
 * Automatically renumbers slides after reordering.
 *
 * @param slides - Current array of slides
 * @param activeId - ID of the slide being dragged (format: "slide-{number}")
 * @param overId - ID of the slide being dropped over (format: "slide-{number}")
 * @returns New array with slides reordered and renumbered
 */
export function reorderSlides(
  slides: ParsedSlide[],
  activeId: string,
  overId: string
): ParsedSlide[] {
  const oldIndex = slides.findIndex((s) => `slide-${s.slideNumber}` === activeId);
  const newIndex = slides.findIndex((s) => `slide-${s.slideNumber}` === overId);

  if (oldIndex === -1 || newIndex === -1) return slides;

  const reordered = [...slides];
  const [removed] = reordered.splice(oldIndex, 1);
  reordered.splice(newIndex, 0, removed);

  // Re-number slides sequentially
  return reordered.map((slide, index) => ({
    ...slide,
    slideNumber: index + 1,
  }));
}
