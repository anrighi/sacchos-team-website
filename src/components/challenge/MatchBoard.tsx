"use client";

import { Heart } from "lucide-react";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import type { BoardFrame, Token } from "#/lib/challenge/board";
import { rowsOf } from "#/lib/challenge/formation";
import { EMPTY_SCALPS_TO_EXIT } from "#/lib/challenge/sim";
import { playerLabel, type Lineup } from "#/lib/challenge/lineup";
import type { Player } from "#/lib/player";
import { cn } from "#/lib/utils";

export function MatchBoard({
  frame,
  host,
  guest,
  roster,
  reducedMotion,
}: {
  frame: BoardFrame;
  host: Lineup;
  guest: Lineup;
  roster: readonly Player[];
  reducedMotion: boolean;
}) {
  const bySlug = new Map(frame.tokens.map((token) => [token.slug, token]));

  return (
    <div
      className="scoutball relative mx-auto mt-6 aspect-[3/5] h-[min(62vh,34rem)] w-auto max-w-full overflow-hidden rounded-[22px]"
      role="img"
      aria-label="Campo scoutball 30 per 18 metri"
    >
      <FieldMarkings />
      <div className="relative z-10 flex h-full flex-col px-2 md:px-3">
        <div className="flex flex-1 flex-col justify-start pt-[3%] pb-1">
          <TeamLines
            lineup={guest}
            roster={roster}
            bySlug={bySlug}
            kit="away"
            keeperFirst
          />
        </div>
        <div className="flex flex-1 flex-col justify-end pb-[3%] pt-1">
          <TeamLines
            lineup={host}
            roster={roster}
            bySlug={bySlug}
            kit="home"
            keeperFirst={false}
          />
        </div>
      </div>
      <span
        className={cn("scoutball-ball", reducedMotion && "scoutball-ball-static")}
        style={{ left: `${frame.ball.x}%`, top: `${frame.ball.y}%` }}
      />
      {frame.flash ? (
        <p
          key={`${frame.flash.kind}-${frame.flash.label}`}
          className={cn(
            "scoutball-flash",
            reducedMotion && "scoutball-flash-static",
          )}
        >
          {frame.flash.label}
        </p>
      ) : null}
    </div>
  );
}

function TeamLines({
  lineup,
  roster,
  bySlug,
  kit,
  keeperFirst,
}: {
  lineup: Lineup;
  roster: readonly Player[];
  bySlug: Map<string, Token>;
  kit: "home" | "away";
  keeperFirst: boolean;
}) {
  const rows = rowsOf(lineup.formation);
  const ordered = keeperFirst ? rows : [...rows].toReversed();

  return (
    <div className="flex flex-col gap-1 md:gap-1.5">
      {ordered.map((row) => (
        <div key={row.label} className="flex items-start justify-center gap-1 md:gap-2">
          {row.slots.map((slot) => {
            const slug = lineup.slots[slot];
            const token = slug ? bySlug.get(slug) : undefined;
            if (!token) {
              return null;
            }
            const player = roster.find((entry) => entry.slug === token.slug);
            if (!player) {
              return null;
            }
            return (
              <Card
                key={token.slug}
                token={token}
                player={player}
                label={playerLabel(player, roster)}
                kit={kit}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

function Card({
  token,
  player,
  label,
  kit,
}: {
  token: Token;
  player: Player;
  label: string;
  kit: "home" | "away";
}) {
  const away = kit === "away";
  const remaining = EMPTY_SCALPS_TO_EXIT - token.vuoti;

  return (
    <div
      className={cn(
        "scoutball-card",
        token.highlight && "scoutball-card-hot",
        !token.onField && "scoutball-card-out",
      )}
    >
      <span className={cn("scoutball-face", away && "scoutball-face-away")}>
        <PlayerPortrait
          player={player}
          kit={kit}
          className="scale-[1.45] object-top"
        />
      </span>
      <span className="scoutball-name">{label}</span>
      <span className="scoutball-hearts" aria-label={`${remaining} vuoti rimasti`}>
        {Array.from({ length: EMPTY_SCALPS_TO_EXIT }, (_, i) => (
          <Heart
            key={i}
            className={cn(
              "size-2.5",
              i < remaining ? "fill-pink text-pink" : "text-white/25",
            )}
            aria-hidden
          />
        ))}
      </span>
    </div>
  );
}

function FieldMarkings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 180 300"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <defs>
        <pattern id="scoutball-grass" width="18" height="300" patternUnits="userSpaceOnUse">
          <rect width="9" height="300" fill="#3b8f4c" />
          <rect x="9" width="9" height="300" fill="#347d44" />
        </pattern>
      </defs>
      <rect width="180" height="300" fill="url(#scoutball-grass)" />
      <rect x="4" y="4" width="172" height="292" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      <line x1="4" y1="150" x2="176" y2="150" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      <rect x="4" y="4" width="172" height="40" fill="rgba(255,255,255,0.08)" />
      <rect x="4" y="256" width="172" height="40" fill="rgba(255,255,255,0.08)" />
      <line x1="4" y1="44" x2="176" y2="44" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
      <line x1="4" y1="256" x2="176" y2="256" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1" />
      <line x1="70" y1="4" x2="70" y2="14" stroke="rgba(255,255,255,0.9)" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="110" y1="4" x2="110" y2="14" stroke="rgba(255,255,255,0.9)" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="70" y1="286" x2="70" y2="296" stroke="rgba(255,255,255,0.9)" strokeWidth="2.4" strokeLinecap="round" />
      <line x1="110" y1="286" x2="110" y2="296" stroke="rgba(255,255,255,0.9)" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="8" cy="44" r="2.2" fill="#f4f1ea" />
      <circle cx="172" cy="44" r="2.2" fill="#f4f1ea" />
      <circle cx="8" cy="256" r="2.2" fill="#f4f1ea" />
      <circle cx="172" cy="256" r="2.2" fill="#f4f1ea" />
    </svg>
  );
}
