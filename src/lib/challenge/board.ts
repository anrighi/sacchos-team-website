import { SQUAD_SIZE } from "#/lib/challenge/formation";
import type { Lineup } from "#/lib/challenge/lineup";
import { EMPTY_SCALPS_TO_EXIT, type MatchSim, type Side, type SimEvent, type SimKind } from "#/lib/challenge/sim";

export type Token = {
  slug: string;
  side: Side;
  slot: number;
  onField: boolean;
  highlight: boolean;
  vuoti: number;
  callout?: string;
};

export type BoardFlash = {
  kind: SimKind;
  label: string;
  side?: Side;
} | null;

export type BoardFrame = {
  tokens: Token[];
  flash: BoardFlash;
};

export type BoardInput = {
  host: Lineup;
  guest: Lineup;
  match: MatchSim;
  index: number;
};

export function boardAt(input: BoardInput): BoardFrame {
  return poseAt(input.host, input.guest, input.match.events, input.index);
}

export function poseAt(
  host: Lineup,
  guest: Lineup,
  events: readonly SimEvent[],
  index: number,
): BoardFrame {
  const event = index >= 0 ? events[Math.min(index, events.length - 1)] ?? null : null;
  const live = occupancyAfter(host, guest, events, index);
  const vuoti = vuotiAfter(host, guest, events, index);
  const flash = flashFor(event);
  const tokens = [
    ...sideTokens(host, "host", live, vuoti, event, flash),
    ...sideTokens(guest, "guest", live, vuoti, event, flash),
  ];

  return { tokens, flash };
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

function vuotiAfter(
  host: Lineup,
  guest: Lineup,
  events: readonly SimEvent[],
  lastInclusive: number,
): Map<string, number> {
  const vuoti = new Map<string, number>();
  for (const slug of [...host.slots, ...guest.slots]) {
    if (slug) {
      vuoti.set(slug, 0);
    }
  }

  for (let i = 0; i <= lastInclusive; i += 1) {
    const event = events[i];
    if (!event) {
      continue;
    }

    if (event.kind === "intervallo" || event.kind === "secondo-tempo") {
      for (const slug of vuoti.keys()) {
        vuoti.set(slug, 0);
      }
      continue;
    }

    if (event.kind === "scalpo-vuoto" && event.actor) {
      const next = Math.min(EMPTY_SCALPS_TO_EXIT, (vuoti.get(event.actor) ?? 0) + 1);
      vuoti.set(event.actor, next);
    }
  }

  return vuoti;
}

function sideTokens(
  lineup: Lineup,
  side: Side,
  live: Map<string, boolean>,
  vuoti: Map<string, number>,
  event: SimEvent | null,
  flash: BoardFlash,
): Token[] {
  const tokens: Token[] = [];

  for (let slot = 0; slot < SQUAD_SIZE; slot += 1) {
    const slug = lineup.slots[slot];
    if (!slug) {
      continue;
    }

    const highlight = isHighlighted(slug, slot, side, event);
    tokens.push({
      slug,
      side,
      slot,
      onField: live.get(slug) !== false,
      highlight,
      vuoti: vuoti.get(slug) ?? 0,
      callout: highlight ? calloutFor(slug, event, flash) : undefined,
    });
  }

  return tokens;
}

function isHighlighted(slug: string, slot: number, side: Side, event: SimEvent | null): boolean {
  if (!event) {
    return false;
  }
  if (event.actor === slug || event.target === slug) {
    return true;
  }
  if (
    (event.kind === "inizio" || event.kind === "secondo-tempo") &&
    event.side === side &&
    slot === SQUAD_SIZE - 1
  ) {
    return true;
  }
  return false;
}

function calloutFor(slug: string, event: SimEvent | null, flash: BoardFlash): string | undefined {
  if (!event || !flash) {
    return undefined;
  }
  if (event.target === slug && event.actor !== slug) {
    if (event.kind === "scalpo-pieno") {
      return "Scalpato";
    }
    if (event.kind === "parata") {
      return "Meta tentata";
    }
    return undefined;
  }
  return flash.label;
}

function isGoldenClock(event: SimEvent): boolean {
  return event.clock.startsWith("GO");
}

function flashFor(event: SimEvent | null): BoardFlash {
  if (!event) {
    return null;
  }
  if (event.kind === "inizio" || event.kind === "secondo-tempo") {
    return { kind: event.kind, label: "Palla", side: event.side };
  }
  if (event.kind === "supplementari") {
    return { kind: event.kind, label: "Meta d'argento", side: event.side };
  }
  if (event.kind === "golden") {
    return { kind: event.kind, label: "Meta d'oro", side: event.side };
  }
  if (event.kind === "meta") {
    return {
      kind: event.kind,
      label: isGoldenClock(event) ? "Meta d'oro" : "Meta",
      side: event.side,
    };
  }
  if (event.kind === "meta-tecnica") {
    return {
      kind: event.kind,
      label: isGoldenClock(event) ? "Meta d'oro tecnica" : "Meta tecnica",
      side: event.side,
    };
  }
  if (event.kind === "parata") {
    return { kind: event.kind, label: "Impedisce la meta", side: event.side };
  }
  if (event.kind === "scalpo-pieno") {
    return { kind: event.kind, label: "Scalpo pieno", side: event.side };
  }
  if (event.kind === "scalpo-vuoto") {
    return { kind: event.kind, label: "Scalpo a vuoto", side: event.side };
  }
  return null;
}
