// Attaches a custom DOM event listener on window that triggers the overlay
export function attachCustomEventTrigger(
  onTrigger: () => void,
  config?: boolean | string
): () => void {
  if (config === false) {
    return () => {};
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  const eventName = typeof config === "string" ? config : "truden:open";

  function handleCustomEvent(): void {
    onTrigger();
  }

  window.addEventListener(eventName, handleCustomEvent);

  return () => {
    window.removeEventListener(eventName, handleCustomEvent);
  };
}
