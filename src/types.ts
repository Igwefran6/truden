export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullWindow: boolean;
}

export interface ShakeConfig {
  reversals?: number;
  window?: number;
  minDistance?: number;
}

export interface TouchConfig {
  duration?: number;
  maxDistance?: number;
}

export type FloatingButtonPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface FloatingButtonConfig {
  position?: FloatingButtonPosition;
  label?: string;
  className?: string;
}

export interface EndpointConfig {
  url: string;
  headers?: Record<string, string>;
  prompt?: string;
}

export type TrudenEndpoint = string | EndpointConfig;

export interface TrudenInitConfig {
  /** Mode B: backend endpoint URL or configuration. If omitted, Mode A (frontend Blob) is used. */
  endpoint?: TrudenEndpoint;
  shake?: boolean | ShakeConfig;
  shortcut?: boolean | string;
  customEvent?: boolean | string;
  floatingButton?: boolean | FloatingButtonConfig;
  touch?: boolean | TouchConfig;
  onOpen?: () => void;
  onCancel?: () => void;
  onResult?: (result: any) => void;
  onError?: (error: unknown) => void;
  [key: string]: unknown;
}

export interface VisionAnalyzeContext {
  /** Complete data URL (e.g. `data:image/png;base64,...`) */
  image: string;
  /** Raw base64 string without the `data:...;base64,` prefix */
  base64Data: string;
  /** Image MIME type (e.g. `image/png`, `image/jpeg`, `image/webp`) */
  mediaType: string;
  /** Inspection prompt */
  prompt: string;
  /** The incoming Web Request object */
  request: Request;
}

export type VisionAnalyzeFn = (
  context: VisionAnalyzeContext
) => Promise<string> | string;

export interface TrudenHandlerConfig {
  /** Custom vision analysis function using any SDK (OpenAI, Anthropic, OpenRouter, Vercel AI SDK, Ollama, Gemini, etc.) */
  analyze: VisionAnalyzeFn;
  /** Default prompt sent if client does not provide one */
  defaultPrompt?: string;
}
