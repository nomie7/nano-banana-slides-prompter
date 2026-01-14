/**
 * File Parser Service
 * Handles PDF and DOCX file parsing for content extraction
 */
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export interface ParseResult {
  success: boolean;
  text: string;
  error?: string;
  metadata?: {
    pages?: number;
    wordCount?: number;
  };
}

/**
 * Parse PDF buffer and extract text content
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  try {
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    const text = result.text.trim();

    // Get info for page count
    const info = await parser.getInfo();
    await parser.destroy();

    if (!text) {
      return {
        success: false,
        text: '',
        error: 'PDF contains no extractable text (may be scanned/image-based)',
      };
    }

    return {
      success: true,
      text,
      metadata: {
        pages: info.total,
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to parse PDF',
    };
  }
}

/**
 * Parse DOCX buffer and extract text content
 */
export async function parseDocx(buffer: Buffer): Promise<ParseResult> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();

    if (!text) {
      return {
        success: false,
        text: '',
        error: 'DOCX contains no extractable text',
      };
    }

    // Log any warnings from mammoth
    if (result.messages.length > 0) {
      console.warn('DOCX parsing warnings:', result.messages);
    }

    return {
      success: true,
      text,
      metadata: {
        wordCount: text.split(/\s+/).length,
      },
    };
  } catch (error) {
    return {
      success: false,
      text: '',
      error: error instanceof Error ? error.message : 'Failed to parse DOCX',
    };
  }
}

/**
 * Parse file based on type
 */
export async function parseFile(buffer: Buffer, mimeType: string): Promise<ParseResult> {
  if (mimeType === 'application/pdf') {
    return parsePdf(buffer);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    mimeType === 'application/docx'
  ) {
    return parseDocx(buffer);
  }

  return {
    success: false,
    text: '',
    error: `Unsupported file type: ${mimeType}`,
  };
}
