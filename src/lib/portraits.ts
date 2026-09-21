import { csvCell, csvEscape, foldHeader, parseCsv, slugify } from "#/lib/csv";
import type { Player, PortraitTraits } from "#/lib/player";
import {
  BEARD_VARIANTS,
  HAIR_VARIANTS,
  REAR_HAIR_VARIANTS,
  resolveHairColor,
  resolveSkinColor,
  sheetHairColorLabel,
  sheetSkinColorLabel,
} from "#/lib/portrait";
import { SHEET_BEARD, SHEET_HAIR, SHEET_REAR_HAIR, variantAliasMap } from "#/lib/sheet-schema";

const HEADERS = {
  hair: ["hair", "capelli"],
  rearHair: ["rearHair", "capelliDietro", "capelli dietro"],
  hairColor: ["hairColor", "coloreCapelli", "colore capelli"],
  skinColor: ["skinColor", "carnagione"],
  beard: ["beard", "barba"],
} as const;

const HAIR_ALIASES = variantAliasMap(SHEET_HAIR);
const REAR_HAIR_ALIASES = variantAliasMap(SHEET_REAR_HAIR);
const BEARD_ALIASES = variantAliasMap(SHEET_BEARD);

export function parsePortraitTraits(row: Record<string, string>): PortraitTraits | undefined {
  const traits: PortraitTraits = {};
  assignVariant(traits, "hair", csvCell(row, ...HEADERS.hair), HAIR_VARIANTS, HAIR_ALIASES);
  assignVariant(
    traits,
    "rearHair",
    csvCell(row, ...HEADERS.rearHair),
    REAR_HAIR_VARIANTS,
    REAR_HAIR_ALIASES,
  );
  assignVariant(traits, "beard", csvCell(row, ...HEADERS.beard), BEARD_VARIANTS, BEARD_ALIASES);

  const hairColor = resolveHairColor(csvCell(row, ...HEADERS.hairColor));
  if (hairColor) {
    traits.hairColor = hairColor;
  }
  const skinColor = resolveSkinColor(csvCell(row, ...HEADERS.skinColor));
  if (skinColor) {
    traits.skinColor = skinColor;
  }

  if (Object.keys(traits).length === 0) {
    return undefined;
  }
  return traits;
}

export function parsePortraitsCsv(csv: string): Map<string, PortraitTraits> {
  const byKey = new Map<string, PortraitTraits>();
  for (const row of parseCsv(csv)) {
    const traits = parsePortraitTraits(row);
    if (!traits) {
      continue;
    }
    const slug = csvCell(row, "slug");
    if (slug) {
      byKey.set(slug, traits);
      continue;
    }
    const firstName = csvCell(row, "firstName", "nome");
    const number = csvCell(row, "number", "numero");
    if (!firstName || number === "") {
      continue;
    }
    const team = csvCell(row, "team", "squadra");
    byKey.set(portraitMatchKey(firstName, number, team || undefined), traits);
  }
  return byKey;
}

export function serializePortraitsCsv(players: readonly Player[]): string {
  const header = "slug,firstName,number,team,hair,rearHair,hairColor,skinColor,beard";
  const lines = [header];
  for (const player of players) {
    const traits = player.portrait ?? {};
    lines.push(
      [
        player.slug,
        player.firstName,
        String(player.number),
        player.team,
        traits.hair ?? "",
        traits.rearHair ?? "",
        sheetHairColorLabel(traits.hairColor),
        sheetSkinColorLabel(traits.skinColor),
        traits.beard ?? "",
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  return `${lines.join("\n")}\n`;
}

export function applyPortraits(players: Player[], csv: string): Player[] {
  const extras = parsePortraitsCsv(csv);
  if (extras.size === 0) {
    return players;
  }
  return players.map((player) => {
    const fromFile =
      extras.get(player.slug) ??
      extras.get(portraitMatchKey(player.firstName, String(player.number), player.team)) ??
      extras.get(portraitMatchKey(player.firstName, String(player.number)));
    if (!fromFile) {
      return player;
    }
    return { ...player, portrait: { ...fromFile, ...player.portrait } };
  });
}

export function portraitMatchKey(firstName: string, number: string, team?: string): string {
  const base = `${slugify(firstName)}#${number.trim()}`;
  if (!team) {
    return base;
  }
  return `${base}#${slugify(team)}`;
}

function assignVariant(
  traits: PortraitTraits,
  key: keyof PortraitTraits,
  raw: string,
  allowed: readonly string[],
  aliases: Record<string, string>,
): void {
  const value = parseVariant(raw, allowed, aliases);
  if (value) {
    traits[key] = value;
  }
}

function parseVariant(
  raw: string,
  allowed: readonly string[],
  aliases: Record<string, string>,
): string | undefined {
  if (!raw) {
    return undefined;
  }
  const folded = foldHeader(raw);
  if (/^(none|no|false|nessuno)$/u.test(folded)) {
    return "none";
  }
  const aliased = aliases[folded];
  if (aliased) {
    return aliased;
  }
  return allowed.find((item) => foldHeader(item) === folded);
}
