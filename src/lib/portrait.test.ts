import { describe, expect, it } from "vitest";
import {
  HAIR_COLOR_PRESETS,
  KIT_LAYOUT,
  SKIN_COLOR_PRESETS,
  kitKind,
  portraitOptions,
  portraitSvg,
  resolveHairColor,
  resolveSkinColor,
} from "#/lib/portrait";
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
  it("renders Toon Head with the white home kit, crests and claws", () => {
    const svg = portraitSvg(sample());
    expect(svg).toContain('viewBox="0 0 768 1024"');
    expect(svg).toContain("ToonHead");
    expect(svg).toContain("Johan Melin");
    expect(svg).toContain("id=\"kit-marks\"");
    expect(svg).toContain("crest-sacchos.png");
    expect(svg).toContain("crest-agesci.png");
    expect(svg).toContain("kit-claws.png");
    expect(svg).toContain("#ffffff");
    expect(svg).toContain("tShirt");
  });

  it("renders the navy away kit for Saccios Tim", () => {
    const svg = portraitSvg(
      sample({ slug: "nico-11", team: "Saccios Tim", sex: "M" }),
    );
    expect(svg).toContain("#1a2634");
    expect(svg).toContain("id=\"kit-marks\"");
    expect(svg).toContain("crest-sacchos.png");
    expect(svg).toContain("kit-claws.png");
  });

  it("pins CSV traits on the DiceBear options", () => {
    const options = portraitOptions(
      sample({
        portrait: {
          hair: "spiky",
          rearHair: "none",
          beard: "none",
          eyes: "wink",
          mouth: "laugh",
          hairColor: "2c1b18",
        },
      }),
    );
    expect(options.hairVariant).toEqual(["spiky"]);
    expect(options.rearHairProbability).toBe(0);
    expect(options.beardProbability).toBe(0);
    expect(options.eyesVariant).toEqual(["wink"]);
    expect(options.mouthVariant).toEqual(["laugh"]);
    expect(options.hairColor).toEqual(["2c1b18"]);
    expect(options.clothesVariant).toEqual(["tShirt"]);
  });

  it("picks hair and skin from the 5 presets when the CSV leaves them empty", () => {
    const options = portraitOptions(sample());
    expect(options.hairColor).toEqual(Object.values(HAIR_COLOR_PRESETS));
    expect(options.skinColor).toEqual(Object.values(SKIN_COLOR_PRESETS));
    expect(options.eyesVariant).toBeUndefined();
    expect(options.eyebrowsVariant).toBeUndefined();
    expect(options.mouthVariant).toBeUndefined();
  });

  it("resolves named color presets and custom hex", () => {
    expect(resolveHairColor("biondo")).toBe("d6b370");
    expect(resolveHairColor("black")).toBe("2c1b18");
    expect(resolveSkinColor("chiara")).toBe("f1c3a5");
    expect(resolveSkinColor("#f5d0b0")).toBe("f5d0b0");
  });

  it("keeps the claws below the AGESCI crest", () => {
    const { agesci, claws } = KIT_LAYOUT;
    expect(claws.y).toBeGreaterThan(agesci.y + agesci.height);
    const svg = portraitSvg(sample());
    expect(svg).toContain(`y="${agesci.y}"`);
    expect(svg).toContain(`y="${claws.y}"`);
    expect(svg).toContain(`id="kit-claws-clip-${sample().slug}"`);
  });
});
