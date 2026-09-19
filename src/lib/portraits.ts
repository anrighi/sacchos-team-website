import { csvCell, parseCsv, slugify } from "#/lib/csv";
import type { Player, PortraitTraits } from "#/lib/player";
import {
  BEARD_VARIANTS,
  EYEBROWS_VARIANTS,
  EYES_VARIANTS,
  HAIR_VARIANTS,
  MOUTH_VARIANTS,
  REAR_HAIR_VARIANTS,
  normalizeHex,
} from "#/lib/portrait";

const HEADERS = {
  hair: ["hair", "capelli"],
  rearHair: ["rearHair", "capelliDietro"],
  hairColor: ["hairColor", "coloreCapelli"],
  skinColor: ["skinColor", "carnagione"],
  eyes: ["eyes", "occhi"],
  eyebrows: ["eyebrows", "sopracciglia"],
  mouth: ["mouth", "bocca"],
  beard: ["beard", "barba"],
} as const;

export function parsePortraitTraits(row: Record<string, string>): PortraitTraits | undefined {
  const traits: PortraitTraits = {};
  assignVariant(traits, "hair", csvCell(row, ...HEADERS.hair), HAIR_VARIANTS);
  assignVariant(traits, "rearHair", csvCell(row, ...HEADERS.rearHair), REAR_HAIR_VARIANTS);
  assignVariant(traits, "eyes", csvCell(row, ...HEADERS.eyes), EYES_VARIANTS);
  assignVariant(traits, "eyebrows", csvCell(row, ...HEADERS.eyebrows), EYEBROWS_VARIANTS);
  assignVariant(traits, "mouth", csvCell(row, ...HEADERS.mouth), MOUTH_VARIANTS);
  assignVariant(traits, "beard", csvCell(row, ...HEADERS.beard), BEARD_VARIANTS);

  const hairColor = normalizeHex(csvCell(row, ...HEADERS.hairColor));
  if (hairColor) {
    traits.hairColor = hairColor;
  }
  const skinColor = normalizeHex(csvCell(row, ...HEADERS.skinColor));
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
): void {
  const value = parseVariant(raw, allowed);
  if (value) {
    traits[key] = value;
  }
}

function parseVariant(raw: string, allowed: readonly string[]): string | undefined {
  if (!raw) {
    return undefined;
  }
  const value = raw.trim();
  if (/^(none|no|false|-)$/iu.test(value)) {
    return "none";
  }
  return allowed.find((item) => item.toLowerCase() === value.toLowerCase());
}
