import { club } from "#/lib/club";
import type { Player, TeamName } from "#/lib/player";

const W = 48;
const H = 64;
const PINK = club.colors.pink;
const PINK_DARK = "#c44580";
const NAVY = club.colors.navy;
const INK = "#0d141c";
const WHITE = "#ffffff";

const SKINS = [
  { base: "#f3d0b6", shadow: "#d9a07a", blush: "#e8a090" },
  { base: "#e8c09a", shadow: "#c4926a", blush: "#d99080" },
  { base: "#d09b6c", shadow: "#a56b42", blush: "#c07a68" },
  { base: "#a56b42", shadow: "#7a4a2c", blush: "#9a5a48" },
] as const;

const HAIRS = [
  { base: "#1a2634", light: "#4a5d72", dark: "#0d141c" },
  { base: "#2a1810", light: "#6a4030", dark: "#140c08" },
  { base: "#5a4634", light: "#8a6e52", dark: "#3a2c20" },
  { base: "#f867a5", light: "#ff9cc8", dark: "#c44580" },
  { base: "#1f5c5c", light: "#5ec0c0", dark: "#0d3333" },
] as const;

export type KitKind = "home" | "away";

export function kitKind(team: TeamName): KitKind {
  if (team === "Saccios Tim") {
    return "away";
  }
  return "home";
}

type KitPalette = {
  kind: KitKind;
  bg: string;
  shirt: string;
  shade: string;
  cuff: string;
};

function kitPalette(kind: KitKind): KitPalette {
  if (kind === "away") {
    return {
      kind,
      bg: "#2a3d4f",
      shirt: NAVY,
      shade: "#101820",
      cuff: "#0d141c",
    };
  }
  return {
    kind,
    bg: "#15202c",
    shirt: WHITE,
    shade: "#cfc8bc",
    cuff: "#e6e0d6",
  };
}

type Grid = {
  w: number;
  h: number;
  data: (string | null)[];
};

export function portraitSvg(player: Player): string {
  const kind = kitKind(player.team);
  const kit = kitPalette(kind);
  const grid = paintPortrait(player, kit);
  const body = emitRects(grid);
  const desc = kind === "home" ? "Maglia casa bianca" : "Maglia trasferta navy";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 8}" height="${H * 8}" shape-rendering="crispEdges" role="img" aria-label="">
  <desc>${desc}</desc>
  <rect width="${W}" height="${H}" fill="${kit.bg}"/>
  <g id="kit-body">${body}</g>
  <g id="claw-slashes"/>
  <g id="badge-agesci"/>
  <g id="badge-sacchos"/>
