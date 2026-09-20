import { describe, expect, it } from "vitest";
import {
  balancePlayerStats,
  balanceRosterStats,
  clampStat,
  displayName,
  filterPlayers,
  OVERALL_MAX,
  OVERALL_MIN,
  overallFromStats,
  parseRosterCsv,
  playerSlug,
  rosterAverage,
  serializeSheetCsv,
  SHEET_BALANCE_FORMULA,
  SHEET_BALANCE_NOTE,
  slugify,
} from "#/lib/roster";
import type { Player, PlayerStats } from "#/lib/player";

const header =
  "firstName,nickname,number,birthYear,team,sex,role,velocita,salto,intercetto,scalpo,finalizzazione,gk";

describe("clampStat", () => {
  it("defaults empty values to 75", () => {
    expect(clampStat("")).toBe(75);
    expect(clampStat(undefined)).toBe(75);
    expect(clampStat("nope")).toBe(75);
  });

  it("clamps to 60–100", () => {
    expect(clampStat(10)).toBe(60);
    expect(clampStat(60)).toBe(60);
    expect(clampStat(75)).toBe(75);
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

describe("balancePlayerStats", () => {
  it("leaves a media inside 75–90 untouched", () => {
    const stats = {
      velocita: 80,
      salto: 82,
      intercetto: 78,
      scalpo: 75,
      finalizzazione: 90,
      gk: 75,
    } satisfies PlayerStats;
    expect(balancePlayerStats(stats)).toEqual(stats);
    expect(overallFromStats(stats)).toBeGreaterThanOrEqual(OVERALL_MIN);
    expect(overallFromStats(stats)).toBeLessThanOrEqual(OVERALL_MAX);
  });

  it("pulls an overall above 90 down to 90", () => {
    const stats = {
      velocita: 100,
      salto: 100,
      intercetto: 100,
      scalpo: 100,
      finalizzazione: 100,
      gk: 100,
    } satisfies PlayerStats;
    const balanced = balancePlayerStats(stats);
    expect(overallFromStats(balanced)).toBe(OVERALL_MAX);
    expect(Object.values(balanced).every((value) => value >= 60 && value <= 100)).toBe(true);
  });

  it("spreads a high overall without flattening identity", () => {
    const stats = {
      velocita: 100,
      salto: 100,
      intercetto: 100,
      scalpo: 100,
      finalizzazione: 100,
      gk: 75,
    } satisfies PlayerStats;
    const balanced = balancePlayerStats(stats);
    expect(overallFromStats(balanced)).toBe(OVERALL_MAX);
    expect(balanced.gk).toBe(75);
    expect(balanced.velocita).toBeGreaterThan(balanced.gk);
  });

  it("keeps the roster average inside the band", () => {
    const raw = [
      player("hot", "Saccho's Team", undefined, {
        velocita: 100,
        salto: 100,
        intercetto: 100,
        scalpo: 100,
        finalizzazione: 100,
        gk: 100,
      }),
      player("cold", "Saccios Tim", undefined),
    ];
    const balanced = balanceRosterStats(raw);
    expect(balanced.every((item) => item.overall >= OVERALL_MIN && item.overall <= OVERALL_MAX)).toBe(
      true,
    );
    expect(rosterAverage(balanced)).toBeGreaterThanOrEqual(OVERALL_MIN);
    expect(rosterAverage(balanced)).toBeLessThanOrEqual(OVERALL_MAX);
  });

  it("keeps a dumped stat at 60 when raising overall to 75", () => {
    const stats = {
      velocita: 60,
      salto: 75,
      intercetto: 75,
      scalpo: 75,
      finalizzazione: 75,
      gk: 75,
    } satisfies PlayerStats;
    const balanced = balancePlayerStats(stats);
    expect(balanced.velocita).toBe(60);
    expect(overallFromStats(balanced)).toBe(OVERALL_MIN);
  });

  it("documents the Sheet formula and the 75–90 note", () => {
    expect(SHEET_BALANCE_FORMULA).toContain("AVERAGE(H2:M1000)");
    expect(SHEET_BALANCE_NOTE).toContain("75–90");
    expect(SHEET_BALANCE_NOTE).toContain("60–100");
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
    expect(player?.stats.velocita).toBe(60);
    expect(player?.stats.salto).toBe(100);
    expect(player?.overall).toBe(80);
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

  it("reads optional Toon Head traits from extra columns", () => {
    const [player] = parseRosterCsv(
      "firstName,number,sex,hair,beard,mouth\nAda,1,F,spiky,none,smile",
    );
    expect(player?.portrait).toEqual({
      hair: "spiky",
      beard: "none",
    });
  });

  it("reads Italian headers, roles and look values", () => {
    const csv = `Nome,Soprannome,Numero,Anno,Squadra,Sesso,Ruolo,Velocità,Salto,Intercetto,Scalpo,Finalizzazione,Parate,Capelli,Capelli dietro,Colore capelli,Carnagione,Barba
Ada,Winx,14,1998,Saccho's Team,Femmina,Ala,80,75,75,75,90,75,chignon,lunghi mossi,biondo,chiara,nessuno`;
    const [player] = parseRosterCsv(csv);
    expect(player?.firstName).toBe("Ada");
    expect(player?.nickname).toBe("Winx");
    expect(player?.sex).toBe("F");
    expect(player?.role).toBe("ALA");
    expect(player?.stats.velocita).toBe(80);
    expect(player?.stats.finalizzazione).toBe(90);
    expect(player?.stats.gk).toBe(75);
    expect(player?.portrait).toEqual({
      hair: "bun",
      rearHair: "longWavy",
      hairColor: "d6b370",
      skinColor: "f1c3a5",
      beard: "none",
    });
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

describe("serializeSheetCsv", () => {
  it("writes Italian labels, stats 75 and leaves role empty", () => {
    const csv = serializeSheetCsv([
      player("ada", "Saccho's Team", undefined),
    ]);
    expect(csv.startsWith("Nome,Soprannome,Numero,Anno,Squadra,Sesso,Ruolo,")).toBe(true);
    const row = csv.trim().split("\n")[1] ?? "";
    expect(row).toContain("ada,,1,2000,Saccho's Team,Femmina,,75,75,75,75,75,75,");
    expect(row.split(",")[6]).toBe("");
    expect(row).toMatch(/,(nero|castano|biondo),(scura|media|chiara),/);
  });

  it("writes Palo for the PAL role", () => {
    const csv = serializeSheetCsv([
      player("ada", "Saccho's Team", "PAL"),
    ]);
    expect(csv).toContain("Palo");
    expect(csv).not.toContain("Palleggiatore");
  });
});

function player(
  slug: string,
  team: Player["team"],
  role: Player["role"],
  stats?: PlayerStats,
): Player {
  const resolved = stats ?? {
    velocita: 75,
    salto: 75,
    intercetto: 75,
    scalpo: 75,
    finalizzazione: 75,
    gk: 75,
  };
  return {
    slug,
    firstName: slug,
    team,
    role,
    sex: "F",
    number: 1,
    birthYear: 2000,
    overall: overallFromStats(resolved),
    stats: resolved,
  };
}
