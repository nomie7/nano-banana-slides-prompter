import type {
  SlidePromptConfig,
  GeneratedPrompt,
  SlideStyle,
  ColorPalette,
  LayoutStructure,
  AspectRatio,
} from '@/types/slidePrompt';

const styleDescriptions: Record<SlideStyle, string> = {
  professional:
    'Clean, corporate design with professional typography, subtle gradients, and business-appropriate imagery. Use structured layouts with clear hierarchy.',
  technical:
    'Blueprint-style with technical diagrams, grid layouts, and monospace fonts. Include data visualizations and schematic elements.',
  creative:
    'Bold, artistic design with creative typography, vibrant colors, and expressive imagery. Use asymmetric layouts and visual storytelling.',
  infographic:
    'Data-driven design with charts, icons, and visual statistics. Use clear visual hierarchy to present information at a glance.',
  educational:
    'Clear, accessible design with step-by-step layouts, numbered sections, and supportive illustrations. Focus on learning outcomes.',
  'pixel-art':
    'Retro pixel art aesthetic with 8-bit style graphics, pixel fonts, and nostalgic color palettes. Fun and memorable visuals.',
  minimalist:
    'Ultra-clean design with abundant whitespace, simple typography, and minimal elements. Focus on essential content only.',
  'dark-neon':
    'Dark backgrounds with vibrant neon accent colors, glowing effects, and high contrast. Cyberpunk-inspired aesthetic.',
  'hand-drawn':
    'Organic, illustrated feel with sketchy lines, rough edges, and handwritten fonts. Warm and approachable style.',
  glassmorphism:
    'Frosted glass effects with translucent layers, soft shadows, and blurred backgrounds. Modern and sophisticated.',
  vintage:
    '70s/80s inspired design with warm tones, retro typography, and nostalgic textures. Groovy and memorable.',
  '3d-isometric':
    'Dimensional graphics with isometric illustrations, depth effects, and 3D elements. Technical yet engaging.',
  watercolor:
    'Soft, artistic style with painted textures, flowing colors, and organic shapes. Elegant and creative.',
  newspaper:
    'Editorial design with bold headlines, column layouts, serif fonts, and print-inspired aesthetics. Classic and authoritative.',
  'flat-design':
    'Bold solid colors, simple geometric shapes, no gradients or shadows. Clean and modern.',
  'gradient-mesh':
    'Modern style with flowing color transitions, mesh gradients, and abstract color blends. Contemporary and eye-catching.',
  'sci-fi-hud':
    'Futuristic heads-up display with holographic elements, technical readouts, and cyberpunk aesthetics. High-tech and immersive.',
  'deep-ocean':
    'Deep underwater atmosphere with bioluminescent creatures, mysterious depths, and natural beauty. Documentary-style visuals.',
  'dev-console':
    'Developer terminal aesthetic with code syntax highlighting, system logs, and monospace fonts. Technical and authentic.',
  'neon-scientific':
    'Dark backgrounds with glowing bioluminescent elements, energy particle effects, and holographic scientific visualizations. Combine technical diagrams with cinematic neon lighting (blues, oranges, teals). Features flowing energy waves, high-contrast data overlays, and futuristic lab aesthetics. Perfect for presenting scientific concepts with dramatic visual impact.',
};

const colorPaletteDescriptions: Record<ColorPalette, string> = {
  auto: 'Let the AI choose the best color palette based on the content and style',
  'corporate-blue': 'Navy blue (#1E3A5F), light blue (#4A90D9), white, and silver accents',
  'modern-purple': 'Deep purple (#6B21A8), violet (#8B5CF6), soft lavender, and white',
  'nature-green': 'Forest green (#166534), sage (#86EFAC), cream, and earthy browns',
  'warm-orange': 'Burnt orange (#EA580C), coral (#FB923C), cream, and deep brown',
  'elegant-monochrome': 'Black, white, and various shades of gray with subtle texture',
  'vibrant-gradient': 'Bold gradients from cyan to magenta, with electric accents',
  'ocean-teal': 'Deep teal (#0D9488), aquamarine (#5EEAD4), seafoam, and sandy beige',
  'sunset-pink': 'Hot pink (#EC4899), peach (#FBBF24), soft coral, and warm cream',
  'forest-earth': 'Deep brown (#78350F), terracotta (#D97706), olive green, and cream',
  'royal-gold': 'Royal blue (#1E40AF), gold (#F59E0B), ivory, and deep navy',
  'arctic-frost': 'Ice blue (#38BDF8), silver (#94A3B8), white, and pale lavender',
  'neon-night': 'Electric purple (#A855F7), neon green (#22C55E), hot pink, on dark background',
};

