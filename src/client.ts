import { showOverlay, isOverlayActive } from "./overlay.js";
import { captureRegion } from "./capture.js";
import { attachShakeTrigger } from "./shake.js";
import type { TrudenInitConfig, CaptureRegion } from "./types.js";

let currentConfig: TrudenInitConfig = {};
let activeTeardown: (() => void) | null = null;

export function init(config?: TrudenInitConfig): () => void {
  // Clean up any previous listeners if init was called before
  if (activeTeardown) {
    activeTeardown();
  }

  currentConfig = config || {};

  const cleanups: Array<() => void> = [];

  const cleanupShake = attachShakeTrigger(() => {
    open();
  }, currentConfig.shake);
  cleanups.push(cleanupShake);

  const teardown = () => {
    cleanups.forEach((cleanup) => cleanup());
    currentConfig = {};
    activeTeardown = null;
  };

  activeTeardown = teardown;
  return teardown;
}

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
