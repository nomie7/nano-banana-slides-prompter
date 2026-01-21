import type { SlideStyle, PresentationSettings } from './types';

interface RegenerateContext {
  slideNumber: number;
  previousSlide?: { title: string; prompt: string };
  nextSlide?: { title: string; prompt: string };
  style: SlideStyle;
  settings: PresentationSettings;
  instructions?: string;
}

/**
 * Builds a prompt for regenerating a single slide with context awareness.
 * Takes into account previous/next slides for consistency.
 */
export function buildRegeneratePrompt(ctx: RegenerateContext): string {
  const contextParts: string[] = [];

  if (ctx.previousSlide) {
    contextParts.push(`Previous slide (${ctx.slideNumber - 1}): "${ctx.previousSlide.title}"`);
  }
  if (ctx.nextSlide) {
    contextParts.push(`Next slide (${ctx.slideNumber + 1}): "${ctx.nextSlide.title}"`);
  }

  const contextSection =
    contextParts.length > 0 ? `\n## Surrounding Context\n${contextParts.join('\n')}\n` : '';

  const instructionsSection = ctx.instructions
    ? `\n## Special Instructions\n${ctx.instructions}\n`
    : '';

  return `You are regenerating slide ${ctx.slideNumber} of a presentation.
${contextSection}
## Style Guidelines
- Visual Style: ${ctx.style}
- Aspect Ratio: ${ctx.settings.aspectRatio}
- Color Palette: ${ctx.settings.colorPalette}
- Layout: ${ctx.settings.layoutStructure}
${instructionsSection}
## Requirements
1. Maintain consistency with surrounding slides (if any)
2. Follow the ${ctx.style} visual style precisely
3. Optimize layout for ${ctx.settings.aspectRatio} format
4. Create detailed, descriptive content for AI image generation

## Output Format
**Slide ${ctx.slideNumber}: [Compelling Title]**
\`\`\`
[Detailed visual description for AI image generation including:
- Visual composition and layout
- Color scheme and lighting
- Key elements and their placement
- Typography and text elements
- Mood and atmosphere]
\`\`\`
`.trim();
}

/**
 * System prompt for slide regeneration
 */
export const REGENERATE_SYSTEM_PROMPT = `You are an expert presentation designer.
Your task is to regenerate a single slide that fits seamlessly with the surrounding content.
Focus on creating visually compelling and contextually appropriate content.
Always output in the exact format specified.`;
