import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public UI", () => {
  it("names the home chapter La squadra", () => {
    const src = readFileSync("src/components/HomeLanding.tsx", "utf8");
    expect(src).toContain("La squadra.");
    expect(src).not.toContain("Le carte.");
  });

  it("publishes the match archive at /sfide", () => {
    const page = readFileSync("src/routes/sfide.tsx", "utf8");
    const api = readFileSync("src/lib/challenge/cloud.ts", "utf8");
    expect(page).toContain("listMatchesFn");
    expect(page).not.toContain('redirect({ to: "/" })');
    expect(api).toContain("listMatchesFn");
    expect(api).toContain("listMatchSummaries");
  });

  it("hides player stats in the UI until the Sheet is filled", () => {
    const player = readFileSync("src/lib/player.ts", "utf8");
    const card = readFileSync("src/components/PlayerCard.tsx", "utf8");
    const picker = readFileSync("src/components/challenge/RosterPicker.tsx", "utf8");
    expect(player).toContain("export const SHOW_PLAYER_STATS = false");
    expect(card).toContain("SHOW_PLAYER_STATS");
    expect(picker).toContain("SHOW_PLAYER_STATS");
  });

  it("hides player detail pages until stats are filled", () => {
    const page = readFileSync("src/routes/giocatori.$slug.tsx", "utf8");
    const card = readFileSync("src/components/PlayerCard.tsx", "utf8");
    const carousel = readFileSync("src/components/SquadCarousel.tsx", "utf8");
    expect(page).toContain('redirect({ to: "/rosa" })');
    expect(card).toContain("linked = SHOW_PLAYER_STATS");
    expect(carousel).toContain("SHOW_PLAYER_STATS");
  });

  it("carousels the full roster on the home", () => {
    const home = readFileSync("src/components/HomeLanding.tsx", "utf8");
    const carousel = readFileSync("src/components/SquadCarousel.tsx", "utf8");
    expect(home).toContain("SquadCarousel");
    expect(home).toContain("Math.random()");
    expect(home).not.toContain("giorgia-pappagiorgia");
    expect(carousel).toContain("Giocatore precedente");
    expect(carousel).toContain("Giocatore successivo");
  });
});
