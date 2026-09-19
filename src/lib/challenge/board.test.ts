import { describe, expect, it } from "vitest";
import { boardAt, poseAt, restPositions } from "#/lib/challenge/board";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import { playbackAt, simulateMatch, totalPlaybackMs } from "#/lib/challenge/sim";
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

describe("restPositions", () => {
  it("puts host keeper at the bottom and attack toward midfield", () => {
    const hostPts = restPositions("3-2-1", "host");
    expect(hostPts).toHaveLength(7);
    expect(hostPts[0]!.y).toBeGreaterThan(hostPts[6]!.y);
    expect(hostPts[6]!.x).toBe(50);
    expect(hostPts[0]!.y).toBeGreaterThan(80);
    expect(hostPts[6]!.y).toBeGreaterThan(40);
    expect(hostPts[6]!.y).toBeLessThan(50);
  });

  it("mirrors guest toward the top", () => {
    const guestPts = restPositions("3-2-1", "guest");
    expect(guestPts[0]!.y).toBeLessThan(guestPts[6]!.y);
    expect(guestPts[0]!.y).toBeLessThan(20);
    expect(guestPts[6]!.y).toBeGreaterThan(50);
    expect(guestPts[6]!.y).toBeLessThan(60);
  });

  it("spreads a five-line formation on distinct rows", () => {
    const pts = restPositions("2-1-1-2", "host");
    const ys = [...new Set(pts.map((point) => point.y))];
    expect(ys).toHaveLength(5);
  });
});

describe("boardAt", () => {
  it("kicks off with fourteen tokens on the field and the ball in the centre", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const frame = boardAt({
      host,
      guest,
      match,
      t: 0,
      index: 0,
      paused: true,
      reducedMotion: false,
    });

    expect(frame.tokens).toHaveLength(14);
    expect(frame.tokens.every((token) => token.onField)).toBe(true);
    expect(frame.ball).toEqual({ x: 50, y: 50 });
    expect(frame.tokens.filter((token) => token.side === "host")).toHaveLength(7);
  });

  it("is deterministic for the same seed and clock", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const input = {
      host,
      guest,
      match,
      t: 120,
      index: 3,
      paused: false,
      reducedMotion: false,
    };
    expect(boardAt(input)).toEqual(boardAt(input));
  });

  it("sends the ball into the scoring goal on a meta", () => {
    const match = simulateMatch({ host, guest, roster, seed: "k7p2qm1a" });
    const meta = match.events.find((event) => event.kind === "meta");
    expect(meta).toBeTruthy();
    const index = match.events.indexOf(meta!);
    const frame = poseAt(host, guest, match.events, index);
    const actor = frame.tokens.find((token) => token.slug === meta!.actor);

    expect(actor?.highlight).toBe(true);
    if (meta!.side === "host") {
      expect(frame.ball.y).toBeLessThan(12);
      expect(actor?.y).toBeLessThan(25);
    } else {
      expect(frame.ball.y).toBeGreaterThan(88);
      expect(actor?.y).toBeGreaterThan(75);
    }
  });

  it("keeps a scalp clash on the pitch, then benches the target", () => {
    const match = simulateMatch({ host, guest, roster, seed: "board01" });
    const scalp = match.events.find((event) => event.kind === "scalpo-pieno");
    expect(scalp?.target).toBeTruthy();
    const index = match.events.indexOf(scalp!);
    const during = poseAt(host, guest, match.events, index);
    const victim = during.tokens.find((token) => token.slug === scalp!.target);
    const attacker = during.tokens.find((token) => token.slug === scalp!.actor);

    expect(victim?.highlight).toBe(true);
    expect(attacker?.highlight).toBe(true);
    expect(Math.abs((victim?.x ?? 0) - (attacker?.x ?? 0))).toBeLessThan(12);

    const after = poseAt(host, guest, match.events, index + 1);
    const benched = after.tokens.find((token) => token.slug === scalp!.target);
    expect(benched?.onField).toBe(false);
    expect(benched?.x === 7 || benched?.x === 93).toBe(true);
  });

  it("lerps tokens between consecutive event poses", () => {
    const match = simulateMatch({ host, guest, roster, seed: "ticker" });
    const paused = match.events.find((event) => event.pauseMs > 0);
    expect(paused).toBeTruthy();
    const toIndex = match.events.indexOf(paused!);
    if (toIndex < 1) {
      return;
    }

    const from = poseAt(host, guest, match.events, toIndex - 1);
    const to = poseAt(host, guest, match.events, toIndex);
    const mid = boardAt({
      host,
      guest,
      match,
      t: (match.events[toIndex - 1]!.t + paused!.t) / 2,
      index: toIndex - 1,
      paused: false,
      reducedMotion: false,
    });

    const slug = to.tokens.find((token) => token.highlight)?.slug ?? to.tokens[0]!.slug;
    const a = from.tokens.find((token) => token.slug === slug)!;
    const b = to.tokens.find((token) => token.slug === slug)!;
    const c = mid.tokens.find((token) => token.slug === slug)!;
    const lo = Math.min(a.y, b.y);
    const hi = Math.max(a.y, b.y);
    expect(c.y).toBeGreaterThanOrEqual(lo - 0.01);
    expect(c.y).toBeLessThanOrEqual(hi + 0.01);
  });

  it("snaps to the event pose when motion is reduced", () => {
    const match = simulateMatch({ host, guest, roster, seed: "ticker" });
    const total = totalPlaybackMs(match, true);
    const play = playbackAt(match, total / 2, true);
    const snapped = boardAt({
      host,
      guest,
      match,
      t: play.t,
      index: play.index,
      paused: play.paused,
      reducedMotion: true,
    });
    expect(snapped).toEqual(poseAt(host, guest, match.events, play.index));
  });
});
