import { foldHeader } from "#/lib/csv";
import { ROLE_LABELS, ROLES, TEAMS, type Role } from "#/lib/player";

export const SHEET_HEADERS = [
  "Nome",
  "Soprannome",
  "Numero",
  "Anno",
  "Squadra",
  "Sesso",
  "Ruolo",
  "Velocità",
  "Salto",
  "Intercetto",
  "Scalpo",
  "Finalizzazione",
  "Parate",
  "Capelli",
  "Capelli dietro",
  "Colore capelli",
  "Carnagione",
  "Barba",
] as const;

export const SHEET_TEAMS = [...TEAMS] as const;
export const SHEET_SEX = ["Femmina", "Maschio"] as const;
export const SHEET_ROLES = ROLES.map((role) => ROLE_LABELS[role]);

export const SHEET_HAIR = [
  { value: "chignon", trait: "bun" },
  { value: "piegata", trait: "sideComed" },
  { value: "irti", trait: "spiky" },
  { value: "undercut", trait: "undercut" },
  { value: "nessuno", trait: "none" },
] as const;

export const SHEET_REAR_HAIR = [
  { value: "lunghi lisci", trait: "longStraight" },
  { value: "lunghi mossi", trait: "longWavy" },
  { value: "nuca", trait: "neckHigh" },
  { value: "spalle", trait: "shoulderHigh" },
  { value: "nessuno", trait: "none" },
] as const;

export const SHEET_BEARD = [
  { value: "pizzo", trait: "chin" },
  { value: "pizzo e baffi", trait: "chinMoustache" },
  { value: "barba", trait: "fullBeard" },
  { value: "barba lunga", trait: "longBeard" },
  { value: "baffi", trait: "moustacheTwirl" },
  { value: "nessuno", trait: "none" },
] as const;

export const SHEET_HAIR_COLORS = ["nero", "castano", "biondo"] as const;
export const SHEET_SKIN_COLORS = ["scura", "media", "chiara"] as const;

export const DEFAULT_HAIR_COLOR_KEYS = ["black", "brown", "blonde"] as const;
export const DEFAULT_SKIN_COLOR_KEYS = ["deep", "medium", "light"] as const;

export const STAT_SHEET_ALIASES = {
  velocita: ["velocita", "velocità", "vel"],
  salto: ["salto"],
  intercetto: ["intercetto"],
  scalpo: ["scalpo"],
  finalizzazione: ["finalizzazione"],
  gk: ["gk", "parate", "parata"],
} as const;

export function sheetValues(rows: readonly { value: string }[]): string[] {
  return rows.map((row) => row.value);
}

export function sheetTraitLabel(
  rows: readonly { value: string; trait: string }[],
  trait: string | undefined,
): string {
  if (!trait) {
    return "";
  }
  if (trait === "none") {
    return "nessuno";
  }
  const match = rows.find((row) => row.trait === trait || row.value === trait);
  return match?.value ?? "";
}

export function variantAliasMap(
  rows: readonly { value: string; trait: string }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[foldHeader(row.value)] = row.trait;
    map[foldHeader(row.trait)] = row.trait;
  }
  return map;
}

export function parseSheetRole(raw: string): Role | undefined {
  const value = raw.trim();
  if (!value) {
    return undefined;
  }
  const code = value.toUpperCase();
  if ((ROLES as readonly string[]).includes(code)) {
    return code as Role;
  }
  const folded = foldLabel(value);
  if (folded === "palo" || folded === "palleggiatore") {
    return "PAL";
  }
  for (const role of ROLES) {
    if (foldLabel(ROLE_LABELS[role]) === folded) {
      return role;
    }
  }
  return undefined;
}

export function parseSheetSex(raw: string): "F" | "M" | undefined {
  const folded = foldLabel(raw);
  if (!folded) {
    return undefined;
  }
  if (folded === "f" || folded === "femmina" || folded === "donna") {
    return "F";
  }
  if (folded === "m" || folded === "maschio" || folded === "uomo") {
    return "M";
  }
  return undefined;
}

function foldLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}
