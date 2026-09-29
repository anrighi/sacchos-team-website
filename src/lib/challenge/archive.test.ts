import { describe, expect, it } from "vitest";
import { appendMatch, listMatchSummaries, matchRecordFrom, mvpOf } from "#/lib/challenge/archive";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import { simulateMatch } from "#/lib/challenge/sim";
import { memoryStore } from "#/lib/challenge/store";
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

describe("archive", () => {
  it("lists nothing without stored matches", async () => {
    expect(await listMatchSummaries(memoryStore())).toEqual([]);
  });

  it("stores the recap payload once per seed", async () => {
    const match = simulateMatch({ host, guest, roster, seed: "arch01" });
    const record = matchRecordFrom({
      match,
      host,
      guest,
      recapUrl: "/sfida?host=Marco&guest=Luca&seed=arch01",
      timestamp: "2026-09-29T07:00:00.000Z",
    });
    expect(record).toMatchObject({
      id: "arch01",
      simVersion: 1,
      seed: "arch01",
      winner: match.winner,
      mete: match.score,
      host: { name: "Marco", slugs: host.slots },
      guest: { name: "Luca", slugs: guest.slots },
    });
    expect(record.boxScore.length).toBeGreaterThan(0);
    expect(record.log).toEqual(match.events);
    expect(record.mvp === null || typeof record.mvp === "string").toBe(true);

    const store = memoryStore();
    const first = await appendMatch(store, record);
    const second = await appendMatch(store, { ...record, displayName: "changed" });
    expect(first).toEqual({ ok: true, duplicate: false });
    expect(second).toEqual({ ok: true, duplicate: true });
    const listed = await listMatchSummaries(store);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.displayName).toBe(record.displayName);
    expect(listed[0]).not.toHaveProperty("log");
  });

  it("picks the MVP from metas then scalpi", () => {
    expect(
      mvpOf([
        {
          kind: "meta",
          t: 1,
          half: 1,
          clock: "1T 00:01",
          actor: "hm5",
          pauseMs: 0,
          score: { host: 1, guest: 0 },
          text: "meta",
        },
        {
          kind: "scalpo-pieno",
          t: 2,
          half: 1,
          clock: "1T 00:02",
          actor: "hm2",
          pauseMs: 0,
          score: { host: 1, guest: 0 },
          text: "scalpo",
        },
      ]),
    ).toBe("hm5");
  });
});
