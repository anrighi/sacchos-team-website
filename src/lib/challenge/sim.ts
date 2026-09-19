import type { FormationId } from "#/lib/challenge/formation";
import { KEEPER_SLOT, lineOfSlot } from "#/lib/challenge/formation";
import {
  clashingSlugs,
  isLineupReady,
  lineupLabel,
  playerLabel,
  type Lineup,
} from "#/lib/challenge/lineup";
import type { Player, PlayerStats, Role } from "#/lib/player";

export const HALF_SECONDS = 15 * 60;
export const HALF_COUNT = 2;
export const MATCH_SECONDS = HALF_SECONDS * HALF_COUNT;
export const EXTRA_SECONDS = 5 * 60;
export const SILVER_END = MATCH_SECONDS + EXTRA_SECONDS;
export const GOLDEN_END = SILVER_END + EXTRA_SECONDS;
export const PLAYBACK_SCALE = 20;
export const MS_PER_GAME_SECOND = 1000 / PLAYBACK_SCALE;
export const MIN_PAUSE_MS = 1000;
export const MAX_PAUSE_MS = 3000;
export const INTERVAL_PAUSE_MS = 2000;
export const TECHNICAL_ON_FIELD = 3;
export const EMPTY_SCALPS_TO_EXIT = 3;
export const OUT_OF_POSITION_FACTOR = 0.82;
export const WRONG_KEEPER_FACTOR = 0.7;

export type Side = "host" | "guest";

export type SimKind =
  | "inizio"
  | "intervallo"
  | "secondo-tempo"
  | "supplementari"
  | "golden"
  | "fine"
  | "meta"
  | "meta-tecnica"
  | "scalpo-pieno"
  | "scalpo-vuoto"
  | "parata"
  | "uscita";

export type MatchScore = { host: number; guest: number };

export type SimEvent = {
  kind: SimKind;
  t: number;
  half: 1 | 2;
  clock: string;
  side?: Side;
  actor?: string;
  target?: string;
  pauseMs: number;
  score: MatchScore;
  text: string;
};

export type MatchSim = {
  seed: string;
  hostName: string;
  guestName: string;
  events: SimEvent[];
  score: MatchScore;
  winner: Side;
  scalpi: {
    host: { pieni: number; vuoti: number };
    guest: { pieni: number; vuoti: number };
  };
};

export type PeriodId = "1T" | "2T" | "SA" | "GO";

export type SimulateInput = {
  host: Lineup;
  guest: Lineup;
  roster: readonly Player[];
  seed: string;
};

export const ROLES_FOR_LINE: Record<string, readonly Role[]> = {
  Portiere: ["POR"],
  Difesa: ["CEN", "PAL"],
  Centro: ["PAL", "ALA", "CEN"],
  Filtro: ["PAL", "CEN"],
  Trequarti: ["ALA", "PUN"],
  Attacco: ["PUN", "ALA"],
};

type Rng = () => number;

export type SlotState = {
  player: Player;
  stats: PlayerStats;
  onField: boolean;
  emptyThisHalf: number;
};

export type SquadState = {
  side: Side;
  name: string;
  slots: SlotState[];
};

const PAUSE_KINDS: ReadonlySet<SimKind> = new Set([
  "meta",
  "meta-tecnica",
  "scalpo-pieno",
  "scalpo-vuoto",
  "parata",
]);

export function createMatchSeed(): string {
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 8);
}

export function matchClock(t: number): {
  half: 1 | 2;
  period: PeriodId;
  secondsInHalf: number;
  periodLength: number;
  label: string;
} {
  const whole = Math.max(0, t);
  if (whole < HALF_SECONDS) {
    return clockOf("1T", 1, whole, HALF_SECONDS);
  }
  if (whole <= MATCH_SECONDS) {
    return clockOf("2T", 2, Math.min(whole - HALF_SECONDS, HALF_SECONDS), HALF_SECONDS);
  }
  if (whole <= SILVER_END) {
    return clockOf("SA", 2, Math.min(whole - MATCH_SECONDS, EXTRA_SECONDS), EXTRA_SECONDS);
  }
  return clockOf("GO", 2, Math.min(Math.max(0, whole - SILVER_END), EXTRA_SECONDS), EXTRA_SECONDS);
}

