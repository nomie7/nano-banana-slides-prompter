import { describe, it, expect } from 'vitest';
import { generatePrompt } from '../promptGenerator';
import type { SlidePromptConfig } from '@/types/slidePrompt';

const createBaseConfig = (overrides: Partial<SlidePromptConfig> = {}): SlidePromptConfig => ({
  content: {
    type: 'text',
    text: 'Test presentation content',
    topic: '',
    fileContent: '',
    fileName: '',
    url: '',
    urlContent: '',
  },
  style: 'professional',
  settings: {
    aspectRatio: '16:9',
    slideCount: 5,
    colorPalette: 'auto',
    layoutStructure: 'balanced',
  },
  ...overrides,
});

describe('promptGenerator', () => {
  describe('generatePrompt', () => {
    it('should generate prompt with text content type', () => {
      const config = createBaseConfig({
        content: {
          type: 'text',
          text: 'My presentation about AI',
          topic: '',
          fileContent: '',
          fileName: '',
          url: '',
          urlContent: '',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('My presentation about AI');
      expect(result.jsonFormat.messages).toHaveLength(2);
      expect(result.jsonFormat.messages[0].role).toBe('system');
      expect(result.jsonFormat.messages[1].role).toBe('user');
    });

    it('should generate prompt with topic content type', () => {
      const config = createBaseConfig({
        content: {
          type: 'topic',
          text: '',
          topic: 'Climate Change',
          fileContent: '',
          fileName: '',
          url: '',
          urlContent: '',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Topic: Climate Change');
      expect(result.jsonFormat.messages[1].content).toContain('Topic: Climate Change');
    });

    it('should generate prompt with file content type', () => {
      const config = createBaseConfig({
        content: {
          type: 'file',
          text: '',
          topic: '',
          fileContent: 'File content here',
          fileName: 'document.pdf',
          url: '',
          urlContent: '',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Content from file "document.pdf"');
      expect(result.plainText).toContain('File content here');
    });

    it('should generate prompt with URL content type', () => {
      const config = createBaseConfig({
        content: {
          type: 'url',
          text: '',
          topic: '',
          fileContent: '',
          fileName: '',
          url: 'https://example.com',
          urlContent: 'Fetched URL content',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Content from URL "https://example.com"');
      expect(result.plainText).toContain('Fetched URL content');
    });

    it('should include correct slide count in prompt', () => {
      const config = createBaseConfig({
        settings: {
          aspectRatio: '16:9',
          slideCount: 10,
          colorPalette: 'auto',
          layoutStructure: 'balanced',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('10-slide presentation');
      expect(result.jsonFormat.messages[1].content).toContain('Generate all 10 slides now');
    });

    it('should include style description for professional style', () => {
      const config = createBaseConfig({ style: 'professional' });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Professional');
      expect(result.plainText).toContain('Clean, corporate design');
    });

    it('should include style description for creative style', () => {
      const config = createBaseConfig({ style: 'creative' });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Creative');
      expect(result.plainText).toContain('Bold, artistic design');
    });

    it('should include correct aspect ratio information', () => {
      const config = createBaseConfig({
        settings: {
          aspectRatio: '4:3',
          slideCount: 5,
          colorPalette: 'auto',
          layoutStructure: 'balanced',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('4:3');
      expect(result.plainText).toContain('Traditional presentation format');
    });

    it('should include layout structure description', () => {
      const config = createBaseConfig({
        settings: {
          aspectRatio: '16:9',
          slideCount: 5,
          colorPalette: 'auto',
          layoutStructure: 'visual-heavy',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('70% visuals, 30% text');
    });

    it('should include color palette description', () => {
      const config = createBaseConfig({
        settings: {
          aspectRatio: '16:9',
          slideCount: 5,
          colorPalette: 'corporate-blue',
          layoutStructure: 'balanced',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('Navy blue');
      expect(result.plainText).toContain('#1E3A5F');
    });

    it('should return correct JSON format structure', () => {
      const config = createBaseConfig();

      const result = generatePrompt(config);

      expect(result.jsonFormat).toHaveProperty('model', 'google/gemini-2.5-flash');
      expect(result.jsonFormat).toHaveProperty('messages');
      expect(Array.isArray(result.jsonFormat.messages)).toBe(true);
    });

    it('should return empty slides array', () => {
      const config = createBaseConfig();

      const result = generatePrompt(config);

      expect(result.slides).toEqual([]);
    });

    it('should handle empty content gracefully', () => {
      const config = createBaseConfig({
        content: {
          type: 'text',
          text: '',
          topic: '',
          fileContent: '',
          fileName: '',
          url: '',
          urlContent: '',
        },
      });

      const result = generatePrompt(config);

      expect(result.plainText).toContain('General presentation content');
    });
  });
});
