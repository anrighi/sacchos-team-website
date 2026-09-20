import { Avatar, Style } from "@dicebear/core";
import definition from "@dicebear/styles/toon-head.json" with { type: "json" };
import { club } from "#/lib/club";
import type { Player, PortraitTraits, TeamName } from "#/lib/player";
import { publicUrl } from "#/lib/public-url";

const toonHead = new Style(definition);
const portraitCache = new Map<string, string>();

const NAVY = club.colors.navy;
const WHITE = club.colors.white;
const PORTRAIT_WIDTH = 768;
const PORTRAIT_HEIGHT = 1024;
const TSHIRT_TRANSFORM = "translate(107.32 587.5)";
const TSHIRT_PATH =
  "M356.88 46.52C461.33 80.32 536.96 178.76 537.18 295h-520c.22-116.24 75.85-214.69 180.3-248.48C222.52 82.94 248.8 101 276.68 101s55.15-18.06 80.2-54.48Z";

export const KIT_LAYOUT = {
  agesci: { x: 200, y: 688, width: 74, height: 108 },
  sacchos: { x: 470, y: 694, width: 86, height: 86 },
  claws: { x: 196, y: 828, width: 368, height: 344 },
} as const;

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

export const HAIR_COLOR_PRESETS = {
  black: "2c1b18",
  brown: "724133",
  auburn: "a55728",
  blonde: "d6b370",
  gold: "b58143",
} as const;

export const SKIN_COLOR_PRESETS = {
  deep: "5c3829",
  tan: "a36b4f",
  medium: "c68e7a",
  warm: "b98e6a",
  light: "f1c3a5",
} as const;

export const DEFAULT_HAIR_COLORS = [
  HAIR_COLOR_PRESETS.black,
  HAIR_COLOR_PRESETS.brown,
  HAIR_COLOR_PRESETS.blonde,
] as const;

export const DEFAULT_SKIN_COLORS = [
  SKIN_COLOR_PRESETS.deep,
  SKIN_COLOR_PRESETS.medium,
  SKIN_COLOR_PRESETS.light,
] as const;

const HAIR_COLOR_ALIASES: Record<string, keyof typeof HAIR_COLOR_PRESETS> = {
  nero: "black",
  castano: "brown",
  ramato: "auburn",
  biondo: "blonde",
  miele: "gold",
  lightbrown: "gold",
};

const SKIN_COLOR_ALIASES: Record<string, keyof typeof SKIN_COLOR_PRESETS> = {
  scura: "deep",
  scuro: "deep",
  olivastra: "tan",
  media: "medium",
  calda: "warm",
  chiara: "light",
};

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

export function portraitSvg(
  player: Player,
  options: { backdrop?: boolean; kit?: KitKind } = {},
): string {
  const kit = options.kit ?? kitKind(player.team);
  const backdrop = options.backdrop !== false;
  const key = `${player.slug}:${kit}:${backdrop}:${player.sex}:${JSON.stringify(player.portrait ?? {})}`;
  const cached = portraitCache.get(key);
  if (cached) {
    return cached;
  }
  const avatar = new Avatar(toonHead, portraitOptions(player, kit, backdrop) as never);
  const svg = withClubKit(avatar.toString(), kit, player.slug, backdrop);
  portraitCache.set(key, svg);
  return svg;
}

