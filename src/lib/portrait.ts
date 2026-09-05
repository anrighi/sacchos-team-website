import type { Player } from "#/lib/player";

const SKINS = ["#f3d0b6", "#e8c09a", "#d09b6c", "#a56b42"] as const;
const HAIR = ["#1a2634", "#241820", "#3b2a18", "#5a4634", "#f867a5"] as const;

export function portraitSvg(player: Player): string {
  const h = hashString(player.slug);
  const skin = SKINS[h % SKINS.length] ?? SKINS[0];
  const hair = HAIR[Math.floor(h / 5) % HAIR.length] ?? HAIR[0];
  const hairStyle = h % 6;
  const older = player.birthYear > 0 && player.birthYear <= 1986;
  const shirt = "#f4f1ea";
  const number = String(player.number);
  const isFemale = player.sex === "F";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 400" width="320" height="400" role="img" aria-label="">
  <rect width="320" height="400" fill="#1a2634"/>
  <ellipse cx="160" cy="410" rx="150" ry="70" fill="#0d141c"/>
  <path d="M70 250 C70 210 90 190 160 190 C230 190 250 210 250 250 L268 400 L52 400 Z" fill="${shirt}"/>
  <path d="M92 250 C100 220 120 205 160 205 C200 205 220 220 228 250" fill="none" stroke="#f867a5" stroke-width="10"/>
  <text x="160" y="330" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="${number.length > 1 ? 72 : 84}" font-weight="700" fill="#f867a5">${escapeXml(number)}</text>
  <ellipse cx="160" cy="248" rx="28" ry="18" fill="${skin}"/>
  <ellipse cx="160" cy="148" rx="62" ry="74" fill="${skin}"/>
  ${faceMarks(h, skin)}
  ${hairMarkup(isFemale, hairStyle, hair, older)}
  ${accessoryMarkup(h, isFemale)}
</svg>
`;
}

function faceMarks(h: number, skin: string): string {
  const eyeY = 148;
  const brow = h % 2 === 0 ? -6 : -2;
  return `
  <ellipse cx="138" cy="${eyeY}" rx="8" ry="9" fill="#1a2634"/>
  <ellipse cx="182" cy="${eyeY}" rx="8" ry="9" fill="#1a2634"/>
  <circle cx="140" cy="${eyeY - 2}" r="2.2" fill="#ffffff"/>
  <circle cx="184" cy="${eyeY - 2}" r="2.2" fill="#ffffff"/>
  <path d="M150 ${eyeY + brow} H126" stroke="#1a2634" stroke-width="3" stroke-linecap="round"/>
  <path d="M170 ${eyeY + brow} H194" stroke="#1a2634" stroke-width="3" stroke-linecap="round"/>
  <path d="M160 162 q 4 6 0 10 q -4 -2 0 -10" fill="${shade(skin, -18)}"/>
  <path d="M148 186 Q160 196 172 186" fill="none" stroke="#1a2634" stroke-width="3" stroke-linecap="round"/>
`;
}

function hairMarkup(isFemale: boolean, style: number, hair: string, older: boolean): string {
  if (older && !isFemale) {
    return `
    <path d="M104 128 C108 78 210 78 216 130 C200 92 120 92 104 128 Z" fill="${hair}"/>
    <rect x="108" y="108" width="104" height="18" rx="6" fill="${shade(hair, 24)}"/>
    `;
  }
  if (!isFemale) {
    if (style === 0) {
      return `<path d="M98 150 C96 78 224 78 222 150 L210 118 C180 88 140 88 110 118 Z" fill="${hair}"/>`;
    }
    if (style === 1) {
      return `<path d="M100 155 C90 70 230 70 220 155 C200 100 120 100 100 155 Z" fill="${hair}"/>`;
    }
    if (style === 2) {
      return `<path d="M102 148 C100 86 220 86 218 148 L200 108 L160 92 L120 108 Z" fill="${hair}"/>`;
    }
    if (style === 3) {
      return `<path d="M96 160 C88 84 232 84 224 160 Q160 70 96 160 Z" fill="${hair}"/>`;
    }
    return `<path d="M100 152 C98 90 222 90 220 152 C190 110 130 110 100 152 Z" fill="${hair}"/>`;
  }
  if (style === 0) {
    return `
    <path d="M86 210 C70 90 250 90 234 210 C220 120 100 120 86 210 Z" fill="${hair}"/>
    <path d="M92 200 C88 250 70 310 78 360 L98 360 C92 300 110 240 116 210 Z" fill="${hair}"/>
    `;
  }
  if (style === 1) {
    return `<path d="M90 200 C78 80 242 80 230 200 C210 130 110 130 90 200 Z" fill="${hair}"/>`;
  }
  if (style === 2) {
    return `
    <path d="M100 150 C90 70 230 70 220 150 C210 96 110 96 100 150 Z" fill="${hair}"/>
    <ellipse cx="160" cy="92" rx="46" ry="28" fill="${hair}"/>
    `;
  }
  if (style === 3) {
    return `
    <path d="M88 220 C72 88 248 88 232 220 L210 140 C180 96 140 96 110 140 Z" fill="${hair}"/>
    <path d="M232 180 C270 220 250 310 210 330 L200 300 C230 290 236 220 220 190 Z" fill="${hair}"/>
    `;
  }
  return `<path d="M92 190 C80 78 240 78 228 190 C200 110 120 110 92 190 Z" fill="${hair}"/>`;
}

function accessoryMarkup(h: number, isFemale: boolean): string {
  if (h % 7 !== 0) {
    return "";
  }
  if (isFemale) {
    return `<ellipse cx="160" cy="108" rx="70" ry="12" fill="none" stroke="#f867a5" stroke-width="8"/>`;
  }
  return `<rect x="108" y="118" width="104" height="14" rx="4" fill="#f867a5"/>`;
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

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
