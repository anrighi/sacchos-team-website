import { csvCell, csvEscape, parseCsv, slugify } from "#/lib/csv";
import { sheetHairColorLabel, sheetSkinColorLabel } from "#/lib/portrait";
import { parsePortraitTraits } from "#/lib/portraits";
import {
  parseSheetRole,
  parseSheetSex,
  SHEET_BEARD,
  SHEET_HAIR,
  SHEET_HEADERS,
  SHEET_REAR_HAIR,
  STAT_SHEET_ALIASES,
  sheetTraitLabel,
} from "#/lib/sheet-schema";
import {
  ROLE_LABELS,
  STAT_KEYS,
  TEAMS,
  type Player,
  type PlayerStats,
  type Role,
  type Sex,
  type TeamName,
} from "#/lib/player";

export { slugify } from "#/lib/csv";

const STAT_MIN = 60;
const STAT_MAX = 100;
const STAT_DEFAULT = 75;

export const OVERALL_MIN = 75;
export const OVERALL_MAX = 90;

export const SHEET_BALANCE_FORMULA = "=IFERROR(ROUND(AVERAGE(G2:L1000);1);\"\")";
export const SHEET_BALANCE_NOTE =
  "Fascia 75–90: la media delle sei stats di ogni giocatore deve stare tra 75 e 90. Fuori fascia, la build ricalibra (la singola stats resta 60–100, vuota = 75).";

export type RosterFilters = {
  team?: "sacchos" | "saccios";
  role?: Role;
};

export function displayName(player: Pick<Player, "firstName" | "nickname">) {
  if (player.nickname) {
    return player.nickname;
  }
  return player.firstName;
}

export function clampStat(value: unknown): number {
  if (value === "" || value == null) {
    return STAT_DEFAULT;
  }
  const n = typeof value === "number" ? value : Number(String(value).trim());
  if (!Number.isFinite(n)) {
    return STAT_DEFAULT;
  }
  return Math.min(STAT_MAX, Math.max(STAT_MIN, Math.round(n)));
}

export function overallFromStats(stats: PlayerStats): number {
  const sum = STAT_KEYS.reduce((acc, key) => acc + stats[key], 0);
  return Math.round(sum / STAT_KEYS.length);
}

export function rosterAverage(players: readonly Player[]): number {
  if (players.length === 0) {
    return STAT_DEFAULT;
  }
  const sum = players.reduce((acc, player) => acc + overallFromStats(player.stats), 0);
  return sum / players.length;
}

export function balancePlayerStats(stats: PlayerStats): PlayerStats {
  const next = {} as PlayerStats;
  for (const key of STAT_KEYS) {
    next[key] = clampStat(stats[key]);
  }
  const overall = overallFromStats(next);
  if (overall >= OVERALL_MIN && overall <= OVERALL_MAX) {
    return next;
  }
  const target = overall < OVERALL_MIN ? OVERALL_MIN : OVERALL_MAX;
  return distributeToOverall(next, target);
}

export function balanceRosterStats(players: Player[]): Player[] {
  return players.map((player) => {
    const stats = balancePlayerStats(player.stats);
    const overall = overallFromStats(stats);
    if (sameStats(stats, player.stats) && overall === player.overall) {
      return player;
    }
    return { ...player, stats, overall };
  });
}

function distributeToOverall(stats: PlayerStats, target: number): PlayerStats {
  const next = { ...stats };
  const targetSum = target * STAT_KEYS.length;
  let sum = STAT_KEYS.reduce((acc, key) => acc + next[key], 0);

  while (sum < targetSum) {
    const key = nextRaiseKey(next);
    if (!key) {
      break;
    }
    next[key] += 1;
    sum += 1;
  }

  while (sum > targetSum) {
    const key = nextLowerKey(next);
    if (!key) {
      break;
    }
    next[key] -= 1;
    sum -= 1;
  }

  return next;
}

function nextRaiseKey(stats: PlayerStats): (typeof STAT_KEYS)[number] | undefined {
  const preferred = STAT_KEYS.find(
    (key) => stats[key] >= STAT_DEFAULT && stats[key] < STAT_MAX,
  );
  if (preferred) {
    return preferred;
  }
  return STAT_KEYS.find((key) => stats[key] < STAT_MAX);
}

function nextLowerKey(stats: PlayerStats): (typeof STAT_KEYS)[number] | undefined {
  let best: (typeof STAT_KEYS)[number] | undefined;
  for (const key of STAT_KEYS) {
    if (stats[key] <= STAT_MIN) {
      continue;
    }
    if (!best || stats[key] > stats[best]) {
      best = key;
    }
  }
  return best;
}

