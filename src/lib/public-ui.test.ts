import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("public UI", () => {
  it("names the home chapter La squadra", () => {
    const src = readFileSync("src/components/HomeLanding.tsx", "utf8");
    expect(src).toContain("La squadra.");
    expect(src).not.toContain("Le carte.");
  });

  it("does not publish the match archive", () => {
    const page = readFileSync("src/routes/sfide.tsx", "utf8");
    const api = readFileSync("src/lib/challenge/cloud.ts", "utf8");
    expect(page).toContain('redirect({ to: "/" })');
    expect(api).not.toContain("listMatchesFn");
    expect(api).not.toContain("listMatchSummaries");
  });
});
