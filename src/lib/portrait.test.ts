import { describe, expect, it } from "vitest";
import { kitKind, portraitSvg } from "#/lib/portrait";
import type { Player } from "#/lib/player";

const stats = {
  velocita: 75,
  salto: 75,
  intercetto: 75,
  scalpo: 75,
  finalizzazione: 75,
  gk: 75,
};

function sample(overrides: Partial<Player> = {}): Player {
  return {
    slug: "ada-10",
    firstName: "Ada",
    team: "Saccho's Team",
    sex: "F",
    number: 10,
    birthYear: 2000,
    overall: 75,
    stats,
    ...overrides,
  };
}

describe("kitKind", () => {
  it("uses the white home kit for Saccho's Team", () => {
    expect(kitKind("Saccho's Team")).toBe("home");
  });

  it("uses the navy away kit for Saccios Tim", () => {
    expect(kitKind("Saccios Tim")).toBe("away");
  });
});

describe("portraitSvg", () => {
  it("draws a pixel-art white kit with pink claws", () => {
    const svg = portraitSvg(sample());
    expect(svg).toContain('viewBox="0 0 48 64"');
    expect(svg).toContain('shape-rendering="crispEdges"');
    expect(svg).toContain('id="kit-body"');
    expect(svg).toContain('fill="#ffffff"');
    expect(svg).toContain("#f867a5");
    expect(svg).toContain('id="claw-slashes"');
    expect(svg).toContain('id="badge-agesci"');
    expect(svg).toContain('id="badge-sacchos"');
    expect(svg).toContain("Maglia casa bianca");
  });

  it("draws the navy away kit for Saccios Tim", () => {
    const svg = portraitSvg(
      sample({ slug: "nico-11", team: "Saccios Tim", sex: "M" }),
    );
    expect(svg).toContain('fill="#1a2634"');
    expect(svg).toContain("Maglia trasferta navy");
    expect(svg).toContain('id="claw-slashes"');
  });
});
