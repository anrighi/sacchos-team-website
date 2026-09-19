import { KEEPER_SLOT, SQUAD_SIZE, rowsOf, type FormationId } from "#/lib/challenge/formation";
import type { Lineup } from "#/lib/challenge/lineup";
import type { MatchSim, Side, SimEvent } from "#/lib/challenge/sim";

export type Point = { x: number; y: number };

export type Token = {
  slug: string;
  side: Side;
  slot: number;
  x: number;
  y: number;
  onField: boolean;
  highlight: boolean;
};

export type BoardFrame = {
  tokens: Token[];
  ball: Point;
};

export type BoardInput = {
  host: Lineup;
  guest: Lineup;
  match: MatchSim;
  t: number;
  index: number;
  paused: boolean;
  reducedMotion: boolean;
};

const HOST_KEEP_Y = 91;
const HOST_ATTACK_Y = 44;
const GUEST_KEEP_Y = 9;
const GUEST_ATTACK_Y = 56;
const LINE_LEFT = 22;
const LINE_RIGHT = 78;
const HOST_GOAL_Y = 5;
const GUEST_GOAL_Y = 95;

export function restPositions(formation: FormationId, side: Side): Point[] {
  const rows = rowsOf(formation);
  const points: Point[] = Array.from({ length: SQUAD_SIZE }, () => ({ x: 50, y: 50 }));
  const yKeep = side === "host" ? HOST_KEEP_Y : GUEST_KEEP_Y;
  const yAttack = side === "host" ? HOST_ATTACK_Y : GUEST_ATTACK_Y;
  const last = Math.max(rows.length - 1, 1);

  for (let line = 0; line < rows.length; line += 1) {
    const row = rows[line]!;
    const y = yKeep + (yAttack - yKeep) * (line / last);
    const xs = spreadX(row.slots.length);
    for (let i = 0; i < row.slots.length; i += 1) {
      points[row.slots[i]!] = { x: xs[i]!, y };
    }
  }

  return points;
}

export function boardAt(input: BoardInput): BoardFrame {
  const { host, guest, match, t, index, paused, reducedMotion } = input;
  const events = match.events;
  const fromIndex = Math.min(index, events.length - 1);

  if (paused || reducedMotion || fromIndex >= events.length - 1) {
    return poseAt(host, guest, events, fromIndex);
  }

  const from = poseAt(host, guest, events, fromIndex);
  const to = poseAt(host, guest, events, fromIndex + 1);
  const tFrom = fromIndex < 0 ? 0 : events[fromIndex]!.t;
  const tTo = events[fromIndex + 1]!.t;
  const span = tTo - tFrom;
  const u = span <= 0 ? 1 : clamp((t - tFrom) / span, 0, 1);
  return lerpFrame(from, to, u * u * u);
}

export function poseAt(
  host: Lineup,
  guest: Lineup,
  events: readonly SimEvent[],
  index: number,
): BoardFrame {
  if (index < 0 || events.length === 0) {
    return restFrame(host, guest, occupancyAfter(host, guest, events, -1), null);
  }

  const event = events[Math.min(index, events.length - 1)]!;
  const live = occupancyAfter(host, guest, events, index - 1);
  if (event.actor) {
    live.set(event.actor, true);
  }
  if (event.target) {
    live.set(event.target, true);
  }

  return stage(restFrame(host, guest, live, event), event);
}

function occupancyAfter(
  host: Lineup,
  guest: Lineup,
  events: readonly SimEvent[],
  lastInclusive: number,
): Map<string, boolean> {
  const live = new Map<string, boolean>();
  for (const slug of [...host.slots, ...guest.slots]) {
    if (slug) {
      live.set(slug, true);
    }
  }

  for (let i = 0; i <= lastInclusive; i += 1) {
    const event = events[i];
    if (!event) {
      continue;
    }

    if (
      event.kind === "inizio" ||
      event.kind === "intervallo" ||
      event.kind === "secondo-tempo" ||
      event.kind === "meta" ||
      event.kind === "meta-tecnica"
    ) {
      for (const slug of live.keys()) {
        live.set(slug, true);
      }
      continue;
    }

    if (event.kind === "scalpo-pieno" && event.target) {
      live.set(event.target, false);
      continue;
    }

    if (event.kind === "uscita" && event.actor) {
      live.set(event.actor, false);
    }
  }

  return live;
}

function restFrame(
  host: Lineup,
  guest: Lineup,
  live: Map<string, boolean>,
  event: SimEvent | null,
): BoardFrame {
  return {
    tokens: [
      ...sideTokens(host, "host", live),
      ...sideTokens(guest, "guest", live),
    ],
    ball: ballAtRest(event),
  };
}

function sideTokens(lineup: Lineup, side: Side, live: Map<string, boolean>): Token[] {
  const rest = restPositions(lineup.formation, side);
  const tokens: Token[] = [];

  for (let slot = 0; slot < SQUAD_SIZE; slot += 1) {
    const slug = lineup.slots[slot];
    if (!slug) {
      continue;
    }

    const onField = live.get(slug) !== false;
    const point = onField ? rest[slot]! : sidelineOf(side, slot);
    tokens.push({
      slug,
      side,
      slot,
      x: point.x,
      y: point.y,
      onField,
      highlight: false,
    });
  }

  return tokens;
}

