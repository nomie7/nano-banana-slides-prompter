import type {
  SlideStyle,
  AspectRatio,
  ColorPalette,
  LayoutStructure,
  RenderStyle,
  CharacterGender,
  OutputLanguage,
} from '@/types/slidePrompt';

export type TemplateCategory = 'presentation' | 'education' | 'business' | 'creative' | 'quiz';

export interface TemplateConfig {
  style?: SlideStyle;
  aspectRatio?: AspectRatio;
  slideCount?: number;
  colorPalette?: ColorPalette;
  layoutStructure?: LayoutStructure;
  character?: {
    enabled: boolean;
    renderStyle?: RenderStyle;
    gender?: CharacterGender;
  };
  outputLanguage?: OutputLanguage;
}

export interface PromptTemplate {
  id: string;
  name: string;
  nameKey: string;
  category: TemplateCategory;
  description: string;
  descriptionKey: string;
  tags: string[];
  config: TemplateConfig;
  version: string;
}

export interface TemplateFile {
  category: TemplateCategory;
  templates: PromptTemplate[];
}

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; labelKey: string; icon: string }[] = [
  { id: 'presentation', labelKey: 'templates.categories.presentation', icon: 'Presentation' },
  { id: 'education', labelKey: 'templates.categories.education', icon: 'GraduationCap' },
  { id: 'business', labelKey: 'templates.categories.business', icon: 'Briefcase' },
  { id: 'creative', labelKey: 'templates.categories.creative', icon: 'Palette' },
  { id: 'quiz', labelKey: 'templates.categories.quiz', icon: 'HelpCircle' },
];
