import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import { generateWithLLM, generateWithLLMStream } from '../services/llm';
import {
  NANO_BANANA_PRO_SYSTEM_PROMPT,
  buildUserPrompt,
} from '../prompts/system';
import type { GeneratePromptResponse, ParsedSlide } from '../prompts/types';
import { parseSlides } from '../prompts/types';

const generateSchema = z.object({
  content: z.object({
    type: z.enum(['text', 'topic', 'file', 'url']),
    text: z.string().optional(),
    topic: z.string().optional(),
    fileContent: z.string().optional(),
    fileName: z.string().optional(),
    fileType: z.enum(['text', 'csv', 'pdf']).optional(),
    url: z.string().optional(),
    urlContent: z.string().optional(),
  }),
  style: z.enum([
    'professional',
    'technical',
    'creative',
    'infographic',
    'educational',
    'pixel-art',
    'minimalist',
    'dark-neon',
    'hand-drawn',
    'glassmorphism',
    'vintage',
    '3d-isometric',
    'watercolor',
    'newspaper',
    'flat-design',
    'gradient-mesh',
    'sci-fi-hud',
    'deep-ocean',
    'dev-console',
    'neon-scientific',
  ]),
  settings: z.object({
    aspectRatio: z.enum(['16:9', '4:3', '1:1', '9:16']),
    slideCount: z.number().min(1).max(20),
    colorPalette: z.enum([
      'auto',
      'corporate-blue',
      'modern-purple',
      'nature-green',
      'warm-orange',
      'elegant-monochrome',
      'vibrant-gradient',
      'ocean-teal',
      'sunset-pink',
      'forest-earth',
      'royal-gold',
      'arctic-frost',
      'neon-night',
    ]),
    layoutStructure: z.enum(['visual-heavy', 'text-heavy', 'balanced']),
    character: z.object({
      enabled: z.boolean(),
      renderStyle: z.enum(['pixar', 'real', 'anime', 'cartoon', 'sketch', 'chibi', 'low-poly', 'mascot']),
      gender: z.enum(['none', 'male', 'female']),
    }).optional(),
  }),
  llmConfig: z.object({
    apiKey: z.string(),
    baseURL: z.string(),
    model: z.string(),
  }).optional(),
});

export const promptRouter = new Hono();

/**
 * Build content text from request body.
 * Combines content from ALL tabs that have data, not just the selected tab.
 * Returns both text content and optional PDF data for vision models.
 */
function extractContentText(body: z.infer<typeof generateSchema>): { text: string; pdfData?: string } {
  const contentParts: string[] = [];
  let pdfData: string | undefined;

  // Add text content if present
  if (body.content.text?.trim()) {
    contentParts.push(`## User Prompt/Text\n${body.content.text.trim()}`);
  }

  // Add topic if present
  if (body.content.topic?.trim()) {
    contentParts.push(`## Topic Focus\n${body.content.topic.trim()}`);
  }

  // Add file content if present
  if (body.content.fileContent?.trim()) {
    const fileName = body.content.fileName || 'uploaded file';

    if (body.content.fileType === 'pdf') {
      // For PDFs, store the base64 data separately for vision models
      pdfData = body.content.fileContent;
      contentParts.push(`## PDF Document: "${fileName}"\n[PDF file attached - analyze the document content to create presentation slides]`);
    } else {
      // For text/CSV, include content directly
      contentParts.push(`## Content from File "${fileName}"\n${body.content.fileContent.trim()}`);
    }
  }

  // Add URL content if present
  if (body.content.urlContent?.trim()) {
    contentParts.push(`## Content from URL "${body.content.url}"\n${body.content.urlContent.trim()}`);
  } else if (body.content.url?.trim()) {
    // URL provided but not yet extracted
    contentParts.push(`## Reference URL\nCreate a presentation about the content from: ${body.content.url}`);
  }

  return { text: contentParts.join('\n\n'), pdfData };
}

// Original non-streaming endpoint (kept for backwards compatibility)
promptRouter.post(
  '/generate-prompt',
  zValidator('json', generateSchema),
  async (c) => {
    const body = c.req.valid('json');
    const { text: contentText, pdfData } = extractContentText(body);

    if (!contentText.trim()) {
      return c.json<GeneratePromptResponse>(
        {
          success: false,
          error: 'No content provided',
        },
        400
      );
    }

    const userPrompt = buildUserPrompt({
      content: contentText,
      style: body.style,
      colorPalette: body.settings.colorPalette,
      layoutStructure: body.settings.layoutStructure,
      aspectRatio: body.settings.aspectRatio,
      slideCount: body.settings.slideCount,
      character: body.settings.character,
    });

    try {
      const generatedPrompts = await generateWithLLM(
        NANO_BANANA_PRO_SYSTEM_PROMPT,
        userPrompt,
        pdfData
      );

      // Parse the output into individual slides
      const slides = parseSlides(generatedPrompts);

      return c.json<GeneratePromptResponse>({
        success: true,
        prompts: generatedPrompts,
        slides,
        metadata: {
          style: body.style,
          slideCount: body.settings.slideCount,
          aspectRatio: body.settings.aspectRatio,
        },
      });
    } catch (error) {
      console.error('LLM generation error:', error);
      return c.json<GeneratePromptResponse>(
        {
          success: false,
          error:
            error instanceof Error ? error.message : 'Failed to generate prompts',
        },
        500
      );
    }
  }
);