function clockOf(
  period: PeriodId,
  half: 1 | 2,
  secondsInHalf: number,
  periodLength: number,
): {
  half: 1 | 2;
  period: PeriodId;
  secondsInHalf: number;
  periodLength: number;
  label: string;
} {
  const mm = String(Math.floor(secondsInHalf / 60)).padStart(2, "0");
  const ss = String(secondsInHalf % 60).padStart(2, "0");
  return {
    half,
    period,
    secondsInHalf,
    periodLength,
    label: `${period} ${mm}:${ss}`,
  };
}

export function analogHands(t: number): { half: 1 | 2; minuteDeg: number; secondDeg: number } {
  const { half, secondsInHalf, periodLength } = matchClock(t);
  return {
    half,
    minuteDeg: (secondsInHalf / periodLength) * 360,
    secondDeg: ((secondsInHalf % 60) / 60) * 360,
  };
}

export function effectiveStats(player: Player, formation: FormationId, slot: number): PlayerStats {
  const line = lineOfSlot(formation, slot)?.label ?? "";
  const allowed = ROLES_FOR_LINE[line];
  const misplaced = Boolean(player.role && allowed && !allowed.includes(player.role));
  const factor = misplaced ? OUT_OF_POSITION_FACTOR : 1;
  const gkFactor =
    slot === KEEPER_SLOT && player.role && player.role !== "POR" ? WRONG_KEEPER_FACTOR : factor;

  return {
    velocita: scaleStat(player.stats.velocita, factor),
    salto: scaleStat(player.stats.salto, factor),
    intercetto: scaleStat(player.stats.intercetto, factor),
    scalpo: scaleStat(player.stats.scalpo, factor),
    finalizzazione: scaleStat(player.stats.finalizzazione, factor),
    gk: scaleStat(player.stats.gk, gkFactor),
  };
}

export function countOnField(squad: SquadState): number {
  return squad.slots.filter((slot) => slot.onField).length;
}

export function isTechnicalMeta(squad: SquadState): boolean {
  return countOnField(squad) <= TECHNICAL_ON_FIELD;
}

export function liveSquad(side: Side, lineup: Lineup, roster: readonly Player[]): SquadState {
  return makeSquad(side, lineup, roster);
}

export function applyPieno(squad: SquadState, slot: number): boolean {
  const target = squad.slots[slot];
  if (!target || slot === KEEPER_SLOT || !target.onField) {
    return isTechnicalMeta(squad);
  }
  target.onField = false;
  return isTechnicalMeta(squad);
}

export function applyVuoto(squad: SquadState, slot: number): { exited: boolean; technical: boolean } {
  const actor = squad.slots[slot];
  if (!actor || slot === KEEPER_SLOT || !actor.onField) {
    return { exited: false, technical: isTechnicalMeta(squad) };
  }
  actor.emptyThisHalf += 1;
  const exited = actor.emptyThisHalf >= EMPTY_SCALPS_TO_EXIT;
  if (exited) {
    actor.onField = false;
  }
  return { exited, technical: isTechnicalMeta(squad) };
}

type PlayCtx = {
  t: number;
  possession: Side;
  host: SquadState;
  guest: SquadState;
  score: MatchScore;
  scalpi: MatchSim["scalpi"];
  events: SimEvent[];
  rng: Rng;
  roster: readonly Player[];
};

