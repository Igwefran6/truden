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

export interface TrudenInitConfig {
  shake?: boolean | ShakeConfig;
  shortcut?: boolean | string;
  customEvent?: boolean | string;
  onOpen?: () => void;
  onCancel?: () => void;
  onResult?: (result: Blob) => void;
  onError?: (error: unknown) => void;
  [key: string]: unknown;
}
