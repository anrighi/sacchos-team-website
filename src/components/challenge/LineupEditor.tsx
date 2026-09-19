"use client";

import { useState } from "react";
import { AlertCircle, Check, Shuffle } from "lucide-react";
import { Pitch, type PitchKit } from "#/components/challenge/Pitch";
import { RosterPicker } from "#/components/challenge/RosterPicker";
import type { Player } from "#/lib/player";
import {
  FORMATION_IDS,
  FORMATIONS,
  KEEPER_SLOT,
  MAX_NAME_LENGTH,
  ISSUE_MESSAGES,
  canRandomLineup,
  lineOfSlot,
  lineupIssues,
  lineupSlugs,
  randomLineup,
  withFormation,
  withPlayerAt,
  type Lineup,
} from "#/lib/challenge";
import { cn } from "#/lib/utils";

export function LineupEditor({
  lineup,
  roster,
  kit,
  blocked,
  namePlaceholder,
  onChange,
}: {
  lineup: Lineup;
  roster: readonly Player[];
  kit: PitchKit;
  blocked: ReadonlySet<string>;
  namePlaceholder: string;
  onChange: (next: Lineup) => void;
}) {
  const [openSlot, setOpenSlot] = useState<number | null>(null);
  const issues = lineupIssues(lineup, roster);
  const taken = new Set([...blocked, ...lineupSlugs(lineup)]);
  const canShuffle = canRandomLineup(roster, blocked);

  return (
    <div className="space-y-5">
      <div>
        <label
          htmlFor={`nome-${kit}`}
          className="text-[11px] uppercase tracking-[0.2em] text-white/40"
        >
          Nome della rosa
        </label>
        <input
          id={`nome-${kit}`}
          value={lineup.name}
          maxLength={MAX_NAME_LENGTH}
          placeholder={namePlaceholder}
          onChange={(event) => onChange({ ...lineup, name: event.target.value })}
          className="mt-2 h-12 w-full rounded-xl border border-white/12 bg-white/5 px-4 text-[17px] text-white outline-none placeholder:text-white/30 focus-visible:border-pink/60"
        />
      </div>

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/40">Modulo</p>
        <div className="mt-2 flex gap-2">
          {FORMATION_IDS.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => onChange(withFormation(lineup, id))}
              title={FORMATIONS[id].hint}
              className={cn(
                "min-h-10 flex-1 rounded-full text-[13px] font-medium tracking-tight transition-colors",
                lineup.formation === id
                  ? "bg-pink text-navy-deep"
                  : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        disabled={!canShuffle}
        onClick={() => onChange(randomLineup(lineup, roster, blocked))}
        className={cn(
          "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-medium",
          canShuffle
            ? "bg-white/10 text-white hover:bg-white/20"
            : "cursor-not-allowed bg-white/5 text-white/30",
        )}
      >
        <Shuffle className="size-4" aria-hidden />
        Rosa casuale
      </button>

      <Pitch lineup={lineup} roster={roster} kit={kit} onSlot={setOpenSlot} />

      <IssueList issues={issues} />

      <RosterPicker
        open={openSlot !== null}
        slotLabel={slotLabel(lineup, openSlot)}
        roster={roster}
        taken={taken}
        kit={kit}
        current={openSlot === null ? null : (lineup.slots[openSlot] ?? null)}
        onClose={() => setOpenSlot(null)}
        onPick={(slug) => {
          if (openSlot === null) {
            return;
          }
          onChange(withPlayerAt(lineup, openSlot, slug));
          setOpenSlot(null);
        }}
      />
    </div>
  );
}

function IssueList({ issues }: { issues: ReturnType<typeof lineupIssues> }) {
  if (issues.length === 0) {
    return (
      <p className="flex items-center gap-2 text-[15px] text-pink">
        <Check className="size-4" aria-hidden />
        Rosa pronta.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {issues.map((issue) => (
        <li key={issue} className="flex items-center gap-2 text-[15px] text-white/55">
          <AlertCircle className="size-4 shrink-0 text-white/30" aria-hidden />
          {ISSUE_MESSAGES[issue]}
        </li>
      ))}
    </ul>
  );
}

function slotLabel(lineup: Lineup, slot: number | null): string {
  if (slot === null) {
    return "Scegli un giocatore";
  }
  if (slot === KEEPER_SLOT) {
    return "Portiere";
  }
  return lineOfSlot(lineup.formation, slot)?.label ?? "In campo";
}