function playOpenPlay(ctx: PlayCtx, endAt: number, stopOnScore: boolean): boolean {
  const golden = stopOnScore;
  for (let step = 0; step < 250 && ctx.t < endAt; step += 1) {
    const remaining = endAt - ctx.t;
    if (remaining < 8) {
      ctx.t = endAt;
      return false;
    }

    const dt = Math.round(lerp(ctx.rng(), 12, 28));
    ctx.t = Math.min(ctx.t + dt, endAt);
    if (ctx.t >= endAt) {
      return false;
    }

    const att = ctx.possession === "host" ? ctx.host : ctx.guest;
    const def = ctx.possession === "host" ? ctx.guest : ctx.host;
    const roll = ctx.rng();

    if (roll < 0.14) {
      const scalp = tryScalp(att, def, ctx.rng, ctx.roster);
      if (!scalp) {
        continue;
      }
      if (scalp.kind === "scalpo-pieno") {
        ctx.scalpi[def.side].pieni += 1;
      }
      if (scalp.kind === "scalpo-vuoto") {
        ctx.scalpi[def.side].vuoti += 1;
      }
      pushEvent(ctx.events, {
        kind: scalp.kind,
        t: ctx.t,
        score: ctx.score,
        side: def.side,
        actor: scalp.actor,
        target: scalp.target,
        text: scalp.text,
        pauseMs: pauseMs(ctx.rng, scalp.kind),
      });
      if (scalp.exited) {
        pushEvent(ctx.events, {
          kind: "uscita",
          t: ctx.t,
          score: ctx.score,
          side: def.side,
          actor: scalp.actor,
          text: `${labelOf(def.slots[scalp.actorSlot]!.player, ctx.roster)} esce: tre vuoti`,
          pauseMs: 0,
        });
      }
      if (isTechnicalMeta(att)) {
        ctx.score[def.side] += 1;
        restoreAll(ctx.host);
        restoreAll(ctx.guest);
        ctx.possession = att.side;
        pushEvent(ctx.events, {
          kind: "meta-tecnica",
          t: ctx.t,
          score: ctx.score,
          side: def.side,
          text: golden
            ? `Meta d'oro tecnica: ${att.name} restano in tre`
            : `Meta tecnica: ${att.name} restano in tre`,
          pauseMs: pauseMs(ctx.rng, "meta-tecnica"),
        });
        if (stopOnScore) {
          return true;
        }
        continue;
      }
      if (scalp.exited && isTechnicalMeta(def)) {
        ctx.score[att.side] += 1;
        restoreAll(ctx.host);
        restoreAll(ctx.guest);
        ctx.possession = def.side;
        pushEvent(ctx.events, {
          kind: "meta-tecnica",
          t: ctx.t,
          score: ctx.score,
          side: att.side,
          text: golden
            ? `Meta d'oro tecnica: ${def.name} restano in tre`
            : `Meta tecnica: ${def.name} restano in tre`,
          pauseMs: pauseMs(ctx.rng, "meta-tecnica"),
        });
        if (stopOnScore) {
          return true;
        }
      }
      continue;
    }

    if (roll < 0.36) {
      const shot = tryShot(att, def, ctx.rng, ctx.roster);
      if (shot.kind === "turnover") {
        ctx.possession = def.side;
        continue;
      }
      if (shot.kind === "meta") {
        ctx.score[att.side] += 1;
        restoreAll(ctx.host);
        restoreAll(ctx.guest);
        ctx.possession = def.side;
        if (golden) {
          shot.text = shot.text.replace("appoggia la meta", "appoggia la meta d'oro");
        }
      }
      if (shot.kind === "parata") {
        ctx.possession = def.side;
      }
      pushEvent(ctx.events, {
        kind: shot.kind,
        t: ctx.t,
        score: ctx.score,
        side: shot.kind === "parata" ? def.side : att.side,
        actor: shot.actor,
        target: shot.target,
        text: shot.text,
        pauseMs: pauseMs(ctx.rng, shot.kind),
      });
      if (stopOnScore && shot.kind === "meta") {
        return true;
      }
      continue;
    }

    if (roll < 0.46) {
      ctx.possession = def.side;
    }
  }

  ctx.t = endAt;
  return false;
}

function leaderOf(score: MatchScore): Side | null {
  if (score.host === score.guest) {
    return null;
  }
  return score.host > score.guest ? "host" : "guest";
}

function extraTiebreak(
  scalpi: MatchSim["scalpi"],
  rng: Rng,
): { side: Side; text: string } {
  if (scalpi.host.pieni !== scalpi.guest.pieni) {
    const hostLeads = scalpi.host.pieni > scalpi.guest.pieni;
    return {
      side: hostLeads ? "host" : "guest",
      text: hostLeads
        ? "Più scalpi pieni in casa."
        : "Più scalpi pieni per gli ospiti.",
    };
  }
  if (scalpi.host.vuoti !== scalpi.guest.vuoti) {
    const hostFewer = scalpi.host.vuoti < scalpi.guest.vuoti;
    return {
      side: hostFewer ? "host" : "guest",
      text: hostFewer
        ? "Meno scalpi a vuoto in casa."
        : "Meno scalpi a vuoto per gli ospiti.",
    };
  }
  const side: Side = rng() < 0.5 ? "host" : "guest";
  return {
    side,
    text: side === "host" ? "Sorteggio: vincono i padroni di casa." : "Sorteggio: vincono gli ospiti.",
  };
}

function extraFinalText(t: number, goldenMeta: boolean, winnerName: string): string {
  if (goldenMeta || t > SILVER_END) {
    return `Fine partita. Meta d'oro. Vince ${winnerName}.`;
  }
  if (t > MATCH_SECONDS) {
    return `Fine partita. Meta d'argento. Vince ${winnerName}.`;
  }
  return "Fine partita.";
}

