/**
 * Canva Export Schema
 * Converts slides to Canva-compatible JSON format
 */
import type { ParsedSlide, Session } from '@/types/slidePrompt';

export interface CanvaSlide {
  type: 'PRESENTATION_SLIDE';
  title: string;
  elements: CanvaElement[];
}

export interface CanvaElement {
  type: 'TEXT' | 'SHAPE' | 'IMAGE';
  content?: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: 'normal' | 'bold';
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
  };
}

export interface CanvaDocument {
  version: '1.0';
  type: 'PRESENTATION';
  title: string;
  slides: CanvaSlide[];
  metadata: {
    generator: string;
    generatedAt: string;
    slideCount: number;
  };
}

/**
 * Convert slides to Canva-compatible JSON
 */
export function slidesToCanvaJson(session: Session): CanvaDocument {
  const slides = session.generatedPrompt?.slides || session.slides || [];

  const canvaSlides: CanvaSlide[] = slides.map((slide) => ({
    type: 'PRESENTATION_SLIDE',
    title: slide.title,
    elements: [
      // Title element
      {
        type: 'TEXT',
        content: slide.title,
        position: { x: 50, y: 50 },
        size: { width: 700, height: 60 },
        style: {
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          color: '#1a1a1a',
          textAlign: 'left',
        },
      },
      // Slide number badge
      {
        type: 'SHAPE',
        position: { x: 50, y: 120 },
        size: { width: 40, height: 30 },
        style: {
          backgroundColor: '#3b82f6',
        },
      },
      {
        type: 'TEXT',
        content: String(slide.slideNumber),
        position: { x: 50, y: 120 },
        size: { width: 40, height: 30 },
        style: {
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ffffff',
          textAlign: 'center',
        },
      },
      // Content element
      {
        type: 'TEXT',
        content: slide.prompt,
        position: { x: 50, y: 170 },
        size: { width: 700, height: 350 },
        style: {
          fontSize: 14,
          fontFamily: 'Inter',
          fontWeight: 'normal',
          color: '#374151',
          textAlign: 'left',
        },
      },
    ],
  }));

  return {
    version: '1.0',
    type: 'PRESENTATION',
    title: session.title,
    slides: canvaSlides,
    metadata: {
      generator: 'Nano Banana Slides Prompter',
      generatedAt: new Date().toISOString(),
      slideCount: slides.length,
    },
  };
}

/**
 * Export to Canva JSON file
 */
export function exportToCanvaJson(session: Session): void {
  const canvaDoc = slidesToCanvaJson(session);
  const content = JSON.stringify(canvaDoc, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}_canva.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
