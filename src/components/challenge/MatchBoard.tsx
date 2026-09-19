"use client";

import { PlayerPortrait } from "#/components/PlayerPortrait";
import { ScalpoMark } from "#/components/challenge/ScalpoMark";
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
  const focused = frame.tokens.some((token) => token.highlight);

  return (
    <div
      className={cn(
        "scoutball relative mx-auto mt-3 aspect-[5/3] w-full max-h-[min(36vh,18rem)] rounded-[22px]",
        focused && "scoutball-focus",
      )}
      role="img"
      aria-label="Campo scoutball semplificato, 30 per 18 metri in orizzontale"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
        <FieldMarkings />
      </div>
      <div className="relative z-10 flex h-full items-stretch px-2 pt-4 pb-1 md:px-4">
        <TeamColumns
          lineup={host}
          roster={roster}
          bySlug={bySlug}
          kit="home"
          fromGoal="left"
          reducedMotion={reducedMotion}
        />
        <TeamColumns
          lineup={guest}
          roster={roster}
          bySlug={bySlug}
          kit="away"
          fromGoal="right"
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  );
}

function TeamColumns({
  lineup,
  roster,
  bySlug,
  kit,
  fromGoal,
  reducedMotion,
}: {
  lineup: Lineup;
  roster: readonly Player[];
  bySlug: Map<string, Token>;
  kit: "home" | "away";
  fromGoal: "left" | "right";
  reducedMotion: boolean;
}) {
  const rows = rowsOf(lineup.formation);
  const ordered = fromGoal === "left" ? rows : [...rows].toReversed();

  return (
    <div className="flex flex-1 items-center justify-evenly">
      {ordered.map((row) => (
        <div key={row.label} className="flex flex-col items-center justify-center gap-0.5 md:gap-1">
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
                reducedMotion={reducedMotion}
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
  reducedMotion,
}: {
  token: Token;
  player: Player;
  label: string;
  kit: "home" | "away";
  reducedMotion: boolean;
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
        <span className="scoutball-mug">
          <PlayerPortrait
            player={player}
            kit={kit}
            className="scale-[1.45] object-top"
          />
        </span>
        {token.callout ? (
          <span
            className={cn(
              "scoutball-callout",
              reducedMotion && "scoutball-callout-static",
            )}
          >
            {token.callout}
          </span>
        ) : null}
      </span>
      <span className="scoutball-name">{label}</span>
      <span className="scoutball-scalpi" aria-label={`${remaining} scalpi rimasti`}>
        {Array.from({ length: EMPTY_SCALPS_TO_EXIT }, (_, i) => (
          <ScalpoMark
            key={i}
            spent={i >= remaining}
            className={cn(
              "size-3 md:size-3.5",
              i < remaining ? "text-pink" : "text-white/40",
            )}
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
      viewBox="0 0 300 180"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full"
    >
      <defs>
        <pattern id="scoutball-grass" width="20" height="180" patternUnits="userSpaceOnUse">
          <rect width="10" height="180" fill="#3b8f4c" />
          <rect x="10" width="10" height="180" fill="#347d44" />
        </pattern>
      </defs>
      <rect width="300" height="180" fill="url(#scoutball-grass)" />
      <rect x="4" y="4" width="292" height="172" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4" />
      <line x1="150" y1="4" x2="150" y2="176" stroke="rgba(255,255,255,0.5)" strokeWidth="1.3" />
      <rect x="4" y="4" width="40" height="172" fill="rgba(255,255,255,0.08)" />
      <rect x="256" y="4" width="40" height="172" fill="rgba(255,255,255,0.08)" />
      <line x1="44" y1="4" x2="44" y2="176" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
      <line x1="256" y1="4" x2="256" y2="176" stroke="rgba(255,255,255,0.45)" strokeWidth="1.1" />
      <line x1="4" y1="70" x2="12" y2="70" stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="4" y1="110" x2="12" y2="110" stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="288" y1="70" x2="296" y2="70" stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="288" y1="110" x2="296" y2="110" stroke="rgba(255,255,255,0.9)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="44" cy="8" r="2.2" fill="#f4f1ea" />
      <circle cx="44" cy="172" r="2.2" fill="#f4f1ea" />
      <circle cx="256" cy="8" r="2.2" fill="#f4f1ea" />
      <circle cx="256" cy="172" r="2.2" fill="#f4f1ea" />
    </svg>
  );
}
