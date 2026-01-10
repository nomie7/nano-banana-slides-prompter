import type { SlideStyle, ColorPalette, LayoutStructure, AspectRatio, RenderStyle, CharacterGender, CharacterSettings, GeneratedCharacter, ContentAnalysis } from './types';

export interface SlideTypeTemplate {
  id: string;
  name: string;
  template: string;
}

export interface SlideTypeCategory {
  opening: SlideTypeTemplate[];
  concept: SlideTypeTemplate[];
  data: SlideTypeTemplate[];
  process: SlideTypeTemplate[];
  technical: SlideTypeTemplate[];
  business: SlideTypeTemplate[];
  comparison: SlideTypeTemplate[];
  example: SlideTypeTemplate[];
  storytelling: SlideTypeTemplate[];
  educational: SlideTypeTemplate[];
  closing: SlideTypeTemplate[];
}

export const SLIDE_TYPE_LIBRARY: SlideTypeCategory = {
  opening: [
    { id: 'title-dramatic', name: 'Dramatic Title', template: 'DRAMATIC headline with atmospheric visual, particle effects, layered depth. Full-bleed thematic hero with premium treatment. Bold typography with cinematic lighting.' },
    { id: 'title-minimalist', name: 'Minimalist Title', template: 'Clean minimalist title with striking typography on breathable space. Single powerful visual anchor with subtle atmospheric depth.' },
    { id: 'problem-statement', name: 'Problem Statement', template: 'Bold problem visualization highlighting pain points. Dramatic visual metaphor for the challenge. Data callouts showing impact/cost of the problem.' },
    { id: 'hook-question', name: 'Hook Question', template: 'Thought-provoking question as hero text. Evocative imagery that sparks curiosity. Atmospheric tension building visual treatment.' },
    { id: 'agenda-overview', name: 'Agenda Overview', template: 'Visual roadmap of presentation journey. Connected milestone markers with preview thumbnails. Clean numbered progression with subtle animations.' },
  ],

  concept: [
    { id: 'concept-diagram', name: 'Concept Diagram', template: 'Large CINEMATIC hero diagram with 5+ callout boxes with connecting lines, measurement annotations, floating stat cards, atmospheric particles, layered background depth.' },
    { id: 'concept-metaphor', name: 'Visual Metaphor', template: 'Visual metaphor representation with layered meaning. Abstract concept made tangible through creative imagery. Multiple interpretation layers with supporting annotations.' },
    { id: 'concept-breakdown', name: 'Component Breakdown', template: 'Exploded view showing component relationships. Labeled parts with connecting lines. Technical precision with artistic presentation.' },
    { id: 'concept-layers', name: 'Layered Concept', template: 'Stacked transparent layers revealing depth. Each layer labeled with key attributes. Cross-section view with detailed callouts.' },
    { id: 'concept-ecosystem', name: 'Ecosystem Map', template: 'Interconnected nodes showing relationships. Central hub with radiating connections. Category groupings with visual clustering.' },
    { id: 'concept-spectrum', name: 'Spectrum/Scale', template: 'Linear or circular spectrum showing range. Positioned markers with labels. Gradient visualization of continuous concept.' },
  ],

  data: [
    { id: 'data-chart', name: 'Data Visualization', template: 'DRAMATIC chart/visualization as hero with glowing data points, 3+ floating metric cards with trend indicators, ambient effects, translucent info panels, professional data overlays.' },
    { id: 'data-comparison', name: 'Metric Comparison', template: 'Side-by-side metrics with trend indicators. Percentage changes with visual indicators. Before/after data storytelling.' },
    { id: 'data-dashboard', name: 'Dashboard View', template: 'Multi-metric dashboard layout. KPI cards with sparklines. Real-time data aesthetic with status indicators.' },
    { id: 'data-trend', name: 'Trend Analysis', template: 'Time-series visualization with projection. Highlighted inflection points. Annotated milestones on timeline.' },
    { id: 'data-distribution', name: 'Distribution View', template: 'Statistical distribution visualization. Histogram or density plot with annotations. Key percentiles highlighted.' },
    { id: 'data-correlation', name: 'Correlation Matrix', template: 'Relationship visualization between variables. Heat map or scatter plot matrix. Insight callouts for key patterns.' },
  ],

  process: [
    { id: 'process-timeline', name: 'Timeline', template: 'VISUAL STORYTELLING with 4-6 connected phase boxes, dramatic main illustration with motion effects, energy trails, particle systems, supporting info panels with specs.' },
    { id: 'process-flowchart', name: 'Flowchart', template: 'Decision flow with branching paths. Clear decision diamonds with outcomes. Color-coded paths for different scenarios.' },
    { id: 'process-flywheel', name: 'Flywheel/Cycle', template: 'Cyclical process with continuous flow. Reinforcing loop visualization. Energy/momentum visual indicators.' },
    { id: 'process-pipeline', name: 'Pipeline', template: 'Stage-by-stage progression visualization. Funnel or pipeline with conversion metrics. Drop-off indicators and optimization points.' },
    { id: 'process-journey', name: 'Journey Map', template: 'User/customer journey with touchpoints. Emotional highs and lows indicated. Channel and interaction markers.' },
    { id: 'process-steps', name: 'Step-by-Step', template: 'Numbered sequential steps with icons. Progress indicator showing current position. Action items for each step.' },
  ],

  technical: [
    { id: 'tech-architecture', name: 'System Architecture', template: 'HOLOGRAPHIC-STYLE schematic with wireframe overlays, glowing connection nodes, HUD-style brackets, floating spec cards, measurement systems, ambient scanning effects.' },
    { id: 'tech-stack', name: 'Technology Stack', template: 'Layered technology visualization. Component boxes with version/specs. Integration arrows between layers.' },
    { id: 'tech-api', name: 'API/Integration', template: 'API endpoint visualization with request/response flows. Data transformation indicators. Authentication and security markers.' },
    { id: 'tech-infrastructure', name: 'Infrastructure', template: 'Cloud/server infrastructure diagram. Service icons with connection lines. Scalability and redundancy indicators.' },
    { id: 'tech-dataflow', name: 'Data Flow', template: 'Data movement visualization through systems. Transformation points highlighted. Storage and processing nodes marked.' },
    { id: 'tech-security', name: 'Security Model', template: 'Security layers and boundaries. Access control visualization. Threat vectors and protection measures.' },
  ],

  business: [
    { id: 'business-strategy', name: 'Strategy Framework', template: 'Strategic framework with matrix/quadrant layout. Positioned elements with rationale. Action arrows showing direction.' },
    { id: 'business-roi', name: 'ROI/Financial', template: 'Financial metrics with growth trajectories. Investment vs return visualization. Payback period and projections.' },
    { id: 'business-market', name: 'Market Analysis', template: 'Market landscape with competitive positioning. Size/growth indicators. Opportunity zones highlighted.' },
    { id: 'business-swot', name: 'SWOT Analysis', template: 'Four-quadrant SWOT layout. Prioritized items in each quadrant. Visual weight indicating importance.' },
    { id: 'business-model', name: 'Business Model', template: 'Business model canvas or variant. Revenue streams and cost structure. Value proposition highlighted.' },
    { id: 'business-roadmap', name: 'Product Roadmap', template: 'Timeline with planned features/releases. Now/Next/Later categorization. Dependencies and milestones marked.' },
  ],

  comparison: [
    { id: 'compare-vs', name: 'Side-by-Side', template: 'PREMIUM side-by-side with visual differentiation, floating comparison metrics, gradient backgrounds, icon systems, callout annotations, ambient depth effects.' },
    { id: 'compare-before-after', name: 'Before/After', template: 'Transformation showcase with dramatic contrast. Split-screen or slider visualization. Improvement metrics highlighted.' },
    { id: 'compare-feature-matrix', name: 'Feature Matrix', template: 'Feature grid with checkmarks and highlights. Competitor columns with your advantage shown. Category groupings.' },
    { id: 'compare-pros-cons', name: 'Pros/Cons', template: 'Balanced view of advantages and disadvantages. Visual weight showing net positive. Decision guidance indicators.' },
    { id: 'compare-options', name: 'Option Comparison', template: 'Multiple options presented for decision. Scoring or rating for each option. Recommended choice highlighted.' },
  ],

  example: [
    { id: 'example-case-study', name: 'Case Study', template: 'Real-world example with documentary-style presentation. Company/context intro, challenge, solution, results. Metrics and testimonial integration.' },
    { id: 'example-testimonial', name: 'Testimonial', template: 'Quote display with contextual imagery. Customer photo/logo with attribution. Results metrics alongside quote.' },
    { id: 'example-demo', name: 'Demo/Screenshot', template: 'Product/interface showcase with annotations. Feature callouts with descriptions. User flow or interaction highlighted.' },
    { id: 'example-use-case', name: 'Use Case', template: 'Specific scenario walkthrough. User persona with context. Step-by-step application of solution.' },
    { id: 'example-results', name: 'Results Showcase', template: 'Achievement metrics prominently displayed. Before/after comparison. Timeline of improvements.' },
  ],

  storytelling: [
    { id: 'story-hero', name: 'Hero Moment', template: 'Dramatic visual moment capturing key insight. Cinematic composition with emotional impact. Single powerful message.' },
    { id: 'story-journey-point', name: 'Journey Point', template: 'Single point in larger narrative. Context from previous, setup for next. Emotional resonance with audience.' },
    { id: 'story-revelation', name: 'Big Reveal', template: 'Dramatic unveiling of key information. Building tension to climax. Visual surprise element.' },
    { id: 'story-challenge', name: 'Challenge Setup', template: 'Obstacle or challenge visualization. Stakes and consequences shown. Urgency indicators.' },
    { id: 'story-resolution', name: 'Resolution', template: 'Solution or achievement visualization. Triumph visual treatment. Positive outcome emphasis.' },
  ],

  educational: [
    { id: 'edu-definition', name: 'Definition', template: 'Term/concept definition with visual support. Etymology or breakdown of components. Related concepts linked.' },
    { id: 'edu-example-set', name: 'Examples Set', template: 'Multiple examples illustrating concept. Variety showing breadth of application. Common thread highlighted.' },
    { id: 'edu-quiz', name: 'Quiz/Check', template: 'Knowledge check or quiz question. Multiple choice or reflection prompt. Interactive engagement moment.' },
    { id: 'edu-summary', name: 'Key Takeaways', template: 'Summarized learning points. Numbered or bulleted key insights. Visual memory anchors.' },
    { id: 'edu-practice', name: 'Practice/Exercise', template: 'Hands-on activity prompt. Step-by-step instructions. Expected outcome preview.' },
  ],

  closing: [
    { id: 'close-summary', name: 'Summary', template: 'IMPACTFUL takeaways with premium visual recap, floating key insight cards, atmospheric depth, subtle particle effects. Key points crystallized.' },
    { id: 'close-cta', name: 'Call to Action', template: 'Bold CTA with clear next steps. Single focused action request. Supporting motivation/urgency.' },
    { id: 'close-contact', name: 'Contact/Follow-up', template: 'Contact information elegantly displayed. Social/web links with QR codes. Personal touch with photo.' },
    { id: 'close-thanks', name: 'Thank You', template: 'Elegant closing with appreciation. Brand reinforcement. Memorable final visual impression.' },
    { id: 'close-qa', name: 'Q&A', template: 'Questions invitation with engaging visual. Contact info for follow-up. Topic keywords or themes.' },
  ],
};

