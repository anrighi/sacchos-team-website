import { describe, expect, it } from "vitest";
import {
  applyPortraitDefaults,
  completePortraitTraits,
  DEFAULT_HAIR_COLORS,
  DEFAULT_SKIN_COLORS,
  defaultPortraitTraits,
  HAIR_VARIANTS,
  KIT_LAYOUT,
  kitKind,
  portraitOptions,
  portraitSvg,
  resolveHairColor,
  resolveSkinColor,
  sheetHairColorLabel,
  sheetSkinColorLabel,
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

  it("pins CSV hair, beard and color and ignores face expressions", () => {
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
    expect(options.eyesVariant).toBeUndefined();
    expect(options.mouthVariant).toBeUndefined();
    expect(options.hairColor).toEqual(["2c1b18"]);
    expect(options.clothesVariant).toEqual(["tShirt"]);
  });

  it("pins hair, beard and a single color from the 3 defaults", () => {
    const options = portraitOptions(sample());
    expect(HAIR_VARIANTS).toContain((options.hairVariant as string[])[0]);
    expect(options.hairColor).toHaveLength(1);
    expect(DEFAULT_HAIR_COLORS).toContain((options.hairColor as string[])[0]);
    expect(options.skinColor).toHaveLength(1);
    expect(DEFAULT_SKIN_COLORS).toContain((options.skinColor as string[])[0]);
    expect(options.rearHairProbability).toBe(100);
    expect(options.beardProbability).toBe(0);
    expect(options.eyesVariant).toBeUndefined();
    expect(options.eyebrowsVariant).toBeUndefined();
    expect(options.mouthVariant).toBeUndefined();
  });

  it("resolves named color presets and custom hex", () => {
    expect(resolveHairColor("biondo")).toBe("d6b370");
    expect(resolveHairColor("black")).toBe("2c1b18");
    expect(resolveSkinColor("chiara")).toBe("f1c3a5");
    expect(resolveSkinColor("#f5d0b0")).toBe("f5d0b0");
    expect(sheetHairColorLabel("2c1b18")).toBe("nero");
    expect(sheetSkinColorLabel("chiara")).toBe("chiara");
  });

  it("keeps the claws below the AGESCI crest", () => {
    const { agesci, claws } = KIT_LAYOUT;
    expect(claws.y).toBeGreaterThan(agesci.y + agesci.height);
    const svg = portraitSvg(sample());
    expect(svg).toContain(`y="${agesci.y}"`);
    expect(svg).toContain(`y="${claws.y}"`);
    expect(svg).toContain(`id="kit-claws-clip-${sample().slug}"`);
  });

  it("can omit the painted backdrop", () => {
    const withBackdrop = portraitSvg(sample());
    const cutout = portraitSvg(sample(), { backdrop: false });
    expect(withBackdrop).toContain('fill="#182430"');
    expect(cutout).not.toContain('fill="#182430"');
  });

  it("dresses a player in the kit asked for, not the one of his team", () => {
    const player = sample();
    expect(portraitSvg(player, { kit: "away" })).toContain("#1a2634");
    expect(portraitSvg(player, { kit: "home" })).toBe(portraitSvg(player));
  });
});

describe("defaultPortraitTraits", () => {
  it("gives women rear hair and no beard", () => {
    const traits = defaultPortraitTraits(sample({ sex: "F", birthYear: 1998 }));
    expect(traits.beard).toBe("none");
    expect(traits.rearHair).not.toBe("none");
    expect(DEFAULT_HAIR_COLORS).toContain(traits.hairColor);
    expect(DEFAULT_SKIN_COLORS).toContain(traits.skinColor);
  });

  it("gives young men no rear hair and no beard", () => {
    const traits = defaultPortraitTraits(sample({ sex: "M", birthYear: 2000 }));
    expect(traits.rearHair).toBe("none");
    expect(traits.beard).toBe("none");
  });

  it("gives older men a beard", () => {
    const traits = defaultPortraitTraits(
      sample({ slug: "marco-mt", sex: "M", birthYear: 1983 }),
    );
    expect(traits.rearHair).toBe("none");
    expect(traits.beard).not.toBe("none");
  });

  it("is stable for the same slug", () => {
    expect(defaultPortraitTraits(sample())).toEqual(defaultPortraitTraits(sample()));
  });

  it("fills only missing custom traits", () => {
    const player = sample({
      portrait: {
        hair: "undercut",
        rearHair: "longWavy",
        beard: "none",
        skinColor: "f1c3a5",
      },
    });
    const traits = completePortraitTraits(player);
    expect(traits.hair).toBe("undercut");
    expect(traits.rearHair).toBe("longWavy");
    expect(traits.beard).toBe("none");
    expect(traits.skinColor).toBe("f1c3a5");
    expect(DEFAULT_HAIR_COLORS).toContain(traits.hairColor);
  });

  it("applies a complete look to every player", () => {
    const [filled] = applyPortraitDefaults([sample({ portrait: undefined })]);
    expect(filled?.portrait?.hair).toBeTruthy();
    expect(filled?.portrait?.hairColor).toBeTruthy();
    expect(filled?.portrait?.skinColor).toBeTruthy();
  });
});
