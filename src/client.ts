import { showOverlay, isOverlayActive } from "./overlay.js";
import { captureRegion } from "./capture.js";
import { attachShakeTrigger } from "./shake.js";
import { attachShortcutTrigger } from "./shortcut.js";
import { attachCustomEventTrigger } from "./event.js";
import { attachFloatingButton } from "./button.js";
import { attachTouchTrigger } from "./touch.js";
import type { TrudenInitConfig, CaptureRegion } from "./types.js";

let currentConfig: TrudenInitConfig = {};
let activeTeardown: (() => void) | null = null;

export function init(config?: TrudenInitConfig): () => void {
  if (activeTeardown) {
    activeTeardown();
  }

  currentConfig = config || {};

  const cleanups: Array<() => void> = [];

  const cleanupShake = attachShakeTrigger(() => {
    open();
  }, currentConfig.shake);
  cleanups.push(cleanupShake);

  const cleanupShortcut = attachShortcutTrigger(() => {
    open();
  }, currentConfig.shortcut);
  cleanups.push(cleanupShortcut);

  const cleanupCustomEvent = attachCustomEventTrigger(() => {
    open();
  }, currentConfig.customEvent);
  cleanups.push(cleanupCustomEvent);

  const cleanupFloatingButton = attachFloatingButton(() => {
    open();
  }, currentConfig.floatingButton);
  cleanups.push(cleanupFloatingButton);

  const cleanupTouch = attachTouchTrigger(() => {
    open();
  }, currentConfig.touch);
  cleanups.push(cleanupTouch);

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
