/**
 * Sanitize Filename Utility
 * Shared utility for safe file system filename generation
 */

/**
 * Generates a safe filename from a title string
 * - Removes special characters except alphanumeric, CJK, spaces, and hyphens
 * - Replaces spaces with underscores
 * - Truncates to 50 characters
 * - Returns fallback if result is empty
 */
export function sanitizeFilename(title: string, fallback = 'document'): string {
  return (
    title
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50) || fallback
  );
}
