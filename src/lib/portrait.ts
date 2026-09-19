import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/toon-head.json" with { type: "json" };
import { club } from "#/lib/club";
import type { Player, PortraitTraits, TeamName } from "#/lib/player";

const toonHead = new Style(definition);
const portraitCache = new Map<string, string>();

const PINK = club.colors.pink;
const PINK_DARK = "#c44580";
const NAVY = club.colors.navy;
const WHITE = club.colors.white;

export const HAIR_VARIANTS = ["bun", "sideComed", "spiky", "undercut"] as const;
export const REAR_HAIR_VARIANTS = [
  "longStraight",
  "longWavy",
  "neckHigh",
  "shoulderHigh",
] as const;
export const EYES_VARIANTS = ["bow", "happy", "humble", "wide", "wink"] as const;
export const EYEBROWS_VARIANTS = ["angry", "happy", "neutral", "raised", "sad"] as const;
export const MOUTH_VARIANTS = ["agape", "angry", "laugh", "sad", "smile"] as const;
export const BEARD_VARIANTS = [
  "chin",
  "chinMoustache",
  "fullBeard",
  "longBeard",
  "moustacheTwirl",
] as const;

export type HairVariant = (typeof HAIR_VARIANTS)[number];
export type RearHairVariant = (typeof REAR_HAIR_VARIANTS)[number];
export type EyesVariant = (typeof EYES_VARIANTS)[number];
export type EyebrowsVariant = (typeof EYEBROWS_VARIANTS)[number];
export type MouthVariant = (typeof MOUTH_VARIANTS)[number];
export type BeardVariant = (typeof BEARD_VARIANTS)[number];

export type KitKind = "home" | "away";

export function kitKind(team: TeamName): KitKind {
  if (team === "Saccios Tim") {
    return "away";
  }
  return "home";
}

export function portraitSvg(player: Player): string {
  const kit = kitKind(player.team);
  const key = `${player.slug}:${kit}:${player.sex}:${player.birthYear}:${JSON.stringify(player.portrait ?? {})}`;
  const cached = portraitCache.get(key);
  if (cached) {
    return cached;
  }
  const avatar = new Avatar(toonHead, portraitOptions(player, kit) as never);
  const svg = withKitMarks(avatar.toString(), kit);
  portraitCache.set(key, svg);
  return svg;
}

export function portraitOptions(
  player: Player,
  kit: KitKind = kitKind(player.team),
): Record<string, unknown> {
  const traits = player.portrait ?? {};
  const older = player.birthYear > 0 && player.birthYear <= 1986;

  return {
    seed: player.slug,
    title: "",
    clothesVariant: ["tShirt"],
    clothesColor: [kit === "home" ? WHITE.slice(1) : NAVY.slice(1)],
    clothesColorFill: ["solid"],
    backgroundColor: [kit === "home" ? "182430" : "223142"],
    backgroundColorFill: ["solid"],
    ...variantOption("hair", traits.hair, HAIR_VARIANTS),
    ...variantOption(
      "rearHair",
      traits.rearHair,
      REAR_HAIR_VARIANTS,
      defaultRearHairProbability(player, traits),
    ),
    ...variantOption(
      "beard",
      traits.beard,
      BEARD_VARIANTS,
      defaultBeardProbability(player, traits, older),
    ),
    ...variantOption("eyes", traits.eyes, EYES_VARIANTS),
    ...variantOption("eyebrows", traits.eyebrows, EYEBROWS_VARIANTS),
    ...variantOption("mouth", traits.mouth, MOUTH_VARIANTS),
    ...colorOption("hair", traits.hairColor),
    ...colorOption("skin", traits.skinColor),
  };
}

function defaultRearHairProbability(player: Player, traits: PortraitTraits): number {
  if (traits.rearHair) {
    return 100;
  }
  return player.sex === "F" ? 100 : 12;
}

function defaultBeardProbability(
  player: Player,
  traits: PortraitTraits,
  older: boolean,
): number {
  if (traits.beard) {
    return 100;
  }
  if (player.sex === "F") {
    return 0;
  }
  return older ? 70 : 22;
}

function variantOption(
  name: string,
  value: string | undefined,
  allowed: readonly string[],
  fallbackProbability?: number,
): Record<string, unknown> {
  if (value === "none") {
    return { [`${name}Probability`]: 0 };
  }
  if (value && allowed.includes(value)) {
    return {
      [`${name}Variant`]: [value],
      [`${name}Probability`]: 100,
    };
  }
  if (fallbackProbability == null) {
    return {};
  }
  return { [`${name}Probability`]: fallbackProbability };
}

function colorOption(name: string, value: string | undefined): Record<string, unknown> {
  const hex = normalizeHex(value);
  if (!hex) {
    return {};
  }
  return {
    [`${name}Color`]: [hex],
    [`${name}ColorFill`]: ["solid"],
  };
}

export function normalizeHex(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  const hex = value.trim().replace(/^#/, "").toLowerCase();
  if (!/^[0-9a-f]{6}$/u.test(hex)) {
    return undefined;
  }
  return hex;
}

function withKitMarks(svg: string, kit: KitKind): string {
  const shirt = kit === "home" ? WHITE : NAVY;
  const marks = `<g id="kit-marks" aria-hidden="true">
  <path d="M286 612c28 18 62 38 96 38s68-20 96-38" fill="none" stroke="${PINK}" stroke-width="14" stroke-linecap="round"/>
  <path d="M200 748 C 268 688, 338 638, 418 612" fill="none" stroke="${PINK_DARK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M200 748 C 268 688, 338 638, 418 612" fill="none" stroke="${PINK}" stroke-width="11" stroke-linecap="round"/>
  <path d="M258 752 C 328 694, 398 646, 478 624" fill="none" stroke="${PINK_DARK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M258 752 C 328 694, 398 646, 478 624" fill="none" stroke="${PINK}" stroke-width="11" stroke-linecap="round"/>
  <path d="M318 756 C 384 704, 452 658, 536 640" fill="none" stroke="${PINK_DARK}" stroke-width="20" stroke-linecap="round"/>
  <path d="M318 756 C 384 704, 452 658, 536 640" fill="none" stroke="${PINK}" stroke-width="11" stroke-linecap="round"/>
  <circle cx="248" cy="686" r="18" fill="${shirt}" stroke="${PINK}" stroke-width="4"/>
  <circle cx="520" cy="686" r="18" fill="${shirt}" stroke="${PINK}" stroke-width="4"/>
</g>`;
  return svg.replace(/<\/svg>\s*$/u, `${marks}</svg>`);
}
