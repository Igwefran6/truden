# truden

> Hold **Alt** and shake your mouse anywhere in your web app to capture and snip UI for AI assistants.

[![npm version](https://img.shields.io/npm/v/truden.svg)](https://www.npmjs.com/package/truden)
[![license](https://img.shields.io/npm/l/truden.svg)](https://github.com/Igwefran6/truden/blob/master/LICENSE)

Truden gives your web application an instant screen-snipping overlay. Users select any region on the screen (or press Enter for full viewport), and the capture is either:

1. **Mode A (Frontend Only):** Handed directly to your in-app multimodal AI chat assistant as an image `Blob` with zero backend setup.
2. **Mode B (Vision LLM Backend):** POSTed to a backend route handler where your preferred AI SDK analyzes the image and returns a text description.

---

## Installation

```bash
npm install truden
# or
pnpm add truden
# or
yarn add truden
```

---

## 2-Minute Quickstart

### Mode A: Direct Image Attachment (Frontend Only)

```tsx
import { useEffect, useState } from "react";
import truden from "truden";

export default function App() {
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);

  useEffect(() => {
    // Initializes Alt+shake and triggers
    return truden.init({
      onResult: (blob: Blob) => {
        console.log("Captured image:", blob);
        setImageBlob(blob); // Attach to your AI chat prompt!
      },
    });
  }, []);

  return (
    <div>
      <h1>My Application</h1>
      <p>Hold Alt and shake mouse to snip!</p>
      {imageBlob && (
        <img
          src={URL.createObjectURL(imageBlob)}
          alt="Captured snippet"
          style={{ maxWidth: 400, marginTop: 16, borderRadius: 8, display: "block" }}
        />
      )}
    </div>
  );
}
```

---

### Mode B: Vision LLM Analysis (Server Adapter)

#### 1. Server Route Handler (`app/api/truden/route.ts`)

```ts
import { handler } from "truden/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export const POST = handler({
  analyze: async ({ image, prompt }) => {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return text;
  },
});
```

#### 2. Client Setup

```tsx
import { useEffect } from "react";
import truden from "truden";

export default function App() {
  useEffect(() => {
    return truden.init({
      endpoint: "/api/truden",
      onResult: (description: string) => {
        console.log("Vision analysis:", description);
      },
    });
  }, []);

  return <div>App Content</div>;
}
```

---

## Triggers

| Trigger | Default | How to Activate |
| :-------------------------- | :--------------- | :------------------------------------------------------- |
| **Alt + Shake** | Enabled | Hold`Alt` and shake mouse horizontally |
| **Keyboard Shortcut** | `Ctrl+Shift+S` | Press`Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) |
| **Floating Button** | Disabled | Enable with`floatingButton: true` in `init()` |
| **Custom Event** | `truden:open` | `window.dispatchEvent(new CustomEvent('truden:open'))` |
| **Touch Long-Press** | Enabled (600ms) | Press and hold on touchscreen |
| **Programmatic** | Always available | Call`truden.open()` from any button or hook |

---

## Documentation

Comprehensive guides and API reference are available in the [`/documentation`](https://github.com/Igwefran6/truden/tree/master/documentation) directory:

- 📖 [Getting Started](https://github.com/Igwefran6/truden/blob/master/documentation/getting-started.md)
- 🚀 [Framework & Platform Guides (React, Next.js, Svelte, Vue, Angular, TanStack Start, Solid, Vanilla)](https://github.com/Igwefran6/truden/blob/master/documentation/frameworks.md)
- 🎯 [Trigger Configurations](https://github.com/Igwefran6/truden/blob/master/documentation/triggers.md)
- 🖼️ [Mode A: Frontend AI Assistants](https://github.com/Igwefran6/truden/blob/master/documentation/mode-a.md)
- 🤖 [Mode B: Vision LLM Adapters](https://github.com/Igwefran6/truden/blob/master/documentation/mode-b.md)
- 📚 [Complete API Reference](https://github.com/Igwefran6/truden/blob/master/documentation/api-reference.md)
- ⚠️ [Known Limitations & Security](https://github.com/Igwefran6/truden/blob/master/documentation/limitations.md)

---

## License

[MIT](https://github.com/Igwefran6/truden/blob/master/LICENSE) © [Francis Igwe](https://github.com/Igwefran6)

