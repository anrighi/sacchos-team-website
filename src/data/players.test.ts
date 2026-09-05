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
    expect(giorgia?.nickname).toBe("bomberona");
    expect(displayName(giorgia!)).toBe("bomberona");
  });

  it("defaults overall to 75", () => {
    expect(players.every((p) => p.overall === 75)).toBe(true);
  });
});
