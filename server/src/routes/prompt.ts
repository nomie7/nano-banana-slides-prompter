import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { streamSSE } from 'hono/streaming';
import { z } from 'zod';
import { generateWithLLM, generateWithLLMStream } from '../services/llm';
import {
  NANO_BANANA_PRO_SYSTEM_PROMPT,
  CHARACTER_GENERATION_SYSTEM_PROMPT,
  CONTENT_ANALYZER_SYSTEM_PROMPT,
  buildUserPrompt,
  buildCharacterGenerationPrompt,
  buildSlideTypeSequence,
  getDefaultSlideSequence,
} from '../prompts/system';
import type { GeneratePromptResponse, ParsedSlide, GeneratedCharacter, ContentAnalysis } from '../prompts/types';
import { parseSlides, parseCharacterDescription, parseContentAnalysis } from '../prompts/types';

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
    outputLanguage: z.enum(['en', 'vi', 'zh', 'ja', 'ko', 'th', 'id', 'fr', 'de', 'es']).optional(),
  }),
  llmConfig: z.object({
    apiKey: z.string(),
    baseURL: z.string(),
    model: z.string(),
  }).optional(),
});

export const promptRouter = new Hono();

function extractContentText(body: z.infer<typeof generateSchema>): { text: string; pdfData?: string } {
  const contentParts: string[] = [];
  let pdfData: string | undefined;

  if (body.content.text?.trim()) {
    contentParts.push(`## User Prompt/Text\n${body.content.text.trim()}`);
  }
  if (body.content.topic?.trim()) {
    contentParts.push(`## Topic Focus\n${body.content.topic.trim()}`);
  }
  if (body.content.fileContent?.trim()) {
    const fileName = body.content.fileName || 'uploaded file';
    if (body.content.fileType === 'pdf') {
      pdfData = body.content.fileContent;
      contentParts.push(`## PDF Document: "${fileName}"\n[PDF file attached - analyze the document content to create presentation slides]`);
    } else {
      contentParts.push(`## Content from File "${fileName}"\n${body.content.fileContent.trim()}`);
    }
  }
  if (body.content.urlContent?.trim()) {
    contentParts.push(`## Content from URL "${body.content.url}"\n${body.content.urlContent.trim()}`);
  } else if (body.content.url?.trim()) {
    contentParts.push(`## Reference URL\nCreate a presentation about the content from: ${body.content.url}`);
  }

  return { text: contentParts.join('\n\n'), pdfData };
}

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

    let generatedCharacter: GeneratedCharacter | undefined;
    let slideTypeSequence: string[];

    const analysisPromise = (async () => {
      try {
        const analysisResponse = await generateWithLLM(
          CONTENT_ANALYZER_SYSTEM_PROMPT,
          `Analyze this content for a ${body.settings.slideCount}-slide presentation and suggest optimal slide types:\n\n${contentText}`,
          undefined,
          body.llmConfig
        );
        return parseContentAnalysis(analysisResponse);
      } catch (error) {
        console.error('Content analysis failed:', error);
        return null;
      }
    })();

    const characterPromise = (async () => {
      if (body.settings.character?.enabled && body.settings.character?.renderStyle) {
        try {
          const characterPrompt = buildCharacterGenerationPrompt({
            content: contentText,
            style: body.style,
            renderStyle: body.settings.character.renderStyle,
            gender: body.settings.character.gender,
            slideCount: body.settings.slideCount,
          });

          const characterResponse = await generateWithLLM(
            CHARACTER_GENERATION_SYSTEM_PROMPT,
            characterPrompt,
            undefined,
            body.llmConfig
          );

          return parseCharacterDescription(characterResponse) ?? undefined;
        } catch (error) {
          console.error('Character generation failed:', error);
          return undefined;
        }
      }
      return undefined;
    })();

    const [contentAnalysis, character] = await Promise.all([analysisPromise, characterPromise]);
    generatedCharacter = character;
    slideTypeSequence = buildSlideTypeSequence(contentAnalysis, body.settings.slideCount);

    const userPrompt = buildUserPrompt({
      content: contentText,
      style: body.style,
      colorPalette: body.settings.colorPalette,
      layoutStructure: body.settings.layoutStructure,
      aspectRatio: body.settings.aspectRatio,
      slideCount: body.settings.slideCount,
      character: body.settings.character,
      generatedCharacter,
      slideTypeSequence,
      outputLanguage: body.settings.outputLanguage,
    });

    try {
      const generatedPrompts = await generateWithLLM(
        NANO_BANANA_PRO_SYSTEM_PROMPT,
        userPrompt,
        pdfData,
        body.llmConfig
      );

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

function parseNewSlides(buffer: string, alreadyEmitted: Set<number>): {
  newSlides: ParsedSlide[];
  updatedBuffer: string;
} {
  const newSlides: ParsedSlide[] = [];
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

  const lastSlideMarker = buffer.lastIndexOf('**Slide');
  if (lastSlideMarker > lastMatchEnd) {
    return { newSlides, updatedBuffer: buffer.slice(lastSlideMarker) };
  }
  return { newSlides, updatedBuffer: buffer.slice(lastMatchEnd) };
}

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

    let generatedCharacter: GeneratedCharacter | undefined;
    let slideTypeSequence: string[];

    const analysisPromise = (async () => {
      try {
        const analysisResponse = await generateWithLLM(
          CONTENT_ANALYZER_SYSTEM_PROMPT,
          `Analyze this content for a ${body.settings.slideCount}-slide presentation and suggest optimal slide types:\n\n${contentText}`,
          undefined,
          body.llmConfig
        );
        return parseContentAnalysis(analysisResponse);
      } catch (error) {
        console.error('Content analysis failed:', error);
        return null;
      }
    })();

    const characterPromise = (async () => {
      if (body.settings.character?.enabled && body.settings.character?.renderStyle) {
        try {
          const characterPrompt = buildCharacterGenerationPrompt({
            content: contentText,
            style: body.style,
            renderStyle: body.settings.character.renderStyle,
            gender: body.settings.character.gender,
            slideCount: body.settings.slideCount,
          });

          const characterResponse = await generateWithLLM(
            CHARACTER_GENERATION_SYSTEM_PROMPT,
            characterPrompt,
            undefined,
            body.llmConfig
          );

          return parseCharacterDescription(characterResponse) ?? undefined;
        } catch (error) {
          console.error('Character generation failed:', error);
          return undefined;
        }
      }
      return undefined;
    })();

    const [contentAnalysis, character] = await Promise.all([analysisPromise, characterPromise]);
    generatedCharacter = character;
    slideTypeSequence = buildSlideTypeSequence(contentAnalysis, body.settings.slideCount);

    const userPrompt = buildUserPrompt({
      content: contentText,
      style: body.style,
      colorPalette: body.settings.colorPalette,
      layoutStructure: body.settings.layoutStructure,
      aspectRatio: body.settings.aspectRatio,
      slideCount: body.settings.slideCount,
      character: body.settings.character,
      generatedCharacter,
      slideTypeSequence,
      outputLanguage: body.settings.outputLanguage,
    });

    return streamSSE(c, async (stream) => {
      let buffer = '';
      const emittedSlides = new Set<number>();
      let eventId = 0;

      try {
        for await (const chunk of generateWithLLMStream(
          NANO_BANANA_PRO_SYSTEM_PROMPT,
          userPrompt,
          pdfData,
          body.llmConfig
        )) {
          buffer += chunk;

          const { newSlides, updatedBuffer } = parseNewSlides(buffer, emittedSlides);
          buffer = updatedBuffer;

          for (const slide of newSlides) {
            await stream.writeSSE({
              id: String(++eventId),
              event: 'slide',
              data: JSON.stringify(slide),
            });
          }
        }

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

