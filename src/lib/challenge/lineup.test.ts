import { describe, expect, it } from "vitest";
import type { Player, Sex } from "#/lib/player";
import {
  clashingSlugs,
  emptyLineup,
  isLineupReady,
  lineupIssues,
  normalizeName,
  playerLabel,
  withPlayerAt,
  type Lineup,
} from "#/lib/challenge/lineup";
import { SQUAD_SIZE } from "#/lib/challenge/formation";

function player(slug: string, sex: Sex, firstName = slug, number = 1): Player {
  return {
    slug,
    firstName,
    team: "Saccho's Team",
    sex,
    number,
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
  };
}

const roster: Player[] = [
  player("f1", "F"),
  player("f2", "F"),
  player("f3", "F"),
  player("m1", "M"),
  player("m2", "M"),
  player("m3", "M"),
  player("m4", "M"),
  player("m5", "M"),
];

function lineupOf(slugs: (string | null)[], name = "Marco"): Lineup {
  return { ...emptyLineup(), name, slots: slugs };
}

const valid = lineupOf(["m1", "f1", "f2", "m2", "m3", "m4", "m5"]);

describe("normalizeName", () => {
  it("trims, collapses spaces and drops the field separator", () => {
    expect(normalizeName("  Marco   il~Grande ")).toBe("Marco il Grande");
  });

  it("caps the length", () => {
    expect(normalizeName("a".repeat(40))).toHaveLength(24);
  });
});

describe("lineupIssues", () => {
  it("accepts a full lineup with keeper and both sexes", () => {
    expect(lineupIssues(valid, roster)).toEqual([]);
    expect(isLineupReady(valid, roster)).toBe(true);
  });

  it("requires a name", () => {
    expect(lineupIssues({ ...valid, name: "   " }, roster)).toContain("name");
  });

  it(`requires ${SQUAD_SIZE} titolari`, () => {
    const short = lineupOf(["m1", "f1", "f2", "m2", "m3", "m4", null]);
    expect(lineupIssues(short, roster)).toContain("count");
  });

  it("requires the keeper slot", () => {
    const noKeeper = lineupOf([null, "f1", "f2", "m2", "m3", "m4", "m5"]);
    expect(lineupIssues(noKeeper, roster)).toContain("keeper");
  });

  it("requires at least two players per sex", () => {
    const onlyOneGirl = lineupOf(["m1", "f1", "m2", "m3", "m4", "m5", "m1"]);
    expect(lineupIssues(onlyOneGirl, roster)).toContain("sex");
  });

  it("rejects the same player twice", () => {
    const twice = lineupOf(["m1", "f1", "f2", "m2", "m3", "m4", "m1"]);
    expect(lineupIssues(twice, roster)).toContain("duplicate");
  });

  it("rejects a slug that left the roster", () => {
    const ghost = lineupOf(["m1", "f1", "f2", "m2", "m3", "m4", "chi-e"]);
    expect(lineupIssues(ghost, roster)).toContain("unknown");
  });
});

describe("withPlayerAt", () => {
  it("moves a player instead of cloning him", () => {
    const moved = withPlayerAt(valid, 3, "m1");
    expect(moved.slots[3]).toBe("m1");
    expect(moved.slots[0]).toBeNull();
  });

  it("clears a slot with null", () => {
    expect(withPlayerAt(valid, 2, null).slots[2]).toBeNull();
  });

  it("ignores a slot out of range", () => {
    expect(withPlayerAt(valid, 9, "f3")).toBe(valid);
  });
});

describe("clashingSlugs", () => {
  it("lists players schierati in entrambe le rose", () => {
    const guest = lineupOf(["f3", "m1", "f1", "m2", "m3", "m4", "m5"], "Luca");
    expect(clashingSlugs(valid, guest)).toEqual(["m1", "f1", "m2", "m3", "m4", "m5"]);
  });

  it("is empty when the two squads are disjoint", () => {
    const host = lineupOf(["m1", "f1", "f2", "m2", null, null, null]);
    const guest = lineupOf(["m3", "f3", "m4", "m5", null, null, null], "Luca");
    expect(clashingSlugs(host, guest)).toEqual([]);
  });
});

describe("playerLabel", () => {
  it("uses the plain name when unique", () => {
    expect(playerLabel(player("andrea-4", "M", "Andrea", 4), roster)).toBe("Andrea");
  });

  it("adds the shirt number when two players share a name", () => {
    const andreaFour = player("andrea-4", "M", "Andrea", 4);
    const andreaTwentyThree = player("andrea-23", "M", "Andrea", 23);
    const both = [andreaFour, andreaTwentyThree];
    expect(playerLabel(andreaFour, both)).toBe("Andrea 4");
    expect(playerLabel(andreaTwentyThree, both)).toBe("Andrea 23");
  });
});
