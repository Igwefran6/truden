import type { TouchConfig } from "./types.js";

// Attaches a touch long-press listener that triggers the overlay on mobile/tablets
export function attachTouchTrigger(
  onTrigger: () => void,
  config?: boolean | TouchConfig
): () => void {
  if (config === false) {
    return () => {};
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  const options: Required<TouchConfig> = {
    duration: 600,
    maxDistance: 10,
    ...(typeof config === "object" ? config : {}),
  };

  let timer: ReturnType<typeof setTimeout> | null = null;
  let startX = 0;
  let startY = 0;

  function clear(): void {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  }

  function handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) {
      clear();
      return;
    }

    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;

    clear();
    timer = setTimeout(() => {
      clear();
      onTrigger();
    }, options.duration);
  }

  function handleTouchMove(e: TouchEvent): void {
    if (!timer || e.touches.length !== 1) return;

    const deltaX = e.touches[0].clientX - startX;
    const deltaY = e.touches[0].clientY - startY;
    const distance = Math.hypot(deltaX, deltaY);

    // If moved beyond threshold (user is scrolling), cancel the long-press
    if (distance > options.maxDistance) {
      clear();
    }
  }

  function handleTouchEnd(): void {
    clear();
  }

  window.addEventListener("touchstart", handleTouchStart, { passive: true });
  window.addEventListener("touchmove", handleTouchMove, { passive: true });
  window.addEventListener("touchend", handleTouchEnd, { passive: true });
  window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

  return () => {
    clear();
    window.removeEventListener("touchstart", handleTouchStart);
    window.removeEventListener("touchmove", handleTouchMove);
    window.removeEventListener("touchend", handleTouchEnd);
    window.removeEventListener("touchcancel", handleTouchEnd);
  };
}
