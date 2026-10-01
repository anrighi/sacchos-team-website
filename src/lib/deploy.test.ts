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
      kv_namespaces?: Array<{ binding: string; id: string }>;
      routes: Array<{ pattern: string; zone_name: string; custom_domain: boolean }>;
    };
    expect(wrangler.name).toBe("sacchos");
    expect(wrangler.kv_namespaces).toBeUndefined();
    expect(wrangler.routes).toEqual([
      {
        pattern: "sacchos.agescipesaro1.it",
        zone_name: "agescipesaro1.it",
        custom_domain: true,
      },
    ]);
  });

  it("resolves the zone account before CLOUDFLARE_ACCOUNT_ID", () => {
    const script = readFileSync("scripts/ci-resolve-cloudflare-account.sh", "utf8");
    const zoneLookup = script.indexOf("zones?name=agescipesaro1.it");
    const secretFallback = script.indexOf("Using CLOUDFLARE_ACCOUNT_ID secret");
    expect(zoneLookup).toBeGreaterThan(-1);
    expect(secretFallback).toBeGreaterThan(zoneLookup);
  });
});
