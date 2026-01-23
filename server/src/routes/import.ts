/**
 * Import Routes
 * Handles PDF and DOCX file upload and text extraction
 */
import { Hono } from 'hono';
import { parsePdf, parseDocx } from '../services/fileParser';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic number signatures for file validation
const PDF_MAGIC = [0x25, 0x50, 0x44, 0x46]; // %PDF
const DOCX_MAGIC = [0x50, 0x4b, 0x03, 0x04]; // PK.. (ZIP/DOCX)

/**
 * Validate file magic number
 */
function validateMagicNumber(buffer: Buffer, expected: number[]): boolean {
  if (buffer.length < expected.length) return false;
  return expected.every((byte, i) => buffer[i] === byte);
}

const importRoutes = new Hono();

/**
 * POST /api/import/pdf
 * Upload and extract text from PDF file
 */
importRoutes.post('/pdf', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
    }

    // Validate file type (MIME)
    if (file.type !== 'application/pdf') {
      return c.json({ success: false, error: 'Invalid file type. Expected PDF.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic number (security: prevent spoofed MIME types)
    if (!validateMagicNumber(buffer, PDF_MAGIC)) {
      return c.json({ success: false, error: 'Invalid PDF file format' }, 400);
    }

    const result = await parsePdf(buffer);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 422);
    }

    return c.json({
      success: true,
      data: {
        text: result.text,
        metadata: result.metadata,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('PDF import error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process PDF' },
      500
    );
  }
});

/**
 * POST /api/import/docx
 * Upload and extract text from DOCX file
 */
importRoutes.post('/docx', async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json({ success: false, error: 'No file provided' }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
    }

    // Validate file type (MIME)
    const validDocxTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/docx',
    ];
    if (!validDocxTypes.includes(file.type)) {
      return c.json({ success: false, error: 'Invalid file type. Expected DOCX.' }, 400);
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate magic number (security: prevent spoofed MIME types)
    if (!validateMagicNumber(buffer, DOCX_MAGIC)) {
      return c.json({ success: false, error: 'Invalid DOCX file format' }, 400);
    }

    const result = await parseDocx(buffer);

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 422);
    }

    return c.json({
      success: true,
      data: {
        text: result.text,
        metadata: result.metadata,
        fileName: file.name,
      },
    });
  } catch (error) {
    console.error('DOCX import error:', error);
    return c.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to process DOCX' },
      500
    );
  }
});

export default importRoutes;
