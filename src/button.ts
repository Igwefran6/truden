import type { FloatingButtonConfig, FloatingButtonPosition } from "./types.js";

// Renders an opt-in floating trigger button that invokes onTrigger on click
export function attachFloatingButton(
  onTrigger: () => void,
  config?: boolean | FloatingButtonConfig
): () => void {
  if (!config) {
    return () => {};
  }

  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  const options: FloatingButtonConfig =
    typeof config === "object" ? config : {};

  const position: FloatingButtonPosition = options.position || "bottom-right";

  const button = document.createElement("button");
  button.id = "truden-floating-btn";
  button.type = "button";
  button.setAttribute("aria-label", options.label || "Capture screen with Truden");

  if (options.className) {
    button.className = options.className;
  }

  const positionStyles: Record<FloatingButtonPosition, Partial<CSSStyleDeclaration>> = {
    "bottom-right": { bottom: "20px", right: "20px", top: "auto", left: "auto" },
    "bottom-left": { bottom: "20px", left: "20px", top: "auto", right: "auto" },
    "top-right": { top: "20px", right: "20px", bottom: "auto", left: "auto" },
    "top-left": { top: "20px", left: "20px", bottom: "auto", right: "auto" },
  };

  Object.assign(button.style, {
    position: "fixed",
    zIndex: "2147483640",
    backgroundColor: "rgba(17, 24, 39, 0.9)",
    backdropFilter: "blur(8px)",
    color: "#ffffff",
    border: "1px solid rgba(255, 255, 255, 0.18)",
    borderRadius: "9999px",
    padding: options.label ? "8px 16px" : "10px",
    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: "13px",
    fontWeight: "500",
    transition: "transform 0.15s ease, background-color 0.15s ease",
    ...positionStyles[position],
  });

  const iconSvg = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  `;

  if (options.label) {
    button.innerHTML = `${iconSvg}<span>${options.label}</span>`;
  } else {
    button.innerHTML = iconSvg;
  }

  button.addEventListener("mouseenter", () => {
    button.style.transform = "scale(1.05)";
    button.style.backgroundColor = "rgba(31, 41, 55, 0.95)";
  });

  button.addEventListener("mouseleave", () => {
    button.style.transform = "scale(1)";
    button.style.backgroundColor = "rgba(17, 24, 39, 0.9)";
  });

  function handleClick(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    onTrigger();
  }

  button.addEventListener("click", handleClick);
  document.body.appendChild(button);

  return () => {
    button.removeEventListener("click", handleClick);
    if (button.parentNode) {
      button.parentNode.removeChild(button);
    }
  };
}
