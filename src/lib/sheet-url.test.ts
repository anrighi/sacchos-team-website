import { describe, expect, it } from "vitest";
import { toGoogleSheetCsvUrl } from "#/lib/sheet-url";

describe("toGoogleSheetCsvUrl", () => {
  it("turns a shared edit link into a CSV export URL", () => {
    const input =
      "https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/edit?usp=drivesdk";
    expect(toGoogleSheetCsvUrl(input)).toBe(
      "https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/export?format=csv",
    );
    const withGid =
      "https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/edit?gid=0#gid=0";
    expect(toGoogleSheetCsvUrl(withGid)).toBe(
      "https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/export?format=csv&gid=0",
    );
  });

  it("keeps gid from the query or hash", () => {
    const fromQuery =
      "https://docs.google.com/spreadsheets/d/abc123/edit?gid=42#gid=42";
    expect(toGoogleSheetCsvUrl(fromQuery)).toBe(
      "https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=42",
    );
    const fromHash = "https://docs.google.com/spreadsheets/d/abc123/edit#gid=7";
    expect(toGoogleSheetCsvUrl(fromHash)).toBe(
      "https://docs.google.com/spreadsheets/d/abc123/export?format=csv&gid=7",
    );
  });

  it("adds output=csv on published /d/e/ links", () => {
    const input = "https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml";
    expect(toGoogleSheetCsvUrl(input)).toBe(
      "https://docs.google.com/spreadsheets/d/e/2PACX-abc/pubhtml?output=csv",
    );
  });

  it("leaves non-Sheet URLs unchanged", () => {
    expect(toGoogleSheetCsvUrl("https://example.com/rosa.csv")).toBe(
      "https://example.com/rosa.csv",
    );
  });
});
