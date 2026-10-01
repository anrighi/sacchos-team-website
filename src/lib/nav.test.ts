import { describe, expect, it } from "vitest";
import { siteNavItems } from "#/lib/nav";

describe("siteNavItems", () => {
  it("shows the archive in the public nav", () => {
    expect(siteNavItems.map((item) => item.to)).toEqual([
      "/",
      "/rosa",
      "/sfida",
      "/sfide",
    ]);
  });
});
