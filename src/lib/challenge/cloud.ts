import { createServerFn } from "@tanstack/react-start";
import { appendMatch, type MatchRecord } from "#/lib/challenge/archive";
import { decodeLineup } from "#/lib/challenge/link";
import { mintLineup, resolveLineup } from "#/lib/challenge/shortlink";
import type { ChallengeStore } from "#/lib/challenge/store";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
};

async function kvStore(): Promise<ChallengeStore | null> {
  try {
    const { env } = await import("cloudflare:workers");
    const ns = (env as { MATCHES?: KvNamespace }).MATCHES;
    if (!ns?.get || !ns.put) {
      return null;
    }
    return {
      get: (key) => ns.get(key),
      put: (key, value) => ns.put(key, value),
    };
  } catch {
    return null;
  }
}

export const mintLineupFn = createServerFn({ method: "POST" })
  .validator((data: { encoded: string }) => data)
  .handler(async ({ data }) => {
    const store = await kvStore();
    if (!store) {
      return { id: null as string | null };
    }
    const lineup = decodeLineup(data.encoded);
    if (!lineup) {
      return { id: null };
    }
    const id = await mintLineup(store, lineup);
    return { id };
  });

export const resolveLineupFn = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const store = await kvStore();
    if (!store) {
      return { lineup: null };
    }
    return { lineup: await resolveLineup(store, data.id) };
  });

export const saveMatchFn = createServerFn({ method: "POST" })
  .validator((data: MatchRecord) => data)
  .handler(async ({ data }) => {
    const store = await kvStore();
    if (!store) {
      return { ok: false as const, reason: "kv" as const };
    }
    const result = await appendMatch(store, data);
    return { ok: true as const, duplicate: result.duplicate };
  });
