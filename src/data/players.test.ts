import { describe, expect, it } from "vitest";
import { players } from "#/data/players.generated";
import { displayName } from "#/lib/roster";

describe("players snapshot", () => {
  it("has the 2026 seed of 24", () => {
    expect(players).toHaveLength(24);
    expect(players.filter((p) => p.team === "Saccho's Team")).toHaveLength(12);
    expect(players.filter((p) => p.team === "Saccios Tim")).toHaveLength(12);
  });

  it("keeps number 0 and the Saccios override", () => {
    const guglielmo = players.find((p) => p.slug === "guglielmo-0");
    const gianluca = players.find((p) => p.number === 9);
    expect(guglielmo?.number).toBe(0);
    expect(gianluca?.team).toBe("Saccios Tim");
  });

  it("uses nickname when present", () => {
    const giorgia = players.find((p) => p.number === 10 && p.team === "Saccho's Team");
    expect(giorgia?.nickname).toBe("pappagiorgia");
    expect(displayName(giorgia!)).toBe("pappagiorgia");
  });

  it("uses shirt names as nicknames for matching numbers", () => {
    expect(players.find((p) => p.number === 4)?.nickname).toBe("PAPU");
    expect(players.find((p) => p.number === 11)?.nickname).toBe("Trabucco Donosor");
    expect(players.find((p) => p.number === 99)?.nickname).toBe("Ragno");
    expect(players.find((p) => p.number === 0)?.nickname).toBeUndefined();
  });

  it("defaults overall to 75", () => {
    expect(players.every((p) => p.overall === 75)).toBe(true);
  });

  it("stores Toon Head traits from portraits.csv", () => {
    const giorgia = players.find((p) => p.slug === "giorgia-pappagiorgia");
    expect(giorgia?.photo).toBeUndefined();
    expect(giorgia?.portrait?.mouth).toBe("smile");
    expect(giorgia?.portrait?.rearHair).toBe("longWavy");
  });
});
