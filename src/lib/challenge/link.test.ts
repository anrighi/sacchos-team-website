import { describe, expect, it } from "vitest";
import { decodeLineup, decodeLineupOrEmpty, encodeLineup } from "#/lib/challenge/link";
import { emptyLineup, type Lineup } from "#/lib/challenge/lineup";
import { DEFAULT_FORMATION } from "#/lib/challenge/formation";

const host: Lineup = {
  name: "Marco",
  formation: "2-3-1",
  slots: ["gugli-0", "andrea-4", "miriam-8", "chiara-29", "luca-15", "alex-11", "guia-42"],
};

describe("encodeLineup / decodeLineup", () => {
  it("round-trips a full lineup", () => {
    expect(decodeLineup(encodeLineup(host))).toEqual(host);
  });

  it("keeps empty slots in place", () => {
    const partial: Lineup = { ...host, slots: ["gugli-0", null, null, "chiara-29", null, null, null] };
    const decoded = decodeLineup(encodeLineup(partial));
    expect(decoded?.slots).toEqual(partial.slots);
  });

  it("does not mutate the lineup it encodes", () => {
    const snapshot = structuredClone(host);
    encodeLineup(host);
    expect(host).toEqual(snapshot);
  });

  it("normalizes the name on the way out", () => {
    expect(decodeLineup(encodeLineup({ ...host, name: "  Marco  il~Grande " }))?.name).toBe(
      "Marco il Grande",
    );
  });

  it("falls back to the default formation when unknown", () => {
    const decoded = decodeLineup("Marco~4-4-2~a~b~c~d~e~f~g");
    expect(decoded?.formation).toBe(DEFAULT_FORMATION);
  });

  it("always yields seven slots", () => {
    expect(decodeLineup("Marco~3-2-1~a~b")?.slots).toHaveLength(7);
    expect(decodeLineup("Marco~3-2-1~a~b~c~d~e~f~g~h~i")?.slots).toHaveLength(7);
  });

  it("rejects input without a name", () => {
    expect(decodeLineup("")).toBeNull();
    expect(decodeLineup("~3-2-1~a")).toBeNull();
    expect(decodeLineup(undefined)).toBeNull();
    expect(decodeLineup(42)).toBeNull();
  });

  it("falls back to an empty lineup when asked to", () => {
    expect(decodeLineupOrEmpty("nope~")).not.toEqual(emptyLineup());
    expect(decodeLineupOrEmpty("")).toEqual(emptyLineup());
  });
});
