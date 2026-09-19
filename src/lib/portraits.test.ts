import { describe, expect, it } from "vitest";
import { applyPortraits, parsePortraitTraits, parsePortraitsCsv } from "#/lib/portraits";
import type { Player } from "#/lib/player";

describe("parsePortraitTraits", () => {
  it("reads english and italian headers", () => {
    const traits = parsePortraitTraits({
      capelli: "spiky",
      barba: "none",
      carnagione: "#c68e7a",
    });
    expect(traits).toEqual({
      hair: "spiky",
      beard: "none",
      skinColor: "c68e7a",
    });
  });

  it("accepts named hair and skin presets", () => {
    expect(parsePortraitTraits({ coloreCapelli: "biondo", carnagione: "chiara" })).toEqual({
      hairColor: "d6b370",
      skinColor: "f1c3a5",
    });
  });

  it("ignores unknown variants", () => {
    expect(parsePortraitTraits({ hair: "mohawk", eyes: "laser" })).toBeUndefined();
  });
});

describe("applyPortraits", () => {
  it("matches by slug and leaves kit stats untouched", () => {
    const csv = `slug,hair,mouth
ada-10,bun,smile`;
    const [player] = applyPortraits([sample()], csv);
    expect(player?.portrait).toEqual({ hair: "bun", mouth: "smile" });
    expect(player?.stats.velocita).toBe(75);
  });

  it("matches by firstName and number when slug is missing", () => {
    const csv = `firstName,number,eyes
Ada,10,wink`;
    const [player] = applyPortraits([sample()], csv);
    expect(player?.portrait?.eyes).toBe("wink");
  });

  it("lets roster-sheet traits win over the portraits file", () => {
    const csv = `slug,hair
ada-10,spiky`;
    const [player] = applyPortraits(
      [sample({ portrait: { hair: "bun", mouth: "smile" } })],
      csv,
    );
    expect(player?.portrait).toEqual({ hair: "bun", mouth: "smile" });
  });
});

describe("parsePortraitsCsv", () => {
  it("skips empty rows", () => {
    const map = parsePortraitsCsv(`slug,hair
ada-10,
nico-11,undercut`);
    expect(map.has("ada-10")).toBe(false);
    expect(map.get("nico-11")).toEqual({ hair: "undercut" });
  });
});

function sample(overrides: Partial<Player> = {}): Player {
  return {
    slug: "ada-10",
    firstName: "Ada",
    team: "Saccho's Team",
    sex: "F",
    number: 10,
    birthYear: 2000,
    overall: 75,
    stats: {
      velocita: 75,
      salto: 75,
      intercetto: 75,
      scalpo: 75,
      finalizzazione: 75,
      gk: 75,
    },
    ...overrides,
  };
}
