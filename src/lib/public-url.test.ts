import { describe, expect, it } from "vitest";
import { publicUrl } from "#/lib/public-url";

describe("publicUrl", () => {
  it("prefixes with vite base", () => {
    expect(publicUrl("/brand/logo-sacchos.jpg")).toBe(
      `${import.meta.env.BASE_URL}brand/logo-sacchos.jpg`,
    );
  });
});
