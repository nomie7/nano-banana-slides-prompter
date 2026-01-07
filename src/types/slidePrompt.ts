export type ContentInputType = 'text' | 'topic' | 'file' | 'url';

export type SlideStyle =
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

// Character presenter types
export type RenderStyle =
  | 'pixar'      // 3D animated (Pixar/Disney)
  | 'real'       // Photorealistic human
  | 'anime'      // Japanese animation
  | 'cartoon'    // 2D Western cartoon
  | 'sketch'     // Hand-drawn pencil/ink
  | 'chibi'      // Cute small-proportioned
  | 'low-poly'   // Geometric 3D
  | 'mascot';    // Corporate mascot style

export type CharacterGender =
  | 'none'       // Unspecified (default) - don't include gender in prompt
  | 'male'
  | 'female';

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
  createdAt: number;
  updatedAt: number;
  config: SlidePromptConfig;
  status: SessionStatus;
  slides: ParsedSlide[];
  generatedPrompt: GeneratedPrompt | null;
  error: string | null;
}
