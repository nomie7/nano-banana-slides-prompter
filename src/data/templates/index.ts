import type { PromptTemplate, TemplateCategory, TemplateFile } from './schema';

const templateCache = new Map<TemplateCategory, PromptTemplate[]>();

const templateLoaders: Record<TemplateCategory, () => Promise<TemplateFile>> = {
  presentation: () =>
    import('./categories/presentation.json').then((m) => m.default as TemplateFile),
  education: () => import('./categories/education.json').then((m) => m.default as TemplateFile),
  business: () => import('./categories/business.json').then((m) => m.default as TemplateFile),
  creative: () => import('./categories/creative.json').then((m) => m.default as TemplateFile),
  quiz: () => import('./categories/quiz.json').then((m) => m.default as TemplateFile),
};

export async function loadTemplatesByCategory(
  category: TemplateCategory
): Promise<PromptTemplate[]> {
  if (templateCache.has(category)) {
    return templateCache.get(category)!;
  }

  try {
    const data = await templateLoaders[category]();
    const templates = data.templates;
    templateCache.set(category, templates);
    return templates;
  } catch (error) {
    console.error(`Failed to load templates for category: ${category}`, error);
    return [];
  }
}

export async function loadAllTemplates(): Promise<PromptTemplate[]> {
  const categories: TemplateCategory[] = [
    'presentation',
    'education',
    'business',
    'creative',
    'quiz',
  ];
  const results = await Promise.all(categories.map(loadTemplatesByCategory));
  return results.flat();
}

export function getTemplateById(
  templates: PromptTemplate[],
  id: string
): PromptTemplate | undefined {
  return templates.find((t) => t.id === id);
}

export function clearTemplateCache(): void {
  templateCache.clear();
}

export { TEMPLATE_CATEGORIES } from './schema';
export type { PromptTemplate, TemplateCategory, TemplateConfig } from './schema';
