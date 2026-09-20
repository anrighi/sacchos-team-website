import { csvCell, parseCsv, slugify } from "#/lib/csv";
import { parsePortraitTraits } from "#/lib/portraits";
import { parseSheetRole, parseSheetSex, STAT_SHEET_ALIASES } from "#/lib/sheet-schema";
import { STAT_KEYS, TEAMS, type Player, type PlayerStats, type Role, type Sex, type TeamName } from "#/lib/player";

export { slugify } from "#/lib/csv";

const STAT_MIN = 75;
const STAT_MAX = 100;
const STAT_DEFAULT = 75;

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
    const birthYearRaw = Number(csvCell(row, "birthYear", "anno"));
    const portrait = parsePortraitTraits(row);

    const player: Player = {
      slug: playerSlug(firstName, nickname, number, used),
      firstName,
      nickname,
      team: parseTeam(csvCell(row, "team", "squadra")),
      role: parseRole(csvCell(row, "role", "ruolo")),
      sex,
      number,
      birthYear: Number.isFinite(birthYearRaw) ? birthYearRaw : 0,
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

export function serializePlayer(player: Player): Player {
  const row: Player = {
    slug: player.slug,
    firstName: player.firstName,
    team: player.team,
    sex: player.sex,
    number: player.number,
    birthYear: player.birthYear,
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