</svg>
`;
}

function paintPortrait(player: Player, kit: KitPalette): Grid {
  const g = createGrid(W, H);
  const hash = hashString(player.slug);
  const skin = SKINS[hash % SKINS.length] ?? SKINS[0];
  const hair = HAIRS[Math.floor(hash / 5) % HAIRS.length] ?? HAIRS[0];
  const hairStyle = hash % 6;
  const older = player.birthYear > 0 && player.birthYear <= 1986;
  const isFemale = player.sex === "F";
  const faceRight = hash % 2 === 0;

  paintJersey(g, kit, hash);
  paintNeck(g, skin);
  paintHair(g, hair, hairStyle, isFemale, older, "back");
  paintHead(g, skin, hash);
  paintHair(g, hair, hairStyle, isFemale, older, "front");
  paintFace(g, skin, hair, hash, isFemale);
  addOutline(g, INK);
  addOutline(g, INK);

  if (faceRight) {
    return g;
  }
  return mirrorX(g);
}

function paintHead(g: Grid, skin: (typeof SKINS)[number], hash: number): void {
  const spans: Array<[number, number, number]> = [
    [7, 22, 31],
    [8, 20, 33],
    [9, 19, 34],
    [10, 18, 35],
    [11, 18, 36],
    [12, 18, 37],
    [13, 18, 38],
    [14, 18, 39],
    [15, 19, 40],
    [16, 19, 40],
    [17, 20, 39],
    [18, 21, 37],
    [19, 22, 35],
    [20, 23, 34],
    [21, 24, 33],
    [22, 25, 32],
  ];
  for (const [y, x0, x1] of spans) {
    fillRect(g, x0, y, x1 - x0 + 1, 1, skin.base);
  }
  fillRect(g, 18, 14, 4, 7, skin.shadow);
  fillRect(g, 19, 12, 3, 5, skin.base);
  plot(g, 19, 14, skin.shadow);
  plot(g, 20, 15, skin.shadow);
  plot(g, 39, 16, skin.shadow);
  plot(g, 38, 17, skin.blush);
  fillRect(g, 24, 20, 8, 3, skin.shadow);
  if (hash % 5 === 0) {
    plot(g, 32, 18, skin.blush);
    plot(g, 33, 19, skin.blush);
  }
}

function paintNeck(g: Grid, skin: (typeof SKINS)[number]): void {
  fillRect(g, 25, 21, 8, 5, skin.base);
  fillRect(g, 25, 22, 3, 4, skin.shadow);
}

function paintFace(
  g: Grid,
  skin: (typeof SKINS)[number],
  hair: (typeof HAIRS)[number],
  hash: number,
  isFemale: boolean,
): void {
  fillRect(g, 31, 12, 7, 6, WHITE);
  fillRect(g, 32, 13, 5, 4, "#4eb6d4");
  fillRect(g, 33, 14, 3, 3, "#1a5f7a");
  plot(g, 34, 15, INK);
  plot(g, 35, 13, WHITE);
  const browY = hash % 2 === 0 ? 10 : 11;
  fillRect(g, 30, browY, 8, 1, hair.dark);
  plot(g, 38, 19, skin.shadow);
  plot(g, 32, 20, PINK_DARK);
  plot(g, 33, 20, INK);
  if (isFemale && hash % 3 === 0) {
    plot(g, 18, 17, PINK);
    plot(g, 18, 18, PINK_DARK);
  }
}

function paintHair(
  g: Grid,
  hair: (typeof HAIRS)[number],
  style: number,
  isFemale: boolean,
  older: boolean,
  layer: "back" | "front",
): void {
  if (older && !isFemale) {
    if (layer === "back") {
      return;
    }
    fillRect(g, 18, 6, 16, 4, hair.base);
    fillRect(g, 16, 8, 6, 12, hair.base);
    fillRect(g, 20, 6, 8, 2, hair.light);
    plot(g, 24, 5, WHITE);
    return;
  }

  if (layer === "back") {
    if (!isFemale) {
      fillRect(g, 14, 10, 8, 12, hair.base);
      return;
    }
    fillRect(g, 10, 12, 12, 22, hair.base);
    fillRect(g, 8, 18, 8, 20, hair.dark);
    fillDisc(g, 16, 14, 6, hair.base);
    if (style === 0) {
      fillRect(g, 8, 32, 10, 16, hair.base);
    }
    return;
  }

  const top: Array<[number, number, number]> = [
    [4, 22, 30],
    [5, 20, 32],
    [6, 18, 34],
    [7, 17, 35],
    [8, 16, 34],
    [9, 16, 28],
    [10, 16, 26],
    [11, 16, 24],
    [12, 16, 22],
  ];
  for (const [y, x0, x1] of top) {
    fillRect(g, x0, y, x1 - x0 + 1, 1, hair.base);
  }
  plot(g, 24, 4, hair.light);
  plot(g, 25, 5, hair.light);
  plot(g, 26, 4, WHITE);

  if (style === 1) {
    fillRect(g, 16, 3, 18, 4, hair.base);
    fillRect(g, 14, 8, 5, 8, hair.base);
  }
  if (style === 2 && isFemale) {
    fillDisc(g, 16, 6, 5, hair.base);
    fillDisc(g, 16, 6, 2, hair.light);
  }
  if (style === 4) {
    fillRect(g, 22, 11, 12, 2, hair.base);
  }
}

function paintJersey(g: Grid, kit: KitPalette, hash: number): void {
  for (let y = 24; y < H; y += 1) {
    const t = (y - 24) / (H - 24);
    const left = 7 + Math.floor(t * 2);
    const right = 41 - Math.floor(t * 1);
    for (let x = left; x <= right; x += 1) {
      const shaded = x <= left + 3 || x >= right - 2;
      plot(g, x, y, shaded ? kit.shade : kit.shirt);
    }
  }

  fillRect(g, 3, 26, 9, 12, kit.shirt);
  fillRect(g, 3, 28, 5, 10, kit.shade);
  fillRect(g, 3, 37, 9, 2, kit.cuff);
  fillRect(g, 37, 26, 8, 11, kit.shirt);
  fillRect(g, 39, 28, 6, 9, kit.shade);
  fillRect(g, 37, 36, 8, 2, kit.cuff);

  fillRect(g, 21, 23, 12, 4, kit.shirt);
  fillRect(g, 23, 24, 8, 2, PINK);
  plot(g, 22, 25, PINK_DARK);
  plot(g, 31, 25, PINK_DARK);

  paintClaws(g, hash);
  paintBadge(g, 17, 34, "agesci");
  paintBadge(g, 31, 34, "sacchos");
}

function paintClaws(g: Grid, hash: number): void {
  const marks: Array<[number, number, number, number]> = [
    [11, 60, 24, 46],
    [15, 62, 30, 44],
    [20, 63, 36, 48],
  ];
  for (let i = 0; i < marks.length; i += 1) {
    const [x0, y0, x1, y1] = marks[i] ?? [0, 0, 0, 0];
    thickLine(g, x0, y0, x1, y1, 2, PINK, hash + i * 13);
    thickLine(g, x0, y0 + 1, x1 - 1, y1 + 1, 1, PINK_DARK, hash + i * 7);
  }
}

function paintBadge(g: Grid, cx: number, cy: number, kind: "agesci" | "sacchos"): void {
  fillDisc(g, cx, cy, 4, WHITE);
  ring(g, cx, cy, 4, PINK);
  if (kind === "agesci") {
    plot(g, cx, cy - 2, PINK);
    plot(g, cx - 1, cy - 1, PINK);
    plot(g, cx, cy - 1, PINK);
    plot(g, cx + 1, cy - 1, PINK);
    plot(g, cx - 2, cy, PINK);
    plot(g, cx, cy, PINK);
    plot(g, cx + 2, cy, PINK);
    plot(g, cx, cy + 1, PINK);
    plot(g, cx, cy + 2, PINK);
    return;
  }
  plot(g, cx + 1, cy - 2, PINK);
  plot(g, cx, cy - 1, PINK);
  plot(g, cx + 1, cy - 1, PINK);
  plot(g, cx - 1, cy, PINK);
  plot(g, cx, cy, PINK_DARK);
  plot(g, cx + 1, cy, PINK);
  plot(g, cx, cy + 1, PINK);
  plot(g, cx + 1, cy + 2, WHITE);
}

function createGrid(w: number, h: number): Grid {
  return { w, h, data: Array.from({ length: w * h }, () => null) };
}

function idx(g: Grid, x: number, y: number): number {
  return y * g.w + x;
}

function inBounds(g: Grid, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < g.w && y < g.h;
}

function plot(g: Grid, x: number, y: number, color: string): void {
  if (!inBounds(g, x, y)) {
    return;
  }
  g.data[idx(g, x, y)] = color;
}

function get(g: Grid, x: number, y: number): string | null {
  if (!inBounds(g, x, y)) {
    return null;
  }
  return g.data[idx(g, x, y)] ?? null;
}

function fillRect(g: Grid, x: number, y: number, w: number, h: number, color: string): void {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      plot(g, xx, yy, color);
    }
  }
}

function fillDisc(g: Grid, cx: number, cy: number, r: number, color: string): void {
  const r2 = r * r;
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        plot(g, x, y, color);
      }
    }
  }
}

function ring(g: Grid, cx: number, cy: number, r: number, color: string): void {
  for (let y = cy - r; y <= cy + r; y += 1) {
    for (let x = cx - r; x <= cx + r; x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      const d2 = dx * dx + dy * dy;
      if (d2 <= r * r && d2 >= (r - 1) * (r - 1)) {
        plot(g, x, y, color);
      }
    }
  }
}

function thickLine(
  g: Grid,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
  color: string,
  seed: number,
): void {
  let x = x0;
  let y = y0;
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let i = 0;
  while (true) {
    const jag = ((seed + i * 17) % 5) === 0 ? 1 : 0;
    stamp(g, x, y + jag, thickness, color);
    if (x === x1 && y === y1) {
      break;
    }
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
    i += 1;
  }
}

function stamp(g: Grid, x: number, y: number, thickness: number, color: string): void {
  const r = Math.max(0, thickness - 1);
  for (let yy = y - r; yy <= y + r; yy += 1) {
    for (let xx = x - r; xx <= x + r; xx += 1) {
      plot(g, xx, yy, color);
    }
  }
}

function addOutline(g: Grid, color: string): void {
  const marks: Array<[number, number]> = [];
  for (let y = 0; y < g.h; y += 1) {
    for (let x = 0; x < g.w; x += 1) {
      if (!get(g, x, y)) {
        continue;
      }
      if (!get(g, x - 1, y) || !get(g, x + 1, y) || !get(g, x, y - 1) || !get(g, x, y + 1)) {
        const neighbors: Array<[number, number]> = [
          [x - 1, y],
          [x + 1, y],
          [x, y - 1],
          [x, y + 1],
        ];
        for (const [nx, ny] of neighbors) {
          if (inBounds(g, nx, ny) && !get(g, nx, ny)) {
            marks.push([nx, ny]);
          }
        }
      }
    }
  }
  for (const [x, y] of marks) {
    plot(g, x, y, color);
  }
}

function mirrorX(g: Grid): Grid {
  const next = createGrid(g.w, g.h);
  for (let y = 0; y < g.h; y += 1) {
    for (let x = 0; x < g.w; x += 1) {
      const color = get(g, x, y);
      if (color) {
        plot(next, g.w - 1 - x, y, color);
      }
    }
  }
  return next;
}

function emitRects(g: Grid): string {
  const parts: string[] = [];
  for (let y = 0; y < g.h; y += 1) {
    let x = 0;
    while (x < g.w) {
      const color = get(g, x, y);
      if (!color) {
        x += 1;
        continue;
      }
      let x2 = x;
      while (x2 + 1 < g.w && get(g, x2 + 1, y) === color) {
        x2 += 1;
      }
      parts.push(
        `<rect x="${x}" y="${y}" width="${x2 - x + 1}" height="1" fill="${color}"/>`,
      );
      x = x2 + 1;
    }
  }
  return parts.join("");
}

function hashString(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}
