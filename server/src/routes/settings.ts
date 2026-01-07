import { Hono } from 'hono';
import { getDefaultConfig } from '../services/llm';

const settingsRouter = new Hono();

settingsRouter.get('/settings/llm', (c) => {
  const config = getDefaultConfig();
  return c.json(config);
});

export { settingsRouter };
