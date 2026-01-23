/**
 * Optimize Route
 * POST /api/optimize-prompt - Optimize slide prompts via LLM self-refine
 */
import { Hono } from 'hono';
import { optimizePrompt, optimizePrompts } from '../services/promptOptimizer';

export const optimizeRouter = new Hono();

interface OptimizeRequest {
  prompt: string;
  iterations?: number;
}

interface BatchOptimizeRequest {
  prompts: string[];
  iterations?: number;
}

/**
 * POST /optimize-prompt
 * Optimize a single slide prompt
 */
optimizeRouter.post('/optimize-prompt', async (c) => {
  try {
    const body = await c.req.json<OptimizeRequest>();

    if (!body.prompt || typeof body.prompt !== 'string') {
      return c.json({ success: false, error: 'Prompt is required' }, 400);
    }

    if (body.prompt.length > 5000) {
      return c.json({ success: false, error: 'Prompt exceeds maximum length (5000 chars)' }, 400);
    }

    const iterations = Math.min(body.iterations || 1, 3); // Cap at 3 iterations

    const result = await optimizePrompt(body.prompt, { iterations });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Optimize prompt error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize prompt',
      },
      500
    );
  }
});

/**
 * POST /optimize-prompts
 * Batch optimize multiple slide prompts
 */
optimizeRouter.post('/optimize-prompts', async (c) => {
  try {
    const body = await c.req.json<BatchOptimizeRequest>();

    if (!Array.isArray(body.prompts) || body.prompts.length === 0) {
      return c.json({ success: false, error: 'Prompts array is required' }, 400);
    }

    if (body.prompts.length > 10) {
      return c.json({ success: false, error: 'Maximum 10 prompts per batch' }, 400);
    }

    const iterations = Math.min(body.iterations || 1, 2); // Cap at 2 for batch

    const results = await optimizePrompts(body.prompts, { iterations });

    return c.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Batch optimize error:', error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to optimize prompts',
      },
      500
    );
  }
});
