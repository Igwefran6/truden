# Trigger Mechanisms

Truden supports **5 trigger mechanisms** out of the box, in addition to direct programmatic control. All triggers funnel through the same shared capture overlay and can be individually configured or disabled.

---

## 1. Alt + Mouse Shake (Signature Gesture)

Hold the **Alt** key and shake your mouse horizontally.

- **How it works:** Truden tracks mouse direction reversals (left-to-right or right-to-left) while `Alt` is held. When the reversal threshold is reached within the time window, the overlay opens automatically.
- **Enabled by default.**

### Configuration

```ts
truden.init({
  shake: {
    reversals: 4,     // Number of horizontal direction reversals required (default: 4)
    window: 800,      // Time window in milliseconds (default: 800)
    minDistance: 20,  // Minimum movement distance in px before counting a reversal (default: 20)
  },
  // or disable completely:
  // shake: false,
});
```

---

## 2. Keyboard Shortcut

Press a configurable key combination anywhere in your application.

- **Default:** `Ctrl+Shift+S` (also accepts `Cmd+Shift+S` on macOS).
- **Prevents default browser actions** when triggered to avoid typing into active form inputs.

### Configuration

```ts
truden.init({
  shortcut: "Ctrl+Shift+S", // Custom combo, e.g. "Alt+Shift+C", "Mod+K", etc.
  // or disable completely:
  // shortcut: false,
});
```

---

## 3. Floating Trigger Button (Opt-in UI)

Injects a stylish, customizable floating trigger button into the corner of your page.

- **Disabled by default.**

### Configuration

```ts
truden.init({
  floatingButton: {
    position: "bottom-right", // "bottom-right" | "bottom-left" | "top-right" | "top-left"
    label: "Snip Screen",     // Optional text label (defaults to icon only)
    className: "my-custom-btn", // Optional custom CSS class
  },
});
```

---

## 4. Custom DOM Event

Dispatch a namespaced browser event (`truden:open`) from anywhere in your codebase.

- **Why it's useful:** Wire Truden into an existing navbar help button, support widget, or right-click context menu without importing `truden` directly into those components.

### Configuration & Dispatching

```ts
// In your initialization
truden.init({
  customEvent: "truden:open", // Custom event name (defaults to "truden:open")
  // or customEvent: false to disable
});

// Anywhere in your app:
window.dispatchEvent(new CustomEvent("truden:open"));
```

---

## 5. Touch Long-Press (Mobile / Tablet)

Press and hold anywhere on a touchscreen device.

- **How it works:** A single-finger hold for 600ms opens the overlay.
- **Scroll cancellation:** If the user drags/scrolls (`> 10px`) or adds a second finger, the timer cancels automatically.

### Configuration

```ts
truden.init({
  touch: {
    duration: 600,    // Hold duration in milliseconds (default: 600)
    maxDistance: 10,  // Movement distance before canceling (default: 10)
  },
  // or disable completely:
  // touch: false,
});
```

---

## 6. Programmatic Trigger: `truden.open()`

You can also trigger the overlay directly from your own buttons, menus, or AI assistant logic:

```ts
import truden from "truden";

// Call from any click handler or assistant response
truden.open();
```

---

## Disabling Triggers

Any default trigger can be completely disabled by passing `false`:

```ts
truden.init({
  // Disable Alt+Mouse Shake:
  shake: false,

  // Disable global keyboard shortcut:
  shortcut: false,

  // Disable touchscreen long-press:
  touch: false,

  // Disable window custom DOM event listener:
  customEvent: false,

  // Floating button is disabled by default (pass false or omit)
  floatingButton: false,

  onResult: (blob) => { ... },
});
```

### Programmatic-Only Mode (No Automatic Triggers)

If you only want Truden to open when your own custom button or chat assistant calls `truden.open()`, disable all automatic triggers at once:

```ts
truden.init({
  shake: false,
  shortcut: false,
  touch: false,
  customEvent: false,
  onResult: (blob) => { ... },
});

// Now the overlay only opens when you call:
// truden.open();
```