function sameStats(left: PlayerStats, right: PlayerStats): boolean {
  return STAT_KEYS.every((key) => left[key] === right[key]);
}

export function playerSlug(
  firstName: string,
  nickname: string | undefined,
  number: number,
  used: Set<string>,
): string {
  const base = slugify(firstName) || "giocatore";
  const candidates = [
    nickname ? `${base}-${slugify(nickname)}` : "",
    `${base}-${number}`,
  ];
  for (const candidate of candidates) {
    if (!candidate || used.has(candidate)) {
      continue;
    }
    used.add(candidate);
    return candidate;
  }
  let i = 2;
  while (used.has(`${base}-${number}-${i}`)) {
    i += 1;
  }
  const fallback = `${base}-${number}-${i}`;
  used.add(fallback);
  return fallback;
}

export function parseRosterCsv(csv: string): Player[] {
  const rows = parseCsv(csv);
  const used = new Set<string>();
  const players: Player[] = [];

  for (const row of rows) {
    const firstName = csvCell(row, "firstName", "nome");
    const numberRaw = csvCell(row, "number", "numero");
    if (!firstName || numberRaw === "") {
      continue;
    }
    const number = Number(numberRaw);
    if (!Number.isFinite(number)) {
      continue;
    }

    const sex = parseSex(csvCell(row, "sex", "sesso"));
    if (!sex) {
      continue;
    }

    const nicknameRaw = csvCell(row, "nickname", "soprannome");
    const nickname = nicknameRaw || undefined;
    const stats = parseStats(row);
    const portrait = parsePortraitTraits(row);

    const player: Player = {
      slug: playerSlug(firstName, nickname, number, used),
      firstName,
      nickname,
      team: parseTeam(csvCell(row, "team", "squadra")),
      role: parseRole(csvCell(row, "role", "ruolo")),
      sex,
      number,
      overall: overallFromStats(stats),
      stats,
    };
    if (portrait) {
      player.portrait = portrait;
    }
    players.push(player);
  }

  return players;
}

export function filterPlayers(players: readonly Player[], filters: RosterFilters): Player[] {
  return players.filter((player) => {
    if (filters.team === "sacchos" && player.team !== "Saccho's Team") {
      return false;
    }
    if (filters.team === "saccios" && player.team !== "Saccios Tim") {
      return false;
    }
    if (filters.role && player.role !== filters.role) {
      return false;
    }
    return true;
  });
}

export function serializeSheetCsv(players: readonly Player[]): string {
  const lines = [SHEET_HEADERS.join(",")];
  for (const player of players) {
    const traits = player.portrait ?? {};
    lines.push(
      [
        player.firstName,
        player.nickname ?? "",
        String(player.number),
        player.team,
        player.sex === "F" ? "Femmina" : "Maschio",
        player.role ? ROLE_LABELS[player.role] : "",
        ...STAT_KEYS.map((key) => String(player.stats[key])),
        sheetTraitLabel(SHEET_HAIR, traits.hair),
        sheetTraitLabel(SHEET_REAR_HAIR, traits.rearHair),
        sheetHairColorLabel(traits.hairColor),
        sheetSkinColorLabel(traits.skinColor),
        sheetTraitLabel(SHEET_BEARD, traits.beard),
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function serializePlayer(player: Player): Player {
  const row: Player = {
    slug: player.slug,
    firstName: player.firstName,
    team: player.team,
    sex: player.sex,
    number: player.number,
    overall: player.overall,
    stats: player.stats,
  };
  if (player.nickname) {
    row.nickname = player.nickname;
  }
  if (player.role) {
    row.role = player.role;
  }
  if (player.photo) {
    row.photo = player.photo;
  }
  if (player.portrait && Object.keys(player.portrait).length > 0) {
    row.portrait = player.portrait;
  }
  return row;
}

function parseStats(row: Record<string, string>): PlayerStats {
  const stats = {} as PlayerStats;
  for (const key of STAT_KEYS) {
    stats[key] = clampStat(csvCell(row, key, ...STAT_SHEET_ALIASES[key]));
  }
  return stats;
}

function parseTeam(raw: string): TeamName {
  const normalized = raw.toLowerCase().replace(/['’]/g, "");
  if (normalized.includes("saccios")) {
    return "Saccios Tim";
  }
  return TEAMS[0];
}

function parseRole(raw: string): Role | undefined {
  return parseSheetRole(raw);
}

function parseSex(raw: string): Sex | undefined {
  return parseSheetSex(raw);
}
