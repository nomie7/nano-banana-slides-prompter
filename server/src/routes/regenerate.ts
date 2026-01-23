import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { generateWithLLM } from '../services/llm';
import { buildRegeneratePrompt, REGENERATE_SYSTEM_PROMPT } from '../prompts/regenerate-prompt';
import type { SlideStyle, PresentationSettings } from '../prompts/types';

const slideContextSchema = z.object({
  title: z.string(),
  prompt: z.string(),
});

const regenerateSchema = z.object({
  slideNumber: z.number().min(1).max(200),
  previousSlide: slideContextSchema.optional(),
  nextSlide: slideContextSchema.optional(),
  style: z.string(),
  settings: z.object({
    aspectRatio: z.string(),
    slideCount: z.number(),
    colorPalette: z.string(),
    layoutStructure: z.string(),
  }),
  instructions: z.string().max(500).optional(),
  llmConfig: z
    .object({
      apiKey: z.string().optional(),
      baseURL: z.string().optional(),
      model: z.string().optional(),
    })
    .optional(),
});

export const regenerateRouter = new Hono();

/**
 * POST /api/regenerate-slide
 * Regenerates a single slide with context awareness
 */
regenerateRouter.post('/regenerate-slide', zValidator('json', regenerateSchema), async (c) => {
  const body = c.req.valid('json');

  try {
    const prompt = buildRegeneratePrompt({
      slideNumber: body.slideNumber,
      previousSlide: body.previousSlide,
      nextSlide: body.nextSlide,
      style: body.style as SlideStyle,
      settings: body.settings as PresentationSettings,
      instructions: body.instructions,
    });

    const response = await generateWithLLM(
      REGENERATE_SYSTEM_PROMPT,
      prompt,
      undefined,
      body.llmConfig
    );

    const slide = parseSlideFromResponse(response, body.slideNumber);

    return c.json({ success: true, slide });
  } catch (error) {
    console.error('Regenerate slide error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to regenerate slide',
      },
      500
    );
  }
});

/**
 * Parses LLM response to extract slide title and prompt
 */
function parseSlideFromResponse(
  response: string,
  slideNumber: number
): { slideNumber: number; title: string; prompt: string } {
  // Match format: **Slide N: Title**
  const titleMatch = response.match(/\*\*Slide \d+:\s*(.+?)\*\*/);
  // Match code block content
  const promptMatch = response.match(/```\n?([\s\S]+?)\n?```/);

  return {
    slideNumber,
    title: titleMatch?.[1]?.trim() || `Slide ${slideNumber}`,
    prompt: promptMatch?.[1]?.trim() || response.trim(),
  };
}