function stage(frame: BoardFrame, event: SimEvent): BoardFrame {
  const tokens = frame.tokens.map((token) => ({ ...token }));
  const ball = { ...frame.ball };
  const actor = tokens.find((token) => token.slug === event.actor);
  const target = tokens.find((token) => token.slug === event.target);

  if (event.kind === "inizio" || event.kind === "secondo-tempo" || event.kind === "fine") {
    ball.x = 50;
    ball.y = 50;
  }

  if (event.kind === "intervallo") {
    ball.x = 50;
    ball.y = 50;
  }

  if (event.kind === "meta" || event.kind === "meta-tecnica") {
    placeGoal(tokens, ball, event.side ?? actor?.side ?? "host", actor);
  }

  if (event.kind === "parata") {
    placeSave(tokens, ball, event.side ?? actor?.side ?? "host", actor);
  }

  if (event.kind === "scalpo-pieno" || event.kind === "scalpo-vuoto") {
    placeClash(ball, event, actor, target);
  }

  if (event.kind === "uscita" && actor) {
    const bench = sidelineOf(actor.side, actor.slot);
    actor.x = bench.x;
    actor.y = bench.y;
    actor.onField = false;
    actor.highlight = true;
  }

  for (const token of tokens) {
    if (token.onField || token.highlight) {
      continue;
    }
    const bench = sidelineOf(token.side, token.slot);
    token.x = bench.x;
    token.y = bench.y;
  }

  return { tokens, ball };
}

function placeGoal(tokens: Token[], ball: Point, scoring: Side, actor?: Token) {
  const hostScores = scoring === "host";
  ball.x = 50 + jitter(scoring, 1.2);
  ball.y = hostScores ? HOST_GOAL_Y : GUEST_GOAL_Y;

  if (actor) {
    actor.x = 50 + (hostScores ? -3.5 : 3.5);
    actor.y = hostScores ? 16 : 84;
    actor.highlight = true;
  }

  const keeper = tokens.find((token) => token.side !== scoring && token.slot === KEEPER_SLOT);
  if (keeper) {
    keeper.x = 50 + (hostScores ? 3 : -3);
    keeper.y = hostScores ? 8 : 92;
  }
}

function placeSave(tokens: Token[], ball: Point, defending: Side, keeper?: Token) {
  const hostKeeps = defending === "host";
  ball.x = 46 + jitter(defending, 2);
  ball.y = hostKeeps ? 14 : 86;

  if (keeper) {
    keeper.x = 48;
    keeper.y = hostKeeps ? 12 : 88;
    keeper.highlight = true;
  }

  const strikers = tokens.filter(
    (token) => token.side !== defending && token.onField && token.slot !== KEEPER_SLOT,
  );
  const striker = strikers[strikers.length - 1];
  if (striker) {
    striker.x = 52;
    striker.y = hostKeeps ? 22 : 78;
    striker.highlight = true;
  }
}

function placeClash(ball: Point, event: SimEvent, actor?: Token, target?: Token) {
  const shift = jitter(event.actor ?? event.clock, 8);
  const targetSide = target?.side ?? (event.side === "host" ? "guest" : "host");
  const clashY = targetSide === "host" ? 58 : 42;
  const clashX = 50 + shift;

  if (actor) {
    actor.x = clashX - 4;
    actor.y = clashY;
    actor.highlight = true;
  }
  if (target) {
    target.x = clashX + 4;
    target.y = clashY;
    target.highlight = true;
  }

  ball.x = clashX;
  ball.y = clashY + (targetSide === "host" ? -6 : 6);
}

function ballAtRest(event: SimEvent | null): Point {
  if (!event || event.kind === "inizio" || event.kind === "secondo-tempo" || event.kind === "fine") {
    return { x: 50, y: 50 };
  }
  return { x: 50, y: 50 };
}

function sidelineOf(side: Side, slot: number): Point {
  if (side === "host") {
    return { x: 7, y: 54 + slot * 5.5 };
  }
  return { x: 93, y: 46 - slot * 5.5 };
}

function spreadX(count: number): number[] {
  if (count <= 1) {
    return [50];
  }
  return Array.from(
    { length: count },
    (_, i) => LINE_LEFT + ((LINE_RIGHT - LINE_LEFT) * i) / (count - 1),
  );
}

function lerpFrame(from: BoardFrame, to: BoardFrame, u: number): BoardFrame {
  const bySlug = new Map(to.tokens.map((token) => [token.slug, token]));
  return {
    ball: lerpPoint(from.ball, to.ball, u),
    tokens: from.tokens.map((token) => {
      const next = bySlug.get(token.slug);
      if (!next) {
        return token;
      }
      const point = lerpPoint(token, next, u);
      return {
        ...next,
        x: point.x,
        y: point.y,
        onField: u < 0.55 ? token.onField : next.onField,
        highlight: u >= 0.7 ? next.highlight : token.highlight,
      };
    }),
  };
}

function lerpPoint(from: Point, to: Point, u: number): Point {
  return {
    x: from.x + (to.x - from.x) * u,
    y: from.y + (to.y - from.y) * u,
  };
}

function jitter(seed: string, span: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 1000;
  }
  return ((hash % 17) - 8) * (span / 8);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