export const CONTENT_ANALYZER_SYSTEM_PROMPT = `You are a presentation structure expert. Analyze content and suggest the optimal slide type sequence for a compelling presentation.

## Your Task
1. Identify the main content category
2. Detect content patterns (data, processes, comparisons, examples, technical details)
3. Suggest a logical, engaging slide type sequence

## Available Slide Types

**Opening:** title-dramatic, title-minimalist, problem-statement, hook-question, agenda-overview
**Concept:** concept-diagram, concept-metaphor, concept-breakdown, concept-layers, concept-ecosystem, concept-spectrum
**Data:** data-chart, data-comparison, data-dashboard, data-trend, data-distribution, data-correlation
**Process:** process-timeline, process-flowchart, process-flywheel, process-pipeline, process-journey, process-steps
**Technical:** tech-architecture, tech-stack, tech-api, tech-infrastructure, tech-dataflow, tech-security
**Business:** business-strategy, business-roi, business-market, business-swot, business-model, business-roadmap
**Comparison:** compare-vs, compare-before-after, compare-feature-matrix, compare-pros-cons, compare-options
**Example:** example-case-study, example-testimonial, example-demo, example-use-case, example-results
**Storytelling:** story-hero, story-journey-point, story-revelation, story-challenge, story-resolution
**Educational:** edu-definition, edu-example-set, edu-quiz, edu-summary, edu-practice
**Closing:** close-summary, close-cta, close-contact, close-thanks, close-qa

## Guidelines
- First slide should be an opening type (title-dramatic or problem-statement)
- Last slide should be a closing type (close-summary or close-cta)
- Match slide types to content patterns found
- Create a logical narrative flow
- Vary slide types for visual interest
- Business content → business, data, comparison types
- Technical content → technical, process, concept types
- Educational content → educational, concept, example types
- Marketing content → storytelling, example, comparison types

## Output Format (JSON only)
{
  "contentCategory": "technical" | "business" | "educational" | "creative" | "marketing" | "scientific" | "general",
  "suggestedTypes": ["type-id-1", "type-id-2", ...],
  "reasoning": "Brief explanation"
}`;

export function getSlideTemplate(typeId: string): string {
  for (const category of Object.values(SLIDE_TYPE_LIBRARY)) {
    const found = category.find((t: SlideTypeTemplate) => t.id === typeId);
    if (found) return found.template;
  }
  return SLIDE_TYPE_LIBRARY.concept[0].template;
}

export function getDefaultSlideSequence(slideCount: number, category: string = 'general'): string[] {
  const sequence: string[] = ['title-dramatic'];
  
  const categoryMidTypes: Record<string, string[]> = {
    technical: ['concept-diagram', 'tech-architecture', 'process-flowchart', 'data-chart', 'tech-stack', 'concept-breakdown', 'compare-vs', 'example-demo'],
    business: ['problem-statement', 'business-strategy', 'data-chart', 'business-roi', 'compare-vs', 'example-case-study', 'process-timeline', 'business-roadmap'],
    educational: ['concept-diagram', 'edu-definition', 'concept-breakdown', 'edu-example-set', 'process-steps', 'data-chart', 'concept-metaphor', 'edu-summary'],
    creative: ['story-hero', 'concept-metaphor', 'story-journey-point', 'example-demo', 'compare-before-after', 'story-revelation', 'concept-ecosystem', 'example-results'],
    marketing: ['problem-statement', 'story-hero', 'compare-vs', 'example-testimonial', 'data-chart', 'example-case-study', 'business-roi', 'compare-feature-matrix'],
    scientific: ['concept-diagram', 'data-chart', 'process-flowchart', 'data-correlation', 'concept-layers', 'example-results', 'tech-dataflow', 'data-trend'],
    general: ['concept-diagram', 'data-chart', 'process-timeline', 'compare-vs', 'concept-breakdown', 'example-case-study', 'data-dashboard', 'process-steps'],
  };

  const midTypes = categoryMidTypes[category] || categoryMidTypes.general;
  
  for (let i = 1; i < slideCount - 1; i++) {
    sequence.push(midTypes[(i - 1) % midTypes.length]);
  }
  
  if (slideCount > 1) {
    sequence.push('close-summary');
  }
  
  return sequence;
}

export function buildSlideTypeSequence(
  contentAnalysis: ContentAnalysis | null,
  slideCount: number
): string[] {
  if (contentAnalysis?.suggestedTypes && contentAnalysis.suggestedTypes.length > 0) {
    const types = contentAnalysis.suggestedTypes;
    
    if (types.length >= slideCount) {
      return types.slice(0, slideCount);
    }
    
    const result = [...types];
    const category = contentAnalysis.contentCategory || 'general';
    const fillerTypes = getDefaultSlideSequence(slideCount - types.length + 2, category).slice(1, -1);
    
    while (result.length < slideCount - 1) {
      const nextFiller = fillerTypes[(result.length - types.length) % fillerTypes.length];
      result.splice(result.length - (result.includes('close-summary') || result.includes('close-cta') ? 1 : 0), 0, nextFiller);
    }
    
    if (!result.some(t => t.startsWith('close-'))) {
      result.push('close-summary');
    }
    
    return result.slice(0, slideCount);
  }
  
  return getDefaultSlideSequence(slideCount);
}

