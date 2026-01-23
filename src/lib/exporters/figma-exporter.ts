/**
 * Figma Export Schema
 * Converts slides to Figma-compatible JSON format
 */
import type { ParsedSlide, Session } from '@/types/slidePrompt';

export interface FigmaNode {
  id: string;
  name: string;
  type: 'FRAME' | 'TEXT' | 'RECTANGLE';
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: FigmaFill[];
  characters?: string;
  style?: FigmaTextStyle;
}

export interface FigmaFill {
  type: 'SOLID';
  color: { r: number; g: number; b: number; a: number };
}

export interface FigmaTextStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT';
  fills: FigmaFill[];
}

export interface FigmaDocument {
  name: string;
  schemaVersion: 0;
  version: string;
  document: {
    id: string;
    name: string;
    type: 'DOCUMENT';
    children: FigmaNode[];
  };
  metadata: {
    generator: string;
    generatedAt: string;
  };
}

// Helper to convert hex to Figma RGB
function hexToFigmaColor(hex: string): { r: number; g: number; b: number; a: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0, a: 1 };
  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: 1,
  };
}

// Generate unique ID using crypto for better collision resistance
function generateId(): string {
  // Use crypto.randomUUID() if available (modern browsers), fallback to timestamp-based
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID().slice(0, 9);
  }
  // Fallback for older environments
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Convert slides to Figma-compatible JSON
 */
export function slidesToFigmaJson(session: Session): FigmaDocument {
  const slides = session.generatedPrompt?.slides || session.slides || [];

  const slideFrames: FigmaNode[] = slides.map((slide, index) => ({
    id: generateId(),
    name: `Slide ${slide.slideNumber}: ${slide.title}`,
    type: 'FRAME',
    absoluteBoundingBox: {
      x: index * 820,
      y: 0,
      width: 800,
      height: 600,
    },
    fills: [{ type: 'SOLID', color: hexToFigmaColor('#ffffff') }],
    children: [
      // Title text
      {
        id: generateId(),
        name: 'Title',
        type: 'TEXT',
        absoluteBoundingBox: { x: 40, y: 40, width: 720, height: 50 },
        characters: slide.title,
        style: {
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 700,
          textAlignHorizontal: 'LEFT',
          fills: [{ type: 'SOLID', color: hexToFigmaColor('#1a1a1a') }],
        },
      },
      // Slide number badge background
      {
        id: generateId(),
        name: 'Badge Background',
        type: 'RECTANGLE',
        absoluteBoundingBox: { x: 40, y: 100, width: 36, height: 28 },
        fills: [{ type: 'SOLID', color: hexToFigmaColor('#3b82f6') }],
      },
      // Slide number text
      {
        id: generateId(),
        name: 'Slide Number',
        type: 'TEXT',
        absoluteBoundingBox: { x: 40, y: 100, width: 36, height: 28 },
        characters: String(slide.slideNumber),
        style: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 700,
          textAlignHorizontal: 'CENTER',
          fills: [{ type: 'SOLID', color: hexToFigmaColor('#ffffff') }],
        },
      },
      // Content text
      {
        id: generateId(),
        name: 'Content',
        type: 'TEXT',
        absoluteBoundingBox: { x: 40, y: 140, width: 720, height: 420 },
        characters: slide.prompt,
        style: {
          fontFamily: 'Inter',
          fontSize: 14,
          fontWeight: 400,
          textAlignHorizontal: 'LEFT',
          fills: [{ type: 'SOLID', color: hexToFigmaColor('#374151') }],
        },
      },
    ],
  }));

  return {
    name: session.title,
    schemaVersion: 0,
    version: '1.0.0',
    document: {
      id: generateId(),
      name: 'Document',
      type: 'DOCUMENT',
      children: slideFrames,
    },
    metadata: {
      generator: 'Nano Banana Slides Prompter',
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Export to Figma JSON file
 */
export function exportToFigmaJson(session: Session): void {
  const figmaDoc = slidesToFigmaJson(session);
  const content = JSON.stringify(figmaDoc, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${session.title.replace(/[^a-z0-9]/gi, '_')}_figma.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
