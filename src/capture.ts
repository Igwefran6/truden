import html2canvas from "html2canvas";
import type { CaptureRegion } from "./types.js";

// Reusable 2D canvas context for CSS color resolution
let colorConverterCtx: CanvasRenderingContext2D | null = null;

function getColorConverterCtx(): CanvasRenderingContext2D | null {
  if (colorConverterCtx) return colorConverterCtx;
  if (typeof document === "undefined") return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  colorConverterCtx = canvas.getContext("2d", { willReadFrequently: true });
  return colorConverterCtx;
}

// Converts any modern CSS color to standard rgb/rgba using the browser's native engine
function convertColorToStandardRgb(colorStr: string): string {
  const ctx = getColorConverterCtx();
  if (!ctx) return colorStr;

  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "rgba(0,0,0,0)";
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);

    const pixel = ctx.getImageData(0, 0, 1, 1).data;
    const [r, g, b, a] = pixel;

    if (a === 255) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(4)})`;
  } catch {
    return colorStr;
  }
}

// Parses and replaces modern CSS color functions using balanced parenthesis tracking
function replaceModernColors(text: string): string {
  const FUNCTION_NAMES =
    /\b(oklch|oklab|lch|lab|hwb|color|color-mix|light-dark)\s*\(/gi;

  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  FUNCTION_NAMES.lastIndex = 0;

  while ((match = FUNCTION_NAMES.exec(text)) !== null) {
    const funcStart = match.index;
    const openParenIndex = funcStart + match[0].length - 1;

    // Track matching closing parenthesis across arbitrary nesting
    let depth = 1;
    let i = openParenIndex + 1;
    while (i < text.length && depth > 0) {
      if (text[i] === "(") depth++;
      else if (text[i] === ")") depth--;
      i++;
    }

    if (depth !== 0) {
      continue;
    }

    const fullExpression = text.substring(funcStart, i);
    const converted = convertColorToStandardRgb(fullExpression);

    result += text.substring(lastIndex, funcStart) + converted;
    lastIndex = i;
    FUNCTION_NAMES.lastIndex = lastIndex;
  }

  result += text.substring(lastIndex);
  return result;
}

const ANY_MODERN_COLOR_TEST =
  /\b(?:oklch|oklab|lch|lab|hwb|color|color-mix|light-dark)\s*\(/i;

// Converts unsupported color functions in stylesheets and inline styles before capture
function sanitizeDocumentColors(clonedDoc: Document): void {
  // Sanitize <style> tags (Tailwind, CSS modules, CSS-in-JS)
  const styleTags = clonedDoc.querySelectorAll("style");
  styleTags.forEach((styleTag) => {
    if (
      styleTag.textContent &&
      ANY_MODERN_COLOR_TEST.test(styleTag.textContent)
    ) {
      styleTag.textContent = replaceModernColors(styleTag.textContent);
    }
  });

  // Sanitize inline style attributes on all DOM elements
  const allElements = clonedDoc.querySelectorAll<HTMLElement | SVGElement>("*");
  allElements.forEach((el) => {
    const inlineStyle = el.getAttribute("style");
    if (inlineStyle && ANY_MODERN_COLOR_TEST.test(inlineStyle)) {
      el.setAttribute("style", replaceModernColors(inlineStyle));
    }
  });
}

// Captures the specified region of the viewport and resolves with a PNG Blob
export async function captureRegion(region: CaptureRegion): Promise<Blob> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Screen capture can only run in a browser environment.");
  }

  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  const targetX = region.isFullWindow ? scrollX : scrollX + region.x;
  const targetY = region.isFullWindow ? scrollY : scrollY + region.y;
  const targetWidth = region.isFullWindow ? window.innerWidth : region.width;
  const targetHeight = region.isFullWindow ? window.innerHeight : region.height;

  // Let DOM repaint so overlay is not included in the snapshot
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const canvas = await html2canvas(document.documentElement, {
    x: targetX,
    y: targetY,
    width: targetWidth,
    height: targetHeight,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    scrollX: scrollX,
    scrollY: scrollY,
    useCORS: true,
    allowTaint: true,
    logging: false,
    onclone: (clonedDoc) => {
      sanitizeDocumentColors(clonedDoc);
    },
  });

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to generate image Blob from canvas."));
      }
    }, "image/png");
  });
}
