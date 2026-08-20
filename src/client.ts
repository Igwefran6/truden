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

// Dispatches the captured Blob to Mode A (direct callback) or Mode B (backend POST)
async function dispatchCaptureResult(blob: Blob, config: TrudenInitConfig): Promise<void> {
  // Mode A: Frontend only (no endpoint configured)
  if (!config.endpoint) {
    config.onResult?.(blob);
    return;
  }

  // Mode B: Backend endpoint configured
  const endpointUrl =
    typeof config.endpoint === "string" ? config.endpoint : config.endpoint.url;
  const customHeaders =
    typeof config.endpoint === "object" ? config.endpoint.headers : undefined;
  const prompt =
    typeof config.endpoint === "object" ? config.endpoint.prompt : undefined;

  const formData = new FormData();
  formData.append("image", blob, "screenshot.png");
  if (prompt) {
    formData.append("prompt", prompt);
  }

  try {
    const res = await fetch(endpointUrl, {
      method: "POST",
      headers: customHeaders,
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      const errorMsg = data?.error || `Server returned error status ${res.status}`;
      config.onError?.(new Error(errorMsg));
      return;
    }

    config.onResult?.(data.description !== undefined ? data.description : data);
  } catch (err: unknown) {
    config.onError?.(err);
  }
}

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
        await dispatchCaptureResult(blob, currentConfig);
      } catch (error) {
        currentConfig.onError?.(error);
      }
    },
    onCancel: () => {
      currentConfig.onCancel?.();
    },
  });
}
