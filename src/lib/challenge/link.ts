import {
  DEFAULT_FORMATION,
  SQUAD_SIZE,
  isFormationId,
  type FormationId,
} from "#/lib/challenge/formation";
import { emptyLineup, normalizeName, type Lineup, type Slot } from "#/lib/challenge/lineup";

const FIELD = "~";

export function encodeLineup(lineup: Lineup): string {
  return [normalizeName(lineup.name), lineup.formation, ...lineup.slots.map(slotToken)].join(
    FIELD,
  );
}

export function decodeLineup(raw: unknown): Lineup | null {
  if (typeof raw !== "string" || raw.trim() === "") {
    return null;
  }

  const [nameRaw, formationRaw, ...slotTokens] = raw.split(FIELD);
  const name = normalizeName(nameRaw ?? "");
  if (!name) {
    return null;
  }

  const formation: FormationId = isFormationId(formationRaw)
    ? formationRaw
    : DEFAULT_FORMATION;

  const slots: Slot[] = Array.from({ length: SQUAD_SIZE }, (_, index) =>
    tokenToSlot(slotTokens[index]),
  );

  return { name, formation, slots };
}

export function decodeLineupOrEmpty(raw: unknown): Lineup {
  return decodeLineup(raw) ?? emptyLineup();
}

function slotToken(slot: Slot): string {
  return slot ?? "";
}

function tokenToSlot(token: string | undefined): Slot {
  const value = (token ?? "").trim();
  return value === "" ? null : value;
}
