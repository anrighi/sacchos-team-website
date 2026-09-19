import { describe, expect, it } from "vitest";

describe("bootstrap", () => {
  it("runs in node 26+", () => {
    const major = Number(process.versions.node.split(".")[0]);
    expect(major).toBeGreaterThanOrEqual(26);
  });
});
