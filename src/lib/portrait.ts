import { club } from "#/lib/club";
import type { Player, TeamName } from "#/lib/player";

const SKINS = ["#f3d0b6", "#e8c09a", "#d09b6c", "#a56b42"] as const;
const HAIR = ["#1a2634", "#241820", "#3b2a18", "#5a4634", "#f867a5"] as const;

const PINK = club.colors.pink;
const NAVY = club.colors.navy;

export type KitKind = "home" | "away";

export function kitKind(team: TeamName): KitKind {
  if (team === "Saccios Tim") {
    return "away";
  }
  return "home";
}

export function portraitSvg(player: Player): string {
  const h = hashString(player.slug);
  const skin = SKINS[h % SKINS.length] ?? SKINS[0];
  const hair = HAIR[Math.floor(h / 5) % HAIR.length] ?? HAIR[0];
  const hairStyle = h % 6;
  const older = player.birthYear > 0 && player.birthYear <= 1986;
  const isFemale = player.sex === "F";
  const kind = kitKind(player.team);
  const kit = kitPalette(kind);
  const uid = `p-${player.slug.replace(/[^a-z0-9-]/gi, "")}`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="320" height="400" role="img" aria-label="">
  ${kitDefs(uid, kind)}
  <rect width="320" height="400" fill="${kit.bg}"/>
  <ellipse cx="160" cy="418" rx="128" ry="46" fill="#0d141c" opacity="0.55"/>
  ${hairMarkup(isFemale, hairStyle, hair, older, "back")}
  ${jerseyMarkup(uid, kind)}
  ${forearmsMarkup(skin)}
  <ellipse cx="160" cy="214" rx="22" ry="28" fill="${skin}"/>
  <ellipse cx="102" cy="148" rx="10" ry="14" fill="${skin}"/>
  <ellipse cx="218" cy="148" rx="10" ry="14" fill="${skin}"/>
  <ellipse cx="160" cy="138" rx="60" ry="72" fill="${skin}"/>
  ${faceMarks(h, skin)}
  ${hairMarkup(isFemale, hairStyle, hair, older, "front")}
  ${accessoryMarkup(h, isFemale)}
</svg>
`;
}

type KitPalette = {
  kind: KitKind;
  bg: string;
  shirt: string;
  fold: string;
  stroke: string;
  cuff: string;
};

function kitPalette(kind: KitKind): KitPalette {
  if (kind === "away") {
    return {
      kind,
      bg: "#3a4c5e",
      shirt: NAVY,
      fold: "#243446",
      stroke: PINK,
      cuff: "#121a24",
    };
  }
  return {
    kind,
    bg: "#15202c",
    shirt: "#ffffff",
    fold: "#d8d3ca",
    stroke: NAVY,
    cuff: "#ece8e1",
  };
}

function kitDefs(uid: string, kind: KitKind): string {
  const kit = kitPalette(kind);
  return `
  <defs>
    <clipPath id="${uid}-torso">
      <path d="${torsoPath()}"/>
    </clipPath>
    <linearGradient id="${uid}-shine" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff" stop-opacity="${kind === "home" ? 0.28 : 0.1}"/>
      <stop offset="0.45" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="${uid}-soft" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#0d141c" flood-opacity="0.35"/>
    </filter>
  </defs>
  <desc>${kit.kind === "home" ? "Maglia casa bianca" : "Maglia trasferta navy"}</desc>
`;
}

function jerseyMarkup(uid: string, kind: KitKind): string {
  const kit = kitPalette(kind);
  return `
  <g id="kit-body" filter="url(#${uid}-soft)">
    <path d="${jerseyPath()}" fill="${kit.shirt}" stroke="${kit.stroke}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="${jerseyPath()}" fill="url(#${uid}-shine)"/>
    <path d="M56 306 L90 284" fill="none" stroke="${kit.cuff}" stroke-width="7" stroke-linecap="butt"/>
    <path d="M264 306 L230 284" fill="none" stroke="${kit.cuff}" stroke-width="7" stroke-linecap="butt"/>
    <path d="M114 222 C128 234 144 238 160 238 C176 238 192 234 206 222" fill="none" stroke="${PINK}" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M124 268 C118 318 112 358 108 398" fill="none" stroke="${kit.fold}" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <path d="M168 250 C172 310 166 356 162 398" fill="none" stroke="${kit.fold}" stroke-width="4" stroke-linecap="round" opacity="0.55"/>
    <path d="M208 272 C214 322 220 360 224 398" fill="none" stroke="${kit.fold}" stroke-width="3.5" stroke-linecap="round" opacity="0.7"/>
    <path d="M64 250 Q58 270 70 292" fill="none" stroke="${kit.fold}" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
    <path d="M256 250 Q262 270 250 292" fill="none" stroke="${kit.fold}" stroke-width="2.5" stroke-linecap="round" opacity="0.65"/>
    <g clip-path="url(#${uid}-torso)" id="claw-slashes" fill="${PINK}">
      ${jaggedSlash(70, 388, 148, 286, 18, 4)}
      ${jaggedSlash(94, 394, 176, 278, 20, 11)}
      ${jaggedSlash(122, 398, 204, 292, 16, 19)}
    </g>
    ${chestBadges()}
    <path d="${jerseyPath()}" fill="none" stroke="${kit.stroke}" stroke-width="2.2" stroke-linejoin="round"/>
  </g>
`;
}

function jerseyPath(): string {
  return [
    "M110 218",
    "C126 230 142 236 160 236",
    "C178 236 194 230 210 218",
    "L246 230",
    "L286 258",
    "L268 302",
    "L224 276",
    "L236 400",
    "L84 400",
    "L96 276",
    "L52 302",
    "L34 258",
    "L74 230",
    "Z",
  ].join(" ");
}

function torsoPath(): string {
  return "M98 248 C120 240 140 246 160 246 C180 246 200 240 222 248 L234 400 L86 400 Z";
}

function forearmsMarkup(skin: string): string {
  return `
  <path d="M48 304 C30 328 24 356 34 372 C42 382 56 374 60 356 C56 338 58 318 66 306 Z" fill="${skin}"/>
  <path d="M272 304 C290 328 296 356 286 372 C278 382 264 374 260 356 C264 338 262 318 254 306 Z" fill="${skin}"/>
`;
}

function chestBadges(): string {
  return `
  <g id="badge-agesci" transform="translate(114 258)">
    <circle r="22" fill="#ffffff" stroke="${PINK}" stroke-width="1.8" stroke-dasharray="3 2"/>
    <g transform="scale(1.15)">
      <path fill="${PINK}" d="${fleurDeLisPath()}"/>
    </g>
    <text x="0" y="16" text-anchor="middle" font-size="4.6" font-family="ui-sans-serif, system-ui, sans-serif" font-weight="700" fill="${PINK}">PESARO 1</text>
  </g>
  <g id="badge-sacchos" transform="translate(206 258)">
    <circle r="22" fill="#ffffff" stroke="${PINK}" stroke-width="2"/>
    <g transform="scale(1.15)">
      ${dragonMark()}
    </g>
  </g>
`;
}

function fleurDeLisPath(): string {
  return [
    "M0 -11.2",
    "C3.4 -11 5.4 -7.4 3.6 -3.6",
    "C6.4 -4.4 9.2 -2.4 9.2 0.4",
    "C9.2 2.2 7.2 3.2 5.2 2.4",
    "L2.2 0.6",
    "C2.4 4.2 2.8 7.6 3.2 10.4",
    "H-3.2",
    "C-2.8 7.6 -2.4 4.2 -2.2 0.6",
    "L-5.2 2.4",
    "C-7.2 3.2 -9.2 2.2 -9.2 0.4",
    "C-9.2 -2.4 -6.4 -4.4 -3.6 -3.6",
    "C-5.4 -7.4 -3.4 -11 0 -11.2",
    "Z",
    "M-5.6 0.2 H5.6 V2 H-5.6 Z",
  ].join(" ");
}

function dragonMark(): string {
  return `
    <path fill="${PINK}" d="M-1 -7 C4 -10 10 -4 8 1 C10 4 7 8 2 7 L4 11 L0 9 C-4 12 -10 6 -8 1 C-11 -3 -6 -8 -1 -7 Z"/>
    <path fill="${NAVY}" d="M1 -2 C4 -4 6 0 4 3 C2 5 -1 4 -2 2 C-1 -1 0 -1 1 -2 Z" opacity="0.55"/>
    <circle cx="2.2" cy="-1.2" r="1.1" fill="#ffffff"/>
    <circle cx="-4.5" cy="4.2" r="2.4" fill="#ffffff" stroke="${NAVY}" stroke-width="0.6"/>
    <path fill="${NAVY}" d="M-5.6 3.4 L-3.4 3.4 L-4.5 5.4 Z"/>
  `;
}

function jaggedSlash(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  width: number,
  seed: number,
): string {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const steps = 12;
  const left: string[] = [];
  const right: string[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const taper = Math.sin(Math.PI * t);
    const w = (width / 2) * (0.2 + 0.8 * taper);
    const jag = ((((seed * 17 + i * 31) % 11) + 11) % 11) - 5;
    const x = x0 + dx * t;
    const y = y0 + dy * t;
    const j = jag * 0.55;
    left.push(`${(x + nx * (w + j)).toFixed(1)} ${(y + ny * (w + j)).toFixed(1)}`);
    right.push(
      `${(x - nx * (w - j * 0.35)).toFixed(1)} ${(y - ny * (w - j * 0.35)).toFixed(1)}`,
    );
  }
  const reversed = [...right].reverse();
  return `<path d="M${left.join("L")}L${reversed.join("L")}Z"/>`;
}

function faceMarks(h: number, skin: string): string {
  const eyeY = 138;
  const brow = h % 2 === 0 ? -7 : -3;
  return `
  <ellipse cx="138" cy="${eyeY}" rx="8" ry="9" fill="${NAVY}"/>
  <ellipse cx="182" cy="${eyeY}" rx="8" ry="9" fill="${NAVY}"/>
  <circle cx="140" cy="${eyeY - 2}" r="2.2" fill="#ffffff"/>
  <circle cx="184" cy="${eyeY - 2}" r="2.2" fill="#ffffff"/>
  <path d="M150 ${eyeY + brow} H126" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>
  <path d="M170 ${eyeY + brow} H194" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>
  <path d="M160 152 q 4 6 0 10 q -4 -2 0 -10" fill="${shade(skin, -18)}"/>
  <path d="M148 176 Q160 186 172 176" fill="none" stroke="${NAVY}" stroke-width="3" stroke-linecap="round"/>
`;
}

function hairMarkup(
  isFemale: boolean,
  style: number,
  hair: string,
  older: boolean,
  layer: "back" | "front",
): string {
  if (older && !isFemale) {
    if (layer === "back") {
      return "";
    }
    return `
    <path d="M104 118 C108 68 210 68 216 120 C200 82 120 82 104 118 Z" fill="${hair}"/>
    <rect x="108" y="98" width="104" height="18" rx="6" fill="${shade(hair, 24)}"/>
    `;
  }
  if (!isFemale) {
    if (layer === "back") {
      return "";
    }
    if (style === 0) {
      return `<path d="M98 140 C96 68 224 68 222 140 L210 108 C180 78 140 78 110 108 Z" fill="${hair}"/>`;
    }
    if (style === 1) {
      return `<path d="M100 145 C90 60 230 60 220 145 C200 90 120 90 100 145 Z" fill="${hair}"/>`;
    }
    if (style === 2) {
      return `<path d="M102 138 C100 76 220 76 218 138 L200 98 L160 82 L120 98 Z" fill="${hair}"/>`;
    }
    if (style === 3) {
      return `<path d="M96 150 C88 74 232 74 224 150 Q160 60 96 150 Z" fill="${hair}"/>`;
    }
    return `<path d="M100 142 C98 80 222 80 220 142 C190 100 130 100 100 142 Z" fill="${hair}"/>`;
  }
  if (layer === "back") {
    if (style === 0) {
      return `
      <path d="M86 200 C70 80 250 80 234 200 C220 110 100 110 86 200 Z" fill="${hair}"/>
      <path d="M88 210 C70 280 62 340 70 392 L92 392 C86 330 104 250 112 210 Z" fill="${hair}"/>
      <path d="M232 210 C250 280 258 340 250 392 L228 392 C234 330 216 250 208 210 Z" fill="${hair}"/>
      `;
    }
    if (style === 3) {
      return `
      <path d="M88 210 C72 78 248 78 232 210 L210 130 C180 86 140 86 110 130 Z" fill="${hair}"/>
      <path d="M232 170 C270 210 250 300 210 320 L200 290 C230 280 236 210 220 180 Z" fill="${hair}"/>
      `;
    }
    return `<path d="M90 190 C78 70 242 70 230 190 C210 120 110 120 90 190 Z" fill="${hair}"/>`;
  }
  if (style === 0) {
    return `<path d="M100 128 C96 70 224 70 220 128 C200 88 120 88 100 128 Z" fill="${hair}"/>`;
  }
  if (style === 1) {
    return `<path d="M100 140 C90 62 230 62 220 140 C200 96 120 96 100 140 Z" fill="${hair}"/>`;
  }
  if (style === 2) {
    return `
    <path d="M100 140 C90 60 230 60 220 140 C210 86 110 86 100 140 Z" fill="${hair}"/>
    <ellipse cx="160" cy="82" rx="46" ry="28" fill="${hair}"/>
    `;
  }
  if (style === 3) {
    return `<path d="M102 132 C98 72 222 72 218 132 C198 90 122 90 102 132 Z" fill="${hair}"/>`;
  }
  return `<path d="M100 136 C90 68 230 68 220 136 C196 96 124 96 100 136 Z" fill="${hair}"/>`;
}

function accessoryMarkup(h: number, isFemale: boolean): string {
  if (h % 7 !== 0) {
    return "";
  }
  if (isFemale) {
    return `<ellipse cx="160" cy="98" rx="70" ry="12" fill="none" stroke="${PINK}" stroke-width="8"/>`;
  }
  return `<rect x="108" y="108" width="104" height="14" rx="4" fill="${PINK}"/>`;
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function shade(hex: string, amount: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 255) + amount));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 255) + amount));
  const b = Math.min(255, Math.max(0, (n & 255) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
