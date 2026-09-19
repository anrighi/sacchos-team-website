"use client";

import { Plus } from "lucide-react";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import type { Player } from "#/lib/player";
import { KEEPER_SLOT, rowsOf } from "#/lib/challenge/formation";
import { playerLabel, type Lineup } from "#/lib/challenge/lineup";
import { cn } from "#/lib/utils";

export type PitchKit = "home" | "away";

export function Pitch({
  lineup,
  roster,
  kit,
  onSlot,
  readOnly = false,
}: {
  lineup: Lineup;
  roster: readonly Player[];
  kit: PitchKit;
  onSlot?: (slot: number) => void;
  readOnly?: boolean;
}) {
  const rows = rowsOf(lineup.formation).slice().reverse();

  return (
    <div className="pitch relative overflow-hidden rounded-[22px] border border-white/10 p-3 md:p-5">
      <PitchMarkings />
      <div className="relative flex flex-col-reverse gap-3 md:gap-5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-center gap-2 md:gap-4">
            {row.slots.map((slot) => (
              <PitchSlot
                key={slot}
                slot={slot}
                player={playerAt(lineup, roster, slot)}
                roster={roster}
                kit={kit}
                readOnly={readOnly}
                onSelect={onSlot}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function PitchSlot({
  slot,
  player,
  roster,
  kit,
  readOnly,
  onSelect,
}: {
  slot: number;
  player: Player | null;
  roster: readonly Player[];
  kit: PitchKit;
  readOnly: boolean;
  onSelect?: (slot: number) => void;
}) {
  const keeper = slot === KEEPER_SLOT;
  const ring = kit === "home" ? "ring-white/85" : "ring-pink/75";
  const label = player ? playerLabel(player, roster) : keeper ? "Portiere" : "Libero";

  const face = (
    <>
      <span
        className={cn(
          "relative flex size-14 items-center justify-center overflow-hidden rounded-full md:size-16",
          player
            ? cn("bg-navy-deep ring-2", ring)
            : cn(
                "border-2 border-dashed bg-white/5",
                keeper ? "border-pink/45" : "border-white/25",
              ),
        )}
      >
        {player ? (
          <PlayerPortrait player={player} kit={kit} className="scale-[1.35] object-top" />
        ) : (
          <Plus className="size-5 text-white/45" aria-hidden />
        )}
      </span>
      <span
        className={cn(
          "mt-1.5 block max-w-[4.5rem] truncate text-center text-[11px] leading-tight md:max-w-20 md:text-xs",
          player ? "font-medium text-white" : "text-white/45",
        )}
      >
        {label}
      </span>
      {player ? (
        <span className="block text-center text-[10px] text-pink">#{player.number}</span>
      ) : null}
    </>
  );

  if (readOnly || !onSelect) {
    return <div className="flex w-16 flex-col items-center md:w-20">{face}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(slot)}
      aria-label={player ? `Cambia ${label}` : `Scegli un giocatore per ${label}`}
      className="flex w-16 flex-col items-center rounded-xl py-1 outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-pink md:w-20"
    >
      {face}
    </button>
  );
}

function PitchMarkings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full text-white/12"
    >
      <rect x="4" y="4" width="92" height="132" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <line x1="4" y1="70" x2="96" y2="70" stroke="currentColor" strokeWidth="0.6" />
      <circle cx="50" cy="70" r="14" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <rect x="28" y="4" width="44" height="16" fill="none" stroke="currentColor" strokeWidth="0.6" />
      <rect x="28" y="120" width="44" height="16" fill="none" stroke="currentColor" strokeWidth="0.6" />
    </svg>
  );
}

function playerAt(lineup: Lineup, roster: readonly Player[], slot: number): Player | null {
  const slug = lineup.slots[slot];
  if (!slug) {
    return null;
  }
  return roster.find((player) => player.slug === slug) ?? null;
}
