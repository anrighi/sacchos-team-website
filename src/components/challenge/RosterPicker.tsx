"use client";

import { useMemo, useState } from "react";
import { Search, UserMinus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import type { Player } from "#/lib/player";
import { ROLE_LABELS } from "#/lib/player";
import type { KitKind } from "#/lib/portrait";
import { playerLabel } from "#/lib/challenge/lineup";
import { slugify } from "#/lib/roster";
import { cn } from "#/lib/utils";

export function RosterPicker({
  open,
  slotLabel,
  roster,
  taken,
  current,
  kit,
  onPick,
  onClose,
}: {
  open: boolean;
  slotLabel: string;
  roster: readonly Player[];
  taken: ReadonlySet<string>;
  current: string | null;
  kit: KitKind;
  onPick: (slug: string | null) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const needle = slugify(query);

  const matches = useMemo(() => {
    if (!needle) {
      return roster;
    }
    return roster.filter((player) => {
      const haystack = `${slugify(playerLabel(player, roster))}-${player.number}`;
      return haystack.includes(needle);
    });
  }, [needle, roster]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setQuery("");
          onClose();
        }
      }}
    >
      <DialogContent className="max-h-[85dvh] gap-0 overflow-hidden border-white/10 bg-[#11151c] p-0 text-white sm:max-w-lg">
        <DialogHeader className="border-b border-white/10 p-5 pb-4 text-left">
          <DialogTitle className="font-display text-2xl tracking-tight">
            {slotLabel}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Scegli chi schierare. Chi è già in campo resta spento.
          </DialogDescription>
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
              aria-hidden
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Cerca per nome o numero"
              aria-label="Cerca giocatore"
              className="h-11 w-full rounded-full border border-white/12 bg-white/5 pl-9 pr-3 text-[15px] text-white outline-none placeholder:text-white/35 focus-visible:border-pink/60"
            />
          </div>
        </DialogHeader>

        <div className="max-h-[52dvh] overflow-y-auto overscroll-contain p-2">
          {current ? (
            <button
              type="button"
              onClick={() => onPick(null)}
              className="mb-1 flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] text-white/70 hover:bg-white/8"
            >
              <UserMinus className="size-4 text-pink" aria-hidden />
              Libera la posizione
            </button>
          ) : null}

          {matches.length === 0 ? (
            <p className="px-3 py-8 text-center text-[15px] text-white/45">
              Nessun giocatore trovato.
            </p>
          ) : null}

          <ul>
            {matches.map((player) => {
              const busy = taken.has(player.slug) && player.slug !== current;
              return (
                <li key={player.slug}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPick(player.slug)}
                    className={cn(
                      "flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
                      busy
                        ? "cursor-not-allowed opacity-35"
                        : "hover:bg-white/8 focus-visible:bg-white/8",
                      player.slug === current && "bg-pink/15",
                    )}
                  >
                    <span className="size-10 shrink-0 overflow-hidden rounded-full bg-navy-deep">
                      <PlayerPortrait
                        player={player}
                        kit={kit}
                        className="scale-[1.35] object-top"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-white">
                        {playerLabel(player, roster)}
                      </span>
                      <span className="block truncate text-[13px] text-white/45">
                        #{player.number}
                        {player.role ? ` · ${ROLE_LABELS[player.role]}` : ""}
                        {` · ${player.sex === "F" ? "ragazza" : "ragazzo"}`}
                        {busy ? " · già in campo" : ""}
                      </span>
                    </span>
                    <span className="font-display text-xl text-pink">{player.overall}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
