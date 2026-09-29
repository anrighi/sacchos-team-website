import { describe, expect, it } from "vitest";
import { mintLineup, nameSlug, resolveLineup, shortPath } from "#/lib/challenge/shortlink";
import { memoryStore } from "#/lib/challenge/store";
import type { Lineup } from "#/lib/challenge/lineup";

const marco: Lineup = {
  name: "Marco",
  formation: "3-2-1",
  slots: ["gugli-0", "andrea-4", "miriam-8", "chiara-29", "luca-15", "alex-11", "guia-42"],
};

const marcoB: Lineup = {
  ...marco,
  slots: ["gugli-0", "andrea-4", "miriam-8", "chiara-29", "luca-15", "alex-11", "giorgia-1"],
};

describe("shortlink", () => {
  it("uses a name slug when the name is free", async () => {
    const store = memoryStore();
    const id = await mintLineup(store, marco, () => "k7p2qm1a");
    expect(id).toBe("marco");
    expect(nameSlug("Marco")).toBe("marco");
    expect(await resolveLineup(store, id)).toEqual(marco);
  });

  it("round-trips mint and resolve", async () => {
    const store = memoryStore();
    const id = await mintLineup(store, marco);
    expect(await resolveLineup(store, id)).toEqual(marco);
  });

  it("keeps the first name mapping and mints an opaque id on collision", async () => {
    const store = memoryStore();
    const first = await mintLineup(store, marco);
    let n = 0;
    const second = await mintLineup(store, marcoB, () => {
      n += 1;
      return n === 1 ? "k7p2qm1a" : "zzzzzzzz";
    });
    expect(first).toBe("marco");
    expect(second).toBe("k7p2qm1a");
    expect(await resolveLineup(store, "marco")).toEqual(marco);
    expect(await resolveLineup(store, second)).toEqual(marcoB);
  });

  it("returns null for an unknown id", async () => {
    expect(await resolveLineup(memoryStore(), "ignoto")).toBeNull();
  });

  it("reuses the same id when the lineup is unchanged", async () => {
    const store = memoryStore();
    const first = await mintLineup(store, marco);
    const second = await mintLineup(store, marco);
    expect(second).toBe(first);
  });

  it("builds short paths for host and match", () => {
    expect(shortPath("marco")).toBe("/s/marco");
    expect(shortPath("marco", "luca", "seed01")).toBe("/s/marco/luca?seed=seed01");
  });
});
