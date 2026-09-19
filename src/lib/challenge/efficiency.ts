import type { SimEvent } from "#/lib/challenge/sim";

export const EFFICIENCY_STORAGE_KEY = "sacchos.efficiency.v1";

export type ShotResult = "meta" | "impedita";

export type ShotLog = {
  t: number;
  shooter: string;
  keeper: string;
  result: ShotResult;
};

export type EfficiencyRow = {
  slug: string;
  tentativi: number;
  metas: number;
  impedite: number;
  shotsFaced: number;
  efficienza: number | null;
  parate: number | null;
};

export type EfficiencyDb = {
  version: 1;
  matches: Record<string, { shots: ShotLog[] }>;
};

export type EfficiencyStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

export function shotsFrom(events: readonly SimEvent[]): ShotLog[] {
  const shots: ShotLog[] = [];
  for (const event of events) {
    if (event.kind === "meta" && event.actor && event.target) {
      shots.push({
        t: event.t,
        shooter: event.actor,
        keeper: event.target,
        result: "meta",
      });
      continue;
    }
    if (event.kind === "parata" && event.actor && event.target) {
      shots.push({
        t: event.t,
        shooter: event.target,
        keeper: event.actor,
        result: "impedita",
      });
    }
  }
  return shots;
}

export function rowsFromShots(shots: readonly ShotLog[]): EfficiencyRow[] {
  const bySlug = new Map<string, EfficiencyRow>();

  const rowOf = (slug: string): EfficiencyRow => {
    const existing = bySlug.get(slug);
    if (existing) {
      return existing;
    }
    const created: EfficiencyRow = {
      slug,
      tentativi: 0,
      metas: 0,
      impedite: 0,
      shotsFaced: 0,
      efficienza: null,
      parate: null,
    };
    bySlug.set(slug, created);
    return created;
  };

  for (const shot of shots) {
    const shooter = rowOf(shot.shooter);
    const keeper = rowOf(shot.keeper);
    shooter.tentativi += 1;
    keeper.shotsFaced += 1;
    if (shot.result === "meta") {
      shooter.metas += 1;
      continue;
    }
    keeper.impedite += 1;
  }

  const rows = [...bySlug.values()];
  for (const row of rows) {
    row.efficienza = ratio(row.metas, row.tentativi);
    row.parate = ratio(row.impedite, row.shotsFaced);
  }
  return rows;
}

export function careerOf(db: EfficiencyDb, slug: string): EfficiencyRow {
  const shots: ShotLog[] = [];
  for (const match of Object.values(db.matches)) {
    for (const shot of match.shots) {
      if (shot.shooter === slug || shot.keeper === slug) {
        shots.push(shot);
      }
    }
  }
  return (
    rowsFromShots(shots).find((row) => row.slug === slug) ?? {
      slug,
      tentativi: 0,
      metas: 0,
      impedite: 0,
      shotsFaced: 0,
      efficienza: null,
      parate: null,
    }
  );
}

export function emptyDb(): EfficiencyDb {
  return { version: 1, matches: {} };
}

export function parseDb(raw: string | null): EfficiencyDb {
  if (!raw) {
    return emptyDb();
  }
  try {
    const parsed = JSON.parse(raw) as Partial<EfficiencyDb>;
    if (parsed.version !== 1 || !parsed.matches || typeof parsed.matches !== "object") {
      return emptyDb();
    }
    return { version: 1, matches: parsed.matches };
  } catch {
    return emptyDb();
  }
}

export function recordMatch(db: EfficiencyDb, seed: string, shots: readonly ShotLog[]): EfficiencyDb {
  if (!seed || db.matches[seed]) {
    return db;
  }
  return {
    version: 1,
    matches: {
      ...db.matches,
      [seed]: { shots: [...shots] },
    },
  };
}

export function loadDb(storage: EfficiencyStorage): EfficiencyDb {
  return parseDb(storage.getItem(EFFICIENCY_STORAGE_KEY));
}

export function saveDb(storage: EfficiencyStorage, db: EfficiencyDb): void {
  storage.setItem(EFFICIENCY_STORAGE_KEY, JSON.stringify(db));
}

export function recordMatchIn(
  storage: EfficiencyStorage,
  seed: string,
  shots: readonly ShotLog[],
): EfficiencyDb {
  const next = recordMatch(loadDb(storage), seed, shots);
  saveDb(storage, next);
  return next;
}

export function formatPct(value: number | null): string {
  if (value === null) {
    return "—";
  }
  return `${Math.round(value * 100)}%`;
}

export function formatSplit(made: number, taken: number): string {
  return `${made}/${taken}`;
}

function ratio(made: number, taken: number): number | null {
  if (taken <= 0) {
    return null;
  }
  return made / taken;
}
