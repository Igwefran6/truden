export interface TrudenInitConfig {
  [key: string]: unknown;
}

export function init(config?: TrudenInitConfig): () => void {
  return () => { };
}

export function open(): void {
}
