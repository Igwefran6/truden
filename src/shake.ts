import type { ShakeConfig } from "./types.js";

// Attaches mouse shake gesture listener while Alt key is held
export function attachShakeTrigger(
  onTrigger: () => void,
  config?: boolean | ShakeConfig
): () => void {
  if (config === false) {
    return () => {};
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  const options: Required<ShakeConfig> = {
    reversals: 4,
    window: 800,
    minDistance: 20,
    ...(typeof config === "object" ? config : {}),
  };

  let lastX: number | null = null;
  let currentDirection: "left" | "right" | null = null;
  let accumulatedDistance = 0;
  const reversalTimestamps: number[] = [];

  function reset(): void {
    lastX = null;
    currentDirection = null;
    accumulatedDistance = 0;
    reversalTimestamps.length = 0;
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!e.altKey) {
      if (reversalTimestamps.length > 0) {
        reset();
      }
      return;
    }

    const currentX = e.clientX;
    const now = Date.now();

    if (lastX === null) {
      lastX = currentX;
      return;
    }

    const deltaX = currentX - lastX;
    lastX = currentX;

    if (Math.abs(deltaX) < 1) {
      return;
    }

    const newDirection = deltaX > 0 ? "right" : "left";

    if (currentDirection === null) {
      currentDirection = newDirection;
      accumulatedDistance = Math.abs(deltaX);
      return;
    }

    if (newDirection === currentDirection) {
      accumulatedDistance += Math.abs(deltaX);
    } else {
      if (accumulatedDistance >= options.minDistance) {
        while (
          reversalTimestamps.length > 0 &&
          now - reversalTimestamps[0] > options.window
        ) {
          reversalTimestamps.shift();
        }

        reversalTimestamps.push(now);

        if (reversalTimestamps.length >= options.reversals) {
          reset();
          onTrigger();
          return;
        }
      }

      currentDirection = newDirection;
      accumulatedDistance = Math.abs(deltaX);
    }
  }

  function handleKeyUp(e: KeyboardEvent): void {
    if (e.key === "Alt") {
      reset();
    }
  }

  function handleBlur(): void {
    reset();
  }

  window.addEventListener("mousemove", handleMouseMove, { passive: true });
  window.addEventListener("keyup", handleKeyUp, { passive: true });
  window.addEventListener("blur", handleBlur, { passive: true });

  return () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("blur", handleBlur);
    reset();
  };
}
