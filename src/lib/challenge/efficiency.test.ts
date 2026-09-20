import { describe, expect, it } from "vitest";
import {
  careerOf,
  emptyDb,
  formatPct,
  formatSplit,
  parseDb,
  recordMatch,
  recordMatchIn,
  rowsFromShots,
  shotsFrom,
  type EfficiencyStorage,
  type ShotLog,
  EFFICIENCY_STORAGE_KEY,
} from "#/lib/challenge/efficiency";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import { simulateMatch } from "#/lib/challenge/sim";
import type { Player, Sex } from "#/lib/player";

function player(slug: string, sex: Sex, number: number): Player {
  return {
    slug,
    firstName: slug,
    team: "Saccho's Team",
    sex,
    number,
    overall: 75,
    stats: {
      velocita: 75,
      salto: 75,
      intercetto: 75,
      scalpo: 75,
      finalizzazione: 75,
      gk: 75,
    },
  };
}

const roster: Player[] = [
  player("hf1", "F", 1),
  player("hf2", "F", 2),
  player("hm1", "M", 3),
  player("hm2", "M", 4),
  player("hm3", "M", 5),
  player("hm4", "M", 6),
  player("hm5", "M", 7),
  player("gf1", "F", 8),
  player("gf2", "F", 9),
  player("gm1", "M", 10),
  player("gm2", "M", 11),
  player("gm3", "M", 12),
  player("gm4", "M", 13),
  player("gm5", "M", 14),
];

const host: Lineup = {
  ...emptyLineup(),
  name: "Marco",
  slots: ["hf1", "hf2", "hm1", "hm2", "hm3", "hm4", "hm5"],
};

const guest: Lineup = {
  ...emptyLineup(),
  name: "Luca",
  slots: ["gf1", "gf2", "gm1", "gm2", "gm3", "gm4", "gm5"],
};

function memoryStorage(initial: Record<string, string> = {}): EfficiencyStorage {
  const data = { ...initial };
  return {
    getItem: (key) => data[key] ?? null,
    setItem: (key, value) => {
      data[key] = value;
    },
  };
}

describe("shotsFrom", () => {
  it("pairs keeper and shooter on impedisce la meta", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const stop = match.events.find((event) => event.kind === "parata");
    expect(stop?.actor).toBeTruthy();
    expect(stop?.target).toBeTruthy();
    expect(stop?.actor).not.toBe(stop?.target);
    expect(stop?.text).toMatch(/impedisce la meta di /);
    expect(stop?.text).not.toMatch(/\bpara\b/i);

    const shots = shotsFrom(match.events);
    const logged = shots.find((shot) => shot.t === stop!.t && shot.result === "impedita");
    expect(logged).toEqual({
      t: stop!.t,
      shooter: stop!.target,
      keeper: stop!.actor,
      result: "impedita",
    });
  });

  it("counts a meta as a tentativo for the scorer against the keeper", () => {
    const match = simulateMatch({ host, guest, roster, seed: "k7p2qm1a" });
    const meta = match.events.find((event) => event.kind === "meta");
    expect(meta?.actor).toBeTruthy();
    expect(meta?.target).toBeTruthy();
    const shot = shotsFrom(match.events).find((entry) => entry.t === meta!.t && entry.result === "meta");
    expect(shot).toEqual({
      t: meta!.t,
      shooter: meta!.actor,
      keeper: meta!.target,
      result: "meta",
    });
  });
});

describe("rowsFromShots", () => {
  it("computes shooter efficiency and keeper save rate", () => {
    const shots: ShotLog[] = [
      { t: 10, shooter: "hm5", keeper: "gf1", result: "meta" },
      { t: 20, shooter: "hm5", keeper: "gf1", result: "impedita" },
      { t: 30, shooter: "hm5", keeper: "gf1", result: "impedita" },
      { t: 40, shooter: "gm5", keeper: "hf1", result: "meta" },
    ];
    const rows = rowsFromShots(shots);
    const hm5 = rows.find((row) => row.slug === "hm5");
    const gf1 = rows.find((row) => row.slug === "gf1");
    const hf1 = rows.find((row) => row.slug === "hf1");
    expect(hm5).toMatchObject({ tentativi: 3, metas: 1, efficienza: 1 / 3 });
    expect(gf1).toMatchObject({ shotsFaced: 3, impedite: 2, parate: 2 / 3 });
    expect(hf1).toMatchObject({ shotsFaced: 1, impedite: 0, parate: 0 });
    expect(formatPct(hm5?.efficienza ?? null)).toBe("33%");
    expect(formatSplit(hm5!.metas, hm5!.tentativi)).toBe("1/3");
  });
});

describe("recordMatch", () => {
  it("stores a match once per seed", () => {
    const shots: ShotLog[] = [{ t: 1, shooter: "a", keeper: "b", result: "impedita" }];
    const once = recordMatch(emptyDb(), "seed01", shots);
    const twice = recordMatch(once, "seed01", [
      { t: 2, shooter: "a", keeper: "b", result: "meta" },
    ]);
    expect(twice.matches.seed01?.shots).toEqual(shots);
    expect(careerOf(twice, "a")).toMatchObject({ tentativi: 1, metas: 0, efficienza: 0 });
  });

  it("writes through a storage adapter without duplicating", () => {
    const storage = memoryStorage();
    const shots: ShotLog[] = [{ t: 8, shooter: "punta", keeper: "por", result: "meta" }];
    recordMatchIn(storage, "alpha", shots);
    recordMatchIn(storage, "alpha", shots);
    const db = parseDb(storage.getItem(EFFICIENCY_STORAGE_KEY));
    expect(Object.keys(db.matches)).toEqual(["alpha"]);
    expect(careerOf(db, "punta").metas).toBe(1);
  });
});
