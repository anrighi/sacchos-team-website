import { describe, expect, it } from "vitest";
import { csvCell, parseCsv } from "#/lib/csv";
import {
  parseSheetRole,
  parseSheetSex,
  SHEET_BEARD,
  SHEET_HAIR,
  SHEET_HAIR_COLORS,
  SHEET_SKIN_COLORS,
  sheetTraitLabel,
} from "#/lib/sheet-schema";

describe("csvCell", () => {
  it("matches headers ignoring case, spaces and accents", () => {
    const [row] = parseCsv("Nome,Velocità,Capelli dietro\nAda,80,lunghi mossi");
    expect(csvCell(row ?? {}, "nome")).toBe("Ada");
    expect(csvCell(row ?? {}, "velocita")).toBe("80");
    expect(csvCell(row ?? {}, "capelliDietro")).toBe("lunghi mossi");
  });
});

describe("sheet enums", () => {
  it("parses Italian roles and sex", () => {
    expect(parseSheetRole("Palo")).toBe("PAL");
    expect(parseSheetRole("por")).toBe("POR");
    expect(parseSheetSex("Femmina")).toBe("F");
    expect(parseSheetSex("maschio")).toBe("M");
  });

  it("offers 3 of 5 hair and skin colors", () => {
    expect(SHEET_HAIR_COLORS).toEqual(["nero", "castano", "biondo"]);
    expect(SHEET_SKIN_COLORS).toEqual(["scura", "media", "chiara"]);
  });

  it("maps trait ids to Italian sheet labels", () => {
    expect(sheetTraitLabel(SHEET_HAIR, "spiky")).toBe("irti");
    expect(sheetTraitLabel(SHEET_BEARD, "none")).toBe("nessuno");
    expect(sheetTraitLabel(SHEET_HAIR, undefined)).toBe("");
  });
});
