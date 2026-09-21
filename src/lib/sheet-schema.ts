import { foldHeader } from "#/lib/csv";
import { ROLE_LABELS, ROLES, type Role } from "#/lib/player";

export const SHEET_HEADERS = [
  "Nome",
  "Soprannome",
  "Numero",
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

export const SHEET_HAIR = [
  { value: "crocchia", trait: "bun", aliases: ["chignon"] },
  { value: "pettinati di lato", trait: "sideComed", aliases: ["piegata"] },
  { value: "a punte", trait: "spiky", aliases: ["irti"] },
  { value: "lati rasati", trait: "undercut" },
  { value: "nessuno", trait: "none" },
] as const;

export const SHEET_REAR_HAIR = [
  { value: "lunghi lisci", trait: "longStraight" },
  { value: "lunghi mossi", trait: "longWavy" },
  { value: "alla nuca", trait: "neckHigh", aliases: ["nuca"] },
  { value: "alle spalle", trait: "shoulderHigh", aliases: ["spalle"] },
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

export const STAT_SHEET_ALIASES = {
  velocita: ["velocita", "velocità", "vel"],
  salto: ["salto"],
  intercetto: ["intercetto"],
  scalpo: ["scalpo"],
  finalizzazione: ["finalizzazione"],
  gk: ["gk", "parate", "parata"],
} as const;

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
  rows: readonly { value: string; trait: string; aliases?: readonly string[] }[],
): Record<string, string> {
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[foldHeader(row.value)] = row.trait;
    map[foldHeader(row.trait)] = row.trait;
    for (const alias of row.aliases ?? []) {
      map[foldHeader(alias)] = row.trait;
    }
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
  const folded = foldHeader(value);
  for (const role of ROLES) {
    if (foldHeader(ROLE_LABELS[role]) === folded) {
      return role;
    }
  }
  return undefined;
}

export function parseSheetSex(raw: string): "F" | "M" | undefined {
  const folded = foldHeader(raw);
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
