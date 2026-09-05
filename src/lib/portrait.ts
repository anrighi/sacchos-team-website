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
  { base: "#f6d5bb", shadow: "#d9a97f", blush: "#e79a8c" },
  { base: "#eec49c", shadow: "#c8956a", blush: "#d98a78" },
  { base: "#cf9a6b", shadow: "#a56b42", blush: "#bd7a62" },
  { base: "#a66c43", shadow: "#7a4a2c", blush: "#95573f" },
] as const;

const HAIRS = [
  { base: "#20303f", light: "#3d5568", dark: "#101a24" },
  { base: "#2f1a12", light: "#5a3524", dark: "#1a0e08" },
  { base: "#6b5238", light: "#96764f", dark: "#43331f" },
  { base: "#c9503f", light: "#e87a5c", dark: "#8f3324" },
  { base: "#1f5c5c", light: "#49a0a0", dark: "#0f3636" },
] as const;

const EYE = { white: "#f4f7fa", iris: "#2f8fb5", irisLight: "#5ec0e0" } as const;

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
  bgGlow: string;
  bgFloor: string;
  shirt: string;
  shade: string;
  seam: string;
};

function kitPalette(kind: KitKind): KitPalette {
  if (kind === "away") {
    return {
      kind,
      bg: "#2b3f52",
      bgGlow: "#3f5a70",
      bgFloor: "#1d2b38",
      shirt: NAVY,
      shade: "#111a24",
      seam: "#0e161e",
    };
  }
  return {
    kind,
    bg: "#182430",
    bgGlow: "#27394a",
    bgFloor: "#101a23",
    shirt: WHITE,
    shade: "#d5cec2",
    seam: "#b9b1a4",
  };
}

type Grid = {
  w: number;
  h: number;
  data: (string | null)[];
};

type Skin = (typeof SKINS)[number];
type Hair = (typeof HAIRS)[number];

export function portraitSvg(player: Player): string {
  const kind = kitKind(player.team);
  const grid = paintPortrait(player, kitPalette(kind));
  const desc = kind === "home" ? "Maglia casa bianca" : "Maglia trasferta navy";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * 8}" height="${H * 8}" shape-rendering="crispEdges" role="img" aria-label="">
  <desc>${desc}</desc>
  <g id="kit-body">${emitRects(grid)}</g>
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
  const hair = HAIRS[Math.floor(hash / 7) % HAIRS.length] ?? HAIRS[0];
  const style = hash % 5;
  const longHair = player.sex === "F" && hash % 3 !== 2;
  const older = player.birthYear > 0 && player.birthYear <= 1986;

  paintNeck(g, skin);
  paintJersey(g, kit, hash);
  if (longHair) {
    paintLongHair(g, hair);
  }
  paintHair(g, hair, style);
  paintFace(g, skin, hair, hash);
  if (older) {
    paintBeard(g, hair);
  }
  addOutline(g, INK);
  paintBackdrop(g, kit);

  if (hash % 2 === 0) {
    return g;
  }
  return mirrorX(g);
}

function paintNeck(g: Grid, skin: Skin): void {
  fillRect(g, 23, 30, 9, 12, skin.base);
  fillRect(g, 23, 31, 3, 11, skin.shadow);
  fillRect(g, 26, 37, 6, 5, skin.shadow);
}

function paintJersey(g: Grid, kit: KitPalette, hash: number): void {
  for (let y = 39; y < H; y += 1) {
    const t = Math.min(1, (y - 39) / 5);
    const left = Math.round(16 - 8 * t);
    const right = Math.round(36 + 5 * t);
    for (let x = left; x <= right; x += 1) {
      const edge = x <= left + 1 || x >= right - 1;
      plot(g, x, y, edge ? kit.shade : kit.shirt);
    }
  }

  for (let y = 46; y < H; y += 1) {
    plot(g, 13, y, kit.seam);
    plot(g, 38, y, kit.seam);
  }

  fillRect(g, 22, 38, 10, 2, PINK);
  plot(g, 21, 39, PINK_DARK);
  plot(g, 32, 39, PINK_DARK);
  fillRect(g, 24, 40, 6, 1, kit.shade);

  paintClaws(g, hash);
  paintBadge(g, 18, 46, "agesci");
  paintBadge(g, 33, 46, "sacchos");
}

function paintClaws(g: Grid, hash: number): void {
  const marks: Array<[number, number, number, number]> = [
    [12, 63, 26, 54],
    [18, 63, 32, 53],
    [24, 63, 37, 56],
  ];
  for (let i = 0; i < marks.length; i += 1) {
    const [x0, y0, x1, y1] = marks[i] ?? [0, 0, 0, 0];
    thickLine(g, x0, y0, x1, y1, 1, PINK, hash + i * 13);
    thickLine(g, x0 + 1, y0, x1 + 1, y1, 1, PINK_DARK, hash + i * 7);
  }
}

function paintBadge(g: Grid, cx: number, cy: number, kind: "agesci" | "sacchos"): void {
  ring(g, cx, cy, 4, PINK);
  fillDisc(g, cx, cy, 3, PINK_DARK);
  if (kind === "agesci") {
    fillRect(g, cx, cy - 2, 1, 5, WHITE);
    fillRect(g, cx - 1, cy, 3, 1, WHITE);
    return;
  }
  plot(g, cx - 1, cy - 2, WHITE);
  plot(g, cx, cy - 1, WHITE);
  plot(g, cx + 1, cy, WHITE);
  plot(g, cx - 1, cy + 1, WHITE);
  plot(g, cx, cy + 2, WHITE);
}

