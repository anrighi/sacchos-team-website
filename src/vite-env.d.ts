/// <reference types="vite/client" />

declare module "cloudflare:workers" {
  export const env: {
    MATCHES?: {
      get(key: string): Promise<string | null>;
      put(key: string, value: string): Promise<void>;
      delete(key: string): Promise<void>;
      list(opts?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
        keys: Array<{ name: string }>;
        list_complete: boolean;
        cursor?: string;
      }>;
    };
    ADMIN_SECRET?: string;
  };
}
