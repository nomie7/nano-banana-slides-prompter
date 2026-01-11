import OpenAI, { APIError, RateLimitError, APIConnectionError, AuthenticationError } from 'openai';
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';

interface LLMConfig { apiKey: string; baseURL: string; model: string; }

// 重试配置
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
};

// 自定义错误类型，用于前端识别
export class LLMError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly retryable: boolean = false
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function handleAPIError(error: unknown): never {
  if (error instanceof RateLimitError) {
    throw new LLMError(
      'API rate limit exceeded. Please wait a moment and try again.',
      'RATE_LIMIT',
      429,
      true
    );
  }
  
  if (error instanceof AuthenticationError) {
    throw new LLMError(
      'Invalid API key. Please check your API key configuration.',
      'AUTH_ERROR',
      401,
      false
    );
  }
  
  if (error instanceof APIConnectionError) {
    throw new LLMError(
      'Failed to connect to API server. Please check your network or API base URL.',
      'CONNECTION_ERROR',
      undefined,
      true
    );
  }
  
  if (error instanceof APIError) {
    const statusCode = error.status;
    if (statusCode === 429) {
      throw new LLMError(
        'API rate limit exceeded. Please wait a moment and try again.',
        'RATE_LIMIT',
        429,
        true
      );
    }
    if (statusCode === 401 || statusCode === 403) {
      throw new LLMError(
        'Authentication failed. Please check your API key.',
        'AUTH_ERROR',
        statusCode,
        false
      );
    }
    if (statusCode === 400) {
      throw new LLMError(
        'Invalid request. Please check your input parameters.',
        'BAD_REQUEST',
        400,
        false
      );
    }
    if (statusCode && statusCode >= 500) {
      throw new LLMError(
        'API server error. Please try again later.',
        'SERVER_ERROR',
        statusCode,
        true
      );
    }
    throw new LLMError(
      error.message || 'An unexpected API error occurred.',
      'API_ERROR',
      statusCode,
      false
    );
  }
  
  if (error instanceof Error) {
    throw new LLMError(error.message, 'UNKNOWN_ERROR', undefined, false);
  }
  
  throw new LLMError('An unexpected error occurred.', 'UNKNOWN_ERROR', undefined, false);
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = RETRY_CONFIG.maxRetries
): Promise<T> {
  let lastError: Error = new Error('Unknown error');
  let delay = RETRY_CONFIG.initialDelayMs;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // 检查是否是可重试的错误
      const isRetryable =
        error instanceof RateLimitError ||
        error instanceof APIConnectionError ||
        (error instanceof APIError && error.status && error.status >= 500) ||
        (error instanceof LLMError && error.retryable);
      
      if (isRetryable && attempt < maxRetries) {
        console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms...`);
        await sleep(delay);
        delay = Math.min(delay * 2, RETRY_CONFIG.maxDelayMs);
        continue;
      }
      
      handleAPIError(error);
    }
  }
  
  handleAPIError(lastError);
}

function normalizeBaseURL(url: string): string {
  const parsed = new URL(url.trim());
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('Base URL must use http or https');
  return parsed.origin + parsed.pathname.replace(/\/+$/, '').replace(/\/+/g, '/').replace(/(?:\/v1)?\/*$/, '') + '/v1';
}

const defaultConfig: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: normalizeBaseURL(process.env.OPENAI_API_BASE || 'https://api.openai.com'),
  model: process.env.OPENAI_MODEL || 'gpt-4o',
};

export function getDefaultConfig() {
  return { baseURL: defaultConfig.baseURL.replace(/\/v1$/, ''), model: defaultConfig.model };
}

function createClient(config?: Partial<LLMConfig>) {
  const baseURL = config?.baseURL ? normalizeBaseURL(config.baseURL) : defaultConfig.baseURL;
  return { client: new OpenAI({ apiKey: config?.apiKey || defaultConfig.apiKey, baseURL }), model: config?.model || defaultConfig.model };
}

type MessageContent = string | ChatCompletionContentPart[];
const buildUserContent = (userPrompt: string, pdfDataUrl?: string): MessageContent =>
  pdfDataUrl ? [{ type: 'text', text: userPrompt }, { type: 'image_url', image_url: { url: pdfDataUrl } }] : userPrompt;

export async function generateWithLLM(systemPrompt: string, userPrompt: string, pdfDataUrl?: string, config?: Partial<LLMConfig>): Promise<string> {
  const { client, model } = createClient(config);
  
  return withRetry(async () => {
    const response = await client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: buildUserContent(userPrompt, pdfDataUrl) }],
    });
    return response.choices[0]?.message?.content || '';
  });
}

export async function* generateWithLLMStream(systemPrompt: string, userPrompt: string, pdfDataUrl?: string, config?: Partial<LLMConfig>): AsyncGenerator<string> {
  const { client, model } = createClient(config);
  
  const stream = await withRetry(async () => {
    return client.chat.completions.create({
      model,
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: buildUserContent(userPrompt, pdfDataUrl) }],
      stream: true,
    });
  });
  
  try {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  } catch (error) {
    handleAPIError(error);
  }
}