function paintLongHair(g: Grid, hair: Hair): void {
  fillEllipse(g, 26, 22, 12, 15, hair.base);
  fillRect(g, 14, 22, 10, 24, hair.base);
  fillRect(g, 14, 32, 5, 14, hair.dark);
  fillRect(g, 34, 26, 4, 16, hair.base);
  fillRect(g, 36, 32, 2, 10, hair.dark);
}

function paintHair(g: Grid, hair: Hair, style: number): void {
  fillEllipse(g, 26, 20, 11, 13, hair.base);
  fillRect(g, 16, 20, 8, 11, hair.base);

  if (style === 1) {
    fillEllipse(g, 25, 14, 12, 7, hair.base);
  }
  if (style === 2) {
    fillEllipse(g, 22, 12, 7, 6, hair.base);
  }
  if (style === 3) {
    fillRect(g, 20, 8, 12, 4, hair.base);
  }

  fillRect(g, 23, 11, 6, 2, hair.light);
  plot(g, 29, 12, WHITE);
  fillRect(g, 18, 24, 3, 6, hair.dark);
}

function paintFace(g: Grid, skin: Skin, hair: Hair, hash: number): void {
  fillEllipse(g, 29, 24, 9, 11, skin.base);
  fillRect(g, 37, 23, 2, 5, skin.base);
  plot(g, 38, 27, skin.shadow);
  plot(g, 36, 28, skin.shadow);
  fillRect(g, 24, 30, 6, 4, skin.shadow);
  fillRect(g, 27, 33, 7, 2, skin.shadow);

  fillEllipse(g, 23, 27, 2, 3, skin.base);
  plot(g, 23, 27, skin.shadow);

  fillRect(g, 31, 22, 5, 4, EYE.white);
  fillRect(g, 33, 23, 2, 2, EYE.iris);
  plot(g, 33, 23, INK);
  plot(g, 34, 24, EYE.irisLight);
  fillRect(g, 31, 19 + (hash % 2), 6, 1, hair.dark);
  plot(g, 30, 20 + (hash % 2), hair.dark);

  plot(g, 34, 30, PINK_DARK);
  plot(g, 35, 30, PINK_DARK);
  plot(g, 33, 30, skin.shadow);

  if (hash % 4 === 0) {
    fillRect(g, 32, 28, 2, 1, skin.blush);
  }
  if (hash % 5 === 0) {
    plot(g, 22, 30, PINK);
  }
}

function paintBeard(g: Grid, hair: Hair): void {
  for (let y = 28; y <= 35; y += 1) {
    for (let x = 24; x <= 37; x += 1) {
      const nx = (x - 29) / 9;
      const ny = (y - 24) / 11;
      if (nx * nx + ny * ny > 1) {
        continue;
      }
      if (y <= 30 && x >= 32) {
        continue;
      }
      plot(g, x, y, hair.dark);
    }
  }
  plot(g, 34, 30, PINK_DARK);
  plot(g, 35, 30, PINK_DARK);
}

function paintBackdrop(g: Grid, kit: KitPalette): void {
  const inner = 17 * 17;
  const outer = 22 * 22;
  for (let y = 0; y < g.h; y += 1) {
    for (let x = 0; x < g.w; x += 1) {
      if (get(g, x, y)) {
        continue;
      }
      const base = y >= 52 ? kit.bgFloor : kit.bg;
      const dx = x - 26;
      const dy = y - 22;
      const d2 = dx * dx + dy * dy;
      if (d2 <= inner) {
        plot(g, x, y, kit.bgGlow);
        continue;
      }
      if (d2 <= outer && (x + y) % 2 === 0) {
        plot(g, x, y, kit.bgGlow);
        continue;
      }
      plot(g, x, y, base);
    }
  }
}

function createGrid(w: number, h: number): Grid {
  return { w, h, data: Array.from({ length: w * h }, () => null) };
}

function inBounds(g: Grid, x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < g.w && y < g.h;
}

function plot(g: Grid, x: number, y: number, color: string): void {
  if (!inBounds(g, x, y)) {
    return;
  }
  g.data[y * g.w + x] = color;
}

function get(g: Grid, x: number, y: number): string | null {
  if (!inBounds(g, x, y)) {
    return null;
  }
  return g.data[y * g.w + x] ?? null;
}

function fillRect(g: Grid, x: number, y: number, w: number, h: number, color: string): void {
  for (let yy = y; yy < y + h; yy += 1) {
    for (let xx = x; xx < x + w; xx += 1) {
      plot(g, xx, yy, color);
    }
  }
}

function fillDisc(g: Grid, cx: number, cy: number, r: number, color: string): void {
  fillEllipse(g, cx, cy, r, r, color);
}

function fillEllipse(
  g: Grid,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
): void {
  for (let y = cy - ry; y <= cy + ry; y += 1) {
    for (let x = cx - rx; x <= cx + rx; x += 1) {
      const nx = (x - cx) / rx;
      const ny = (y - cy) / ry;
      if (nx * nx + ny * ny <= 1) {
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
    const jag = (seed + i * 17) % 5 === 0 ? 1 : 0;
    stamp(g, x, y + jag, thickness, color);
    if (x === x1 && y === y1) {
      return;
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
