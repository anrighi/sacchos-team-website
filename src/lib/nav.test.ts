import { describe, expect, it } from "vitest";
import { siteNavItems } from "#/lib/nav";

describe("siteNavItems", () => {
  it("lists home, rosa, sfida and archive", () => {
    expect(siteNavItems.map((item) => item.to)).toEqual([
      "/",
      "/rosa",
      "/sfida",
      "/sfide",
    ]);
  });
});