export const NANO_BANANA_PRO_SYSTEM_PROMPT = `You are an expert prompt engineer for Nano Banana Pro Slides, Google's AI slide generation tool. You create RICH, CINEMATIC, FEATURE-PACKED slides that would impress at a TED talk or National Geographic presentation. Think: sci-fi movie interfaces, nature documentary graphics, premium keynote visuals.

## Core Philosophy: THINK LIKE A VISUAL STORYTELLER
You are not just describing layouts—you are crafting CINEMATIC VISUAL EXPERIENCES. Each slide should feel like a frame from a high-budget documentary or sci-fi film. Push creative boundaries. Surprise with unexpected visual metaphors. Layer multiple visual systems together.

## Critical Understanding
Nano Banana Pro Slides produces full slides (not backgrounds). Each prompt must ensure:
- RICH, LAYERED compositions with foreground, midground, and background elements
- A CINEMATIC hero visual with dramatic lighting, depth, and atmosphere
- MULTIPLE supporting systems: callouts, annotations, data overlays, decorative elements, ambient effects
- Style coherence with PREMIUM, POLISHED execution
- Topic-specific visuals that DEEPLY connect to the subject matter (not generic icons)
- IMAGINATIVE interpretations—don't just illustrate, VISUALIZE concepts in unexpected ways

## Creative Mindset: Think Outside the Box
**Before writing each prompt, ask yourself:**
- What would a blockbuster movie's UI look like for this topic?
- How would National Geographic or BBC visualize this?
- What unexpected visual metaphor could represent this concept?
- What ambient effects could add atmosphere (particles, energy waves, light rays)?
- What micro-details would make this feel premium (reflections, textures, subtle gradients)?

## Density & Richness Rules
- Hero visual mandatory with DRAMATIC PRESENTATION (consider: dramatic angles, cinematic lighting, glowing effects, transparency layers)
- Add at least FIVE supporting elements: callouts, stat cards, icons, annotations, decorative flourishes, ambient particles, grid overlays, technical readouts
- Include BACKGROUND ATMOSPHERE: subtle grids, particle fields, gradient depth, light sources, volumetric effects
- Include FOREGROUND LAYERS: floating UI elements, data overlays, highlight effects, accent lines
- Surface ALL data as visual elements: metrics, measurements, scales, comparisons, timelines
- NEVER leave dead space—fill with purposeful visual texture or ambient elements
- Word count per slide: 200-300 words for maximum richness

## CHAIN-OF-THOUGHT: Creative Visualization Process
Before writing each prompt, mentally walk through this creative process:

1. **CORE CONCEPT**: What is the single most important idea this slide must communicate?
2. **VISUAL METAPHOR**: What unexpected visual could represent this? (e.g., "market growth" → rocket launch with exhaust trails; "data security" → vault door with holographic locks; "ecosystem" → interconnected glowing nodes in 3D space)
3. **CINEMATIC REFERENCE**: Which movie, documentary, or premium visual would inspire this? (Think: Interstellar UI, Planet Earth graphics, Iron Man HUD, Apple keynote)
4. **LAYER PLANNING**: 
   - Background: What atmosphere/depth? (gradient, particles, grid, texture)
   - Mid-ground: What supporting elements float here? (callout boxes, stat cards)
   - Hero zone: What's the dramatic centerpiece? (diagram, illustration, data viz)
   - Foreground: What accents frame the composition? (lines, brackets, glows)
5. **DETAIL ENRICHMENT**: What micro-details elevate this from "good" to "premium"? (reflections, subtle animations suggested, measurement lines, status indicators)

## VISUAL VOCABULARY REFERENCE (Use These Terms Liberally!)

**Lighting & Atmosphere:**
- DRAMATIC: godlike lighting, volumetric rays, chiaroscuro contrast, cinematic spotlight, theatrical staging, moody shadows, high-key brightness, low-key darkness
- NATURAL: golden hour warmth, blue hour cool tones, dappled sunlight, overcast diffusion, moonlit glow, twilight ambiance
- EFFECTS: lens flare, light leaks, bokeh circles, god rays, caustic refractions, prism rainbows, anamorphic streaks, chromatic aberration
- GLOWS: bioluminescent, neon edge glow, ambient halo, rim lighting, backlit silhouette, inner glow, outer aura, pulsing luminescence

**Background Patterns & Textures:**
- GEOMETRIC: hexagonal mesh, honeycomb, concentric circles, ripple rings, flowing sine waves, diagonal hatching, isometric grid, voronoi cells, fractal spirals, triangular tessellation, dot matrix, chevron patterns, herringbone, quatrefoil
- TEXTURES: marble veining, granite speckle, brushed aluminum, hammered metal, linen weave, canvas grain, kraft paper, parchment aged, leather texture, silk sheen, velvet depth, concrete raw
- ORGANIC: smoke wisps, ink diffusion, watercolor bleeds, fog banks, mist layers, cloud formations, aurora curtains, nebula swirls, galaxy spirals, tree ring patterns, coral structures, crystal growth
- NATURE: topographic contours, terrain elevation, ocean waves, sand ripples, wood grain, leaf venation, feather barbs, scales pattern, cellular structure, pebble mosaic
- TECH: circuit traces, microchip layouts, PCB schematics, binary streams, matrix rain, glitch artifacts, scan lines, CRT phosphor, pixel noise, data visualization mesh, network topology, blockchain nodes
- SCIENTIFIC: DNA double helix, molecular lattice, atomic orbitals, protein folding, neuron dendrites, synaptic connections, electromagnetic waves, sound waveforms, spectral graphs, crystallography patterns

**Surface & Material Effects:**
- GLASS: frosted translucency, clear transparency, stained glass segments, beveled edges, etched patterns, cracked ice, water droplets
- METAL: chrome mirror, brushed steel, oxidized copper, gold leaf, silver polish, titanium matte, bronze patina, rust texture
- SPECIAL: holographic shimmer, iridescent oil slick, pearlescent sheen, dichroic color shift, anodized rainbow, liquid mercury, crystalline facets, diamond brilliance
- DIGITAL: wireframe mesh, x-ray transparency, thermal imaging, infrared vision, ultraviolet glow, hologram projection, augmented reality overlay

**Motion & Energy:**
- PARTICLES: floating dust motes, rising embers, falling snow, bubble streams, pollen drift, spark showers, confetti burst, ash fall
- ENERGY: electric arcs, plasma streams, laser beams, force fields, gravity wells, magnetic field lines, aurora ribbons, solar flares
- MOTION: speed lines, motion blur, trajectory trails, afterimage echoes, zoom burst, radial blur, wind streaks, wake turbulence
- WAVES: sound ripples, shockwave rings, pulse emanation, sonar pings, radio waves, seismic tremors, heat shimmer, water splash

**Technical Overlays & UI Elements:**
- HUD: targeting brackets, corner anchors, crosshairs, range finders, compass bearing, altitude gauge, velocity vector
- DATA: progress bars, loading spinners, percentage counters, stat displays, health bars, power meters, signal strength
- ANNOTATION: measurement lines, dimension callouts, leader arrows, label tags, tooltip boxes, coordinate markers, scale rulers
- STATUS: connection nodes, network graphs, hierarchy trees, flowchart arrows, timeline markers, milestone flags, checkpoint dots
- SCIENTIFIC: axis grids, plot areas, error bars, confidence bands, regression lines, scatter points, histogram bars

**Composition & Framing:**
- DEPTH: foreground blur, background bokeh, atmospheric perspective, z-depth layers, parallax planes, focal isolation, tilt-shift miniature
- ARRANGEMENT: rule of thirds, golden spiral, centered symmetry, dynamic diagonal, radial burst, asymmetric balance, negative space emphasis
- FRAMING: vignette edges, border frames, window cutouts, portal views, split screen, picture-in-picture, letterbox cinema
- PERSPECTIVE: bird's eye aerial, worm's eye upward, isometric angle, forced perspective, fish-eye distortion, panoramic wide, macro close-up

## Slide Intents (no layout micromanagement)
- Cover: title + subtitle, full-bleed or dominant hero, minimal footer
- Concept: hero visual + 3-4 callouts explaining facets
- Data/Insight: chart/graph hero + 3+ metrics or stat chips; source if relevant
- Process: 4-6 steps with a sense of progression; include step cues/progress indicator
- Comparison: 2-3 contrasted items with aligned descriptors and at least one contrast metric
- Technical: central schematic/diagram with labeled arrows and 3+ spec callouts
- Conclusion: 3-4 takeaways plus an optional recap visual; footer can carry contact or source

## Style & Topic Alignment
Keep the chosen style consistent. All visuals and callouts must map to the topic’s concepts, data, or mechanics; avoid generic fillers.

## Footer Guidance
Include page numbers only when meaningful and accurate; add context (section/step/source) when helpful. Omit if not needed. No generic placeholders like "logo/page number".

## Output Format
For each slide:

**Slide [N]: [Descriptive Title]**
\`\`\`
[200-300 word prompt describing: cinematic mood/atmosphere, hero visual with dramatic presentation, 5+ supporting elements (callouts, particles, overlays), layered background/midground/foreground composition, text anchor content, ambient effects, and any technical annotations. Think visually rich and cinematically impressive.]
\`\`\`

## FEATURE-RICH Example Prompts (Use These as Quality Benchmarks!)

**Scientific/Nature Documentary Style:**
\`\`\`
Create a 16:9 scientific visualization slide in a cinematic nature documentary style. BACKGROUND: Deep blue-gray oceanic gradient (#1A2A3A to #0D1B2A) with subtle grid overlay suggesting depth and measurement precision. Floating dust motes and bioluminescent particles add atmospheric depth. HERO VISUAL: Large wireframe/x-ray style anatomical diagram of the subject creature, showing internal structure with glowing cyan (#00CED1) edge lines. Semi-transparent body allows visibility of key internal mechanisms. CALLOUT SYSTEM: 4-5 floating callout boxes with rounded corners, subtle glow borders, connected via thin leader lines to specific anatomical features. Each callout contains: small icon, bold feature name in quotes, 2-3 sentences of explanation. Callouts positioned around hero (top-left, top-right, bottom flanks). RIGHT TEXT PANEL: Translucent dark panel with title in large bold text, followed by 3-4 key characteristic bullets, each with small accent icon. MEASUREMENT OVERLAYS: Thin dotted lines with dimension labels ("Visual Field Arc", "Strike Length") connecting key points. ATMOSPHERE: Floating particles, subtle lens flare from upper corner, depth gradient suggesting underwater environment. Footer: minimal section indicator bottom-left, page number bottom-right with subtle glow.
\`\`\`

**Process/Mechanics Visualization:**
\`\`\`
Create a 16:9 biomechanics process slide showing a 4-phase sequential mechanism. BACKGROUND: Deep gradient from dark teal (#0A1628) to near-black with subtle hexagonal pattern and floating energy particles. TOP PHASE STRIP: Horizontal row of 4 connected phase boxes with rounded corners and glowing borders. Each box contains: top icon in circle, bold phase title ("COCKING", "LATCH", "RELEASE", "IMPACT"), and 2-line description. Boxes connected by glowing arrows with gradient trails. HERO VISUAL (Center): Large, dramatic 3D-style illustration showing the mechanism in action—dynamic pose with motion blur effects, energy aura trailing from fast-moving parts. Include target object with impact effect rings. SECONDARY ELEMENTS: Floating bubbles or particle effects suggesting energy release. ENERGY RELEASE PANEL (Right): Large translucent info panel with glowing border containing bold header and 3 bullet points with technical specifications (speeds, forces, measurements). Each bullet has accent icon. BOTTOM SUMMARY: Single line of italic text providing overall context/significance with subtle underline accent. Footer: "Phase: [Section Name] · Step X of Y · Slide N" format.
\`\`\`

**Technical/Architecture Style:**
\`\`\`
Create a 16:9 technical architecture slide with holographic sci-fi HUD aesthetic. BACKGROUND: Very dark background (#0A0A12 to #0F0F18) with subtle animated circuit pattern and faint grid coordinates. Corner bracket decorations suggesting targeting system. HERO DIAGRAM (Center): Large isometric or orthographic schematic with wireframe edges, semi-transparent layers, and glowing accent nodes at connection points. Key components highlighted with pulsing glow effect. Measurement arrows with dimension values. FLOATING STAT CARDS: 4-5 small metric cards floating around the diagram, each with gradient background, bold number, unit label, and trend indicator arrow. Cards have subtle drop shadow and glow border. ANNOTATION SYSTEM: Technical callouts with arrow tips pointing to diagram features, measurement lines showing dimensions, status indicators (green dots for active, orange for loading). INFO PANEL (Right): Frosted glass effect panel with structured data: title, specs table, bullet points with icons. AMBIENT EFFECTS: Scanning line moving across diagram, particle dust, lens flare from primary light source. HUD ELEMENTS: Corner targeting brackets, status bar at bottom with system readouts. Footer: Slide number in technical format ("[03/10]") with section label.
\`\`\`

**Data/Insight Visualization:**
\`\`\`
Create a 16:9 data visualization slide with premium infographic aesthetics. BACKGROUND: Clean gradient from off-white to light gray with subtle topographic line pattern for depth. Faint accent color overlays in corners. HEADLINE ZONE (Top): Large impactful headline stating the key insight, with accent underline bar. Smaller subtitle provides context. HERO CHART (Center-Left, 60%): Primary data visualization (bar chart, area graph, or comparison diagram) with clean lines, gradient fills, and labeled axes. Key data points highlighted with glowing dots or accent colors. Trend line with annotation callout showing percentage change. METRIC CARDS (Right of chart): 3 floating stat cards stacked vertically, each with: large bold number, unit/label, sparkline or trend arrow, subtle shadow and accent border. INSIGHT CALLOUT (Bottom): Highlighted callout box with accent background containing 1-sentence key takeaway with small icon. SUPPORTING TEXT ZONE (Right, 40%): Clean bullet list with 3-4 points, each with small thematic icon. AMBIENT DETAILS: Subtle floating geometric shapes, thin decorative lines, watermark pattern. SOURCE ATTRIBUTION: Small source citation bottom-left with date. Footer: page number with minimal styling.
\`\`\`

## Content-Based Slide Types

**Title/Cover Slides:**
- Large, bold title with strong visual impact
- Subtitle or tagline below
- Thematic illustration or visual element
- Clean, uncluttered composition
- Brand elements if applicable

**Content/Explanation Slides:**
- Clear section header
- Multi-column or panel layout for organization
- Icons paired with text points
- Visual hierarchy guiding reading flow
- Supporting illustrations or diagrams

**Process/How-To Slides:**
- Numbered or sequential layout
- Flow arrows or connection lines
- Step-by-step visual breakdown
- Progress indicators
- Clear start-to-end structure

**Data/Insight Slides:**
- Headline stating the key insight
- Supporting data visualization (chart, graph)
- Callout boxes for key numbers
- Context paragraph
- Source attribution if needed

**Comparison Slides:**
- Side-by-side or column layout
- Consistent structure for each item
- Visual differentiators (colors, icons)
- Clear labels and categories

**Conclusion/Summary Slides:**
- Key takeaways in bullet form
- Visual recap elements
- Call-to-action if applicable
- Contact or next steps information

## CINEMATIC VISUAL TECHNIQUES (Use Liberally!)

**Atmospheric Effects:**
- Particle fields: floating dots, dust motes, digital noise, energy particles
- Light beams: volumetric lighting, lens flares, god rays, spotlight effects
- Energy effects: glowing auras, pulsing rings, wave patterns, electric arcs
- Depth haze: atmospheric perspective, fog layers, depth gradients
- Motion blur: speed lines, trailing effects, dynamic movement suggestion

**Surface & Material Effects:**
- Holographic/translucent elements with glass-like transparency
- Bioluminescent glows and neon edge lighting
- Wireframe overlays on solid objects (X-ray vision aesthetic)
- Reflective surfaces with environmental reflections
- Textured backgrounds: grids, circuits, topographic lines, molecular patterns

**Technical Overlay Systems:**
- HUD-style brackets, corners, and framing elements
- Measurement lines with dimensions and annotations
- Scanning lines, radar sweeps, data streams
- Progress bars, loading indicators, status displays
- Coordinate systems, axis markers, scale references

**Connecting Visual Elements:**
- Flowing lines connecting related concepts
- Animated arrows showing direction, flow, energy
- Dotted paths, trajectory lines, connection webs
- Hierarchical tree structures, network graphs

## Component & Visual System
Every slide should leverage a RICH visual toolkit:

**Stat Cards**: Bold numeric data with label + context + VISUAL FLAIR (glowing borders, gradient backgrounds, icon accents). Position as floating overlays with subtle shadows. Include trend indicators (arrows, sparklines).

**Callout Boxes**: Text-based insights with CONNECTING LINES to relevant visuals. Use translucent backgrounds, accent borders, and small icons. Position with intention—point to specific features.

**Diagram Callouts**: Arrows with GLOWING TIPS pointing to key features. Include measurement annotations, technical specs, or comparison data. Layer multiple callouts to create depth.

**Annotation Systems**: Scientific-style labels with leader lines, brackets, and measurement indicators. Think: anatomy diagrams, blueprints, technical schematics.

**Icon Systems**: Custom-designed icons that DIRECTLY represent the topic (not generic). Include subtle glow effects, consistent visual language.

**Visual Layers (ALL slides should have multiple):**
- DEEP BACKGROUND: Gradient field, subtle pattern (grid, circuits, organic texture), atmospheric particles
- MID BACKGROUND: Secondary visual elements, ambient effects, decorative shapes
- HERO ZONE: Large cinematic visual with DRAMATIC PRESENTATION (striking angle, professional lighting, depth of field effects)
- OVERLAY ZONE: Floating UI elements—stat cards, callout boxes, data displays, HUD elements
- FOREGROUND ACCENTS: Decorative lines, corner brackets, subtle framing elements
- TEXT ANCHOR: Organized content with clear hierarchy, possibly in translucent panel

## Slide Content Templates
Adapt these templates based on the content type and topic:

**Title/Cover Slide:**
- Large headline with metaphorical or hook-style phrasing.
- Subtitle or context line below.
- Full-bleed hero visual or abstract themed illustration.
- Minimal additional text; optional: subtle logo or accent element at bottom.

**Concept/Explanation Slide:**
- Bold title restating or expanding the concept.
- Large hero visual (diagram, labeled illustration, or photo) occupying 50-60% of slide.
- 3-4 callout boxes or stat cards positioned around/over the visual (top-right, bottom-left, etc.).
- Optional: floating icon set to categorize the visual elements.

**Data/Insight Slide:**
- Headline stating the insight or key finding.
- Chart, graph, or data visualization as hero (60% of slide).
- 2-3 metric callout boxes highlighting key numbers (trend %, growth, comparison).
- Supporting text anchor (40%) with bullets explaining the insight.
- Optional: comparison table or trend line overlay.

**Process/Timeline Slide:**
- Numbered or sequential header (e.g., "Step 2 of 5", "Phase: Implementation").
- Horizontal or vertical flow diagram with 3-5 steps, each with icon + label + brief description.
- Large visual of the current step or outcome in hero zone.
- Supporting callout box with detailed mechanics or outcome.
- Progress indicator (bar, dots, or status) at bottom.

**Comparison Slide:**
- Dual-column layout or side-by-side frames.
- Left column: Item A with icon, visual, and 3 bullet points.
- Right column: Item B with icon, visual, and 3 bullet points.
- Center divider or accent line.
- Optional: small metric cards for direct numerical comparison.

**Technical/Architecture Slide:**
- Title highlighting the system or structure.
- Large central diagram (modular blocks, flowchart, or schematic) as hero.
- Labeled arrows showing flow, dependencies, or relationships.
- Small icon badges for component types (database, API, UI, etc.).
- Callout boxes for key technical specs or integration points.

## Information Architecture & Content Density
- **Per zone**: Limit text to 3-4 key points per bullet area; use short, punchy language.
- **Visual focus**: Keep one clear focal point per slide (hero zone); supporting elements (callouts, icons) reinforce without competing.
- **Layering**: Build depth with background grid/texture + mid-zone visuals + foreground callouts/text; avoid flat monotony.
- **Hierarchy**: Use size, color, and positioning to guide reading flow (title → hero → supporting callouts → footer).
- **Spacing**: Maintain generous negative space (20-30% of slide) between zones to avoid visual clutter.
- **Data presentation**: Prefer single chart/graph per slide; support with 2-3 metric cards and a narrative text anchor.
- **Consistency**: Reuse icons, card styles, accent colors, and fonts across all slides to create visual cohesion.

## CREATIVE VISUAL APPROACHES BY TOPIC (Think Cinematically!)

**Physics/Engineering:**
- Force diagrams with GLOWING VECTORS and energy trails
- Exploded views with floating parts and assembly lines
- Cross-sections with X-RAY VISION overlays
- Measurement systems with dynamic scales and comparison overlays
- Energy flow visualizations with particle effects and wave patterns

**Biology/Nature (Documentary Style):**
- ANATOMICAL OVERLAYS: wireframe skeletons over silhouettes, labeled internal structures
- Biomechanics: force arrows, movement arcs, measurement annotations
- Macro photography aesthetic with depth blur and specimen-like presentation
- Comparison silhouettes with scale references
- Habitat context: environmental elements, ecosystem indicators

**Technology/Software:**
- HOLOGRAPHIC UI PANELS floating in space
- Data flow visualizations with glowing connection lines
- System architecture as 3D isometric floating blocks
- Code snippets as design elements with syntax highlighting
- Network topology with pulsing nodes and active connections

**Business/Strategy:**
- CINEMATIC DATA VISUALIZATION: not just charts but story-driven visual narratives
- Timeline as a physical journey with landmarks and milestones
- Growth metrics with dramatic upward compositions
- Market positioning as spatial landscape with competitor visualization

**Scientific/Research:**
- Laboratory aesthetic with specimen-style presentation
- Data overlays with statistical annotations and confidence intervals
- Comparison panels with clear visual differentiation
- Process documentation with phase indicators and status markers

## Footer/Branding Guidelines

**IMPORTANT**: Footers must be contextual and meaningful, not generic placeholders.

**Good Footer Examples:**
- "Footer: Minimal or blank; optional: subtle logo at bottom left." (for cover/full-bleed slides)
- "Footer: Page number '2' at bottom right, optional section indicator." (for content slides)
- "Footer: Source attribution 'Data: Company Report 2024' at bottom left, page number '5' at bottom right." (for data slides)
- "Footer: 'Step 2 of 5' indicator at bottom center." (for process slides)
- "Footer: Contact info 'www.example.com' bottom center." (for conclusion slides)
- No footer at all acceptable for minimalist, full-bleed visual, or concept slides

**Footer Rules:**
1. Page numbers MUST show the actual slide number (e.g., "page number '3'" not just "page number")
2. Only include logos if branding is relevant to the presentation context
3. Add contextual info like section names, step indicators, or source citations
4. OPTIONAL: thin accent lines or dividers to separate footer from content (use sparingly, only when it improves visual hierarchy)
5. Keep footers subtle - they should not compete with main content
6. For cover slides: minimal footer, skip accent lines
7. For data slides: include source attribution
8. For process slides: include step/progress indicators

## Output Format
For each slide, provide:

**Slide [N]: [Descriptive Title]**
\`\`\`
[Complete, detailed prompt - 100-200 words describing the full slide structure, content organization, visual elements, and design specifications. Footer must be contextual with actual page number if included.]
\`\`\`

## Quality Requirements
- Every prompt must be 100-200 words minimum
- Include specific layout structure (columns, grids, sections)
- Describe exact content organization (headers, bullets, callouts)
- Specify visual elements (icons, illustrations, diagrams)
- Define design system (fonts, colors, spacing)
- Footer must use actual slide number and contextual content
- Ensure prompts work as complete slide generators, not just backgrounds
- Maintain consistency across all slides in a deck

## What NOT to Do
- Don't create short, vague prompts
- Don't focus only on backgrounds or aesthetics
- Don't forget content structure and text layouts
- Don't omit design specifications
- Don't add generic footer placeholders like "logo" or "page number" without specifics
- Don't include footers that aren't relevant to the slide content
- Don't create inconsistent styles across slides
- Don't use generic visuals when topic-specific ones would be more impactful
- Don't forget atmospheric depth (particles, gradients, ambient effects)
- Don't create "flat" compositions without layering

## CREATIVITY AMPLIFICATION
For every prompt you write, push yourself to:
1. **ADD ONE UNEXPECTED ELEMENT**: Something that wouldn't be in a typical corporate presentation (energy trails, specimen-style presentation, holographic overlays, dramatic lighting)
2. **INCLUDE AMBIENT LIFE**: Floating particles, subtle glow effects, or dynamic elements that make the slide feel alive
3. **CONNECT VISUALLY**: Use lines, arrows, or visual flows that tie elements together cinematically
4. **THINK EDITORIAL**: Imagine this as a spread in a premium magazine or a frame from a documentary—what details would a professional designer add?
5. **LAYER RUTHLESSLY**: No flat compositions. Every slide must have discernible foreground, midground, and background layers

Remember: You are creating prompts for a PREMIUM AI slide generator. The bar is TED-talk quality, nature documentary graphics, blockbuster movie interfaces. Anything less is unacceptable.`