const layoutDescriptions: Record<LayoutStructure, string> = {
  'visual-heavy': '70% visuals, 30% text. Large hero images, minimal text, icon-based content.',
  'text-heavy': '30% visuals, 70% text. Detailed explanations with supporting graphics.',
  balanced: '50% visuals, 50% text. Equal emphasis on imagery and written content.',
};

const aspectRatioDescriptions: Record<AspectRatio, string> = {
  '16:9': 'Standard widescreen presentation format (1920x1080)',
  '4:3': 'Traditional presentation format (1024x768)',
  '1:1': 'Square format ideal for social media (1080x1080)',
  '9:16': 'Vertical/portrait format for mobile or stories (1080x1920)',
};

function getContentSummary(config: SlidePromptConfig): string {
  const { content } = config;

  if (content.type === 'text' && content.text) {
    return content.text;
  }
  if (content.type === 'topic' && content.topic) {
    return `Topic: ${content.topic}`;
  }
  if (content.type === 'file' && content.fileContent) {
    return `Content from file "${content.fileName}":\n${content.fileContent}`;
  }
  if (content.type === 'url' && content.urlContent) {
    return `Content from URL "${content.url}":\n${content.urlContent}`;
  }

  return 'General presentation content';
}

export function generatePrompt(config: SlidePromptConfig): GeneratedPrompt {
  const { style, settings } = config;
  const contentSummary = getContentSummary(config);

  const systemPrompt = `You are an expert presentation designer and visual artist. Generate professional slide content with detailed visual descriptions that can be used to create stunning presentations. Follow the specified style guidelines precisely.`;

  const styleName = style.charAt(0).toUpperCase() + style.slice(1).replace('-', ' ');
  const aspectRatioInfo = aspectRatioDescriptions[settings.aspectRatio];

  const userPrompt = `Create a ${settings.slideCount}-slide presentation with the following specifications:

## Content
${contentSummary}

Keep visuals, titles, and callouts coherent with the topic/context above; avoid repeating the topic verbatim on every slide unless it improves clarity.

## Visual Style
**Style:** ${styleName}
${styleDescriptions[style]}

## Color Palette
${colorPaletteDescriptions[settings.colorPalette]}

## Layout Structure
${layoutDescriptions[settings.layoutStructure]}

## Format
**Aspect Ratio:** ${settings.aspectRatio} - ${aspectRatioInfo}

## Component & Visual System
Leverage these reusable components consistently across all slides:

**Stat Cards**: Bold numeric data (KPI, measurement, percentage) with label + short context. Size: 80-120px, rounded, accent color background, white text. Use for: metrics, benchmarks, key numbers.

**Callout Boxes**: Text insight/quote with accent line or icon. Contains: bold title + 2-3 sentence explanation. Use for: key insights, tips, important notes.

**Diagram Callouts**: Arrow + label + description pointing to visual elements. Use for: anatomy, process steps, architectural features.

**Icon Systems**: Minimal, consistent icons paired with text for categories, features, or grouping.

**Visual Zones**: Background (subtle grid/particle) + Hero Zone (60-70% cinematic visual) + Text Anchor (30-40% organized text) + Overlay (floating callouts/badges).

## Slide Templates
Use these templates as guides:
- **Title/Cover**: Hook headline + subtitle + full-bleed visual. Minimal text.
- **Concept/Explanation**: Large hero diagram + 3-4 positioned callout boxes + supporting text anchor.
- **Data/Insight**: Hero chart (60%) + 2-3 metric cards + narrative text anchor (40%).
- **Process/Timeline**: Numbered/flow steps + large visual of current step + callout specs + progress indicator.
- **Comparison**: Dual-column layout with icons, visuals, bullets each + metric cards for contrast.
- **Technical/Architecture**: Central diagram (blocks, flowchart) + labeled arrows + icon badges + callout specs.

## Instructions
For each slide, provide (detailed and spatial):
1. **Slide Title** - Clear headline; cinematic or metaphorical phrasing OK.
2. **Visual Description** - Rich sensory detail: camera angle, depth, lighting (glow, volumetric), motion/energy, textures, focal objects. Specify position/placement of key visual elements.
3. **Component Placement** - Exact locations of stat cards, callout boxes, icons, and overlays (top-right, bottom-left, floating center, etc.).
4. **Text Anchor** - Organized bullet structure, alignment, typographic hierarchy for the text zone.
5. **Design Notes** - Layout zones (background + hero + text + overlay), accent colors, icon style, data types (chart, diagram, etc.), stylistic flourishes.

Ensure visual consistency, generous negative space (20-30% of slide), and information hierarchy (title → hero → supporting callouts → footer). Each prompt should be detailed enough for an AI to generate the complete, multi-component slide.

Generate all ${settings.slideCount} slides now.`;

  const plainText = `${systemPrompt}

---

${userPrompt}`;

  const jsonFormat = {
    model: 'google/gemini-2.5-flash',
    messages: [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ],
  };

  return { plainText, jsonFormat, slides: [] };
}
