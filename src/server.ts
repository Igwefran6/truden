export interface TrudenHandlerConfig {
  [key: string]: unknown;
}

export function handler(config?: TrudenHandlerConfig) {
  return async (_req: Request): Promise<Response> => {
    return new Response(JSON.stringify({ status: "not_implemented" }), {
      status: 501,
      headers: { "Content-Type": "application/json" },
    });
  };
}
