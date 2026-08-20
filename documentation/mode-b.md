# Mode B: Server-Side Vision Adapter Mode

**Mode B** automatically sends captured screenshots to a backend route handler that analyzes the image with a Vision LLM and returns a textual description of what the user is seeing.

---

## How It Works

1. User selects a region on the screen.
2. Truden captures the image and POSTs it as `multipart/form-data` to your configured `endpoint`.
3. Your server handler runs your custom `analyze` function using **any AI SDK**.
4. The server responds with `{ description: "..." }`.
5. Truden passes the description string to your client's `onResult(description)` callback.

```
Client Snip ──► POST /api/truden ──► Server Adapter (AI SDK) ──► JSON { description } ──► onResult(text)
```

---

## Server Route Setup (`truden/server`)

Import `handler` from `"truden/server"`. It returns a standard Web API `(req: Request) => Promise<Response>` handler.

### 1. With the Vercel AI SDK (`ai`) — *Recommended for multi-provider support*

```ts
// app/api/truden/route.ts (Next.js App Router)
import { handler } from "truden/server";
import { openai } from "@ai-sdk/openai"; // or @ai-sdk/anthropic, @ai-sdk/google
import { generateText } from "ai";

export const POST = handler({
  analyze: async ({ image, prompt }) => {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      messages: [
        {
          role: "user",
          content: [
            { type: "image", image }, // `image` is a base64 Data URL
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return text;
  },
});
```

### 2. With the Official OpenAI or OpenRouter SDK

```ts
// app/api/truden/route.ts
import { handler } from "truden/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // or default OpenAI
});

export const POST = handler({
  analyze: async ({ image, prompt }) => {
    const res = await client.chat.completions.create({
      model: "google/gemini-2.0-flash-001", // Or any model on OpenRouter / OpenAI
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return res.choices[0]?.message.content || "";
  },
});
```

### 3. With the Official Anthropic SDK

```ts
// app/api/truden/route.ts
import { handler } from "truden/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

export const POST = handler({
  analyze: async ({ base64Data, mediaType, prompt }) => {
    const res = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/png",
                data: base64Data,
              },
            },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return (res.content[0] as Anthropic.TextBlock).text;
  },
});
```

### 4. With Local Models (Ollama)

```ts
// app/api/truden/route.ts
import { handler } from "truden/server";
import OpenAI from "openai";

const ollama = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama",
});

export const POST = handler({
  analyze: async ({ image, prompt }) => {
    const res = await ollama.chat.completions.create({
      model: "llava", // or llama3.2-vision
      messages: [
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: image } },
            { type: "text", text: prompt },
          ],
        },
      ],
    });
    return res.choices[0]?.message.content || "";
  },
});
```

---

## Client Setup for Mode B

Configure the `endpoint` option in `truden.init()`:

```tsx
import { useEffect } from "react";
import truden from "truden";

export function App() {
  useEffect(() => {
    return truden.init({
      endpoint: "/api/truden", // URL to your route handler
      onResult: (description: string) => {
        console.log("Vision model output:", description);
      },
      onError: (err) => {
        console.error("Vision request failed:", err);
      },
    });
  }, []);

  return <div>App Content</div>;
}
```

### Custom Endpoint Headers & Prompts

You can also pass custom authorization headers or prompt overrides:

```ts
truden.init({
  endpoint: {
    url: "/api/truden",
    headers: {
      Authorization: `Bearer ${userSessionToken}`,
    },
    prompt: "Identify UI bugs, misaligned components, and any visible console error messages.",
  },
  onResult: (description: string) => { ... },
});
```