export function portraitOptions(
  player: Player,
  kit: KitKind = kitKind(player.team),
  backdrop = true,
): Record<string, unknown> {
  const traits = completePortraitTraits(player);

  return {
    seed: player.slug,
    title: "",
    clothesVariant: ["tShirt"],
    clothesColor: [kit === "home" ? WHITE.slice(1) : NAVY.slice(1)],
    clothesColorFill: ["solid"],
    ...(backdrop
      ? {
          backgroundColor: [kit === "home" ? "182430" : "223142"],
          backgroundColorFill: ["solid"],
        }
      : {
          backgroundColor: ["00000000"],
          backgroundColorFill: ["solid"],
        }),
    ...variantOption("hair", traits.hair, HAIR_VARIANTS, 0),
    ...variantOption("rearHair", traits.rearHair, REAR_HAIR_VARIANTS, 0),
    ...variantOption("beard", traits.beard, BEARD_VARIANTS, 0),
    ...variantOption("eyes", traits.eyes, EYES_VARIANTS),
    ...variantOption("eyebrows", traits.eyebrows, EYEBROWS_VARIANTS),
    ...variantOption("mouth", traits.mouth, MOUTH_VARIANTS),
    ...colorOption("hair", traits.hairColor),
    ...colorOption("skin", traits.skinColor),
  };
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

function colorOption(name: "hair" | "skin", value: string | undefined): Record<string, unknown> {
  const hex = name === "hair" ? resolveHairColor(value) : resolveSkinColor(value);
  if (!hex) {
    return {};
  }
  return {
    [`${name}Color`]: [hex],
    [`${name}ColorFill`]: ["solid"],
  };
}

export function resolveHairColor(value: string | undefined): string | undefined {
  return resolvePresetColor(value, HAIR_COLOR_PRESETS, HAIR_COLOR_ALIASES);
}

export function resolveSkinColor(value: string | undefined): string | undefined {
  return resolvePresetColor(value, SKIN_COLOR_PRESETS, SKIN_COLOR_ALIASES);
}

export function sheetHairColorLabel(value: string | undefined): string {
  const hex = resolveHairColor(value);
  if (hex === HAIR_COLOR_PRESETS.black) {
    return "nero";
  }
  if (hex === HAIR_COLOR_PRESETS.brown) {
    return "castano";
  }
  if (hex === HAIR_COLOR_PRESETS.blonde) {
    return "biondo";
  }
  return "";
}

export function sheetSkinColorLabel(value: string | undefined): string {
  const hex = resolveSkinColor(value);
  if (hex === SKIN_COLOR_PRESETS.deep) {
    return "scura";
  }
  if (hex === SKIN_COLOR_PRESETS.medium) {
    return "media";
  }
  if (hex === SKIN_COLOR_PRESETS.light) {
    return "chiara";
  }
  return "";
}

export function completePortraitTraits(player: Player): PortraitTraits {
  const traits = player.portrait ?? {};
  const look: PortraitTraits = {};
  if (traits.hair) {
    look.hair = traits.hair;
  }
  if (traits.rearHair) {
    look.rearHair = traits.rearHair;
  }
  if (traits.beard) {
    look.beard = traits.beard;
  }
  if (traits.hairColor) {
    look.hairColor = traits.hairColor;
  }
  if (traits.skinColor) {
    look.skinColor = traits.skinColor;
  }
  return look;
}

function resolvePresetColor<T extends Record<string, string>>(
  value: string | undefined,
  presets: T,
  aliases: Record<string, keyof T>,
): string | undefined {
  if (!value) {
    return undefined;
  }
  const key = value.trim().toLowerCase().replace(/^#/, "").replace(/[\s_-]/g, "");
  const alias = aliases[key];
  if (alias) {
    return presets[alias];
  }
  if (key in presets) {
    return presets[key as keyof T];
  }
  return normalizeHex(value);
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

function withClubKit(
  svg: string,
  kit: KitKind,
  slug: string,
  backdrop: boolean,
): string {
  const framed = svg
    .replace(
      'viewBox="0 0 768 768"',
      `viewBox="0 0 ${PORTRAIT_WIDTH} ${PORTRAIT_HEIGHT}" preserveAspectRatio="xMidYMin meet"`,
    )
    .replace(
      '<rect width="768" height="768" rx="0" ry="0"/>',
      `<rect width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}" rx="0" ry="0"/>`,
    );
  const canvas = backdrop
    ? framed.replace(
        /<rect width="768" height="768" fill="/u,
        `<rect width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}" fill="`,
      )
    : framed.replace(
        /<rect width="768" height="768" fill="[^"]+"/u,
        `<rect width="${PORTRAIT_WIDTH}" height="${PORTRAIT_HEIGHT}" fill="none"`,
      );
  return canvas.replace(/<\/svg>\s*$/u, `${kitOverlay(kit, slug)}</svg>`);
}

function kitOverlay(kit: KitKind, slug: string): string {
  const shirt = kit === "home" ? WHITE : NAVY;
  const clipId = `kit-shirt-clip-${slug}`;
  const clawsClipId = `kit-claws-clip-${slug}`;
  const agesci = publicUrl("/brand/crest-agesci.png");
  const sacchos = publicUrl("/brand/crest-sacchos.png");
  const claws = publicUrl("/brand/kit-claws.png");
  const { agesci: ag, sacchos: sc, claws: cl } = KIT_LAYOUT;
  const holePad = 10;
  return `<g id="kit-marks" aria-hidden="true">
  <clipPath id="${clipId}">
    <path transform="${TSHIRT_TRANSFORM}" d="${TSHIRT_PATH}"/>
    <rect x="124.5" y="850" width="520" height="174"/>
  </clipPath>
  <clipPath id="${clawsClipId}" clip-rule="evenodd">
    <path clip-rule="evenodd" d="M124.5 630h520v394h-520zM${ag.x - holePad} ${ag.y - holePad}h${ag.width + holePad * 2}v${ag.height + holePad * 2}h-${ag.width + holePad * 2}z"/>
  </clipPath>
  <g clip-path="url(#${clipId})">
    <rect x="124.5" y="868" width="520" height="156" fill="${shirt}"/>
    <g clip-path="url(#${clawsClipId})">
      <image href="${claws}" x="${cl.x}" y="${cl.y}" width="${cl.width}" height="${cl.height}" preserveAspectRatio="xMidYMid meet"/>
    </g>
    <image href="${agesci}" x="${ag.x}" y="${ag.y}" width="${ag.width}" height="${ag.height}" preserveAspectRatio="xMidYMin meet"/>
    <image href="${sacchos}" x="${sc.x}" y="${sc.y}" width="${sc.width}" height="${sc.height}" preserveAspectRatio="xMidYMid meet"/>
  </g>
</g>`;
}
