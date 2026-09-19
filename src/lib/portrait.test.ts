import { describe, expect, it } from "vitest";
import { kitKind, portraitOptions, portraitSvg } from "#/lib/portrait";
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
  it("renders Toon Head with the white home kit and pink claws", () => {
    const svg = portraitSvg(sample());
    expect(svg).toContain('viewBox="0 0 768 768"');
    expect(svg).toContain("ToonHead");
    expect(svg).toContain("Johan Melin");
    expect(svg).toContain("id=\"kit-marks\"");
    expect(svg).toContain("#f867a5");
    expect(svg).toContain("#ffffff");
    expect(svg).toContain("tShirt");
  });

  it("renders the navy away kit for Saccios Tim", () => {
    const svg = portraitSvg(
      sample({ slug: "nico-11", team: "Saccios Tim", sex: "M" }),
    );
    expect(svg).toContain("#1a2634");
    expect(svg).toContain("id=\"kit-marks\"");
    expect(svg).toContain("#f867a5");
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
});
