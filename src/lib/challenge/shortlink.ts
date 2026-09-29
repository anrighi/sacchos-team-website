import { encodeLineup, decodeLineup } from "#/lib/challenge/link";
import { normalizeName, type Lineup } from "#/lib/challenge/lineup";
import type { ChallengeStore } from "#/lib/challenge/store";

export const LINEUP_KEY = "s:";
export const NAME_KEY = "n:";
export const SHORT_ID_LENGTH = 8;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function nameSlug(name: string): string {
  return normalizeName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

export function opaqueId(random: () => number = Math.random): string {
  let id = "";
  for (let i = 0; i < SHORT_ID_LENGTH; i += 1) {
    id += ALPHABET[Math.floor(random() * ALPHABET.length)];
  }
  return id;
}

export function shortPath(hostId: string, guestId?: string, seed?: string): string {
  if (!guestId) {
    return `/s/${hostId}`;
  }
  if (!seed) {
    return `/s/${hostId}/${guestId}`;
  }
  return `/s/${hostId}/${guestId}?seed=${encodeURIComponent(seed)}`;
}

export async function mintLineup(
  store: ChallengeStore,
  lineup: Lineup,
  randomId: () => string = opaqueId,
): Promise<string> {
  const encoded = encodeLineup(lineup);
  const slug = nameSlug(lineup.name);
  const nameKey = `${NAME_KEY}${normalizeName(lineup.name).toLowerCase()}`;
  const owned = await store.get(nameKey);
  if (owned) {
    const current = await store.get(`${LINEUP_KEY}${owned}`);
    if (current === encoded) {
      return owned;
    }
    return putOpaque(store, encoded, randomId);
  }

  if (slug) {
    const taken = await store.get(`${LINEUP_KEY}${slug}`);
    if (!taken) {
      await store.put(`${LINEUP_KEY}${slug}`, encoded);
      await store.put(nameKey, slug);
      return slug;
    }
    if (taken === encoded) {
      await store.put(nameKey, slug);
      return slug;
    }
  }

  return putOpaque(store, encoded, randomId);
}

export async function resolveLineup(
  store: ChallengeStore,
  id: string,
): Promise<Lineup | null> {
  const encoded = await store.get(`${LINEUP_KEY}${id}`);
  return decodeLineup(encoded);
}

async function putOpaque(
  store: ChallengeStore,
  encoded: string,
  randomId: () => string,
): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const id = randomId();
    if (!id) {
      continue;
    }
    const existing = await store.get(`${LINEUP_KEY}${id}`);
    if (existing) {
      if (existing === encoded) {
        return id;
      }
      continue;
    }
    await store.put(`${LINEUP_KEY}${id}`, encoded);
    return id;
  }
  throw new Error("shortlink id collision");
}
