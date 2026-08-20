import type { TrudenHandlerConfig, VisionAnalyzeContext } from "./types.js";

const DEFAULT_PROMPT =
  "Describe what is visible in this screenshot in detail, focusing on any error messages, user interface state, visible text, broken layouts, or actionable problems.";

// Converts ArrayBuffer to Base64 across all JavaScript runtimes (Node, Edge, Workers, Bun)
function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(arrayBuffer).toString("base64");
  }
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Parses raw base64 or data URLs into structured components
function parseImagePayload(raw: string): {
  dataUrl: string;
  base64Data: string;
  mediaType: string;
} {
  const match = raw.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    return {
      dataUrl: raw,
      mediaType: match[1],
      base64Data: match[2],
    };
  }
  return {
    dataUrl: `data:image/png;base64,${raw}`,
    mediaType: "image/png",
    base64Data: raw,
  };
}

// Creates a pure adapter route handler for Mode B vision processing
export function handler(config: TrudenHandlerConfig) {
  if (!config || typeof config.analyze !== "function") {
    throw new Error(
      "truden.handler() requires an `analyze` function to process captured images with your preferred AI SDK."
    );
  }

  return async (req: Request): Promise<Response> => {
    if (req.method !== "POST") {
      return Response.json(
        { error: "Method not allowed. Use POST.", code: "METHOD_NOT_ALLOWED" },
        { status: 405 }
      );
    }

    let rawImage = "";
    let customPrompt = config.defaultPrompt || DEFAULT_PROMPT;

    try {
      const contentType = req.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const body = await req.json();
        rawImage = body.image || "";
        if (body.prompt) {
          customPrompt = body.prompt;
        }
      } else if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const imageEntry = formData.get("image");
        const promptEntry = formData.get("prompt");

        if (promptEntry && typeof promptEntry === "string") {
          customPrompt = promptEntry;
        }

        if (imageEntry instanceof Blob) {
          const buffer = await imageEntry.arrayBuffer();
          const base64 = arrayBufferToBase64(buffer);
          rawImage = `data:${imageEntry.type || "image/png"};base64,${base64}`;
        } else if (typeof imageEntry === "string") {
          rawImage = imageEntry;
        }
      } else {
        rawImage = await req.text();
      }
    } catch {
      return Response.json(
        { error: "Failed to parse request payload.", code: "INVALID_REQUEST" },
        { status: 400 }
      );
    }

    if (!rawImage) {
      return Response.json(
        { error: "No image provided in request body.", code: "MISSING_IMAGE" },
        { status: 400 }
      );
    }

    const { dataUrl, base64Data, mediaType } = parseImagePayload(rawImage);

    try {
      const context: VisionAnalyzeContext = {
        image: dataUrl,
        base64Data,
        mediaType,
        prompt: customPrompt,
        request: req,
      };

      const description = await config.analyze(context);

      return Response.json({
        description:
          typeof description === "string"
            ? description
            : JSON.stringify(description),
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return Response.json(
        { error: message, code: "ANALYZE_ERROR" },
        { status: 500 }
      );
    }
  };
}
