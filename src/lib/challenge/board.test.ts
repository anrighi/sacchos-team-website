import { describe, expect, it } from "vitest";
import { boardAt, poseAt } from "#/lib/challenge/board";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import { EMPTY_SCALPS_TO_EXIT, simulateMatch } from "#/lib/challenge/sim";
import type { Player, Sex } from "#/lib/player";

function player(slug: string, sex: Sex, number: number): Player {
  return {
    slug,
    firstName: slug,
    team: "Saccho's Team",
    sex,
    number,
    birthYear: 2000,
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

describe("boardAt", () => {
  it("keeps fourteen cards in formation at kickoff without a ball token", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const kickoff = match.events[0]!;
    const frame = boardAt({ host, guest, match, index: 0 });

    expect(kickoff.kind).toBe("inizio");
    expect(frame.tokens).toHaveLength(14);
    expect(frame.tokens.every((token) => token.onField)).toBe(true);
    expect(frame.tokens.every((token) => token.vuoti === 0)).toBe(true);
    expect(frame).not.toHaveProperty("ball");
    const highlighted = frame.tokens.filter((token) => token.highlight);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0]?.side).toBe(kickoff.side);
    expect(highlighted[0]?.callout).toBe("Palla");
  });

  it("is deterministic for the same index", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const input = { host, guest, match, index: 3 };
    expect(boardAt(input)).toEqual(boardAt(input));
  });

  it("does not move cards between events", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const a = poseAt(host, guest, match.events, 0);
    const b = poseAt(host, guest, match.events, Math.min(4, match.events.length - 1));
    expect(a.tokens.map((token) => `${token.slug}:${token.slot}`)).toEqual(
      b.tokens.map((token) => `${token.slug}:${token.slot}`),
    );
  });

  it("disables the target on a scalpo pieno", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const scalp = match.events.find((event) => event.kind === "scalpo-pieno");
    expect(scalp?.target).toBeTruthy();
    const frame = poseAt(host, guest, match.events, match.events.indexOf(scalp!));
    const victim = frame.tokens.find((token) => token.slug === scalp!.target);
    const actor = frame.tokens.find((token) => token.slug === scalp!.actor);
    expect(victim?.onField).toBe(false);
    expect(actor?.highlight).toBe(true);
    expect(victim?.highlight).toBe(true);
    expect(actor?.callout).toBe("Scalpo pieno");
    expect(victim?.callout).toBe("Scalpato");
    expect(frame.flash?.kind).toBe("scalpo-pieno");
  });

  it("counts vuoti as scalpi on the player who missed", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const vuoto = match.events.find((event) => event.kind === "scalpo-vuoto");
    expect(vuoto?.actor).toBeTruthy();
    const frame = poseAt(host, guest, match.events, match.events.indexOf(vuoto!));
    const actor = frame.tokens.find((token) => token.slug === vuoto!.actor);
    expect(actor?.vuoti).toBeGreaterThanOrEqual(1);
    expect(actor?.vuoti).toBeLessThanOrEqual(EMPTY_SCALPS_TO_EXIT);
    expect(actor?.highlight).toBe(true);
    expect(actor?.callout).toBe("Scalpo a vuoto");
  });

  it("puts a Meta callout on the scorer", () => {
    const match = simulateMatch({ host, guest, roster, seed: "k7p2qm1a" });
    const meta = match.events.find((event) => event.kind === "meta");
    expect(meta).toBeTruthy();
    const frame = poseAt(host, guest, match.events, match.events.indexOf(meta!));
    expect(frame.flash?.kind).toBe("meta");
    const actor = frame.tokens.find((token) => token.slug === meta!.actor);
    expect(actor?.highlight).toBe(true);
    expect(actor?.onField).toBe(true);
    expect(actor?.callout).toBe("Meta");
  });

  it("resets vuoti at half time", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const interval = match.events.findIndex((event) => event.kind === "intervallo");
    expect(interval).toBeGreaterThan(0);
    const frame = poseAt(host, guest, match.events, interval);
    expect(frame.tokens.every((token) => token.vuoti === 0)).toBe(true);
    expect(frame.tokens.every((token) => token.onField)).toBe(true);
  });

  it("labels a stopped meta as impedisce la meta, not parata", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const stop = match.events.find((event) => event.kind === "parata");
    expect(stop).toBeTruthy();
    const frame = poseAt(host, guest, match.events, match.events.indexOf(stop!));
    expect(frame.flash?.label).toBe("Impedisce la meta");
    const keeper = frame.tokens.find((token) => token.slug === stop!.actor);
    expect(keeper?.callout).toBe("Impedisce la meta");
    expect(stop?.target).toBeTruthy();
    const shooter = frame.tokens.find((token) => token.slug === stop!.target);
    expect(shooter?.highlight).toBe(true);
    expect(shooter?.callout).toBe("Meta tentata");
    expect(stop?.text).toMatch(/impedisce la meta di /);
  });
});
