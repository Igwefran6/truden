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

function notifyError(err: unknown, config: TrudenInitConfig): void {
  if (config.onError) {
    config.onError(err);
  } else {
    console.error("[truden] Error during capture:", err);
  }
}

// Validates configuration options and emits warnings for invalid values without throwing
function validateConfig(config: TrudenInitConfig): void {
  if (config.endpoint !== undefined) {
    if (typeof config.endpoint === "string" && config.endpoint.trim() === "") {
      console.warn(
        "[truden] `endpoint` is an empty string. Omit `endpoint` if you intend to use Mode A (frontend only)."
      );
    } else if (
      typeof config.endpoint === "object" &&
      (!config.endpoint.url || config.endpoint.url.trim() === "")
    ) {
      console.warn("[truden] `endpoint` configuration is missing a valid `url` property.");
    }
  }

  if (typeof config.shake === "object" && config.shake !== null) {
    if (config.shake.reversals !== undefined && config.shake.reversals < 1) {
      console.warn("[truden] `shake.reversals` must be >= 1. Using default (4).");
    }
    if (config.shake.window !== undefined && config.shake.window <= 0) {
      console.warn("[truden] `shake.window` must be > 0. Using default (800ms).");
    }
  }

  if (typeof config.touch === "object" && config.touch !== null) {
    if (config.touch.duration !== undefined && config.touch.duration < 100) {
      console.warn(
        "[truden] `touch.duration` is very short (<100ms), which may trigger accidentally during normal taps."
      );
    }
  }
}

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
      notifyError(new Error(errorMsg), config);
      return;
    }

    config.onResult?.(data.description !== undefined ? data.description : data);
  } catch (err: unknown) {
    notifyError(err, config);
  }
}

export function init(config?: TrudenInitConfig): () => void {
  // Guard against stacked duplicate listeners
  if (activeTeardown) {
    activeTeardown();
  }

  currentConfig = config || {};
  validateConfig(currentConfig);

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
        notifyError(error, currentConfig);
      }
    },
    onCancel: () => {
      currentConfig.onCancel?.();
    },
  });
}
