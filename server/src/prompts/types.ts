// Shared types matching the frontend definitions

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

// Generated character from LLM - dynamically created based on content/style
export interface GeneratedCharacter {
  characterType: string;
  speciesOrForm: string;
  coreDescription: string;
  physicalDetails: {
    buildProportions: string;
    distinctiveFeatures: string;
    colorScheme: string;
    faceExpression: string;
  };
  personalityTraits: string;
  wardrobeAndProps: {
    defaultOutfit: string;
    propsAccessories: string;
  };
  signatureGestures: string;
  consistencyNotes: string;
  rawDescription: string; // Full LLM output for reference
}

export interface ContentInput {
  type: ContentInputType;
  text?: string;
  topic?: string;
  fileContent?: string;
  fileName?: string;
  fileType?: 'text' | 'csv' | 'pdf';
  url?: string;
  urlContent?: string;
}

export interface PresentationSettings {
  aspectRatio: AspectRatio;
  slideCount: number;
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
  character?: CharacterSettings;
}

export interface GeneratePromptRequest {
  content: ContentInput;
  style: SlideStyle;
  settings: PresentationSettings;
}

export interface ParsedSlide {
  slideNumber: number;
  title: string;
  prompt: string;
}

export interface GeneratePromptResponse {
  success: boolean;
  prompts?: string;
  slides?: ParsedSlide[];
  error?: string;
  metadata?: {
    style: SlideStyle;
    slideCount: number;
    aspectRatio: AspectRatio;
  };
}

/**
 * Parse the LLM output into individual slides
 * Expected format:
 * **Slide [N]: [Title]**
 * ```
 * [prompt content]
 * ```
 */
export function parseSlides(rawOutput: string): ParsedSlide[] {
  const slides: ParsedSlide[] = [];

  // Match pattern: **Slide N: Title** followed by code block
  const slidePattern = /\*\*Slide\s+(\d+):\s*([^*]+)\*\*\s*```(?:\w*\n)?([\s\S]*?)```/gi;

  let match;
  while ((match = slidePattern.exec(rawOutput)) !== null) {
    const slideNumber = parseInt(match[1], 10);
    const title = match[2].trim();
    const prompt = match[3].trim();

    if (prompt) {
      slides.push({ slideNumber, title, prompt });
    }
  }

  // Fallback: if no matches found, try alternative patterns
  if (slides.length === 0) {
    // Try simpler pattern without code blocks
    const simplePattern = /\*\*Slide\s+(\d+):\s*([^*]+)\*\*\s*\n+([\s\S]*?)(?=\*\*Slide|\n\n\*\*|$)/gi;

    while ((match = simplePattern.exec(rawOutput)) !== null) {
      const slideNumber = parseInt(match[1], 10);
      const title = match[2].trim();
      let prompt = match[3].trim();

      // Remove code block markers if present
      prompt = prompt.replace(/^```\w*\n?/, '').replace(/\n?```$/, '').trim();

      if (prompt) {
        slides.push({ slideNumber, title, prompt });
      }
    }
  }

  return slides.sort((a, b) => a.slideNumber - b.slideNumber);
}

export function parseCharacterDescription(llmOutput: string): GeneratedCharacter | null {
  try {
    const codeBlockMatch = llmOutput.match(/```\s*([\s\S]*?)\s*```/);
    const content = codeBlockMatch ? codeBlockMatch[1] : llmOutput;

    const extractValue = (patterns: string[]): string => {
      for (const pattern of patterns) {
        const regex = new RegExp(`${pattern}[:\\s]+([^\\n]+(?:\\n(?![A-Z_-]+:|\\n).*)*?)(?=\\n[A-Z_-]+:|\\nPHYSICAL|\\nPERSONALITY|\\nWARDROBE|\\nSIGNATURE|\\nCONSISTENCY|$)`, 'is');
        const match = content.match(regex);
        if (match && match[1]?.trim()) {
          return match[1].trim().replace(/\n+/g, ' ');
        }
      }
      return '';
    };

    const extractListValue = (patterns: string[]): string => {
      for (const pattern of patterns) {
        const regex = new RegExp(`${pattern}[:\\s]+(.+?)(?=\\n-|\\n[A-Z]|$)`, 'is');
        const match = content.match(regex);
        if (match && match[1]?.trim()) {
          return match[1].trim();
        }
      }
      return '';
    };

    const character: GeneratedCharacter = {
      characterType: extractValue(['CHARACTER_TYPE', 'CHARACTER TYPE', 'Type']),
      speciesOrForm: extractValue(['SPECIES_OR_FORM', 'SPECIES/FORM', 'Species', 'Form']),
      coreDescription: extractValue(['CORE_DESCRIPTION', 'CORE DESCRIPTION', 'Description', 'Identity']),
      physicalDetails: {
        buildProportions: extractListValue(['Build/proportions', 'Build', 'Proportions', 'Body']),
        distinctiveFeatures: extractListValue(['Distinctive features', 'Distinctive', 'Features', 'Key features']),
        colorScheme: extractListValue(['Color scheme', 'Color palette', 'Colors', 'Palette']),
        faceExpression: extractListValue(['Face/expression', 'Face', 'Expression baseline', 'Default expression']),
      },
      personalityTraits: extractValue(['PERSONALITY_TRAITS', 'PERSONALITY TRAITS', 'Personality', 'Traits']),
      wardrobeAndProps: {
        defaultOutfit: extractListValue(['Default outfit', 'Outfit', 'Clothing', 'Attire', 'Wardrobe']),
        propsAccessories: extractListValue(['Props/accessories', 'Props', 'Accessories', 'Items']),
      },
      signatureGestures: extractValue(['SIGNATURE_GESTURES', 'SIGNATURE GESTURES', 'Gestures', 'Signature poses']),
      consistencyNotes: extractValue(['CONSISTENCY_NOTES', 'CONSISTENCY NOTES', 'Consistency', 'Visual consistency']),
      rawDescription: content,
    };

    if (!character.coreDescription) {
      character.coreDescription = content.substring(0, 800).replace(/\n+/g, ' ');
    }

    return character;
  } catch (error) {
    console.error('Failed to parse character description:', error);
    return null;
  }
}

export interface ExtractUrlRequest {
  url: string;
}

export interface ExtractUrlResponse {
  success: boolean;
  data?: {
    title: string;
    content: string;
    description?: string;
    url: string;
  };
  error?: string;
}

export type ContentCategory = 'technical' | 'business' | 'educational' | 'creative' | 'marketing' | 'scientific' | 'general';

export interface ContentAnalysis {
  contentCategory: ContentCategory;
  suggestedTypes: string[];
  reasoning: string;
}

export function parseContentAnalysis(llmOutput: string): ContentAnalysis | null {
  try {
    const jsonMatch = llmOutput.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.suggestedTypes || !Array.isArray(parsed.suggestedTypes)) {
      return null;
    }

    return {
      contentCategory: parsed.contentCategory || 'general',
      suggestedTypes: parsed.suggestedTypes,
      reasoning: parsed.reasoning || '',
    };
  } catch (error) {
    console.error('Failed to parse content analysis:', error);
    return null;
  }
}
