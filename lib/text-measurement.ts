import { createCanvas } from 'canvas';

/**
 * Measures the pixel width of text using Canvas API
 * Works in both browser and Node.js environments
 */
export function measureTextWidth(text: string): number {
  if (typeof window !== 'undefined' && window.document) {
    // Browser environment - use DOM Canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    ctx.font = '16px Arial';
    const metrics = ctx.measureText(text);
    return Math.round(metrics.width);
  } else {
    // Node.js environment - use node-canvas
    try {
      const canvas = createCanvas(200, 100);
      const ctx = canvas.getContext('2d');
      ctx.font = '16px Arial';
      const metrics = ctx.measureText(text);
      return Math.round(metrics.width);
    } catch {
      // Fallback if canvas is not available
      console.warn('Canvas not available for text measurement, using fallback calculation');
      const averageCharWidth = 9; // Approximate width in pixels for Arial 16px
      return Math.round(text.length * averageCharWidth);
    }
  }
}

/**
 * Creates a canvas element for text measurement in browser environments
 * This is used when you need to pass a canvas reference to other functions
 */
export function createTextMeasurementCanvas(): HTMLCanvasElement | null {
  if (typeof window !== 'undefined' && window.document) {
    return document.createElement('canvas');
  }
  return null;
}

/**
 * Measures text width using a provided canvas element (browser only)
 * This is for compatibility with existing code that uses canvas refs
 */
export function measureTextWidthWithCanvas(text: string, canvas: HTMLCanvasElement | null): number {
  if (!canvas) return 0;

  const ctx = canvas.getContext('2d');
  if (!ctx) return 0;

  ctx.font = '16px Arial';
  const metrics = ctx.measureText(text);
  return Math.round(metrics.width);
}