function goldenDecidedByMeta(events: readonly SimEvent[]): boolean {
  let start = -1;
  for (let i = 0; i < events.length; i += 1) {
    if (events[i]?.kind === "golden") {
      start = i;
    }
  }
  if (start < 0) {
    return false;
  }
  for (let i = start + 1; i < events.length; i += 1) {
    const kind = events[i]?.kind;
    if (kind === "meta" || kind === "meta-tecnica") {
      return true;
    }
  }
  return false;
}

function squadName(side: Side, hostName: string, guestName: string): string {
  return side === "host" ? hostName : guestName;
}

export function simulateMatch(input: SimulateInput): MatchSim {
  if (!isLineupReady(input.host, input.roster) || !isLineupReady(input.guest, input.roster)) {
    throw new Error("Formazioni non valide");
  }
  if (clashingSlugs(input.host, input.guest).length > 0) {
    throw new Error("Giocatori in comune");
  }

  const rng = rngFromSeed(`${input.seed}|${input.host.slots.join("~")}|${input.guest.slots.join("~")}`);
  const host = makeSquad("host", input.host, input.roster);
  const guest = makeSquad("guest", input.guest, input.roster);
  const score: MatchScore = { host: 0, guest: 0 };
  const scalpi = {
    host: { pieni: 0, vuoti: 0 },
    guest: { pieni: 0, vuoti: 0 },
  };
  const events: SimEvent[] = [];
  const kickoff: Side = rng() < 0.5 ? "host" : "guest";
  const ctx: PlayCtx = {
    t: 0,
    possession: kickoff,
    host,
    guest,
    score,
    scalpi,
    events,
    rng,
    roster: input.roster,
  };

  pushEvent(events, {
    kind: "inizio",
    t: ctx.t,
    score,
    side: kickoff,
    text: `Palla a ${kickoff === "host" ? host.name : guest.name}.`,
    pauseMs: 0,
  });

  playOpenPlay(ctx, HALF_SECONDS, false);
  ctx.t = HALF_SECONDS;
  resetHalf(host);
  resetHalf(guest);
  pushEvent(events, {
    kind: "intervallo",
    t: ctx.t,
    score,
    text: "Fine primo tempo. Intervallo.",
    pauseMs: INTERVAL_PAUSE_MS,
  });
  ctx.possession = other(kickoff);
  pushEvent(events, {
    kind: "secondo-tempo",
    t: ctx.t,
    score,
    side: ctx.possession,
    text: `Secondo tempo. Palla a ${ctx.possession === "host" ? host.name : guest.name}.`,
    pauseMs: 0,
  });
  playOpenPlay(ctx, MATCH_SECONDS, false);
  ctx.t = MATCH_SECONDS;
  let winner = leaderOf(score);

  if (!winner) {
    pushEvent(events, {
      kind: "supplementari",
      t: ctx.t,
      score,
      text: "Tempi supplementari. Meta d'argento.",
      pauseMs: INTERVAL_PAUSE_MS,
    });
    playOpenPlay(ctx, SILVER_END, false);
    ctx.t = SILVER_END;
    winner = leaderOf(score);
  }

  if (!winner) {
    pushEvent(events, {
      kind: "golden",
      t: ctx.t,
      score,
      text: "Secondo supplementare. Meta d'oro.",
      pauseMs: MIN_PAUSE_MS,
    });
    const goldenMeta = playOpenPlay(ctx, GOLDEN_END, true);
    if (!goldenMeta) {
      ctx.t = GOLDEN_END;
    }
    winner = leaderOf(score);
  }

  if (!winner) {
    const decided = extraTiebreak(scalpi, ctx.rng);
    winner = decided.side;
    pushEvent(events, {
      kind: "fine",
      t: ctx.t,
      score,
      side: winner,
      text: `Fine partita. ${decided.text}`,
      pauseMs: 0,
    });
  } else {
    pushEvent(events, {
      kind: "fine",
      t: ctx.t,
      score,
      side: winner,
      text: extraFinalText(ctx.t, goldenDecidedByMeta(events), squadName(winner, host.name, guest.name)),
      pauseMs: 0,
    });
  }

  return {
    seed: input.seed,
    hostName: host.name,
    guestName: guest.name,
    events,
    score: { ...score },
    winner,
    scalpi,
  };
}

export type PlaybackFrame = {
  t: number;
  clock: string;
  event: SimEvent | null;
  index: number;
  paused: boolean;
  done: boolean;
};

