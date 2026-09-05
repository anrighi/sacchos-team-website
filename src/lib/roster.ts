import { STAT_KEYS, TEAMS, type Player, type PlayerStats, type Role, type Sex, type TeamName } from "#/lib/player";

const STAT_MIN = 75;
const STAT_MAX = 100;
const STAT_DEFAULT = 75;

export type RosterFilters = {
  team?: "sacchos" | "saccios";
  role?: Role;
  appearances?: "none" | "some";
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

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
    const firstName = cell(row, "firstName", "nome");
    const numberRaw = cell(row, "number", "numero");
    if (!firstName || numberRaw === "") {
      continue;
    }
    const number = Number(numberRaw);
    if (!Number.isFinite(number)) {
      continue;
    }

    const sex = parseSex(cell(row, "sex", "sesso"));
    if (!sex) {
      continue;
    }

    const nicknameRaw = cell(row, "nickname", "soprannome");
    const nickname = nicknameRaw || undefined;
    const stats = parseStats(row);
    const birthYearRaw = Number(cell(row, "birthYear", "anno"));
    const appearancesRaw = Number(cell(row, "appearances", "presenze"));

    players.push({
      slug: playerSlug(firstName, nickname, number, used),
      firstName,
      nickname,
      team: parseTeam(cell(row, "team", "squadra")),
      role: parseRole(cell(row, "role", "ruolo")),
      sex,
      number,
      birthYear: Number.isFinite(birthYearRaw) ? birthYearRaw : 0,
      appearances: Number.isFinite(appearancesRaw) ? Math.max(0, Math.round(appearancesRaw)) : 0,
      overall: overallFromStats(stats),
      stats,
    });
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
    if (filters.appearances === "none" && player.appearances !== 0) {
      return false;
    }
    if (filters.appearances === "some" && player.appearances < 1) {
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
    appearances: player.appearances,
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
  return row;
}

function parseStats(row: Record<string, string>): PlayerStats {
  const stats = {} as PlayerStats;
  for (const key of STAT_KEYS) {
    stats[key] = clampStat(row[key] ?? row[key.toUpperCase()]);
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
  const value = raw.trim().toUpperCase();
  if (value === "POR" || value === "PAL" || value === "CEN" || value === "ALA" || value === "PUN") {
    return value;
  }
  return undefined;
}

function parseSex(raw: string): Sex | undefined {
  const value = raw.trim().toUpperCase();
  if (value === "F" || value === "M") {
    return value;
  }
  return undefined;
}

function cell(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key] ?? row[key.toLowerCase()];
    if (value != null && value !== "") {
      return value.trim();
    }
  }
  return "";
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 2) {
    return [];
  }
  const headers = splitCsvRow(lines[0] ?? "").map((h) => h.trim());
  const rows: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    const fields = splitCsvRow(line);
    const row: Record<string, string> = {};
    for (let i = 0; i < headers.length; i += 1) {
      const header = headers[i];
      if (!header) {
        continue;
      }
      row[header] = fields[i] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

function splitCsvRow(row: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i += 1) {
    const ch = row[i];
    if (inQuotes) {
      if (ch === '"') {
        if (row[i + 1] === '"') {
          current += '"';
          i += 1;
          continue;
        }
        inQuotes = false;
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      fields.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  fields.push(current.trim());
  return fields;
}
