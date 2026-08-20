import { snapdom } from "@zumer/snapdom";
import type { CaptureRegion } from "./types.js";

// Captures a specific region of the page or the full viewport using SnapDOM
export async function captureRegion(region: CaptureRegion): Promise<Blob> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Screen capture can only run in a browser environment.");
  }

  // Wait one frame to ensure overlay is completely removed and DOM has repainted
  await new Promise((resolve) => requestAnimationFrame(resolve));

  const dpr = window.devicePixelRatio || 1;
  const scrollX = window.scrollX || window.pageXOffset || 0;
  const scrollY = window.scrollY || window.pageYOffset || 0;

  // Capture the full rendered document using SnapDOM
  const fullCanvas = await snapdom.toCanvas(document.documentElement, {
    dpr,
    fast: true,
    embedFonts: true,
  });

  // Calculate coordinates in device pixels
  const targetX = (region.isFullWindow ? scrollX : scrollX + region.x) * dpr;
  const targetY = (region.isFullWindow ? scrollY : scrollY + region.y) * dpr;
  const targetWidth = (region.isFullWindow ? window.innerWidth : region.width) * dpr;
  const targetHeight = (region.isFullWindow ? window.innerHeight : region.height) * dpr;

  // Crop the selected bounding box to a high-fidelity destination canvas
  const croppedCanvas = document.createElement("canvas");
  croppedCanvas.width = targetWidth;
  croppedCanvas.height = targetHeight;
  const ctx = croppedCanvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to initialize canvas context for cropped region.");
  }

  ctx.drawImage(
    fullCanvas,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
    0,
    0,
    targetWidth,
    targetHeight
  );

  return new Promise<Blob>((resolve, reject) => {
    croppedCanvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to generate image Blob from canvas."));
      }
    }, "image/png");
  });
}
