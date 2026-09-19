import type { Player, Sex } from "#/lib/player";
import { displayName } from "#/lib/roster";
import {
  DEFAULT_FORMATION,
  KEEPER_SLOT,
  MIN_PER_SEX,
  SQUAD_SIZE,
  type FormationId,
} from "#/lib/challenge/formation";

export const MAX_NAME_LENGTH = 24;

export type Slot = string | null;

export type Lineup = {
  name: string;
  formation: FormationId;
  slots: Slot[];
};

export type LineupIssue =
  | "name"
  | "count"
  | "keeper"
  | "sex"
  | "duplicate"
  | "unknown";

export const ISSUE_MESSAGES: Record<LineupIssue, string> = {
  name: "Dai un nome alla rosa",
  count: `Servono ${SQUAD_SIZE} titolari`,
  keeper: "Il portiere è obbligatorio",
  sex: `Almeno ${MIN_PER_SEX} ragazze e ${MIN_PER_SEX} ragazzi in campo`,
  duplicate: "Lo stesso giocatore è schierato due volte",
  unknown: "Un giocatore schierato non è più in rosa",
};

export function emptyLineup(formation: FormationId = DEFAULT_FORMATION): Lineup {
  return { name: "", formation, slots: Array.from({ length: SQUAD_SIZE }, () => null) };
}

export function normalizeName(raw: string): string {
  return raw.replace(/[~|]/g, " ").replace(/\s+/g, " ").trim().slice(0, MAX_NAME_LENGTH);
}

export function withPlayerAt(lineup: Lineup, slot: number, slug: string | null): Lineup {
  if (slot < 0 || slot >= SQUAD_SIZE) {
    return lineup;
  }
  const slots = lineup.slots.map((current, index) => {
    if (index === slot) {
      return slug;
    }
    return current === slug ? null : current;
  });
  return { ...lineup, slots };
}

export function withFormation(lineup: Lineup, formation: FormationId): Lineup {
  return { ...lineup, formation };
}

export function lineupSlugs(lineup: Lineup): string[] {
  return lineup.slots.filter((slot): slot is string => Boolean(slot));
}

export function lineupPlayers(lineup: Lineup, roster: readonly Player[]): (Player | null)[] {
  return lineup.slots.map((slug) => (slug ? findPlayer(roster, slug) : null));
}

export function findPlayer(roster: readonly Player[], slug: string): Player | null {
  return roster.find((player) => player.slug === slug) ?? null;
}

export function countBySex(players: readonly Player[]): Record<Sex, number> {
  return players.reduce(
    (acc, player) => ({ ...acc, [player.sex]: acc[player.sex] + 1 }),
    { F: 0, M: 0 } as Record<Sex, number>,
  );
}

export function lineupIssues(lineup: Lineup, roster: readonly Player[]): LineupIssue[] {
  const issues: LineupIssue[] = [];
  const slugs = lineupSlugs(lineup);

  if (!normalizeName(lineup.name)) {
    issues.push("name");
  }
  if (slugs.length !== SQUAD_SIZE) {
    issues.push("count");
  }
  if (!lineup.slots[KEEPER_SLOT]) {
    issues.push("keeper");
  }
  if (new Set(slugs).size !== slugs.length) {
    issues.push("duplicate");
  }

  const picked = slugs.map((slug) => findPlayer(roster, slug));
  if (picked.some((player) => !player)) {
    issues.push("unknown");
  }

  const present = picked.filter((player): player is Player => Boolean(player));
  const bySex = countBySex(present);
  if (bySex.F < MIN_PER_SEX || bySex.M < MIN_PER_SEX) {
    issues.push("sex");
  }

  return issues;
}

export function isLineupReady(lineup: Lineup, roster: readonly Player[]): boolean {
  return lineupIssues(lineup, roster).length === 0;
}

export function clashingSlugs(host: Lineup, guest: Lineup): string[] {
  const taken = new Set(lineupSlugs(host));
  return lineupSlugs(guest).filter((slug) => taken.has(slug));
}

export function lineupLabel(lineup: Lineup): string {
  return normalizeName(lineup.name) || "Sfidante";
}

export function playerLabel(player: Player, roster: readonly Player[]): string {
  const name = displayName(player);
  const sameName = roster.filter((other) => displayName(other) === name);
  if (sameName.length < 2) {
    return name;
  }
  return `${name} ${player.number}`;
}

export function canRandomLineup(
  roster: readonly Player[],
  blocked: ReadonlySet<string> = new Set(),
): boolean {
  const pool = roster.filter((player) => !blocked.has(player.slug));
  if (pool.length < SQUAD_SIZE) {
    return false;
  }
  const bySex = countBySex(pool);
  return bySex.F >= MIN_PER_SEX && bySex.M >= MIN_PER_SEX;
}

export function randomLineup(
  lineup: Lineup,
  roster: readonly Player[],
  blocked: ReadonlySet<string> = new Set(),
  rng: () => number = Math.random,
): Lineup {
  if (!canRandomLineup(roster, blocked)) {
    return lineup;
  }

  const pool = roster.filter((player) => !blocked.has(player.slug));
  const picked = takeBalancedSeven(pool, rng);
  const keeper = picked.find((player) => player.role === "POR") ?? picked[0]!;
  const outfield = picked.filter((player) => player.slug !== keeper.slug);
  return { ...lineup, slots: [keeper.slug, ...outfield.map((player) => player.slug)] };
}

function takeBalancedSeven(pool: readonly Player[], rng: () => number): Player[] {
  const women = shuffle(
    pool.filter((player) => player.sex === "F"),
    rng,
  );
  const men = shuffle(
    pool.filter((player) => player.sex === "M"),
    rng,
  );
  const picked: Player[] = [women[0]!, women[1]!, men[0]!, men[1]!];
  const rest = shuffle([...women.slice(2), ...men.slice(2)], rng);
  for (let i = 0; i < rest.length && picked.length < SQUAD_SIZE; i += 1) {
    picked.push(rest[i]!);
  }
  return shuffle(picked, rng);
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = next[i]!;
    next[i] = next[j]!;
    next[j] = tmp;
  }
  return next;
}
