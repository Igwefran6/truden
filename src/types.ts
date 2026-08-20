export interface CaptureRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  isFullWindow: boolean;
}

export interface TrudenInitConfig {
  onOpen?: () => void;
  onCancel?: () => void;
  onResult?: (result: Blob) => void;
  onError?: (error: unknown) => void;
  [key: string]: unknown;
}