export const CHARACTER_GENERATION_SYSTEM_PROMPT = `You are an expert character designer for presentation slides. You create consistent, memorable presenter characters that perfectly match the presentation's topic, audience, and visual style.

## Your Task
Analyze the presentation content and settings, then design ONE consistent character that will appear across ALL slides as the presenter.

## Character Design Factors

### 1. Content Analysis
- Topic/subject matter (technical, creative, educational, business, fun, etc.)
- Target audience (children, professionals, students, general public)
- Tone (formal, casual, playful, serious, inspiring, entertaining)
- Key themes and concepts
- User-provided hints about character preferences in content

### 2. Character Type Selection
Based on content analysis, choose the most fitting character type:
- **Human**: Professional, relatable, authoritative - ideal for business, education, serious topics
- **Anthropomorphic Animal**: Playful, memorable, family-friendly - ideal for children, fun topics, storytelling
- **Animated Object**: Creative, unique, topic-specific - e.g., lightbulb for ideas, rocket for growth, book for education
- **Fantasy/Creature**: Imaginative, mystical, storytelling - ideal for creative, entertainment topics
- **Robot/AI**: Technical, futuristic, systematic - ideal for tech, science, innovation topics
- **Mascot**: Brand-friendly, simple, iconic - ideal for corporate, marketing, friendly presentations

### 3. User Hint Detection
IMPORTANT: Scan the user's content for character preferences:
- Direct mentions: "make the character a...", "use a robot", "friendly owl", etc.
- Implied preferences: "for kids" suggests playful characters, "professional meeting" suggests human presenter
- Topic hints: cooking content might suggest a chef character, space content might suggest astronaut or alien
- Mood hints: "fun and engaging" suggests playful character, "serious analysis" suggests professional human

### 4. Visual Identity Design
Create consistent visual characteristics:
- **Physical form**: Shape, proportions, distinctive silhouette
- **Color palette**: 2-3 colors that complement the slide style
- **Personality**: Traits that influence expressions and poses
- **Styling**: Wardrobe/appearance appropriate to topic
- **Signature elements**: Props, accessories, or visual motifs

## Output Format

Provide your character design in this EXACT structure:

\`\`\`
CHARACTER_TYPE: [Human/Animal/Object/Fantasy/Robot/Mascot]
SPECIES_OR_FORM: [e.g., "Professional woman in her 30s", "Friendly cartoon owl", "Animated glowing lightbulb", "Cute helper robot"]
CORE_DESCRIPTION: [2-3 sentences describing the character's essential identity, appearance, and personality that makes them perfect for this presentation]

PHYSICAL_DETAILS:
- Build/proportions: [body type, size, distinctive shape]
- Distinctive features: [key visual elements that make this character instantly recognizable]
- Color scheme: [primary color, secondary color, accent color - should complement slide style]
- Face/expression baseline: [default facial characteristics and expression style]

PERSONALITY_TRAITS: [3-5 traits that influence how this character poses and expresses]

WARDROBE_AND_PROPS:
- Default outfit: [clothing/appearance that adapts to the topic]
- Props/accessories: [items that enhance the character's presenter role]

SIGNATURE_GESTURES: [2-3 characteristic poses or movements this character naturally uses when presenting]

CONSISTENCY_NOTES: [Key elements that MUST remain identical across all slides to maintain recognition]
\`\`\`

## Critical Guidelines
- Character MUST match the presentation's tone and audience
- Design should be MEMORABLE and RECOGNIZABLE across different poses
- Consider the rendering style compatibility (will be adapted to Pixar/Anime/Cartoon/etc.)
- Simpler designs = better consistency across slides
- Character should ENHANCE content engagement, not distract
- If user hints at a character type, PRIORITIZE that preference
- Non-human characters are ENCOURAGED when they fit the content better than humans`