export function nextPeriodT(t: number): number {
  if (t < HALF_SECONDS) {
    return HALF_SECONDS;
  }
  if (t < MATCH_SECONDS) {
    return MATCH_SECONDS;
  }
  if (t < SILVER_END) {
    return SILVER_END;
  }
  return GOLDEN_END;
}

export function wallMsAt(match: MatchSim, gameT: number, reducedMotion = false): number {
  const target = Math.max(0, gameT);
  if (reducedMotion) {
    let acc = 0;
    for (const event of match.events) {
      if (event.t >= target) {
        return acc;
      }
      acc += reducedDwell(event);
    }
    return acc;
  }

  let wall = 0;
  let prevT = 0;
  for (const event of match.events) {
    if (target <= event.t) {
      return wall + (target - prevT) * MS_PER_GAME_SECOND;
    }
    wall += (event.t - prevT) * MS_PER_GAME_SECOND + event.pauseMs;
    prevT = event.t;
  }
  return wall;
}

export function totalPlaybackMs(match: MatchSim, reducedMotion = false): number {
  if (reducedMotion) {
    return match.events.reduce((sum, event) => sum + reducedDwell(event), 0);
  }

  let wall = 0;
  let prevT = 0;
  for (const event of match.events) {
    wall += (event.t - prevT) * MS_PER_GAME_SECOND;
    wall += event.pauseMs;
    prevT = event.t;
  }
  return wall;
}

export function playbackAt(match: MatchSim, wallMs: number, reducedMotion = false): PlaybackFrame {
  const events = match.events;
  if (events.length === 0) {
    return emptyFrame();
  }

  if (reducedMotion) {
    let acc = 0;
    for (let i = 0; i < events.length; i += 1) {
      const event = events[i]!;
      const dwell = reducedDwell(event);
      if (wallMs < acc + dwell) {
        return {
          t: event.t,
          clock: event.clock,
          event,
          index: i,
          paused: event.pauseMs > 0,
          done: false,
        };
      }
      acc += dwell;
    }
    return lastFrame(events, true);
  }

  let wall = 0;
  let prevT = 0;
  let lastEvent: SimEvent | null = null;
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]!;
    const travel = (event.t - prevT) * MS_PER_GAME_SECOND;
    if (wallMs < wall + travel) {
      const t = prevT + (wallMs - wall) / MS_PER_GAME_SECOND;
      return {
        t,
        clock: matchClock(t).label,
        event: lastEvent,
        index: i - 1,
        paused: false,
        done: false,
      };
    }
    wall += travel;
    if (wallMs < wall + event.pauseMs) {
      return {
        t: event.t,
        clock: event.clock,
        event,
        index: i,
        paused: event.pauseMs > 0,
        done: false,
      };
    }
    wall += event.pauseMs;
    prevT = event.t;
    lastEvent = event;
  }

  return lastFrame(events, true);
}

function emptyFrame(): PlaybackFrame {
  return {
    t: 0,
    clock: matchClock(0).label,
    event: null,
    index: -1,
    paused: false,
    done: true,
  };
}

function lastFrame(events: SimEvent[], done: boolean): PlaybackFrame {
  const last = events[events.length - 1]!;
  return {
    t: last.t,
    clock: last.clock,
    event: last,
    index: events.length - 1,
    paused: false,
    done,
  };
}

function reducedDwell(event: SimEvent): number {
  if (event.pauseMs > 0) {
    return Math.min(event.pauseMs, 500);
  }
  return 280;
}

function makeSquad(side: Side, lineup: Lineup, roster: readonly Player[]): SquadState {
  return {
    side,
    name: lineupLabel(lineup),
    slots: lineup.slots.map((slug, slot) => {
      const player = roster.find((entry) => entry.slug === slug);
      if (!player) {
        throw new Error("Giocatore assente");
      }
      return {
        player,
        stats: effectiveStats(player, lineup.formation, slot),
        onField: true,
        emptyThisHalf: 0,
      };
    }),
  };
}

function resetHalf(squad: SquadState) {
  for (const slot of squad.slots) {
    slot.onField = true;
    slot.emptyThisHalf = 0;
  }
}

function restoreAll(squad: SquadState) {
  for (const slot of squad.slots) {
    slot.onField = true;
  }
}

