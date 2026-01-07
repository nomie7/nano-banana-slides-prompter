import OpenAI from 'openai';

interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

function normalizeBaseURL(url: string): string {
  let normalized = url.trim();
  // Remove trailing slash
  while (normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }
  // Remove /v1 suffix if present
  if (normalized.endsWith('/v1')) {
    normalized = normalized.slice(0, -3);
  }
  // Add /v1
  return normalized + '/v1';
}

const defaultConfig: LLMConfig = {
  apiKey: process.env.OPENAI_API_KEY || '',
  baseURL: normalizeBaseURL(process.env.OPENAI_API_BASE || 'https://api.openai.com'),
  model: process.env.OPENAI_MODEL || 'gpt-4o',
};

export function getDefaultConfig(): { baseURL: string; model: string } {
  // Return without /v1 for display
  let displayURL = defaultConfig.baseURL;
  if (displayURL.endsWith('/v1')) {
    displayURL = displayURL.slice(0, -3);
  }
  return {
    baseURL: displayURL,
    model: defaultConfig.model,
  };
}

function createClient(config?: Partial<LLMConfig>): { client: OpenAI; model: string } {
  const baseURL = config?.baseURL
    ? normalizeBaseURL(config.baseURL)
    : defaultConfig.baseURL;

  const client = new OpenAI({
    apiKey: config?.apiKey || defaultConfig.apiKey,
    baseURL,
  });

  return { client, model: config?.model || defaultConfig.model };
}

type MessageContent = string | Array<{ type: 'text'; text: string } | { type: 'image_url'; image_url: { url: string } }>;

export async function generateWithLLM(
  systemPrompt: string,
  userPrompt: string,
  pdfDataUrl?: string,
  config?: Partial<LLMConfig>
): Promise<string> {
  const { client, model } = createClient(config);

  let userContent: MessageContent;

  if (pdfDataUrl) {
    userContent = [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: pdfDataUrl } }
    ];
  } else {
    userContent = userPrompt;
  }

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent as any },
    ],
  });

  return response.choices[0]?.message?.content || '';
}

export async function* generateWithLLMStream(
  systemPrompt: string,
  userPrompt: string,
  pdfDataUrl?: string,
  config?: Partial<LLMConfig>
): AsyncGenerator<string> {
  const { client, model } = createClient(config);

  let userContent: MessageContent;

  if (pdfDataUrl) {
    userContent = [
      { type: 'text', text: userPrompt },
      { type: 'image_url', image_url: { url: pdfDataUrl } }
    ];
  } else {
    userContent = userPrompt;
  }

  const stream = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent as any },
    ],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}
