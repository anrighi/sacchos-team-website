import { describe, expect, it } from "vitest";
import {
  applyPortraits,
  parsePortraitTraits,
  parsePortraitsCsv,
  serializePortraitsCsv,
} from "#/lib/portraits";
import { DEFAULT_HAIR_COLORS } from "#/lib/portrait";
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

  it("ignores unknown variants and face expressions", () => {
    expect(parsePortraitTraits({ hair: "mohawk", eyes: "laser" })).toBeUndefined();
    expect(parsePortraitTraits({ occhi: "wink", bocca: "smile", capelli: "irti" })).toEqual({
      hair: "spiky",
    });
  });
});

describe("applyPortraits", () => {
  it("matches by slug and leaves kit stats untouched", () => {
    const csv = `slug,hair,mouth
ada-10,bun,smile`;
    const [player] = applyPortraits([sample()], csv);
    expect(player?.portrait).toEqual({ hair: "bun" });
    expect(player?.stats.velocita).toBe(75);
  });

  it("matches by firstName and number when slug is missing", () => {
    const csv = `firstName,number,beard
Ada,10,nessuno`;
    const [player] = applyPortraits([sample()], csv);
    expect(player?.portrait?.beard).toBe("none");
  });

  it("lets roster-sheet traits win over the portraits file", () => {
    const csv = `slug,hair
ada-10,spiky`;
    const [player] = applyPortraits(
      [sample({ portrait: { hair: "bun", beard: "none" } })],
      csv,
    );
    expect(player?.portrait).toEqual({ hair: "bun", beard: "none" });
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

describe("serializePortraitsCsv", () => {
  it("writes a complete look using Italian color names", () => {
    const csv = serializePortraitsCsv([
      sample({
        portrait: {
          hair: "undercut",
          rearHair: "longWavy",
          beard: "none",
          skinColor: "f1c3a5",
        },
      }),
    ]);
    expect(csv).toContain("ada-10,Ada,10,Saccho's Team,undercut,longWavy,");
    expect(csv).toContain(",chiara,none");
    const hairColor = csv.split("\n")[1]?.split(",")[6];
    expect(["nero", "castano", "biondo"]).toContain(hairColor);
    expect(DEFAULT_HAIR_COLORS.length).toBe(3);
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