function tryScalp(att: SquadState, def: SquadState, rng: Rng, roster: readonly Player[]) {
  const attackers = outfield(att);
  const defenders = outfield(def);
  if (attackers.length === 0 || defenders.length === 0) {
    return null;
  }

  const actorSlot = pick(rng, defenders);
  const actor = def.slots[actorSlot]!;
  const onCarrier = rng() < 0.58;
  const targetSlot = onCarrier ? pick(rng, attackers) : pick(rng, attackers);
  const target = att.slots[targetSlot]!;

  if (onCarrier) {
    const p =
      0.28 +
      (actor.stats.scalpo - target.stats.velocita * 0.55 - target.stats.salto * 0.25) / 260;
    if (rng() > clamp(p, 0.12, 0.5)) {
      return null;
    }
    target.onField = false;
    return {
      kind: "scalpo-pieno" as const,
      actor: actor.player.slug,
      target: target.player.slug,
      actorSlot,
      exited: false,
      text: `${labelOf(actor.player, roster)} scalpa pieno ${labelOf(target.player, roster)}`,
    };
  }

  actor.emptyThisHalf += 1;
  const exited = actor.emptyThisHalf >= EMPTY_SCALPS_TO_EXIT;
  if (exited) {
    actor.onField = false;
  }
  return {
    kind: "scalpo-vuoto" as const,
    actor: actor.player.slug,
    target: target.player.slug,
    actorSlot,
    exited,
    text: `${labelOf(actor.player, roster)} scalpo a vuoto su ${labelOf(target.player, roster)}`,
  };
}

function tryShot(att: SquadState, def: SquadState, rng: Rng, roster: readonly Player[]) {
  const attackers = outfield(att);
  const shooterSlot = attackers.length === 0 ? KEEPER_SLOT : attackers[attackers.length - 1]!;
  const shooter = att.slots[shooterSlot]!;
  const keeper = def.slots[KEEPER_SLOT]!;
  const cover = outfield(def).reduce((best, slot) => {
    return Math.max(best, def.slots[slot]!.stats.intercetto);
  }, keeper.stats.intercetto);

  const attack = shooter.stats.finalizzazione * 0.62 + shooter.stats.velocita * 0.2 + shooter.stats.salto * 0.18;
  const defense = keeper.stats.gk * 0.72 + cover * 0.28;
  const pMeta = clamp(0.22 + (attack - defense) / 280, 0.14, 0.48);
  const pSave = clamp(0.2 + keeper.stats.gk / 520, 0.16, 0.36);

  const roll = rng();
  if (roll < pMeta) {
    return {
      kind: "meta" as const,
      actor: shooter.player.slug,
      target: keeper.player.slug,
      text: `${labelOf(shooter.player, roster)} appoggia la meta`,
    };
  }
  if (roll < pMeta + pSave) {
    return {
      kind: "parata" as const,
      actor: keeper.player.slug,
      target: shooter.player.slug,
      text: `${labelOf(keeper.player, roster)} impedisce la meta di ${labelOf(shooter.player, roster)}`,
    };
  }
  return { kind: "turnover" as const, actor: shooter.player.slug, text: "" };
}

function outfield(squad: SquadState): number[] {
  const slots: number[] = [];
  for (let i = 0; i < squad.slots.length; i += 1) {
    if (i === KEEPER_SLOT) {
      continue;
    }
    if (squad.slots[i]?.onField) {
      slots.push(i);
    }
  }
  return slots;
}

function pushEvent(
  events: SimEvent[],
  draft: {
    kind: SimKind;
    t: number;
    score: MatchScore;
    text: string;
    pauseMs: number;
    side?: Side;
    actor?: string;
    target?: string;
  },
) {
  const clock = matchClock(draft.t);
  events.push({
    kind: draft.kind,
    t: draft.t,
    half: clock.half,
    clock: clock.label,
    side: draft.side,
    actor: draft.actor,
    target: draft.target,
    pauseMs: draft.pauseMs,
    score: { ...draft.score },
    text: draft.text,
  });
}

function pauseMs(rng: Rng, kind: SimKind): number {
  if (!PAUSE_KINDS.has(kind)) {
    return 0;
  }
  return Math.round(lerp(rng(), MIN_PAUSE_MS, MAX_PAUSE_MS));
}

function labelOf(player: Player, roster: readonly Player[]): string {
  return playerLabel(player, roster);
}

function other(side: Side): Side {
  return side === "host" ? "guest" : "host";
}

function pick(rng: Rng, items: readonly number[]): number {
  return items[Math.floor(rng() * items.length)] ?? items[0] ?? 0;
}

function lerp(t: number, min: number, max: number): number {
  return min + t * (max - min);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function scaleStat(value: number, factor: number): number {
  return Math.max(1, Math.round(value * factor));
}

function rngFromSeed(seed: string): Rng {
  let a = fnv1a(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fnv1a(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
