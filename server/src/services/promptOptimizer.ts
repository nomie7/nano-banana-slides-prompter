/**
 * Prompt Optimizer Service
 * Self-refine pattern for improving slide prompts via LLM
 */
import { generateWithLLM } from './llm';
import { OPTIMIZE_SINGLE_PROMPT } from '../prompts/optimizer';

export interface OptimizationResult {
  original: string;
  optimized: string;
  improvements: string[];
  score: {
    before: number;
    after: number;
  };
}

export interface OptimizeOptions {
  iterations?: number;
  config?: {
    apiKey?: string;
    baseURL?: string;
    model?: string;
  };
}

/**
 * Parse LLM response to OptimizationResult
 */
function parseOptimizationResponse(response: string): OptimizationResult {
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      original: parsed.original || '',
      optimized: parsed.optimized || parsed.original || '',
      improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
      score: {
        before: parsed.score?.before || 5,
        after: parsed.score?.after || 7,
      },
    };
  } catch {
    // Fallback: return original with no changes
    return {
      original: '',
      optimized: '',
      improvements: ['Unable to parse optimization response'],
      score: { before: 5, after: 5 },
    };
  }
}

/**
 * Optimize a single slide prompt
 * Uses self-refine pattern with configurable iterations
 */
export async function optimizePrompt(
  prompt: string,
  options: OptimizeOptions = {}
): Promise<OptimizationResult> {
  const { iterations = 1, config } = options;

  // Single iteration optimization (most efficient)
  if (iterations <= 1) {
    const userPrompt = `Optimize this slide prompt:\n\n${prompt}`;
    const response = await generateWithLLM(OPTIMIZE_SINGLE_PROMPT, userPrompt, undefined, config);
    const result = parseOptimizationResponse(response);
    result.original = prompt;
    return result;
  }

  // Multi-iteration: chain optimizations, tracking last LLM-assigned score
  let currentPrompt = prompt;
  const allImprovements: string[] = [];
  let initialScore = 5;
  let finalScore = 5;

  for (let i = 0; i < iterations; i++) {
    const userPrompt = `Optimize this slide prompt:\n\n${currentPrompt}`;
    const response = await generateWithLLM(OPTIMIZE_SINGLE_PROMPT, userPrompt, undefined, config);
    const result = parseOptimizationResponse(response);

    if (i === 0) {
      initialScore = result.score.before;
    }

    currentPrompt = result.optimized || currentPrompt;
    allImprovements.push(...result.improvements);
    // Use the actual LLM-assigned score from the last iteration
    finalScore = result.score.after;
  }

  return {
    original: prompt,
    optimized: currentPrompt,
    improvements: allImprovements,
    score: {
      before: initialScore,
      after: finalScore,
    },
  };
}

/**
 * Batch optimize multiple prompts
 */
export async function optimizePrompts(
  prompts: string[],
  options: OptimizeOptions = {}
): Promise<OptimizationResult[]> {
  // Process sequentially to respect rate limits
  const results: OptimizationResult[] = [];
  for (const prompt of prompts) {
    const result = await optimizePrompt(prompt, options);
    results.push(result);
  }
  return results;
}
