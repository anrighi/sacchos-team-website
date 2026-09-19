import { describe, expect, it } from "vitest";
import type { Player, Role, Sex } from "#/lib/player";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import {
  EMPTY_SCALPS_TO_EXIT,
  HALF_SECONDS,
  INTERVAL_PAUSE_MS,
  MATCH_SECONDS,
  MAX_PAUSE_MS,
  MIN_PAUSE_MS,
  WRONG_KEEPER_FACTOR,
  applyPieno,
  applyVuoto,
  countOnField,
  effectiveStats,
  liveSquad,
  matchClock,
  playbackAt,
  simulateMatch,
  totalPlaybackMs,
} from "#/lib/challenge/sim";

function player(
  slug: string,
  sex: Sex,
  extras: Partial<Player> & { role?: Role } = {},
): Player {
  return {
    slug,
    firstName: extras.firstName ?? slug,
    nickname: extras.nickname,
    team: "Saccho's Team",
    role: extras.role,
    sex,
    number: extras.number ?? 1,
    birthYear: 2000,
    overall: 75,
    stats: extras.stats ?? {
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
  player("hf1", "F", { firstName: "Anna", number: 1 }),
  player("hf2", "F", { firstName: "Bea", number: 2 }),
  player("hm1", "M", { firstName: "Carlo", number: 3 }),
  player("hm2", "M", { firstName: "Dario", number: 4 }),
  player("hm3", "M", { firstName: "Enzo", number: 5 }),
  player("hm4", "M", { firstName: "Fabio", number: 6 }),
  player("hm5", "M", { firstName: "Gino", number: 7 }),
  player("gf1", "F", { firstName: "Ilaria", number: 8 }),
  player("gf2", "F", { firstName: "Lara", number: 9 }),
  player("gm1", "M", { firstName: "Marco", number: 10 }),
  player("gm2", "M", { firstName: "Neri", number: 11 }),
  player("gm3", "M", { firstName: "Omar", number: 12 }),
  player("gm4", "M", { firstName: "Piero", number: 13 }),
  player("gm5", "M", { firstName: "Quinto", number: 14 }),
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

describe("matchClock", () => {
  it("shows two halves of 15 minutes, not wall-clock seconds", () => {
    expect(matchClock(0)).toEqual({ half: 1, secondsInHalf: 0, label: "1T 00:00" });
    expect(matchClock(899).label).toBe("1T 14:59");
    expect(matchClock(HALF_SECONDS)).toEqual({
      half: 2,
      secondsInHalf: 0,
      label: "2T 00:00",
    });
    expect(matchClock(MATCH_SECONDS).label).toBe("2T 15:00");
    expect(matchClock(90).label).toBe("1T 01:30");
  });
});

describe("effectiveStats", () => {
  it("applies a keeper malus when a non-POR is in goal", () => {
    const punta = player("punta", "M", { role: "PUN", stats: {
      velocita: 80,
      salto: 80,
      intercetto: 80,
      scalpo: 80,
      finalizzazione: 80,
      gk: 80,
    } });
    const por = player("por", "M", { role: "POR", stats: punta.stats });
    expect(effectiveStats(punta, "3-2-1", 0).gk).toBe(Math.round(80 * WRONG_KEEPER_FACTOR));
    expect(effectiveStats(por, "3-2-1", 0).gk).toBe(80);
  });

  it("leaves stats alone when the player has no role", () => {
    const raw = player("x", "F");
    expect(effectiveStats(raw, "3-2-1", 6)).toEqual(raw.stats);
  });
});

describe("applyVuoto / applyPieno", () => {
  it("sends a player off after three empty scalps", () => {
    const squad = liveSquad("host", host, roster);
    const first = applyVuoto(squad, 2);
    const second = applyVuoto(squad, 2);
    const third = applyVuoto(squad, 2);
    expect(first.exited).toBe(false);
    expect(second.exited).toBe(false);
    expect(third.exited).toBe(true);
    expect(EMPTY_SCALPS_TO_EXIT).toBe(3);
    expect(squad.slots[2]?.onField).toBe(false);
    expect(countOnField(squad)).toBe(6);
  });

  it("awards a technical meta when only three remain on the field", () => {
    const squad = liveSquad("guest", guest, roster);
    expect(applyPieno(squad, 1)).toBe(false);
    expect(applyPieno(squad, 2)).toBe(false);
    expect(applyPieno(squad, 3)).toBe(false);
    expect(applyPieno(squad, 4)).toBe(true);
    expect(countOnField(squad)).toBe(3);
    expect(squad.slots[0]?.onField).toBe(true);
  });

  it("never sends the keeper off on a pieno", () => {
    const squad = liveSquad("host", host, roster);
    expect(applyPieno(squad, 0)).toBe(false);
    expect(squad.slots[0]?.onField).toBe(true);
  });
});

describe("simulateMatch", () => {
  it("is deterministic for the same seed and lineups", () => {
    const a = simulateMatch({ host, guest, roster, seed: "k7p2qm1a" });
    const b = simulateMatch({ host, guest, roster, seed: "k7p2qm1a" });
    expect(a.events).toEqual(b.events);
    expect(a.score).toEqual(b.score);
    expect(a.scalpi).toEqual(b.scalpi);
  });

  it("changes the sequence when the seed changes", () => {
    const a = simulateMatch({ host, guest, roster, seed: "aaaaaaaa" });
    const b = simulateMatch({ host, guest, roster, seed: "bbbbbbbb" });
    expect(a.events.map((event) => event.text)).not.toEqual(b.events.map((event) => event.text));
  });

  it("runs two 15′ halves with interval and non-negative pauses", () => {
    const match = simulateMatch({ host, guest, roster, seed: "orologio" });
    const kinds = match.events.map((event) => event.kind);
    expect(kinds[0]).toBe("inizio");
    expect(kinds).toContain("intervallo");
    expect(kinds).toContain("secondo-tempo");
    expect(kinds.at(-1)).toBe("fine");
    expect(match.events.at(-1)?.t).toBe(MATCH_SECONDS);
    expect(match.events.at(-1)?.clock).toBe("2T 15:00");

    const interval = match.events.find((event) => event.kind === "intervallo");
    expect(interval?.t).toBe(HALF_SECONDS);
    expect(interval?.pauseMs).toBe(INTERVAL_PAUSE_MS);

    for (const event of match.events) {
      expect(event.pauseMs).toBeGreaterThanOrEqual(0);
      if (event.kind === "meta" || event.kind === "meta-tecnica" || event.kind === "scalpo-pieno" || event.kind === "scalpo-vuoto" || event.kind === "parata") {
        expect(event.pauseMs).toBeGreaterThanOrEqual(MIN_PAUSE_MS);
        expect(event.pauseMs).toBeLessThanOrEqual(MAX_PAUSE_MS);
      }
    }
  });

  it("keeps game time monotonic and scores in range", () => {
    const match = simulateMatch({ host, guest, roster, seed: "tabellino" });
    for (let i = 1; i < match.events.length; i += 1) {
      expect(match.events[i]!.t).toBeGreaterThanOrEqual(match.events[i - 1]!.t);
    }
    expect(match.score.host + match.score.guest).toBeGreaterThanOrEqual(0);
    expect(match.score.host).toBeLessThan(20);
    expect(match.score.guest).toBeLessThan(20);
  });

  it("rejects incomplete lineups", () => {
    const broken = { ...host, slots: [...host.slots.slice(0, 6), null] };
    expect(() => simulateMatch({ host: broken, guest, roster, seed: "x" })).toThrow(
      "Formazioni non valide",
    );
  });
});

describe("playbackAt", () => {
  it("freezes the clock during a pause and interpolates between events", () => {
    const match = simulateMatch({ host, guest, roster, seed: "ticker" });
    const paused = match.events.find((event) => event.pauseMs > 0);
    expect(paused).toBeTruthy();

    const total = totalPlaybackMs(match);
    expect(total).toBeGreaterThan(0);

    const start = playbackAt(match, 0);
    expect(start.clock).toBe("1T 00:00");
    expect(start.done).toBe(false);

    const end = playbackAt(match, total + 1_000);
    expect(end.done).toBe(true);
    expect(end.clock).toBe("2T 15:00");
    expect(end.event?.kind).toBe("fine");
  });
});
