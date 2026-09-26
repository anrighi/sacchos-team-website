import { describe, expect, it } from "vitest";
import { club } from "#/lib/club";

describe("club", () => {
  it("is branded as Saccho's Team", () => {
    expect(club.name).toBe("Saccho's Team");
    expect(club.group).toBe("AGESCI Pesaro 1");
    expect(club.productionUrl).toBe("https://sacchos.agescipesaro1.it");
  });
});
