import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { club } from "#/lib/club";

describe("cloudflare deploy", () => {
  it("uses the club domain as canonical URL", () => {
    expect(club.productionUrl).toBe("https://sacchos.agescipesaro1.it");
  });

  it("binds the Worker custom domain", () => {
    const wrangler = JSON.parse(readFileSync("wrangler.jsonc", "utf8")) as {
      name: string;
      routes: Array<{ pattern: string; custom_domain: boolean }>;
    };
    expect(wrangler.name).toBe("sacchos");
    expect(wrangler.routes).toEqual([
      { pattern: "sacchos.agescipesaro1.it", custom_domain: true },
    ]);
  });
});
