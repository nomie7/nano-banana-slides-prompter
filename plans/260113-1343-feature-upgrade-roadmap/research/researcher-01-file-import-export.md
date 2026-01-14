# File Import/Export Libraries Research

**Project:** Nano Banana Slides Prompter (React 19, Vite 7, Hono/Bun)
**Target Users:** Individual/Freelancer, Education, Small Business
**Principle:** KISS (Keep It Simple)

---

## 1. PDF Import (Text Extraction)

| Library      | Bundle Size     | Environment      | Dependencies                    |
| ------------ | --------------- | ---------------- | ------------------------------- |
| `pdf-parse`  | ~21 MB unpacked | Node.js, Browser | 2 (pdfjs-dist, @napi-rs/canvas) |
| `pdfjs-dist` | ~2 MB gzipped   | Browser, Node.js | 0 (standalone)                  |
| `pdf2json`   | ~1.5 MB         | Node.js only     | 0 (since v3.1.6)                |

### Recommendation: `pdf-parse` (Server-side)

**Why:** Simple Promise-based API, handles most PDF types, works with Bun/Hono backend.

**Limitations:**

- Large unpacked size (but only used server-side)
- Complex layouts may lose formatting
- Scanned PDFs need OCR (not included)

**Code Example:**

```typescript
// server/routes/import.ts
import pdf from 'pdf-parse';

app.post('/api/import/pdf', async (c) => {
  const file = await c.req.arrayBuffer();
  const data = await pdf(Buffer.from(file));
  return c.json({ text: data.text, pages: data.numpages });
});
```

---

## 2. DOCX Import

| Library   | Bundle Size      | Environment      | Dependencies                  |
| --------- | ---------------- | ---------------- | ----------------------------- |
| `mammoth` | ~150 KB min+gzip | Browser, Node.js | 3 (xmldom, jszip, underscore) |

### Recommendation: `mammoth.js`

**Why:** Only viable option for DOCX-to-text/HTML. Semantic conversion, well-maintained.

**Features:**

- `convertToHtml()` - DOCX to clean HTML
- `extractRawText()` - Plain text extraction
- Supports headings, lists, tables, images, links

**Limitations:**

- Complex styling not preserved (by design)
- No XLSX support (different lib needed)

**Code Example:**

```typescript
// server/routes/import.ts
import mammoth from 'mammoth';

app.post('/api/import/docx', async (c) => {
  const file = await c.req.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer: file });
  return c.json({ text: result.value, messages: result.messages });
});
```

---

## 3. PPTX Export (PowerPoint Generation)

| Library     | Bundle Size (gzip) | Environment      | Dependencies |
| ----------- | ------------------ | ---------------- | ------------ |
| `pptxgenjs` | ~122 KB min        | Browser, Node.js | 1 (jszip)    |
| `officegen` | ~80 KB             | Node.js only     | Multiple     |

### Recommendation: `pptxgenjs`

**Why:** Feature-rich, zero runtime deps claim, works in browser + Node, active maintenance (2025).

**Features:**

- Slides, text, images, charts, tables, shapes
- Master slides, SVGs, animated GIFs
- Compatible with PowerPoint, Keynote, Google Slides

**Limitations:**

- No template support (build from scratch)
- Learning curve for complex layouts

**Code Example:**

```typescript
// Can run client-side or server-side
import PptxGenJS from 'pptxgenjs';

function exportToPptx(slides: SlideData[]) {
  const pptx = new PptxGenJS();

  slides.forEach((slideData) => {
    const slide = pptx.addSlide();
    slide.addText(slideData.title, { x: 0.5, y: 0.5, fontSize: 24 });
    slide.addText(slideData.content, { x: 0.5, y: 1.5, fontSize: 14 });
  });

  return pptx.writeFile({ fileName: 'presentation.pptx' });
}
```

---

## 4. PDF Export (PDF Generation)

| Library               | Bundle Size (gzip) | Environment      | Approach         |
| --------------------- | ------------------ | ---------------- | ---------------- |
| `@react-pdf/renderer` | ~200 KB            | Browser, Node.js | React components |
| `jspdf`               | ~124 KB            | Browser, Node.js | Canvas API       |
| `puppeteer`           | ~50 MB+            | Node.js only     | Headless Chrome  |

### Recommendation: `jspdf` (Simple) or `@react-pdf/renderer` (Complex)

**For Simple PDFs (text export):** Use `jspdf`

- Lightweight, client-side
- Good for text-based exports

**For Complex PDFs (styled reports):** Use `@react-pdf/renderer`

- React component approach (fits project stack)
- Flexbox layouts, styling

**Avoid `puppeteer`:**

- 50MB+ dependency (headless Chrome)
- Overkill for this use case
- Resource intensive

**Code Example (jspdf):**

```typescript
import { jsPDF } from 'jspdf';

function exportToPdf(content: string, filename: string) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(content, 10, 10, { maxWidth: 180 });
  doc.save(`${filename}.pdf`);
}
```

**Code Example (@react-pdf/renderer):**

```tsx
import { Document, Page, Text, View, pdf } from '@react-pdf/renderer';

const PromptDocument = ({ content }: { content: string }) => (
  <Document>
    <Page size="A4" style={{ padding: 30 }}>
      <View>
        <Text style={{ fontSize: 12 }}>{content}</Text>
      </View>
    </Page>
  </Document>
);

async function exportToPdf(content: string) {
  const blob = await pdf(<PromptDocument content={content} />).toBlob();
  // Download blob
}
```

---

## Summary Recommendations

| Feature     | Library     | Bundle Impact    | Complexity |
| ----------- | ----------- | ---------------- | ---------- |
| PDF Import  | `pdf-parse` | Server-side only | Low        |
| DOCX Import | `mammoth`   | ~150 KB          | Low        |
| PPTX Export | `pptxgenjs` | ~122 KB          | Medium     |
| PDF Export  | `jspdf`     | ~124 KB          | Low        |

**Total Frontend Bundle Impact:** ~396 KB (if all client-side)

### Integration Strategy

1. **Import features** - Handle server-side (Bun/Hono)
   - `pdf-parse` and `mammoth` run on `/api/import/*` endpoints
   - Frontend sends file, receives extracted text

2. **Export features** - Handle client-side
   - `jspdf` for simple text PDF export
   - `pptxgenjs` for PowerPoint export
   - Reduces server load, instant downloads

---

## Unresolved Questions

1. Should PDF export support styled output (requires `@react-pdf/renderer`) or plain text (`jspdf`)?
2. Need XLSX import support? (requires `xlsx` or `exceljs` - not researched)
3. Should PPTX export include slide templates or build from scratch?

---

**Sources:**

- [npm-compare.com - PDF libraries](https://npm-compare.com)
- [npmjs.com - pdf-parse](https://npmjs.com/package/pdf-parse)
- [npmjs.com - mammoth](https://npmjs.com/package/mammoth)
- [npmjs.com - pptxgenjs](https://npmjs.com/package/pptxgenjs)
- [bundlephobia.com - jspdf](https://bundlephobia.com/package/jspdf)
- [react-pdf.dev](https://react-pdf.dev)
