import { createServerFn } from "@tanstack/react-start";
import { appendMatch, MATCH_KEY, MATCH_INDEX_KEY, type MatchRecord } from "#/lib/challenge/archive";
import { decodeLineup } from "#/lib/challenge/link";
import { mintLineup, resolveLineup } from "#/lib/challenge/shortlink";
import type { ChallengeStore } from "#/lib/challenge/store";

type KvNamespace = {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
  list(opts?: { prefix?: string; cursor?: string; limit?: number }): Promise<{
    keys: Array<{ name: string }>;
    list_complete: boolean;
    cursor?: string;
  }>;
};

async function kvNamespace(): Promise<KvNamespace | null> {
  try {
    const { env } = await import("cloudflare:workers");
    const ns = (env as { MATCHES?: KvNamespace }).MATCHES;
    if (!ns?.get || !ns.put) return null;
    return ns;
  } catch {
    return null;
  }
}

async function kvStore(): Promise<ChallengeStore | null> {
  const ns = await kvNamespace();
  if (!ns) return null;
  return { get: (k) => ns.get(k), put: (k, v) => ns.put(k, v) };
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

export const resetArchiveFn = createServerFn({ method: "POST" })
  .validator((data: { secret: string }) => data)
  .handler(async ({ data }) => {
    const { env } = await import("cloudflare:workers").catch(() => ({ env: {} }));
    const adminSecret = (env as { ADMIN_SECRET?: string }).ADMIN_SECRET;
    if (!adminSecret || data.secret !== adminSecret) {
      return { ok: false as const, reason: "unauthorized" as const };
    }
    const ns = await kvNamespace();
    if (!ns) {
      return { ok: false as const, reason: "kv" as const };
    }
    const deleted: string[] = [];
    let cursor: string | undefined;
    do {
      const page = await ns.list({ prefix: MATCH_KEY, ...(cursor ? { cursor } : {}) });
      for (const { name } of page.keys) {
        await ns.delete(name);
        deleted.push(name);
      }
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor);
    await ns.delete(MATCH_INDEX_KEY);
    deleted.push(MATCH_INDEX_KEY);
    return { ok: true as const, deleted: deleted.length };
  });
