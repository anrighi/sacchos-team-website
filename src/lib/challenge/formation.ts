export const FORMATION_IDS = ["3-2-1", "2-3-1", "2-1-1-2"] as const;

export type FormationId = (typeof FORMATION_IDS)[number];

export const DEFAULT_FORMATION: FormationId = "3-2-1";

export const SQUAD_SIZE = 7;
export const KEEPER_SLOT = 0;
export const MIN_PER_SEX = 2;

export type FormationLine = {
  label: string;
  slots: number;
};

export type Formation = {
  id: FormationId;
  hint: string;
  lines: readonly FormationLine[];
};

export const FORMATIONS: Record<FormationId, Formation> = {
  "3-2-1": {
    id: "3-2-1",
    hint: "Difesa solida, una punta sola",
    lines: [
      { label: "Portiere", slots: 1 },
      { label: "Difesa", slots: 3 },
      { label: "Centro", slots: 2 },
      { label: "Attacco", slots: 1 },
    ],
  },
  "2-3-1": {
    id: "2-3-1",
    hint: "Centrocampo folto, si costruisce da dietro",
    lines: [
      { label: "Portiere", slots: 1 },
      { label: "Difesa", slots: 2 },
      { label: "Centro", slots: 3 },
      { label: "Attacco", slots: 1 },
    ],
  },
  "2-1-1-2": {
    id: "2-1-1-2",
    hint: "Due punte, rischio alto",
    lines: [
      { label: "Portiere", slots: 1 },
      { label: "Difesa", slots: 2 },
      { label: "Filtro", slots: 1 },
      { label: "Trequarti", slots: 1 },
      { label: "Attacco", slots: 2 },
    ],
  },
};

export function isFormationId(value: unknown): value is FormationId {
  return FORMATION_IDS.some((id) => id === value);
}

export function formationOf(id: FormationId): Formation {
  return FORMATIONS[id];
}

export type FormationRow = {
  label: string;
  slots: number[];
};

export function rowsOf(id: FormationId): FormationRow[] {
  let cursor = 0;
  return FORMATIONS[id].lines.map((line) => {
    const slots = Array.from({ length: line.slots }, (_, i) => cursor + i);
    cursor += line.slots;
    return { label: line.label, slots };
  });
}

export function lineOfSlot(id: FormationId, slot: number): FormationLine | undefined {
  let cursor = 0;
  for (const line of FORMATIONS[id].lines) {
    cursor += line.slots;
    if (slot < cursor) {
      return line;
    }
  }
  return undefined;
}
