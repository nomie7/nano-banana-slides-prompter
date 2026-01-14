import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, exportJSON, exportMarkdown, exportText, exportSession } from '../export';
import type { Session } from '@/types/slidePrompt';

const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: 'session_test-123',
  title: 'Test Session',
  isDefaultTitle: false,
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  config: {
    content: {
      type: 'text',
      text: 'Test content',
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
  },
  status: 'completed',
  slides: [
    { slideNumber: 1, title: 'Introduction', prompt: 'Slide 1 content' },
    { slideNumber: 2, title: 'Main Topic', prompt: 'Slide 2 content' },
  ],
  generatedPrompt: {
    plainText: 'Generated prompt text',
    slides: [
      { slideNumber: 1, title: 'Introduction', prompt: 'Slide 1 content' },
      { slideNumber: 2, title: 'Main Topic', prompt: 'Slide 2 content' },
    ],
    jsonFormat: {
      model: 'google/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'System prompt' },
        { role: 'user', content: 'User prompt' },
      ],
    },
  },
  error: null,
  ...overrides,
});

describe('export', () => {
  let mockCreateElement: ReturnType<typeof vi.fn>;
  let mockAppendChild: ReturnType<typeof vi.fn>;
  let mockRemoveChild: ReturnType<typeof vi.fn>;
  let mockClick: ReturnType<typeof vi.fn>;
  let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockCreateElement = vi.fn();
    mockAppendChild = vi.fn();
    mockRemoveChild = vi.fn();
    mockClick = vi.fn();

    mockLink = {
      href: '',
      download: '',
      click: mockClick,
    };

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });

    mockCreateElement.mockReturnValue(mockLink);
    vi.stubGlobal('document', {
      createElement: mockCreateElement,
      body: {
        appendChild: mockAppendChild,
        removeChild: mockRemoveChild,
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('downloadFile', () => {
    it('should create blob with correct content and mime type', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockCreateElement).toHaveBeenCalledWith('a');
    });

    it('should set correct download filename', () => {
      downloadFile('test content', 'my-file.json', 'application/json');

      expect(mockLink.download).toBe('my-file.json');
    });

    it('should trigger click and cleanup', () => {
      downloadFile('test content', 'test.txt', 'text/plain');

      expect(mockClick).toHaveBeenCalled();
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it('should handle empty content', () => {
      downloadFile('', 'empty.txt', 'text/plain');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });

    it('should handle special characters in content', () => {
      const specialContent = 'Content with unicode: 中文, 日本語, 😀';
      downloadFile(specialContent, 'unicode.txt', 'text/plain');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe('exportJSON', () => {
    it('should export session as JSON with correct structure', () => {
      const session = createMockSession();

      exportJSON(session);

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(mockLink.download).toContain('.json');
    });

    it('should sanitize filename from session title', () => {
      const session = createMockSession({ title: 'My Test Session!' });

      exportJSON(session);

      expect(mockLink.download).toBe('My_Test_Session.json');
    });

    it('should handle session with special characters in title', () => {
      const session = createMockSession({ title: 'Session @#$%' });

      exportJSON(session);

      expect(mockLink.download).toBe('Session_.json');
    });

    it('should use default filename for empty title', () => {
      const session = createMockSession({ title: '' });

      exportJSON(session);

      expect(mockLink.download).toBe('document.json');
    });
  });

  describe('exportMarkdown', () => {
    it('should export session as Markdown', () => {
      const session = createMockSession();

      exportMarkdown(session);

      expect(mockLink.download).toContain('.md');
    });

    it('should not export if no slides', () => {
      const session = createMockSession({
        slides: [],
        generatedPrompt: null,
      });

      exportMarkdown(session);

      expect(mockClick).not.toHaveBeenCalled();
    });

    it('should use generatedPrompt slides if available', () => {
      const session = createMockSession();

      exportMarkdown(session);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should fallback to session slides if no generatedPrompt', () => {
      const session = createMockSession({
        generatedPrompt: null,
        slides: [{ slideNumber: 1, title: 'Fallback', prompt: 'Fallback content' }],
      });

      exportMarkdown(session);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should sanitize filename for markdown export', () => {
      const session = createMockSession({ title: 'Test Session 2024' });

      exportMarkdown(session);

      expect(mockLink.download).toBe('Test_Session_2024.md');
    });
  });

  describe('exportText', () => {
    it('should export session as plain text', () => {
      const session = createMockSession();

      exportText(session);

      expect(mockLink.download).toContain('.txt');
    });

    it('should not export if no slides', () => {
      const session = createMockSession({
        slides: [],
        generatedPrompt: null,
      });

      exportText(session);

      expect(mockClick).not.toHaveBeenCalled();
    });

    it('should include header with session title', () => {
      const session = createMockSession({ title: 'My Presentation' });

      exportText(session);

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle long session titles', () => {
      const longTitle = 'A'.repeat(100);
      const session = createMockSession({ title: longTitle });

      exportText(session);

      expect(mockLink.download.length).toBeLessThanOrEqual(54);
    });
  });

  describe('exportSession', () => {
    it('should call exportJSON for json format', () => {
      const session = createMockSession();

      exportSession(session, 'json');

      expect(mockLink.download).toContain('.json');
    });

    it('should call exportMarkdown for markdown format', () => {
      const session = createMockSession();

      exportSession(session, 'markdown');

      expect(mockLink.download).toContain('.md');
    });

    it('should call exportText for text format', () => {
      const session = createMockSession();

      exportSession(session, 'text');

      expect(mockLink.download).toContain('.txt');
    });
  });
});
