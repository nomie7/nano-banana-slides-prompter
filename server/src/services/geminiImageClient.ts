import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { RequestOptions } from '@google/generative-ai';

export interface GeminiImageConfig {
  apiKey: string;
  model?: string;
  baseURL?: string; // Custom API endpoint (e.g., http://127.0.0.1:8045)
}

export interface GeneratedImage {
  data: string; // base64 encoded image
  mimeType: string;
}

export interface GenerateImageResult {
  success: boolean;
  images?: GeneratedImage[];
  error?: string;
}

const DEFAULT_MODEL = 'gemini-2.0-flash-preview-image-generation';

const defaultConfig: GeminiImageConfig = {
  apiKey: process.env.GEMINI_API_KEY || '',
  model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
  baseURL: process.env.GEMINI_BASE_URL || undefined,
};

function createClient(config?: Partial<GeminiImageConfig>): {
  genAI: GoogleGenerativeAI;
  requestOptions: RequestOptions | undefined;
} {
  const apiKey = config?.apiKey || defaultConfig.apiKey;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is required');
  }
  const baseUrl = config?.baseURL || defaultConfig.baseURL;
  const genAI = new GoogleGenerativeAI(apiKey);
  const requestOptions: RequestOptions | undefined = baseUrl ? { baseUrl } : undefined;
  return { genAI, requestOptions };
}

/**
 * Generate slide images from prompts using Gemini Image model
 */
export async function generateSlideImage(
  prompt: string,
  config?: Partial<GeminiImageConfig>
): Promise<GenerateImageResult> {
  try {
    const { genAI, requestOptions } = createClient(config);
    const model = genAI.getGenerativeModel(
      {
        model: config?.model || defaultConfig.model || DEFAULT_MODEL,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
        generationConfig: {
          // @ts-expect-error responseModalities is valid but not in types yet
          responseModalities: ['TEXT', 'IMAGE'],
        },
      },
      requestOptions
    );

    const result = await model.generateContent(prompt);
    const response = result.response;
    const images: GeneratedImage[] = [];

    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData?.data && part.inlineData?.mimeType) {
          images.push({
            data: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          });
        }
      }
    }

    if (images.length === 0) {
      return { success: false, error: 'No images generated' };
    }

    return { success: true, images };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GeminiImage] Error:', message);
    return { success: false, error: message };
  }
}

/**
 * Generate multiple slide images from array of prompts (batch processing)
 */
export async function generateSlideImages(
  prompts: string[],
  config?: Partial<GeminiImageConfig>,
  onProgress?: (completed: number, total: number) => void
): Promise<{ results: GenerateImageResult[]; totalSuccess: number; totalFailed: number }> {
  const results: GenerateImageResult[] = [];
  let totalSuccess = 0;
  let totalFailed = 0;

  for (let i = 0; i < prompts.length; i++) {
    const result = await generateSlideImage(prompts[i], config);
    results.push(result);

    if (result.success) {
      totalSuccess++;
    } else {
      totalFailed++;
    }

    onProgress?.(i + 1, prompts.length);
  }

  return { results, totalSuccess, totalFailed };
}

/**
 * Test connection to Gemini API
 */
export async function testGeminiConnection(
  config?: Partial<GeminiImageConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { genAI, requestOptions } = createClient(config);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }, requestOptions);
    await model.generateContent('Say "OK" if you can hear me.');
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export function getDefaultGeminiConfig() {
  return {
    model: defaultConfig.model || DEFAULT_MODEL,
    hasApiKey: !!defaultConfig.apiKey,
  };
}