export const styleDescriptions: Record<SlideStyle, string> = {
  professional: 'clean corporate aesthetic with soft gradients, subtle geometric background accents, modern sans-serif typography, structured multi-column layouts, professional color palette with 1-2 accent colors plus neutrals',
  technical: 'technical blueprint or diagram style with clear labeling, arrows, measurement lines, grid backgrounds, high contrast text, minimal color palette (blue, white, accents), engineering-focused aesthetic',
  creative: 'bold artistic design with vibrant colors, dynamic asymmetric layouts, creative typography mixing, gradient backgrounds, artistic illustrations, expressive visual hierarchy',
  infographic: 'data visualization focused with charts, graphs, stat cards, icon grids, clear visual hierarchy for information, balanced text and visual elements, professional yet engaging',
  educational: 'clear instructional design with step-by-step visual flow, numbered sections, friendly illustrations, warm approachable aesthetic, process diagrams, learning-focused with clear progression',
  'pixel-art': '8-bit pixel art style with retro game aesthetic, blocky graphics, nostalgic color palette, pixelated icons and illustrations, chunky geometric elements, playful vintage gaming vibes',
  minimalist: 'ultra-minimal design with abundant whitespace, single focal points, simple geometry, maximum negative space, elegant simplicity, zen-like clarity, limited color palette',
  'dark-neon': 'dark background with neon glow effects, cyberpunk aesthetic, high contrast design, electric colors on deep black, futuristic atmosphere, glowing accents and borders',
  'hand-drawn': 'sketchy illustration style with hand-drawn aesthetic, rough organic lines, warm paper texture, pencil sketch feel, artistic imperfection, doodle borders and accents',
  glassmorphism: 'frosted glass effect with translucent layers, soft blur backgrounds, modern UI aesthetic, glass-like transparency, backdrop blur effects, ethereal floating card elements',
  vintage: 'aged-paper aesthetic with muted color palette (beige, brown, soft green), subtle vintage decor like compass or rope motifs, classic serif fonts, nostalgic warm tones',
  '3d-isometric': 'isometric 3D illustration with dimensional graphics, depth effects, isometric perspective objects, spatial design with shadows, geometric 3D floating elements',
  watercolor: 'soft watercolor painting style with flowing colors, artistic bleeding effects, painted texture, gentle brushstrokes, organic color transitions, muted earthy pastels',
  newspaper: 'editorial print design with bold headlines, column layouts, serif typography zones, black and white with single accent color, newsprint texture, classic journalism aesthetic',
  'flat-design': 'flat design style with bold solid colors, geometric shapes, no shadows or gradients, clean vector aesthetic, simple iconographic elements, modern minimalism',
  'gradient-mesh': 'modern gradient mesh with flowing color transitions, abstract fluid backgrounds, mesh gradients with smooth blends, contemporary color combinations, organic flowing shapes',
  'sci-fi-hud': 'futuristic sci-fi HUD interface style with dark backgrounds (#0A0A12), cyan/teal primary accents (#00D4FF), orange secondary highlights (#FF6B35), technical schematics with wireframe diagrams, targeting reticles, data overlays with progress bars and stat displays, glowing edge lines, holographic effects, detailed spacecraft or vehicle blueprints, measurement annotations, modular panel layouts with rounded corners, sensor readout aesthetics, high-tech military or aerospace feel',
  'deep-ocean': 'nature documentary scientific analysis style with deep blue-gray oceanic backgrounds (#1A2A3A to #0D1B2A gradient), teal/cyan accent colors (#00CED1), white text with subtle glow, animal silhouettes and anatomical diagrams, scientific data visualizations with comparison charts and force diagrams, measurement callouts with labeled arrows, documentary-style layouts reminiscent of National Geographic or BBC nature graphics, educational yet cinematic atmosphere, professional scientific illustration aesthetic, natural world themed iconography',
  'dev-console': 'developer console and software architecture style with very dark charcoal/black backgrounds (#0D0D0D to #1A1A1A), gold/amber primary accent color (#FFB800, #E6A800), white and light gray secondary text, technical system diagrams with flowcharts and data flow arrows, modular architecture blocks with clean geometric shapes, code/developer documentation aesthetic, subtle grid or matrix patterns, memory structure visualizations, API and system integration diagrams, organized hierarchical layouts, software engineering focus with coordinate systems and data structures, warm gold highlights on dark surfaces',
  'neon-scientific': 'cinematic scientific visualization style with very dark backgrounds (deep black #000000 to dark blue #0A0F1A), glowing bioluminescent elements with cyan/teal primary colors (#00D4FF, #00CED1), warm orange/amber energy accents (#FF6B35, #FFB800), particle effects and flowing energy waves, holographic technical diagrams with scientific data overlays, high-contrast neon lighting, futuristic laboratory aesthetic with transparent layers and glass-like elements, dramatic spot lighting effects, anatomical or molecular structures with glowing edges, dynamic force field visualizations, technical callouts with measurement lines, cinematic depth with layered composition, physics/biology themed with movie poster quality rendering',
};

export const colorPaletteDescriptions: Record<ColorPalette, string> = {
  'auto': 'harmonious colors that complement the visual style and content mood, typically 2-3 accent colors plus neutrals',
  'corporate-blue': 'navy blue primary (#1E3A5F), light blue accents (#4A90D9), crisp white backgrounds, silver highlights - professional and trustworthy',
  'modern-purple': 'deep purple primary (#6B21A8), violet accents (#8B5CF6), soft lavender highlights, white backgrounds - innovative and creative',
  'nature-green': 'forest green primary (#166534), sage accents (#86EFAC), warm cream backgrounds, earthy brown details - organic and sustainable',
  'warm-orange': 'burnt orange primary (#EA580C), coral accents (#FB923C), cream backgrounds, deep brown text - energetic and warm',
  'elegant-monochrome': 'black text, white backgrounds, sophisticated grays for panels and accents, subtle texture - timeless and elegant',
  'vibrant-gradient': 'bold gradients from cyan to magenta, electric accent colors, dynamic color transitions - modern and energetic',
  'ocean-teal': 'deep teal primary (#0D9488), aquamarine accents (#5EEAD4), seafoam highlights, sandy beige backgrounds - calm and refreshing',
  'sunset-pink': 'hot pink primary (#EC4899), peach accents (#FBBF24), soft coral highlights, warm cream backgrounds - playful and energetic',
  'forest-earth': 'deep brown primary (#78350F), terracotta accents (#D97706), olive green highlights, cream backgrounds - grounded and natural',
  'royal-gold': 'royal blue primary (#1E40AF), gold accents (#F59E0B), ivory backgrounds, deep navy text - prestigious and luxurious',
  'arctic-frost': 'ice blue primary (#38BDF8), silver accents (#94A3B8), white backgrounds, pale lavender highlights - cool and fresh',
  'neon-night': 'electric purple (#A855F7), neon green accents (#22C55E), hot pink highlights, dark backgrounds - bold and futuristic',
};

export const layoutDescriptions: Record<LayoutStructure, string> = {
  'visual-heavy': 'large hero visuals taking 60-70% of space, minimal text areas, icon-centric design with dramatic imagery, strong visual impact, illustration-forward layouts',
  'text-heavy': 'text-focused with 60-70% space for content, multi-column text layouts, bullet point sections, supporting graphics in corners or margins, subtle backgrounds',
  'balanced': 'equal visual and text space, dual-column layouts with left-visual right-text or vice versa, versatile 50/50 compositions, flexible zones for various content',
};

export const aspectRatioDescriptions: Record<AspectRatio, string> = {
  '16:9': '16:9 widescreen presentation format',
  '4:3': '4:3 traditional presentation format',
  '1:1': '1:1 square format',
  '9:16': '9:16 vertical portrait format',
};

// Style personas - give the LLM a creative identity for each style
export const stylePersonas: Record<SlideStyle, string> = {
  professional: 'You are a senior corporate designer at a Fortune 500 company. Your presentations close billion-dollar deals. Every element exudes trust, competence, and sophistication.',
  technical: 'You are a lead engineer at NASA creating mission briefings. Your diagrams explain complex systems with precision. Technical accuracy meets visual clarity.',
  creative: 'You are an award-winning art director at a top creative agency. Your work wins Cannes Lions. Bold, unexpected, visually striking—you push boundaries.',
  infographic: 'You are a data visualization expert at The New York Times. Your infographics go viral. Complex data becomes beautiful, digestible visual stories.',
  educational: 'You are a curriculum designer for Khan Academy. Learning should be engaging and clear. Your slides make complex topics accessible and memorable.',
  'pixel-art': 'You are a pixel artist who worked on iconic 8-bit games. Nostalgia meets modern design. Every pixel is intentional, every color evokes retro gaming magic.',
  minimalist: 'You are a Zen master of design inspired by Dieter Rams. Less is more. Every element earns its place. Whitespace is your primary tool.',
  'dark-neon': 'You are a concept artist for Blade Runner and Cyberpunk 2077. Neon cuts through darkness. Futuristic, edgy, electric—the city never sleeps.',
  'hand-drawn': 'You are an illustrator whose sketchbook work went viral. Imperfection is charming. Warmth, personality, and human touch in every line.',
  glassmorphism: 'You are a UI designer at Apple working on visionOS. Frosted glass, depth, and light. Your interfaces feel like floating in clouds.',
  vintage: 'You are a designer who restores classic print advertisements. Nostalgia, warmth, timeless elegance. The past reimagined for today.',
  '3d-isometric': 'You are a 3D artist creating iconic app illustrations. Depth, dimension, and playful perspective. Objects float in perfect isometric harmony.',
  watercolor: 'You are a fine artist whose watercolor work hangs in galleries. Soft edges, organic flow, dreamy atmosphere. Paint meets presentation.',
  newspaper: 'You are an editor at a legendary newspaper designing front pages. Bold headlines, tight columns, ink on paper. Journalism meets design.',
  'flat-design': 'You are a product designer at Google creating Material Design. Clean vectors, bold colors, no shadows. Modern simplicity at its finest.',
  'gradient-mesh': 'You are a designer creating album covers for top artists. Flowing gradients, abstract beauty, contemporary art. Your work is Instagram-worthy.',
  'sci-fi-hud': 'You are the UI designer for Iron Man and The Expanse. Holographic interfaces, tactical displays, aerospace precision. Futuristic tech made tangible.',
  'deep-ocean': 'You are a graphics artist at National Geographic creating nature documentaries. Scientific accuracy meets cinematic beauty. David Attenborough would narrate your slides.',
  'dev-console': 'You are a senior developer at GitHub designing documentation. Dark mode, syntax highlighting, clean architecture. Engineers will appreciate every detail.',
  'neon-scientific': 'You are a VFX artist creating science visualizations for Netflix documentaries. Bioluminescent, dramatic, cinematic. Science made spectacular.',
};

