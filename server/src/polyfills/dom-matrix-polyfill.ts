/**
 * DOM Matrix Polyfill for Node.js/Bun environments
 * Required by pdfjs-dist when @napi-rs/canvas is not available
 * This provides minimal stubs to prevent crashes during PDF text extraction
 */

// Simple DOMMatrix polyfill (minimal implementation for pdfjs-dist compatibility)
class DOMMatrixPolyfill {
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  m11 = 1;
  m12 = 0;
  m13 = 0;
  m14 = 0;
  m21 = 0;
  m22 = 1;
  m23 = 0;
  m24 = 0;
  m31 = 0;
  m32 = 0;
  m33 = 1;
  m34 = 0;
  m41 = 0;
  m42 = 0;
  m43 = 0;
  m44 = 1;

  is2D = true;
  isIdentity = true;

  constructor(init?: string | number[]) {
    if (Array.isArray(init) && init.length >= 6) {
      [this.a, this.b, this.c, this.d, this.e, this.f] = init;
      this.m11 = this.a;
      this.m12 = this.b;
      this.m21 = this.c;
      this.m22 = this.d;
      this.m41 = this.e;
      this.m42 = this.f;
    }
  }

  multiply(): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill();
  }
  translate(): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill();
  }
  scale(): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill();
  }
  rotate(): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill();
  }
  inverse(): DOMMatrixPolyfill {
    return new DOMMatrixPolyfill();
  }
  transformPoint(point: { x: number; y: number }): { x: number; y: number } {
    return point;
  }
}

// Simple ImageData polyfill
class ImageDataPolyfill {
  data: Uint8ClampedArray;
  width: number;
  height: number;
  colorSpace: string = 'srgb';

  constructor(width: number, height: number);
  constructor(data: Uint8ClampedArray, width: number, height?: number);
  constructor(arg1: number | Uint8ClampedArray, arg2: number, arg3?: number) {
    if (typeof arg1 === 'number') {
      this.width = arg1;
      this.height = arg2;
      this.data = new Uint8ClampedArray(arg1 * arg2 * 4);
    } else {
      this.data = arg1;
      this.width = arg2;
      this.height = arg3 ?? Math.floor(arg1.length / (arg2 * 4));
    }
  }
}

// Simple Path2D polyfill
class Path2DPolyfill {
  private commands: string[] = [];

  constructor(_path?: string | Path2DPolyfill) {
    // Minimal implementation
  }

  addPath(): void {}
  closePath(): void {}
  moveTo(): void {}
  lineTo(): void {}
  bezierCurveTo(): void {}
  quadraticCurveTo(): void {}
  arc(): void {}
  arcTo(): void {}
  ellipse(): void {}
  rect(): void {}
}

// Apply polyfills to global scope if not already defined
export function applyDOMPolyfills(): void {
  const g = globalThis as Record<string, unknown>;

  if (typeof g.DOMMatrix === 'undefined') {
    g.DOMMatrix = DOMMatrixPolyfill;
  }

  if (typeof g.ImageData === 'undefined') {
    g.ImageData = ImageDataPolyfill;
  }

  if (typeof g.Path2D === 'undefined') {
    g.Path2D = Path2DPolyfill;
  }
}

// Auto-apply on import
applyDOMPolyfills();
