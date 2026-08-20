# API Reference

Complete reference for functions, configurations, and TypeScript interfaces exported by `truden`.

---

## Client API: `truden.init(config)`

Initializes Truden triggers and overlay listeners on the client. Returns a teardown function.

```ts
import truden from "truden";
// or
import { init } from "truden/client";

const teardown = truden.init(config?: TrudenConfig);
```

### `TrudenConfig` Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `endpoint` | `string \| EndpointConfig` | `undefined` | Mode B backend route. If omitted, Mode A (direct `Blob`) is used. |
| `shake` | `boolean \| ShakeConfig` | `true` | Alt + mouse shake gesture configuration. Set `false` to disable. |
| `shortcut` | `boolean \| string` | `"Ctrl+Shift+S"` | Keyboard shortcut combo (e.g. `"Ctrl+Shift+S"`, `"Alt+S"`). Set `false` to disable. |
| `customEvent` | `boolean \| string` | `"truden:open"` | Namespaced DOM event name on `window`. Set `false` to disable. |
| `floatingButton` | `boolean \| FloatingButtonConfig` | `false` | Opt-in injected floating UI trigger button. |
| `touch` | `boolean \| TouchConfig` | `true` | Touch long-press trigger for mobile/tablet. Set `false` to disable. |
| `onOpen` | `() => void` | `undefined` | Lifecycle hook fired when the capture overlay opens. |
| `onCancel` | `() => void` | `undefined` | Lifecycle hook fired when the overlay is dismissed without capturing. |
| `onResult` | `(result: Blob \| string) => void` | `undefined` | Delivers the captured `Blob` (Mode A) or vision `string` (Mode B). |
| `onError` | `(error: unknown) => void` | `undefined` | Catches capture, network, or server errors. |

---

### Trigger Config Types

#### `ShakeConfig`
```ts
interface ShakeConfig {
  /** Number of horizontal direction reversals required. Default: 4 */
  reversals?: number;
  /** Sliding time window in milliseconds. Default: 800 */
  window?: number;
  /** Minimum movement distance in px before counting a reversal. Default: 20 */
  minDistance?: number;
}
```

#### `TouchConfig`
```ts
interface TouchConfig {
  /** Hold duration in milliseconds before triggering. Default: 600 */
  duration?: number;
  /** Maximum movement in px before canceling long-press (e.g. scrolling). Default: 10 */
  maxDistance?: number;
}
```

#### `FloatingButtonConfig`
```ts
interface FloatingButtonConfig {
  /** Screen corner position. Default: "bottom-right" */
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  /** Optional button text label */
  label?: string;
  /** Custom CSS class name */
  className?: string;
}
```

#### `EndpointConfig`
```ts
interface EndpointConfig {
  /** Route URL (e.g. "/api/truden") */
  url: string;
  /** Custom HTTP request headers (e.g. Authorization) */
  headers?: Record<string, string>;
  /** Custom vision inspection prompt */
  prompt?: string;
}
```

---

## Programmatic API: `truden.open()`

Directly opens the capture overlay on demand.

```ts
import truden from "truden";
// or
import { open } from "truden/client";

truden.open();
```

---

## Server API: `truden.handler(config)`

Creates a standard Web API `(req: Request) => Promise<Response>` route handler for Mode B.

```ts
import { handler } from "truden/server";

export const POST = handler(config: TrudenHandlerConfig);
```

### `TrudenHandlerConfig`
```ts
interface TrudenHandlerConfig {
  /** Custom vision analysis function using any AI SDK */
  analyze: (context: VisionAnalyzeContext) => Promise<string> | string;
  /** Default prompt sent if client does not specify one */
  defaultPrompt?: string;
}
```

### `VisionAnalyzeContext`
```ts
interface VisionAnalyzeContext {
  /** Complete base64 data URL ready for OpenAI/OpenRouter/AI SDK: "data:image/png;base64,..." */
  image: string;
  /** Raw base64 string without data URL prefix (for Anthropic/Gemini) */
  base64Data: string;
  /** Image MIME type: "image/png" */
  mediaType: string;
  /** The inspection prompt */
  prompt: string;
  /** The original incoming Request object */
  request: Request;
}
```