/**
 * Parse slides progressively from accumulated buffer.
 * Returns newly completed slides and leaves partial slide in buffer.
 */
function parseNewSlides(buffer: string, alreadyEmitted: Set<number>): {
  newSlides: ParsedSlide[];
  updatedBuffer: string;
} {
  const newSlides: ParsedSlide[] = [];

  // Match complete slides: **Slide N: Title** followed by ``` code block ```
  const slidePattern = /\*\*Slide\s+(\d+):\s*([^*]+)\*\*\s*```(?:\w*\n)?([\s\S]*?)```/gi;

  let match;
  let lastMatchEnd = 0;

  while ((match = slidePattern.exec(buffer)) !== null) {
    const slideNumber = parseInt(match[1], 10);
    const title = match[2].trim();
    const prompt = match[3].trim();

    if (prompt && !alreadyEmitted.has(slideNumber)) {
      newSlides.push({ slideNumber, title, prompt });
      alreadyEmitted.add(slideNumber);
    }

    lastMatchEnd = Math.max(lastMatchEnd, match.index + match[0].length);
  }

  // Keep only the unmatched portion (potential partial slide)
  // But we need to be careful to keep enough context for partial matches
  // Find the last **Slide marker that might be incomplete
  const lastSlideMarker = buffer.lastIndexOf('**Slide');
  if (lastSlideMarker > lastMatchEnd) {
    // There's a partial slide starting, keep from there
    return {
      newSlides,
      updatedBuffer: buffer.slice(lastSlideMarker),
    };
  }

  // Otherwise just keep trailing content that might be start of new slide
  return {
    newSlides,
    updatedBuffer: buffer.slice(lastMatchEnd),
  };
}

// Streaming endpoint using SSE
promptRouter.post(
  '/generate-prompt-stream',
  zValidator('json', generateSchema),
  async (c) => {
    const body = c.req.valid('json');
    const { text: contentText, pdfData } = extractContentText(body);

    if (!contentText.trim()) {
      return c.json(
        {
          type: 'error',
          error: 'No content provided',
        },
        400
      );
    }

    const userPrompt = buildUserPrompt({
      content: contentText,
      style: body.style,
      colorPalette: body.settings.colorPalette,
      layoutStructure: body.settings.layoutStructure,
      aspectRatio: body.settings.aspectRatio,
      slideCount: body.settings.slideCount,
      character: body.settings.character,
    });

    return streamSSE(c, async (stream) => {
      let buffer = '';
      const emittedSlides = new Set<number>();
      let eventId = 0;

      try {
        // Start streaming from LLM
        for await (const chunk of generateWithLLMStream(
          NANO_BANANA_PRO_SYSTEM_PROMPT,
          userPrompt,
          pdfData,
          body.llmConfig
        )) {
          buffer += chunk;

          // Try to parse any complete slides
          const { newSlides, updatedBuffer } = parseNewSlides(buffer, emittedSlides);
          buffer = updatedBuffer;

          // Emit each new slide as an SSE event
          for (const slide of newSlides) {
            await stream.writeSSE({
              id: String(++eventId),
              event: 'slide',
              data: JSON.stringify(slide),
            });
          }
        }

        // Final parse for any remaining complete slides
        const finalSlides = parseSlides(buffer);
        for (const slide of finalSlides) {
          if (!emittedSlides.has(slide.slideNumber)) {
            await stream.writeSSE({
              id: String(++eventId),
              event: 'slide',
              data: JSON.stringify(slide),
            });
            emittedSlides.add(slide.slideNumber);
          }
        }

        // Send completion event
        await stream.writeSSE({
          id: String(++eventId),
          event: 'done',
          data: JSON.stringify({
            totalSlides: emittedSlides.size,
            style: body.style,
            aspectRatio: body.settings.aspectRatio,
          }),
        });
      } catch (error) {
        console.error('Streaming error:', error);
        await stream.writeSSE({
          id: String(++eventId),
          event: 'error',
          data: JSON.stringify({
            error: error instanceof Error ? error.message : 'Stream failed',
          }),
        });
      }
    });
  }
);

