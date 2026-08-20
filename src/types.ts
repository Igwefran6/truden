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

export interface TrudenInitConfig {
  shake?: boolean | ShakeConfig;
  shortcut?: boolean | string;
  customEvent?: boolean | string;
  floatingButton?: boolean | FloatingButtonConfig;
  onOpen?: () => void;
  onCancel?: () => void;
  onResult?: (result: Blob) => void;
  onError?: (error: unknown) => void;
  [key: string]: unknown;
}
