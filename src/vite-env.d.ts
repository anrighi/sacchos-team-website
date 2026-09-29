/// <reference types="vite/client" />

declare module "cloudflare:workers" {
  export const env: {
    MATCHES?: {
      get(key: string): Promise<string | null>;
      put(key: string, value: string): Promise<void>;
    };
  };
}
