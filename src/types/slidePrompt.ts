export type ContentInputType = 'text' | 'topic' | 'file' | 'url';

export type SlideStyle =
  | 'auto'
  | 'professional'
  | 'technical'
  | 'creative'
  | 'infographic'
  | 'educational'
  | 'pixel-art'
  | 'minimalist'
  | 'dark-neon'
  | 'hand-drawn'
  | 'glassmorphism'
  | 'vintage'
  | '3d-isometric'
  | 'watercolor'
  | 'newspaper'
  | 'flat-design'
  | 'gradient-mesh'
  | 'sci-fi-hud'
  | 'deep-ocean'
  | 'dev-console'
  | 'neon-scientific';

export type AspectRatio = '16:9' | '4:3' | '1:1' | '9:16';

export type LayoutStructure = 'visual-heavy' | 'text-heavy' | 'balanced';

export type ColorPalette =
  | 'auto'
  | 'corporate-blue'
  | 'modern-purple'
  | 'nature-green'
  | 'warm-orange'
  | 'elegant-monochrome'
  | 'vibrant-gradient'
  | 'ocean-teal'
  | 'sunset-pink'
  | 'forest-earth'
  | 'royal-gold'
  | 'arctic-frost'
  | 'neon-night';

export type OutputLanguage = 'en' | 'vi' | 'zh' | 'ja' | 'ko' | 'th' | 'id' | 'fr' | 'de' | 'es';

export const OUTPUT_LANGUAGES: { code: OutputLanguage; label: string; nativeLabel: string }[] = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'vi', label: 'Vietnamese', nativeLabel: 'Tiếng Việt' },
  { code: 'zh', label: 'Chinese', nativeLabel: '中文' },
  { code: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { code: 'ko', label: 'Korean', nativeLabel: '한국어' },
  { code: 'th', label: 'Thai', nativeLabel: 'ภาษาไทย' },
  { code: 'id', label: 'Indonesian', nativeLabel: 'Bahasa Indonesia' },
  { code: 'fr', label: 'French', nativeLabel: 'Français' },
  { code: 'de', label: 'German', nativeLabel: 'Deutsch' },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español' },
];

export type RenderStyle =
  | 'pixar'
  | 'real'
  | 'anime'
  | 'cartoon'
  | 'sketch'
  | 'chibi'
  | 'low-poly'
  | 'mascot';

export type CharacterGender = 'none' | 'male' | 'female';

export interface CharacterSettings {
  enabled: boolean;
  renderStyle: RenderStyle;
  gender: CharacterGender;
}

export interface ContentInput {
  type: ContentInputType;
  text: string;
  topic: string;
  fileContent: string;
  fileName: string;
  fileType?: 'text' | 'csv' | 'pdf';
  url: string;
  urlContent: string;
}

export interface PresentationSettings {
  aspectRatio: AspectRatio;
  slideCount: number;
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
  character?: CharacterSettings;
  outputLanguage?: OutputLanguage;
}

export interface SlidePromptConfig {
  content: ContentInput;
  style: SlideStyle;
  settings: PresentationSettings;
}

export type OutputFormat = 'text' | 'json';

export interface ParsedSlide {
  slideNumber: number;
  title: string;
  prompt: string;
}

export interface GeneratedPrompt {
  plainText: string;
  slides: ParsedSlide[];
  jsonFormat: {
    model: string;
    messages: Array<{
      role: 'system' | 'user';
      content: string;
    }>;
  };
}

export type SessionStatus = 'idle' | 'generating' | 'completed' | 'error';

export interface Session {
  id: string;
  title: string;
  isDefaultTitle?: boolean;
  createdAt: number;
  updatedAt: number;
  config: SlidePromptConfig;
  status: SessionStatus;
  slides: ParsedSlide[];
  generatedPrompt: GeneratedPrompt | null;
  error: string | null;
}
