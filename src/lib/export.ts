import type { Session, ParsedSlide, GeneratedPrompt } from '@/types/slidePrompt';

export type ExportFormat = 'json' | 'markdown' | 'text';

/**
 * Downloads a file with the given content and filename
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a safe filename from session title
 */
function sanitizeFilename(title: string): string {
  return (
    title
      .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50) || 'session'
  );
}

/**
 * Formats slides as plain text
 */
function formatSlidesAsText(slides: ParsedSlide[]): string {
  return slides
    .map((slide) => `Slide ${slide.slideNumber}: ${slide.title}\n${slide.prompt}`)
    .join('\n\n---\n\n');
}

/**
 * Formats slides as Markdown
 */
function formatSlidesAsMarkdown(slides: ParsedSlide[], sessionTitle: string): string {
  const header = `# ${sessionTitle}\n\n`;
  const slidesContent = slides
    .map((slide) => `## Slide ${slide.slideNumber}: ${slide.title}\n\n${slide.prompt}`)
    .join('\n\n---\n\n');
  return header + slidesContent;
}

/**
 * Export session as JSON
 */
export function exportJSON(session: Session): void {
  const exportData = {
    title: session.title,
    createdAt: new Date(session.createdAt).toISOString(),
    updatedAt: new Date(session.updatedAt).toISOString(),
    config: session.config,
    slides: session.slides,
    generatedPrompt: session.generatedPrompt,
  };
  const content = JSON.stringify(exportData, null, 2);
  const filename = `${sanitizeFilename(session.title)}.json`;
  downloadFile(content, filename, 'application/json');
}

/**
 * Export session as Markdown
 */
export function exportMarkdown(session: Session): void {
  const slides = session.generatedPrompt?.slides || session.slides;
  if (slides.length === 0) return;

  const content = formatSlidesAsMarkdown(slides, session.title);
  const filename = `${sanitizeFilename(session.title)}.md`;
  downloadFile(content, filename, 'text/markdown');
}

/**
 * Export session as plain text
 */
export function exportText(session: Session): void {
  const slides = session.generatedPrompt?.slides || session.slides;
  if (slides.length === 0) return;

  const header = `${session.title}\n${'='.repeat(session.title.length)}\n\n`;
  const content = header + formatSlidesAsText(slides);
  const filename = `${sanitizeFilename(session.title)}.txt`;
  downloadFile(content, filename, 'text/plain');
}

/**
 * Export session in specified format
 */
export function exportSession(session: Session, format: ExportFormat): void {
  switch (format) {
    case 'json':
      exportJSON(session);
      break;
    case 'markdown':
      exportMarkdown(session);
      break;
    case 'text':
      exportText(session);
      break;
  }
}
