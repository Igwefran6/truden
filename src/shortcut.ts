interface ParsedShortcut {
  ctrlOrMeta: boolean;
  alt: boolean;
  shift: boolean;
  key: string;
}

// Parses a shortcut string like "Ctrl+Shift+S" or "Alt+S"
function parseShortcut(combo: string): ParsedShortcut {
  const parts = combo.split("+").map((p) => p.trim().toLowerCase());
  let ctrlOrMeta = false;
  let alt = false;
  let shift = false;
  let key = "";

  for (const part of parts) {
    if (
      part === "ctrl" ||
      part === "control" ||
      part === "cmd" ||
      part === "command" ||
      part === "meta" ||
      part === "mod"
    ) {
      ctrlOrMeta = true;
    } else if (part === "alt" || part === "option") {
      alt = true;
    } else if (part === "shift") {
      shift = true;
    } else {
      key = part;
    }
  }

  return { ctrlOrMeta, alt, shift, key };
}

// Checks if the KeyboardEvent matches the parsed shortcut definition
function matchesShortcut(e: KeyboardEvent, parsed: ParsedShortcut): boolean {
  const hasCtrlOrMeta = e.ctrlKey || e.metaKey;
  if (parsed.ctrlOrMeta !== hasCtrlOrMeta) return false;
  if (parsed.alt !== e.altKey) return false;
  if (parsed.shift !== e.shiftKey) return false;

  return e.key.toLowerCase() === parsed.key;
}

// Attaches a global keyboard shortcut listener that invokes onTrigger when pressed
export function attachShortcutTrigger(
  onTrigger: () => void,
  config?: boolean | string
): () => void {
  if (config === false) {
    return () => {};
  }

  if (typeof window === "undefined") {
    return () => {};
  }

  const shortcutString = typeof config === "string" ? config : "Ctrl+Shift+S";
  const parsed = parseShortcut(shortcutString);

  function handleKeyDown(e: KeyboardEvent): void {
    if (matchesShortcut(e, parsed)) {
      e.preventDefault();
      e.stopPropagation();
      onTrigger();
    }
  }

  window.addEventListener("keydown", handleKeyDown, true);

  return () => {
    window.removeEventListener("keydown", handleKeyDown, true);
  };
}
