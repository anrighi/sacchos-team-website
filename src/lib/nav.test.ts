import { describe, expect, it } from "vitest";
import { siteNavItems } from "#/lib/nav";

describe("siteNavItems", () => {
  it("hides the archive until F6", () => {
    expect(siteNavItems.map((item) => item.to)).toEqual([
      "/",
      "/rosa",
      "/sfida",
    ]);
  });
});
