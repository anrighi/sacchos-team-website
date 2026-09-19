import { describe, expect, it } from "vitest";
import { clampStat, displayName, filterPlayers, overallFromStats, parseRosterCsv, playerSlug, slugify } from "#/lib/roster";
import type { Player, PlayerStats } from "#/lib/player";

const header =
  "firstName,nickname,number,birthYear,team,sex,role,velocita,salto,intercetto,scalpo,finalizzazione,gk";

describe("clampStat", () => {
  it("defaults empty values to 75", () => {
    expect(clampStat("")).toBe(75);
    expect(clampStat(undefined)).toBe(75);
    expect(clampStat("nope")).toBe(75);
  });

  it("clamps to 75–100", () => {
    expect(clampStat(10)).toBe(75);
    expect(clampStat(150)).toBe(100);
    expect(clampStat(82.4)).toBe(82);
  });
});

describe("overallFromStats", () => {
  it("is the rounded mean of the six stats", () => {
    const stats = {
      velocita: 75,
      salto: 76,
      intercetto: 77,
      scalpo: 78,
      finalizzazione: 79,
      gk: 80,
    } satisfies PlayerStats;
    expect(overallFromStats(stats)).toBe(78);
  });
});

describe("parseRosterCsv", () => {
  it("defaults missing stats to 75", () => {
    const [player] = parseRosterCsv("firstName,number,sex\nAda,1,F");
    expect(player?.stats.velocita).toBe(75);
    expect(player?.overall).toBe(75);
  });

  it("clamps stats and computes overall", () => {
    const csv = `${header}\nAda,,1,2000,Saccho's Team,F,,10,150,80,80,80,80`;
    const [player] = parseRosterCsv(csv);
    expect(player?.stats.velocita).toBe(75);
    expect(player?.stats.salto).toBe(100);
    expect(player?.overall).toBe(83);
  });

  it("discards rows without number or firstName", () => {
    const csv = `${header}
, ,1,2000,Saccho's Team,F,,75,75,75,75,75,75
Ada,, ,2000,Saccho's Team,F,,75,75,75,75,75,75
Ada,,2,2000,Saccho's Team,F,,75,75,75,75,75,75`;
    const players = parseRosterCsv(csv);
    expect(players).toHaveLength(1);
    expect(players[0]?.firstName).toBe("Ada");
    expect(players[0]?.number).toBe(2);
  });

  it("keeps shirt number 0", () => {
    const [player] = parseRosterCsv("firstName,number,sex\nGuglielmo,0,M");
    expect(player?.number).toBe(0);
    expect(player?.slug).toBe("guglielmo-0");
  });

  it("uses nickname in the slug when present", () => {
    const [player] = parseRosterCsv(
      "firstName,nickname,number,sex\nGiorgia,bomberona,10,F",
    );
    expect(player?.slug).toBe("giorgia-bomberona");
    expect(displayName(player!)).toBe("bomberona");
  });
});

describe("filterPlayers", () => {
  const sample: Player[] = [
    player("a", "Saccho's Team", "CEN"),
    player("b", "Saccios Tim", "POR"),
  ];

  it("filters by team and role", () => {
    expect(filterPlayers(sample, { team: "saccios" }).map((p) => p.slug)).toEqual(["b"]);
    expect(filterPlayers(sample, { role: "CEN" }).map((p) => p.slug)).toEqual(["a"]);
  });
});

describe("playerSlug", () => {
  it("falls back to number when the nickname slug is taken", () => {
    const used = new Set<string>(["ada-bomber"]);
    expect(playerSlug("Ada", "bomber", 7, used)).toBe("ada-7");
  });

  it("slugifies italian letters", () => {
    expect(slugify("Nicolò")).toBe("nicolo");
  });
});

function player(
  slug: string,
  team: Player["team"],
  role: Player["role"],
): Player {
  return {
    slug,
    firstName: slug,
    team,
    role,
    sex: "F",
    number: 1,
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
