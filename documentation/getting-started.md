# Getting Started with Truden

**Truden** lets users hold **Alt** and shake their mouse anywhere in your web app to trigger a screen-snip overlay. The captured region is either:

- Handed directly to your app's AI chat assistant as a raw image attachment (**Mode A**), or
- Sent to a backend endpoint that analyzes it with a vision LLM and returns a text description (**Mode B**).

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

## Quickstart: Mode A (Frontend Only)

Mode A is the fastest path to a working setup.

In your root layout or React component (e.g. `Model.tsx` or `layout.tsx`):

```tsx
import { useEffect, useState } from "react";
import truden from "truden";

export default function App() {
  const [screenshot, setScreenshot] = useState<Blob | null>(null);

  useEffect(() => {
    // Initialize triggers & overlay
    const teardown = truden.init({
      onResult: (blob: Blob) => {
        console.log("Captured image blob:", blob);
        setScreenshot(blob);
        // Attach blob directly to your AI chat interface!
      },
      onError: (err) => console.error("Capture failed:", err),
    });

    // Clean up on unmount
    return teardown;
  }, []);

  return (
    <div>
      <h1>My Application</h1>
      <p>Hold Alt and shake your mouse to capture any screen region!</p>
      {screenshot && (
        <img
          src={URL.createObjectURL(screenshot)}
          alt="Captured screenshot"
          style={{ maxWidth: 400, marginTop: 16, borderRadius: 8, display: "block" }}
        />
      )}
    </div>
  );
}
```

---

## Quickstart: Mode B (Vision LLM Backend Route)

Mode B sends the captured image to your backend route where your preferred AI SDK (Vercel AI SDK, OpenAI, Anthropic, OpenRouter, Google Gemini, Ollama, etc.) inspects the screen and returns a text description.

### 1. Server Route Handler (`app/api/truden/route.ts` or `/api/truden.ts`)

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

### 2. Client Setup

```tsx
import { useEffect } from "react";
import truden from "truden";

export default function App() {
  useEffect(() => {
    return truden.init({
      endpoint: "/api/truden",
      onResult: (description: string) => {
        console.log("AI Vision Analysis:", description);
      },
    });
  }, []);

  return <div>App Content</div>;
}
```

---

## Next Steps

- [Framework &amp; Platform Guides](./frameworks.md) — Recipes for React, Next.js, Svelte, Vue/Nuxt, Angular, TanStack Start, SolidJS, and Vanilla JS.
- [Triggers Guide](./triggers.md) — Configure Alt+Shake, Keyboard Shortcuts, Floating Buttons, Custom Events, and Touch Gestures.
- [Mode A: Frontend AI Assistants](./mode-a.md) — Feed raw image attachments into multimodal chat copilots.
- [Mode B: Server Vision Adapters](./mode-b.md) — Connect with any LLM SDK or local model.
- [Full API Reference](./api-reference.md) — Options and TypeScript types reference.
- [Known Limitations](./limitations.md) — Browser security, CORS, and iframe handling.