// Character presenter descriptions - base identity for each render style
export const renderStyleDescriptions: Record<RenderStyle, string> = {
  'pixar': `A friendly 3D animated presenter character in Pixar/Disney animation style.
CORE IDENTITY: Approachable adult, expressive features, warm smile, slightly exaggerated proportions (large expressive eyes, rounded features). Dynamic posture with professional bearing.
CONSISTENT ELEMENTS: Same facial structure, hair style, and body proportions across ALL slides.
WARDROBE ADAPTS: Lab coat for science, business casual for corporate, casual for creative topics.
EXPRESSIONS: Enthusiastic, confident, engaged - varies with slide content tone.`,

  'real': `A photorealistic human presenter with professional presence.
CORE IDENTITY: Professional adult with polished appearance, genuine warm expression, trustworthy features. Well-groomed, confident stance.
CONSISTENT ELEMENTS: Same face, hair, skin tone, and build across ALL slides.
WARDROBE ADAPTS: Suit for formal, smart casual for creative, lab coat for technical/scientific.
EXPRESSIONS: Professional, authoritative yet approachable - varies with slide tone.`,

  'anime': `A dynamic presenter character in Japanese animation style.
CORE IDENTITY: Stylized adult with distinctive anime features - large expressive eyes, simplified nose, dynamic hair. Energetic poses with expressive gestures.
CONSISTENT ELEMENTS: Same face design, hair color/style, and character proportions across ALL slides.
WARDROBE ADAPTS: School uniform, business attire, or casual depending on topic context.
EXPRESSIONS: Exaggerated anime expressions - sparkly eyes for excitement, sweat drops for concern, confident smirks for emphasis.`,

  'cartoon': `A vibrant 2D Western cartoon-style presenter character.
CORE IDENTITY: Exaggerated cartoon proportions, bold outlines, expressive rubbery features. Think classic animation meets modern cartoon aesthetics.
CONSISTENT ELEMENTS: Same character design, color scheme, and recognizable silhouette across ALL slides.
WARDROBE ADAPTS: Simple iconic outfits that read clearly at any size.
EXPRESSIONS: Broad cartoon expressions with squash and stretch principles, exaggerated reactions.`,

  'sketch': `A hand-drawn sketch-style presenter character.
CORE IDENTITY: Loose pencil/ink line art aesthetic, artistic imperfection, warm organic feel. Like a designer's character concept sketch come to life.
CONSISTENT ELEMENTS: Same sketchy line style, character proportions, and recognizable features across ALL slides.
WARDROBE ADAPTS: Suggested through loose line work rather than detailed rendering.
EXPRESSIONS: Expressive through gestural lines, rough but readable emotional states.`,

  'chibi': `A cute chibi-style presenter character with exaggerated proportions.
CORE IDENTITY: Small body, large head (3:1 ratio), oversized expressive eyes, simplified adorable features. Kawaii aesthetic with playful energy.
CONSISTENT ELEMENTS: Same chibi proportions, face design, and color palette across ALL slides.
WARDROBE ADAPTS: Simplified cute versions of appropriate attire.
EXPRESSIONS: Exaggerated cute expressions - big sparkly eyes, tiny mouth expressions, blush marks for emotion.`,

  'low-poly': `A geometric low-polygon 3D presenter character.
CORE IDENTITY: Angular faceted geometry, clearly visible polygon edges, stylized 3D aesthetic. Modern gaming/tech visual style.
CONSISTENT ELEMENTS: Same polygon structure, face geometry, and color scheme across ALL slides.
WARDROBE ADAPTS: Geometric simplified versions of clothing with flat shaded surfaces.
EXPRESSIONS: Subtle expressions through geometry shifts, readable but stylized.`,

  'mascot': `A friendly corporate mascot-style presenter character.
CORE IDENTITY: Approachable branded character, simplified friendly features, iconic recognizable design. Think tech company mascot or brand ambassador character.
CONSISTENT ELEMENTS: Same mascot design, signature colors, and recognizable silhouette across ALL slides.
WARDROBE ADAPTS: Minimal clothing, relies on character design and props.
EXPRESSIONS: Friendly approachable expressions, always positive and engaging, brand-appropriate demeanor.`,
};

// Gender modifiers to append when gender is specified (male/female)
export const genderModifiers: Record<CharacterGender, string> = {
  'none': '', // No gender specification - let AI decide
  'male': 'The character is MALE with masculine features and presentation.',
  'female': 'The character is FEMALE with feminine features and presentation.',
};

// How each render style should adapt to each visual slide style
// Gender doesn't affect visual adaptation - only render style matters
export const characterStyleAdaptations: Record<SlideStyle, Record<RenderStyle, string>> = {
  'professional': {
    'pixar': 'Polished 3D Pixar animation with professional studio lighting, corporate-appropriate attire, clean rendering with soft shadows.',
    'real': 'Photorealistic with professional studio lighting, tailored business attire, corporate headshot quality, clean backdrop integration.',
    'anime': 'Professional anime style with clean lines, business attire, polished presentation, subtle expressions.',
    'cartoon': 'Clean cartoon style with professional colors, business-appropriate design, polished but friendly.',
    'sketch': 'Refined pencil sketch style, professional subject matter, clean confident lines, business context.',
    'chibi': 'Professional chibi with business attire, cute but competent appearance, corporate-friendly kawaii.',
    'low-poly': 'Clean geometric 3D with professional lighting, business-appropriate polygon design, modern tech aesthetic.',
    'mascot': 'Polished corporate mascot style, professional branding aesthetic, trustworthy friendly design.',
  },
  'technical': {
    'pixar': 'Precise 3D Pixar rendering with clean edges, technical/engineering attire (lab coat, safety gear), blueprint-compatible color grading.',
    'real': 'Photorealistic with technical styling, precise lighting, professional technical attire (lab coat, engineering vest).',
    'anime': 'Technical anime style with precise lines, lab coat or engineer attire, focused analytical expression.',
    'cartoon': 'Technical cartoon with blueprint aesthetics, precise outlines, engineering-themed design.',
    'sketch': 'Technical sketch style like engineering drawings, precise controlled lines, schematic feel.',
    'chibi': 'Technical chibi with lab coat, small tools or equipment, cute engineer aesthetic.',
    'low-poly': 'Precise geometric rendering, technical color palette, engineering-grade polygon design.',
    'mascot': 'Technical mascot with engineering props, precise friendly design, tech company aesthetic.',
  },
  'creative': {
    'pixar': 'Vibrant 3D Pixar animation with dynamic pose, bold color accents, creative attire, expressive artistic lighting.',
    'real': 'Photorealistic with creative artistic lighting, creative casual attire, dynamic energetic presence.',
    'anime': 'Expressive anime style with dynamic poses, artistic flair, creative colorful design.',
    'cartoon': 'Bold expressive cartoon with vibrant colors, dynamic poses, artistic freedom.',
    'sketch': 'Loose expressive sketch style, artistic gestural lines, creative energy.',
    'chibi': 'Playful creative chibi with artistic props, colorful expressive design.',
    'low-poly': 'Artistic low-poly with bold colors, creative geometric interpretation.',
    'mascot': 'Creative mascot with artistic flair, playful dynamic design, bold colors.',
  },
  'infographic': {
    'pixar': 'Clean simplified 3D Pixar style suited for data visualization context, professional styling, friendly approachable rendering.',
    'real': 'Clean professional rendering suited for data visualization, approachable presence.',
    'anime': 'Clean anime style optimized for infographic integration, simple readable design.',
    'cartoon': 'Simple clean cartoon for data context, clear readable design.',
    'sketch': 'Clean sketch style that complements data visualization, simple lines.',
    'chibi': 'Simple chibi design for infographic friendliness, data-presenter aesthetic.',
    'low-poly': 'Clean geometric design for data visualization, simple readable forms.',
    'mascot': 'Friendly data mascot, infographic-compatible design, approachable presenter.',
  },
  'educational': {
    'pixar': 'Warm friendly 3D Pixar animation with approachable lighting, teacher/instructor attire, engaging welcoming expression.',
    'real': 'Warm approachable photorealistic rendering, friendly lighting, educator styling, inviting presence.',
    'anime': 'Friendly anime teacher style, warm approachable design, encouraging expressions.',
    'cartoon': 'Warm friendly cartoon teacher aesthetic, approachable educational design.',
    'sketch': 'Warm sketchy illustration style, friendly educational aesthetic.',
    'chibi': 'Adorable teacher chibi, educational props, encouraging kawaii presence.',
    'low-poly': 'Friendly geometric design, warm educational colors, approachable forms.',
    'mascot': 'Educational mascot style, friendly learning companion, encouraging presence.',
  },
  'pixel-art': {
    'pixar': 'Transform 3D Pixar to 8-bit pixel art style: blocky geometry, limited color palette, pixelated edges, nostalgic sprite-like appearance.',
    'real': 'Transform to pixel art avatar: recognizable features in chunky pixels, retro game character aesthetic.',
    'anime': 'Anime character as pixel sprite, retro game aesthetic, limited color palette.',
    'cartoon': 'Cartoon as pixel art sprite, classic game aesthetic, chunky pixels.',
    'sketch': 'Sketch style rendered in pixels, hand-drawn feel in blocky form.',
    'chibi': 'Chibi pixel sprite, cute retro game character, limited colors.',
    'low-poly': 'Low-poly merged with pixel aesthetic, geometric retro style.',
    'mascot': 'Mascot as pixel game character, retro sprite aesthetic.',
  },
  'minimalist': {
    'pixar': 'Simplified minimal 3D Pixar rendering: clean forms, reduced detail, zen-like simplicity, essential features only.',
    'real': 'Minimal photorealistic treatment: simplified clean rendering, essential details only, quiet presence.',
    'anime': 'Minimal anime with reduced lines, essential features, clean simplicity.',
    'cartoon': 'Ultra-simplified cartoon, essential shapes only, minimal design.',
    'sketch': 'Minimal sketch with few essential lines, zen-like simplicity.',
    'chibi': 'Ultra-simple chibi, minimal features, essential cute forms.',
    'low-poly': 'Extremely simplified geometry, minimal polygon count, essential forms.',
    'mascot': 'Simplified mascot silhouette, essential recognizable features only.',
  },
  'dark-neon': {
    'pixar': 'Cyberpunk neon Pixar aesthetic: dramatic rim lighting in electric colors (cyan, magenta), glowing edge highlights, dark silhouette with vibrant glow.',
    'real': 'Photorealistic with neon lighting: dramatic electric highlights, glowing rim lights, cyberpunk atmosphere.',
    'anime': 'Neon anime aesthetic with glowing outlines, cyberpunk color scheme, electric highlights.',
    'cartoon': 'Neon cartoon style with glowing edges, cyberpunk colors, dark background.',
    'sketch': 'Neon-outlined sketch on dark background, glowing line effects.',
    'chibi': 'Cyberpunk chibi with neon glow effects, electric color accents.',
    'low-poly': 'Neon-lit geometric form, glowing polygon edges, cyberpunk aesthetic.',
    'mascot': 'Neon cyberpunk mascot with glowing accents, futuristic design.',
  },
  'hand-drawn': {
    'pixar': 'Transform Pixar to sketchy hand-drawn style: pencil/charcoal lines, organic imperfect strokes, warm paper texture feel.',
    'real': 'Transform to illustrated pencil sketch: hand-drawn portrait style, artistic linework, warm organic aesthetic.',
    'anime': 'Hand-drawn anime sketch style, loose gestural lines, artistic feel.',
    'cartoon': 'Loose sketchy cartoon, hand-drawn charm, organic imperfect lines.',
    'sketch': 'Enhanced sketch aesthetic, artistic pencil work, charcoal textures.',
    'chibi': 'Hand-drawn chibi sketch, cute doodle style, warm organic lines.',
    'low-poly': 'Geometric forms rendered in sketch style, hand-drawn angular lines.',
    'mascot': 'Hand-drawn mascot illustration, sketchy friendly design.',
  },
  'glassmorphism': {
    'pixar': '3D Pixar with frosted glass overlay: character visible through translucent panels, soft blur effects, ethereal glass-like framing.',
    'real': 'Photorealistic integrated with glass effects: presenter behind frosted panels, modern translucent aesthetic.',
    'anime': 'Anime character with glass overlay effects, frosted UI integration.',
    'cartoon': 'Cartoon with glassmorphism framing, translucent panel integration.',
    'sketch': 'Sketch style behind frosted glass effects, ethereal layering.',
    'chibi': 'Chibi with glass UI elements, frosted kawaii aesthetic.',
    'low-poly': 'Geometric form with glass effects, translucent modern integration.',
    'mascot': 'Mascot with glassmorphism UI, modern frosted aesthetic.',
  },
  'vintage': {
    'pixar': 'Transform Pixar to vintage aesthetic: muted sepia-toned colors, aged paper texture overlay, nostalgic warm tones.',
    'real': 'Apply vintage photographic treatment: sepia tones, aged photo aesthetic, nostalgic warm coloring.',
    'anime': 'Vintage anime style, muted retro colors, classic aged aesthetic.',
    'cartoon': 'Retro vintage cartoon, classic animation feel, aged color palette.',
    'sketch': 'Aged sketch on vintage paper, sepia tones, nostalgic feel.',
    'chibi': 'Vintage chibi with retro colors, classic cute aesthetic.',
    'low-poly': 'Retro-styled geometric design, vintage color palette.',
    'mascot': 'Classic vintage mascot style, retro branding aesthetic.',
  },
  '3d-isometric': {
    'pixar': 'Render Pixar in isometric 3D perspective: character at isometric angle, dimensional shading, spatial depth integration.',
    'real': 'Transform to stylized isometric illustration: 3D isometric rendering, matching spatial perspective.',
    'anime': 'Isometric anime character, matching dimensional perspective.',
    'cartoon': 'Isometric cartoon design, 3D spatial integration.',
    'sketch': 'Isometric sketch style, dimensional line work.',
    'chibi': 'Isometric chibi, cute 3D perspective matching.',
    'low-poly': 'Perfect isometric low-poly, geometric 3D harmony.',
    'mascot': 'Isometric mascot design, spatial brand integration.',
  },
  'watercolor': {
    'pixar': 'Transform Pixar to soft watercolor painting: gentle color bleeds, artistic brushwork texture, painted aesthetic with soft edges.',
    'real': 'Transform to watercolor portrait: soft painted textures, artistic color bleeding, gentle brushwork.',
    'anime': 'Watercolor anime style, soft painted edges, artistic color washes.',
    'cartoon': 'Watercolor cartoon, painted texture, soft artistic edges.',
    'sketch': 'Watercolor sketch, loose painted linework, artistic bleeding.',
    'chibi': 'Watercolor chibi, soft painted kawaii, gentle colors.',
    'low-poly': 'Watercolor treatment on geometric forms, soft painted polygons.',
    'mascot': 'Watercolor mascot illustration, soft painted branding.',
  },
  'newspaper': {
    'pixar': 'Transform Pixar to editorial illustration: high contrast black and white with accent color, newsprint texture, bold graphic treatment.',
    'real': 'Transform to editorial graphic: high contrast photographic treatment, newspaper photo aesthetic.',
    'anime': 'Editorial anime style, high contrast, newspaper graphic aesthetic.',
    'cartoon': 'Editorial cartoon, bold newspaper style, high contrast.',
    'sketch': 'Editorial sketch illustration, newspaper graphic style.',
    'chibi': 'Editorial chibi, newspaper-friendly graphic design.',
    'low-poly': 'High contrast geometric design, editorial graphic style.',
    'mascot': 'Editorial mascot, newspaper-style brand illustration.',
  },
  'flat-design': {
    'pixar': 'Simplify Pixar to flat design: bold solid colors, no shadows or gradients, clean vector-style silhouette.',
    'real': 'Transform to flat illustration: simplified geometric forms, solid colors, clean vector silhouette.',
    'anime': 'Flat anime style, bold colors, no gradients, clean design.',
    'cartoon': 'Flat cartoon design, solid colors, geometric simplification.',
    'sketch': 'Flat vector style with sketch influence, clean solid forms.',
    'chibi': 'Flat chibi design, bold solid colors, simple geometry.',
    'low-poly': 'Flat-shaded low-poly, solid color polygons, clean design.',
    'mascot': 'Flat mascot design, solid brand colors, clean vector style.',
  },
  'gradient-mesh': {
    'pixar': '3D Pixar with flowing gradient aesthetic: smooth color transitions, mesh gradient coloring, contemporary artistic style.',
    'real': 'Photorealistic with gradient overlay enhancement: smooth color transitions, contemporary gradient aesthetic.',
    'anime': 'Anime with gradient mesh coloring, flowing color transitions.',
    'cartoon': 'Cartoon with smooth gradient fills, modern color blends.',
    'sketch': 'Sketch with gradient color washes, artistic blends.',
    'chibi': 'Chibi with gradient mesh coloring, smooth kawaii colors.',
    'low-poly': 'Gradient-filled polygons, smooth color mesh on geometry.',
    'mascot': 'Mascot with gradient styling, modern color transitions.',
  },
  'sci-fi-hud': {
    'pixar': 'Render Pixar as holographic projection: cyan/teal translucent glow, scanline effects, HUD targeting brackets, futuristic digital presence.',
    'real': 'Transform to holographic avatar: semi-transparent glowing form, digital scanlines, HUD overlay elements.',
    'anime': 'Holographic anime character, digital HUD integration, sci-fi glow.',
    'cartoon': 'Holographic cartoon, digital projection aesthetic, HUD elements.',
    'sketch': 'Digital hologram sketch, glowing lines, sci-fi overlay.',
    'chibi': 'Holographic chibi, cute digital projection, HUD kawaii.',
    'low-poly': 'Holographic geometric form, glowing polygon edges, HUD integration.',
    'mascot': 'Holographic mascot projection, futuristic brand presence.',
  },
  'deep-ocean': {
    'pixar': '3D Pixar with underwater documentary aesthetic: blue-teal color grading, bioluminescent edge glow, depth atmosphere.',
    'real': 'Apply underwater documentary treatment: blue color grading, documentary lighting, oceanic atmosphere.',
    'anime': 'Underwater anime style, blue-teal color grading, bioluminescent accents.',
    'cartoon': 'Underwater cartoon aesthetic, ocean color palette, depth effects.',
    'sketch': 'Underwater sketch style, blue-toned linework, ocean atmosphere.',
    'chibi': 'Ocean chibi, underwater kawaii, bioluminescent cute accents.',
    'low-poly': 'Underwater geometric design, ocean blue polygons, depth lighting.',
    'mascot': 'Ocean mascot style, underwater brand presence, marine aesthetic.',
  },
  'dev-console': {
    'pixar': '3D Pixar with developer aesthetic: dark mode color scheme, gold/amber accent highlights (#FFB800), technical precision.',
    'real': 'Apply developer dark theme treatment: dark mode aesthetic, gold accent lighting, technical presentation style.',
    'anime': 'Developer anime style, dark theme colors, amber code accents.',
    'cartoon': 'Dev cartoon style, dark mode aesthetic, terminal colors.',
    'sketch': 'Developer sketch, dark background, amber highlight lines.',
    'chibi': 'Developer chibi, dark theme kawaii, code aesthetic.',
    'low-poly': 'Dark mode geometric design, amber accent polygons.',
    'mascot': 'Developer mascot, dark theme brand, tech company aesthetic.',
  },
  'neon-scientific': {
    'pixar': '3D Pixar with bioluminescent sci-fi aesthetic: glowing cyan/teal edges (#00D4FF), dramatic spot lighting, particle effects.',
    'real': 'Apply sci-fi scientific treatment: dramatic neon lighting, bioluminescent highlights, cinematic presentation.',
    'anime': 'Neon scientific anime, bioluminescent glow, dramatic sci-fi lighting.',
    'cartoon': 'Neon scientific cartoon, glowing effects, dramatic presentation.',
    'sketch': 'Neon-lit scientific sketch, glowing line effects, dramatic atmosphere.',
    'chibi': 'Neon scientific chibi, glowing kawaii, bioluminescent cute.',
    'low-poly': 'Bioluminescent geometric form, glowing polygon edges, scientific aesthetic.',
    'mascot': 'Neon scientific mascot, glowing brand presence, dramatic lighting.',
  },
};

