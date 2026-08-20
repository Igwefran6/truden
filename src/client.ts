import { showOverlay, isOverlayActive } from "./overlay.js";
import type { TrudenInitConfig, CaptureRegion } from "./types.js";

let currentConfig: TrudenInitConfig = {};

/**
 * Initializes Truden with the given configuration.
 * Attaches listeners and returns a teardown function.
 */
export function init(config?: TrudenInitConfig): () => void {
  currentConfig = config || {};

  // Teardown function
  return () => {
    currentConfig = {};
  };
}

/**
 * Directly triggers the capture overlay.
 */
export function open(): void {
  if (isOverlayActive()) {
    return;
  }

  currentConfig.onOpen?.();

  showOverlay({
    onSelect: (region: CaptureRegion) => {
      // Log region and invoke placeholder
      console.log("[truden] Region selected:", region);
    },
    onCancel: () => {
      currentConfig.onCancel?.();
    },
  });
}
