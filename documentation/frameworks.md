# Framework & Platform Guide

Truden is **100% framework-agnostic**. The client runs on standard Web APIs (Canvas, DOM events), and the server handler uses standard Web `Request`/`Response` objects.

Here is how to integrate Truden across all major web frameworks:

---

## Table of Contents
- [React](#1-react)
- [Next.js (App Router)](#2-nextjs-app-router)
- [Svelte / SvelteKit](#3-svelte--sveltekit)
- [Vue 3 / Nuxt 3](#4-vue-3--nuxt-3)
- [Angular](#5-angular)
- [TanStack Start](#6-tanstack-start)
- [SolidJS / SolidStart](#7-solidjs--solidstart)
- [Vanilla JavaScript](#8-vanilla-javascript--html)

---

## 1. React

In any React component or root provider:

```tsx
import { useEffect, useState } from "react";
import truden from "truden";

export default function App() {
  const [screenshot, setScreenshot] = useState<Blob | null>(null);

  useEffect(() => {
    // Returns teardown function to clean up on unmount
    return truden.init({
      onResult: (blob: Blob) => {
        setScreenshot(blob);
      },
    });
  }, []);

  return (
    <div>
      <h1>React App</h1>
      <button onClick={() => truden.open()}>Open Snipper</button>
      {screenshot && <img src={URL.createObjectURL(screenshot)} alt="Capture" />}
    </div>
  );
}
```

---

## 2. Next.js (App Router)

### Client Root Setup (`app/layout.tsx` or `app/providers.tsx`)
```tsx
"use client";

import { useEffect } from "react";
import truden from "truden";

export function TrudenProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    return truden.init({
      endpoint: "/api/truden", // Mode B
      onResult: (description: string) => {
        console.log("Vision analysis:", description);
      },
    });
  }, []);

  return <>{children}</>;
}
```

### Server Route Handler (`app/api/truden/route.ts`)
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

---

## 3. Svelte / SvelteKit

### Client Setup (`src/routes/+layout.svelte`)
```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import truden from 'truden';

  let previewUrl = $state<string | null>(null);

  onMount(() => {
    return truden.init({
      onResult: (blob: Blob) => {
        previewUrl = URL.createObjectURL(blob);
      }
    });
  });
</script>

<h1>Svelte Application</h1>
<button onclick={() => truden.open()}>Open Snipper</button>

{#if previewUrl}
  <img src={previewUrl} alt="Captured preview" />
{/if}
```

### SvelteKit Server Route (`src/routes/api/truden/+server.ts`)
```ts
import { handler } from 'truden/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const POST = handler({
  analyze: async ({ image, prompt }) => {
    const { text } = await generateText({
      model: openai('gpt-4o'),
      messages: [
        { role: 'user', content: [{ type: 'image', image }, { type: 'text', text: prompt }] },
      ],
    });
    return text;
  },
});
```

---

## 4. Vue 3 / Nuxt 3

### Vue 3 Client Setup (`App.vue`)
```vue
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import truden from 'truden';

const previewUrl = ref<string | null>(null);
let teardown: (() => void) | null = null;

onMounted(() => {
  teardown = truden.init({
    onResult: (blob: Blob) => {
      previewUrl.value = URL.createObjectURL(blob);
    },
  });
});

onUnmounted(() => {
  teardown?.();
});
</script>

<template>
  <h1>Vue App</h1>
  <button @click="truden.open()">Open Snipper</button>
  <img v-if="previewUrl" :src="previewUrl" alt="Screenshot" />
</template>
```

### Nuxt 3 Server Route (`server/api/truden.post.ts`)
```ts
import { handler } from 'truden/server';
import OpenAI from 'openai';

const client = new OpenAI();
const trudenHandler = handler({
  analyze: async ({ image, prompt }) => {
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: [{ type: "image_url", image_url: { url: image } }, { type: "text", text: prompt }] }]
    });
    return res.choices[0]?.message.content || "";
  }
});

export default defineEventHandler(async (event) => {
  return trudenHandler(toWebRequest(event));
});
```

---

## 5. Angular

In an Angular Standalone Component:

```ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import truden from 'truden';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Angular App</h1>
    <button (click)="openSnipper()">Snip Screen</button>
    <img *ngIf="previewUrl" [src]="previewUrl" alt="Capture Preview" />
  `
})
export class AppComponent implements OnInit, OnDestroy {
  previewUrl: string | null = null;
  private teardown?: () => void;

  ngOnInit() {
    this.teardown = truden.init({
      onResult: (blob: Blob) => {
        this.previewUrl = URL.createObjectURL(blob);
      }
    });
  }

  openSnipper() {
    truden.open();
  }

  ngOnDestroy() {
    this.teardown?.();
  }
}
```

---

## 6. TanStack Start

### Client Root (`app/routes/__root.tsx`)
```tsx
import { useEffect } from 'react';
import truden from 'truden';

export function RootComponent() {
  useEffect(() => {
    return truden.init({
      endpoint: '/api/truden',
      onResult: (description: string) => {
        console.log('AI Analysis:', description);
      },
    });
  }, []);

  return <div>TanStack Start App</div>;
}
```

### Server API File Route (`app/routes/api/truden.ts`)
```ts
import { createAPIFileRoute } from '@tanstack/start/api';
import { handler } from 'truden/server';

const trudenHandler = handler({
  analyze: async ({ image, prompt }) => {
    return "Vision description from AI";
  },
});

export const Route = createAPIFileRoute('/api/truden')({
  POST: ({ request }) => trudenHandler(request),
});
```

---

## 7. SolidJS / SolidStart

### SolidJS Client (`App.tsx`)
```tsx
import { onMount, onCleanup, createSignal } from "solid-js";
import truden from "truden";

export default function App() {
  const [preview, setPreview] = createSignal<string | null>(null);

  onMount(() => {
    const teardown = truden.init({
      onResult: (blob: Blob) => {
        setPreview(URL.createObjectURL(blob));
      }
    });

    onCleanup(() => teardown());
  });

  return (
    <div>
      <h1>SolidJS App</h1>
      <button onClick={() => truden.open()}>Open Snipper</button>
      {preview() && <img src={preview()!} alt="Capture" />}
    </div>
  );
}
```

---

## 8. Vanilla JavaScript / HTML

In plain HTML / JavaScript with modern ESM modules:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Vanilla Truden</title>
  </head>
  <body>
    <h1>Vanilla JS App</h1>
    <p>Hold <strong>Alt</strong> and shake your mouse to trigger the snipper!</p>
    <button id="snip-btn">Open Snipper</button>
    <img id="preview" style="max-width: 400px; display: none; margin-top: 20px;" />

    <script type="module">
      import truden from "truden";

      // Initialize Truden
      truden.init({
        onResult: (blob) => {
          const img = document.getElementById("preview");
          img.src = URL.createObjectURL(blob);
          img.style.display = "block";
        },
      });

      // Wire custom button
      document.getElementById("snip-btn").addEventListener("click", () => {
        truden.open();
      });
    </script>
  </body>
</html>
```