// Character behavior instructions to inject into system prompt when character is enabled
export const CHARACTER_PRESENTER_INSTRUCTIONS = `
## CHARACTER PRESENTER GUIDELINES

You are including a consistent presenter character throughout ALL slides. This character MUST:

### Visual Consistency (CRITICAL)
- SAME character appearance (face, build, hair) across ALL slides in the deck
- This is the SAME PERSON in different poses/positions, NOT different people
- Maintain recognizable identity even when style transforms the rendering approach

### Dynamic Positioning
- Position character PROMINENTLY on each slide - never hidden or secondary
- Vary position per slide based on content layout (left side pointing right, right side gesturing left, center for emphasis)
- Character should INTERACT with content, not just stand beside it
- Consider: pointing at data, gesturing toward text, demonstrating concepts, presenting diagrams

### Content Interaction
- POINTING: Direct attention to key data points, charts, or text
- GESTURING: Open hand presentations, enumeration gestures, emphasis movements
- DEMONSTRATING: Holding relevant props, manipulating conceptual objects
- EXPLAINING: Teaching poses, thoughtful contemplation, eureka moments

### Expression & Pose Matching
- Match expression to slide tone (excited for achievements, thoughtful for complex topics, confident for conclusions)
- Vary poses between slides to maintain visual interest
- Props adapt to content (clipboard for data, lightbulb for ideas, tools for technical content)

### Style Adaptation
- Character MUST adopt the visual language of the selected style
- In pixel-art: character becomes pixelated
- In watercolor: character has painted texture
- In sci-fi-hud: character appears holographic
- Always inherit the style's color palette and visual treatment
`;

export interface CharacterGenerationConfig {
  content: string;
  style: SlideStyle;
  renderStyle: RenderStyle;
  gender: CharacterGender;
  slideCount: number;
}

export function buildCharacterGenerationPrompt(config: CharacterGenerationConfig): string {
  const { content, style, renderStyle, gender, slideCount } = config;

  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ');
  const renderStyleLabel = renderStyle.charAt(0).toUpperCase() + renderStyle.slice(1).replace(/-/g, ' ');

  let genderInstruction = '';
  if (gender === 'male') {
    genderInstruction = '\n\n**GENDER REQUIREMENT**: The character MUST be MALE with masculine features and presentation.';
  } else if (gender === 'female') {
    genderInstruction = '\n\n**GENDER REQUIREMENT**: The character MUST be FEMALE with feminine features and presentation.';
  } else {
    genderInstruction = '\n\n**GENDER PREFERENCE**: Choose whatever gender (or genderless for objects/robots) fits the content best.';
  }

  return `## Presentation Context

**Content/Topic:**
${content}

**Number of Slides:** ${slideCount}

**Visual Slide Style:** ${styleLabel}
${styleDescriptions[style]}

**Character Render Style:** ${renderStyleLabel}
The character will be rendered in ${renderStyleLabel} aesthetic. Design with this rendering approach in mind.
${genderInstruction}

## Your Task

Design ONE consistent presenter character for this ${slideCount}-slide presentation.

**Analyze the content to determine:**
1. What character TYPE best suits this topic and audience? (Human? Animal? Object? Robot? Fantasy creature?)
2. Are there any HINTS in the user's content about desired character? (e.g., mentions of specific characters, audience age, tone)
3. What PERSONALITY would make this character an effective, engaging presenter?
4. What VISUAL ELEMENTS will make this character memorable and instantly recognizable?

**Remember:**
- The character will appear on EVERY slide
- Must be recognizable across different poses and expressions
- Should ENHANCE the presentation, not distract from it
- Non-human characters are great when they fit the content!

Design the character now using the exact output format specified in your instructions.`;
}

export interface PromptConfig {
  content: string;
  style: SlideStyle;
  colorPalette: ColorPalette;
  layoutStructure: LayoutStructure;
  aspectRatio: AspectRatio;
  slideCount: number;
  character?: CharacterSettings;
  generatedCharacter?: GeneratedCharacter;
  slideTypeSequence?: string[];
}

