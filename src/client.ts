import { showOverlay, isOverlayActive } from "./overlay.js";
import { captureRegion } from "./capture.js";
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
    onSelect: async (region: CaptureRegion) => {
      try {
        const blob = await captureRegion(region);
        currentConfig.onResult?.(blob);
      } catch (error) {
        currentConfig.onError?.(error);
      }
    },
    onCancel: () => {
      currentConfig.onCancel?.();
    },
  });
}
