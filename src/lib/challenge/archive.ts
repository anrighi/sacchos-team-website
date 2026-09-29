import { rowsFromShots, shotsFrom, type EfficiencyRow } from "#/lib/challenge/efficiency";
import { lineupLabel, lineupSlugs, type Lineup } from "#/lib/challenge/lineup";
import {
  SIM_VERSION,
  type MatchSim,
  type Side,
  type SimEvent,
} from "#/lib/challenge/sim";
import type { ChallengeStore } from "#/lib/challenge/store";

export const MATCH_KEY = "m:";
export const MATCH_INDEX_KEY = "m:index";
export const MATCH_INDEX_LIMIT = 100;

export type MatchSide = {
  name: string;
  slugs: string[];
};

export type MatchRecord = {
  id: string;
  timestamp: string;
  simVersion: number;
  seed: string;
  displayName: string;
  winner: Side;
  mete: { host: number; guest: number };
  mvp: string | null;
  host: MatchSide;
  guest: MatchSide;
  boxScore: EfficiencyRow[];
  log: SimEvent[];
  recapUrl: string;
};

export type MatchSummary = Omit<MatchRecord, "boxScore" | "log">;

export function mvpOf(events: readonly SimEvent[]): string | null {
  const scores = new Map<string, number>();
  for (const event of events) {
    if (!event.actor) {
      continue;
    }
    if (event.kind === "meta" || event.kind === "meta-tecnica") {
      scores.set(event.actor, (scores.get(event.actor) ?? 0) + 3);
      continue;
    }
    if (event.kind === "scalpo-pieno") {
      scores.set(event.actor, (scores.get(event.actor) ?? 0) + 1);
    }
  }

  let best: string | null = null;
  let bestScore = 0;
  for (const [slug, score] of scores) {
    if (score > bestScore) {
      best = slug;
      bestScore = score;
    }
  }
  return best;
}

export function matchRecordFrom(input: {
  match: MatchSim;
  host: Lineup;
  guest: Lineup;
  recapUrl: string;
  timestamp?: string;
}): MatchRecord {
  return {
    id: input.match.seed,
    timestamp: input.timestamp ?? new Date().toISOString(),
    simVersion: SIM_VERSION,
    seed: input.match.seed,
    displayName: `${lineupLabel(input.host)} ${input.match.score.host}–${input.match.score.guest} ${lineupLabel(input.guest)}`,
    winner: input.match.winner,
    mete: { ...input.match.score },
    mvp: mvpOf(input.match.events),
    host: { name: lineupLabel(input.host), slugs: lineupSlugs(input.host) },
    guest: { name: lineupLabel(input.guest), slugs: lineupSlugs(input.guest) },
    boxScore: rowsFromShots(shotsFrom(input.match.events)),
    log: [...input.match.events],
    recapUrl: input.recapUrl,
  };
}

export function summarizeMatch(record: MatchRecord): MatchSummary {
  return {
    id: record.id,
    timestamp: record.timestamp,
    simVersion: record.simVersion,
    seed: record.seed,
    displayName: record.displayName,
    winner: record.winner,
    mete: record.mete,
    mvp: record.mvp,
    host: record.host,
    guest: record.guest,
    recapUrl: record.recapUrl,
  };
}

export async function appendMatch(
  store: ChallengeStore,
  record: MatchRecord,
): Promise<{ ok: true; duplicate: boolean }> {
  const key = `${MATCH_KEY}${record.seed}`;
  const existing = await store.get(key);
  if (existing) {
    return { ok: true, duplicate: true };
  }
  await store.put(key, JSON.stringify(record));
  const index = await listMatchSummaries(store);
  const next = [summarizeMatch(record), ...index.filter((item) => item.seed !== record.seed)].slice(
    0,
    MATCH_INDEX_LIMIT,
  );
  await store.put(MATCH_INDEX_KEY, JSON.stringify(next));
  return { ok: true, duplicate: false };
}

export async function listMatchSummaries(store: ChallengeStore): Promise<MatchSummary[]> {
  const raw = await store.get(MATCH_INDEX_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter(isMatchSummary);
  } catch {
    return [];
  }
}

function isMatchSummary(value: unknown): value is MatchSummary {
  if (!value || typeof value !== "object") {
    return false;
  }
  const row = value as MatchSummary;
  return (
    typeof row.id === "string" &&
    typeof row.seed === "string" &&
    typeof row.displayName === "string" &&
    typeof row.timestamp === "string" &&
    (row.winner === "host" || row.winner === "guest")
  );
}
