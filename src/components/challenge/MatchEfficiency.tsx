"use client";

import { useEffect, useMemo } from "react";
import {
  formatPct,
  formatSplit,
  recordMatchIn,
  rowsFromShots,
  shotsFrom,
} from "#/lib/challenge/efficiency";
import { playerLabel } from "#/lib/challenge/lineup";
import type { SimEvent } from "#/lib/challenge/sim";
import type { Player } from "#/lib/player";

export function MatchEfficiency({
  seed,
  events,
  roster,
}: {
  seed: string;
  events: readonly SimEvent[];
  roster: readonly Player[];
}) {
  const shots = useMemo(() => shotsFrom(events), [events]);
  const rows = useMemo(() => rowsFromShots(shots), [shots]);
  const attack = rows
    .filter((row) => row.tentativi > 0)
    .toSorted((a, b) => (b.efficienza ?? -1) - (a.efficienza ?? -1) || b.tentativi - a.tentativi);
  const keepers = rows
    .filter((row) => row.shotsFaced > 0)
    .toSorted((a, b) => (b.parate ?? -1) - (a.parate ?? -1));

  useEffect(() => {
    recordMatchIn(window.localStorage, seed, shots);
  }, [seed, shots]);

  if (attack.length === 0 && keepers.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[18px] border border-white/10 bg-white/4 px-4 py-4">
      <h2 className="text-[13px] font-semibold uppercase tracking-[0.18em] text-pink">
        Efficienza
      </h2>
      {attack.length > 0 ? (
        <table className="mt-3 w-full text-left text-[14px]">
          <caption className="sr-only">Tiri in porta e mete</caption>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-white/40">
              <th className="pb-2 font-medium">Tiri in porta</th>
              <th className="pb-2 text-right font-medium">Mete</th>
              <th className="pb-2 text-right font-medium">Eff.</th>
            </tr>
          </thead>
          <tbody>
            {attack.map((row) => (
              <tr key={row.slug} className="border-t border-white/8 text-white">
                <td className="py-2 pr-3">{labelOf(row.slug, roster)}</td>
                <td className="py-2 text-right tabular-nums text-white/80">
                  {formatSplit(row.metas, row.tentativi)}
                </td>
                <td className="py-2 text-right font-display text-lg leading-none text-pink">
                  {formatPct(row.efficienza)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {keepers.length > 0 ? (
        <table className="mt-5 w-full text-left text-[14px]">
          <caption className="sr-only">Parate dei portieri</caption>
          <thead>
            <tr className="text-[11px] uppercase tracking-[0.14em] text-white/40">
              <th className="pb-2 font-medium">Porta</th>
              <th className="pb-2 text-right font-medium">Parate</th>
              <th className="pb-2 text-right font-medium">Eff.</th>
            </tr>
          </thead>
          <tbody>
            {keepers.map((row) => (
              <tr key={row.slug} className="border-t border-white/8 text-white">
                <td className="py-2 pr-3">{labelOf(row.slug, roster)}</td>
                <td className="py-2 text-right tabular-nums text-white/80">
                  {formatSplit(row.impedite, row.shotsFaced)}
                </td>
                <td className="py-2 text-right font-display text-lg leading-none text-pink">
                  {formatPct(row.parate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      <p className="mt-4 text-[12px] text-white/40">
        Efficienza = mete sui tiri arrivati in porta. Resta su questo dispositivo fino all’archivio
        Sheet.
      </p>
    </section>
  );
}

function labelOf(slug: string, roster: readonly Player[]): string {
  const player = roster.find((entry) => entry.slug === slug);
  if (!player) {
    return slug;
  }
  return playerLabel(player, roster);
}