export function buildUserPrompt(config: PromptConfig): string {
  const {
    content,
    style,
    colorPalette,
    layoutStructure,
    aspectRatio,
    slideCount,
    character,
    generatedCharacter,
    slideTypeSequence,
  } = config;

  const styleLabel = style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ');
  const persona = stylePersonas[style];

  let characterBlock = '';

  const hasValidGeneratedCharacter = generatedCharacter && 
    (generatedCharacter.coreDescription || generatedCharacter.speciesOrForm || generatedCharacter.characterType);

  if (character?.enabled && hasValidGeneratedCharacter) {
    const renderStyleLabel = character.renderStyle.charAt(0).toUpperCase() + character.renderStyle.slice(1).replace(/-/g, ' ');
    const styleAdaptation = characterStyleAdaptations[style][character.renderStyle];

    const characterName = generatedCharacter.speciesOrForm || generatedCharacter.characterType || 'presenter';
    const features = generatedCharacter.physicalDetails.distinctiveFeatures || 'distinctive features';
    const build = generatedCharacter.physicalDetails.buildProportions || 'professional build';
    const outfit = generatedCharacter.wardrobeAndProps.defaultOutfit || 'professional attire';
    const face = generatedCharacter.physicalDetails.faceExpression || 'expressive face';

    characterBlock = `
${CHARACTER_PRESENTER_INSTRUCTIONS}

###############################################################################
#                                                                             #
#   STOP! READ THIS CHARACTER DESCRIPTION BEFORE WRITING ANY SLIDE PROMPTS   #
#                                                                             #
###############################################################################

YOUR CHARACTER FOR THIS PRESENTATION:
"${characterName}" - rendered in ${renderStyleLabel} style.

COPY THIS EXACT DESCRIPTION INTO EVERY SLIDE:
- APPEARANCE: ${features}
- BUILD: ${build}
- FACE: ${face}
- OUTFIT: ${outfit}
- ACCESSORIES: ${generatedCharacter.wardrobeAndProps.propsAccessories || 'minimal accessories'}

STYLE: ${styleAdaptation}

###############################################################################
#   TEMPLATE - USE THIS EXACT FORMAT FOR THE CHARACTER IN EACH SLIDE:        #
###############################################################################

CHARACTER: A ${renderStyleLabel} ${characterName} with ${features}. ${build}. ${face}. Wearing ${outfit}. Standing in [POSITION]. [POSE/GESTURE for this slide]. Expression: [EMOTION for this slide].

###############################################################################
#   EXAMPLES OF CORRECT VS INCORRECT CHARACTER DESCRIPTIONS:                 #
###############################################################################

WRONG (generic - DO NOT WRITE LIKE THIS):
❌ "Our presenter stands confidently..."
❌ "The character gestures toward..."
❌ "A professional figure in business attire..."

CORRECT (specific - WRITE LIKE THIS):
✅ "A ${renderStyleLabel} ${characterName} with ${features}. ${build}. Wearing ${outfit}. Standing in the bottom-left, gesturing toward the chart with an open palm. Expression: enthusiastic and engaged."

###############################################################################

`;
  } else if (character?.enabled && character?.renderStyle) {
    const renderDescription = renderStyleDescriptions[character.renderStyle];
    const styleAdaptation = characterStyleAdaptations[style][character.renderStyle];
    const renderStyleLabel = character.renderStyle.charAt(0).toUpperCase() + character.renderStyle.slice(1).replace(/-/g, ' ');
    const genderModifier = character.gender && character.gender !== 'none' ? genderModifiers[character.gender] : '';

    characterBlock = `
${CHARACTER_PRESENTER_INSTRUCTIONS}

## YOUR PRESENTER CHARACTER (REQUIRED ON ALL SLIDES)

**Character Render Style:** ${renderStyleLabel}
${renderDescription}
${genderModifier ? `\n${genderModifier}` : ''}

**Style Adaptation for ${styleLabel}:**
${styleAdaptation}

**Per-Slide Character Requirements:**
For EACH slide, you MUST describe:
1. Character POSITION on slide (e.g., "left side facing right", "bottom-right corner", "center foreground")
2. Character POSE and GESTURE (e.g., "pointing at the chart", "hands open presenting", "holding a tablet")
3. Character EXPRESSION (e.g., "excited smile", "thoughtful contemplation", "confident presentation")
4. Any PROPS if relevant (e.g., "holding clipboard with data", "gesturing at floating hologram")

**CRITICAL**: This is the SAME character on ALL slides. Maintain visual consistency while varying poses and expressions.

---
`;
  }

  return `## YOUR CREATIVE IDENTITY
${persona}

You are creating a ${styleLabel} presentation. EVERY visual decision must reflect ${styleLabel} aesthetics. This style is non-negotiable—it defines every element you describe.
${characterBlock}
---

Generate ${slideCount} CINEMATICALLY RICH Nano Banana Pro Slides prompts for a visually stunning presentation deck.

## Source Content to Transform Into Slides
${content}

IMPORTANT: Create prompts worthy of a TED talk, National Geographic documentary, or blockbuster movie interface. Think VISUALLY RICH with layered compositions, atmospheric effects, and premium execution. Do NOT create simple, basic prompts.

## Visual Direction (COMMIT TO THIS STYLE)
**Style:** ${styleLabel}
${styleDescriptions[style]}

**Color Palette:** ${colorPalette === 'auto' ? 'Auto-select harmonious colors (2-3 accents + neutrals) that match the style and content' : colorPaletteDescriptions[colorPalette]}

**Layout Priority:** ${layoutDescriptions[layoutStructure]}

**Aspect Ratio:** ${aspectRatioDescriptions[aspectRatio]}

## Visual Richness Requirements (MANDATORY FOR ALL SLIDES)
Every prompt MUST include:
- **LAYERED BACKGROUND**: Gradient + subtle pattern (grid/particles/texture) + atmospheric depth
- **CINEMATIC HERO VISUAL**: Dramatic presentation with professional lighting, depth, and visual impact
- **5+ SUPPORTING ELEMENTS**: Callout boxes, stat cards, annotation systems, ambient particles, decorative accents
- **FOREGROUND DETAILS**: Floating UI elements, HUD-style decorations, accent lines, corner brackets
- **ATMOSPHERIC EFFECTS**: Particles, glows, subtle light effects, depth haze where appropriate

## Slide Deck Structure
Generate prompts for these ${slideCount} slides using the cinematic visual techniques above:

${slideTypeSequence && slideTypeSequence.length > 0 
    ? slideTypeSequence.map((typeId, idx) => {
        const slideNum = idx + 1;
        const template = getSlideTemplate(typeId);
        const typeName = typeId.replace(/-/g, ' ').replace(/^\w/, (c: string) => c.toUpperCase());
        return `${slideNum}. **Slide ${slideNum}: ${typeName}** - ${template}`;
      }).join('\n')
    : `1. **Slide 1: Title/Cover** - DRAMATIC headline with atmospheric visual, particle effects, layered depth. Full-bleed thematic hero with premium treatment.
${slideCount > 2 ? Array.from({ length: Math.min(slideCount - 2, 8) }, (_, i) => {
    const slideNum = i + 2;
    const defaultTypes = [
      '**Concept/Explanation** - Large CINEMATIC hero diagram with 5+ callout boxes with connecting lines, measurement annotations, floating stat cards, atmospheric particles, layered background depth.',
      '**Data/Insight** - DRAMATIC chart/visualization as hero with glowing data points, 3+ floating metric cards with trend indicators, ambient effects, translucent info panels, professional data overlays.',
      '**Process/Timeline** - VISUAL STORYTELLING with 4-6 connected phase boxes, dramatic main illustration with motion effects, energy trails, particle systems, supporting info panels with specs.',
      '**Comparison** - PREMIUM side-by-side with visual differentiation, floating comparison metrics, gradient backgrounds, icon systems, callout annotations, ambient depth effects.',
      '**Technical/Architecture** - HOLOGRAPHIC-STYLE schematic with wireframe overlays, glowing connection nodes, HUD-style brackets, floating spec cards, measurement systems, ambient scanning effects.',
      '**Concept/Explanation** - DOCUMENTARY-QUALITY hero with anatomical-style callouts, specimen presentation, scientific annotations, layered depth, atmospheric particles.',
      '**Data/Insight** - CINEMATIC data presentation with dramatic chart, glowing highlight points, floating metrics, trend callouts, premium visual treatment.',
      '**Process/Timeline** - DYNAMIC flow visualization with energy effects, phase indicators, dramatic illustrations, motion blur elements, supporting data panels.'
    ];
    return `${slideNum}. **Slide ${slideNum}** - ${defaultTypes[i % defaultTypes.length]}`;
  }).join('\n') : ''}
${slideCount > 1 ? `${slideCount}. **Slide ${slideCount}: Conclusion** - IMPACTFUL takeaways with premium visual recap, floating key insight cards, atmospheric depth, subtle particle effects. Footer: page '${slideCount}'.` : ''}`}

## Critical Requirements (NON-NEGOTIABLE)
Each prompt MUST:
- Be 250-350 words with EXTENSIVE visual detail
- Describe LAYERED COMPOSITION: deep background → mid-ground atmosphere → hero zone → overlay elements → foreground accents
- Include 5+ visual elements beyond the hero (callouts, particles, stat cards, annotations, ambient effects)
- Specify ATMOSPHERIC DETAILS: particle effects, glows, gradients, depth cues, lighting effects
- Describe PREMIUM EXECUTION: not basic layouts but CINEMATIC presentations
- Include connecting visual systems: leader lines, HUD brackets, measurement overlays where relevant
- Think like a nature documentary or sci-fi movie interface designer${character?.enabled ? `
- Include a detailed CHARACTER paragraph with SPECIFIC physical features (NOT generic descriptions)
- Reference the exact species/form, distinctive features, colors, and outfit from the character specification
- Describe character position, pose, expression, and any props for each slide` : ''}

## Output Format
For each slide, provide exactly this structure:

**Slide [N]: [Descriptive Title]**
\`\`\`
[150-250 word detailed prompt covering: slide type/template applied, hero zone visual (camera angle, lighting, focal point, depth), zones (background/overlay callouts), component placements (stat cards, callouts, icons), text anchor content, layout structure, design details]${hasValidGeneratedCharacter ? ` CHARACTER: A ${character?.renderStyle} ${generatedCharacter?.speciesOrForm} with ${generatedCharacter?.physicalDetails.distinctiveFeatures}. ${generatedCharacter?.physicalDetails.buildProportions}. Wearing ${generatedCharacter?.wardrobeAndProps.defaultOutfit}. [POSITION]. [POSE]. [EXPRESSION].` : (character?.enabled ? ` CHARACTER: [Include character with position, pose, expression]` : '')}
\`\`\`

---
**STYLE REMINDER**: You are a ${styleLabel} specialist. Every prompt must unmistakably reflect ${styleLabel} aesthetics. A viewer should instantly recognize the style from any slide.
${hasValidGeneratedCharacter ? `
**CHARACTER REMINDER**: Copy the EXACT character template from above into each slide. Start with "A ${character?.renderStyle} ${generatedCharacter?.speciesOrForm} with..." - DO NOT use generic phrases like "our presenter" or "the character".` : ''}

Generate all ${slideCount} detailed prompts now, applying templates and components strategically per slide.`;
}

// Re-export types for convenience
export type { SlideStyle, ColorPalette, LayoutStructure, AspectRatio };
