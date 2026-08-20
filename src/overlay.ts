import type { CaptureRegion } from "./types.js";

let activeOverlay: HTMLElement | null = null;

export interface OverlayOptions {
  onSelect: (region: CaptureRegion) => void;
  onCancel?: () => void;
}

// Creates and displays the full-viewport capture overlay
export function showOverlay(options: OverlayOptions): void {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Prevent multiple simultaneous overlays
  if (activeOverlay) {
    return;
  }

  let startX = 0;
  let startY = 0;
  let isDragging = false;

  const overlay = document.createElement("div");
  overlay.id = "truden-overlay";
  Object.assign(overlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    zIndex: "2147483647",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    cursor: "crosshair",
    userSelect: "none",
    webkitUserSelect: "none",
    boxSizing: "border-box",
    overflow: "hidden",
    touchAction: "none",
    boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.35)",
  });

  const hint = document.createElement("div");
  hint.id = "truden-hint";
  hint.textContent = "Drag to select · Enter for full window · Esc to cancel";
  Object.assign(hint.style, {
    position: "absolute",
    top: "0",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "rgba(17, 24, 39, 0.94)",
    backdropFilter: "blur(8px)",
    color: "#ffffff",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "12px",
    fontWeight: "400",
    letterSpacing: "0.01em",
    padding: "7px 22px 9px 22px",
    borderRadius: "0 0 24px 24px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
    border: "1px solid rgba(255, 255, 255, 0.35)",
    borderTop: "none",
    pointerEvents: "none",
    whiteSpace: "nowrap",
  });

  const selectionBox = document.createElement("div");
  selectionBox.id = "truden-selection-box";
  Object.assign(selectionBox.style, {
    position: "absolute",
    border: "2px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    boxShadow: "0 0 0 99999px rgba(0, 0, 0, 0.25)",
    display: "none",
    pointerEvents: "none",
    boxSizing: "border-box",
  });

  const dimensionBadge = document.createElement("div");
  dimensionBadge.id = "truden-dimensions";
  Object.assign(dimensionBadge.style, {
    position: "absolute",
    bottom: "-24px",
    right: "0",
    backgroundColor: "rgba(17, 24, 39, 0.85)",
    color: "#ffffff",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "11px",
    padding: "2px 6px",
    borderRadius: "4px",
    pointerEvents: "none",
    whiteSpace: "nowrap",
    display: "none",
  });
  selectionBox.appendChild(dimensionBadge);

  overlay.appendChild(hint);
  overlay.appendChild(selectionBox);
  document.body.appendChild(overlay);
  activeOverlay = overlay;

  function cleanup(): void {
    window.removeEventListener("keydown", handleKeyDown, true);
    window.removeEventListener("mousedown", handleMouseDown, true);
    window.removeEventListener("mousemove", handleMouseMove, true);
    window.removeEventListener("mouseup", handleMouseUp, true);
    window.removeEventListener("touchstart", handleTouchStart, { capture: true });
    window.removeEventListener("touchmove", handleTouchMove, { capture: true });
    window.removeEventListener("touchend", handleTouchEnd, { capture: true });
    window.removeEventListener("touchcancel", handleTouchEnd, { capture: true });

    if (activeOverlay && activeOverlay.parentNode) {
      activeOverlay.parentNode.removeChild(activeOverlay);
    }
    activeOverlay = null;
  }

  function handleKeyDown(e: KeyboardEvent): void {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
      options.onCancel?.();
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      cleanup();
      options.onSelect({
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        isFullWindow: true,
      });
    }
  }

  function startSelection(clientX: number, clientY: number): void {
    startX = clientX;
    startY = clientY;
    isDragging = true;

    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";
    selectionBox.style.display = "block";
    dimensionBadge.style.display = "block";
  }

  function updateSelection(clientX: number, clientY: number): void {
    if (!isDragging) return;

    const left = Math.min(startX, clientX);
    const top = Math.min(startY, clientY);
    const width = Math.abs(clientX - startX);
    const height = Math.abs(clientY - startY);

    selectionBox.style.left = `${left}px`;
    selectionBox.style.top = `${top}px`;
    selectionBox.style.width = `${width}px`;
    selectionBox.style.height = `${height}px`;

    dimensionBadge.textContent = `${Math.round(width)} × ${Math.round(height)}`;
  }

  function endSelection(clientX: number, clientY: number): void {
    if (!isDragging) return;
    isDragging = false;

    const width = Math.abs(clientX - startX);
    const height = Math.abs(clientY - startY);

    if (width < 5 || height < 5) {
      selectionBox.style.display = "none";
      dimensionBadge.style.display = "none";
      return;
    }

    const x = Math.min(startX, clientX);
    const y = Math.min(startY, clientY);

    cleanup();

    options.onSelect({
      x,
      y,
      width,
      height,
      isFullWindow: false,
    });
  }

  function handleMouseDown(e: MouseEvent): void {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    startSelection(e.clientX, e.clientY);
  }

  function handleMouseMove(e: MouseEvent): void {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    updateSelection(e.clientX, e.clientY);
  }

  function handleMouseUp(e: MouseEvent): void {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    endSelection(e.clientX, e.clientY);
  }

  function handleTouchStart(e: TouchEvent): void {
    if (e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    startSelection(e.touches[0].clientX, e.touches[0].clientY);
  }

  function handleTouchMove(e: TouchEvent): void {
    if (!isDragging || e.touches.length !== 1) return;
    e.preventDefault();
    e.stopPropagation();
    updateSelection(e.touches[0].clientX, e.touches[0].clientY);
  }

  function handleTouchEnd(e: TouchEvent): void {
    if (!isDragging) return;
    e.preventDefault();
    e.stopPropagation();
    const touch = e.changedTouches[0];
    endSelection(touch ? touch.clientX : startX, touch ? touch.clientY : startY);
  }

  window.addEventListener("keydown", handleKeyDown, true);
  window.addEventListener("mousedown", handleMouseDown, true);
  window.addEventListener("mousemove", handleMouseMove, true);
  window.addEventListener("mouseup", handleMouseUp, true);
  window.addEventListener("touchstart", handleTouchStart, { capture: true, passive: false });
  window.addEventListener("touchmove", handleTouchMove, { capture: true, passive: false });
  window.addEventListener("touchend", handleTouchEnd, { capture: true, passive: false });
  window.addEventListener("touchcancel", handleTouchEnd, { capture: true, passive: false });
}

export function isOverlayActive(): boolean {
  return activeOverlay !== null;
}
