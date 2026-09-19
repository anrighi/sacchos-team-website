"use client";

import { PlayerPortrait } from "#/components/PlayerPortrait";
import type { BoardFrame, Token } from "#/lib/challenge/board";
import { playerLabel } from "#/lib/challenge/lineup";
import type { Player } from "#/lib/player";
import { cn } from "#/lib/utils";

export function MatchBoard({
  frame,
  roster,
}: {
  frame: BoardFrame;
  roster: readonly Player[];
}) {
  const tokens = [...frame.tokens].sort((a, b) => a.y - b.y);

  return (
    <div
      className="subbuteo relative mx-auto mt-6 aspect-[3/4] w-full max-w-md max-h-[min(62vh,32rem)] overflow-hidden rounded-[22px]"
      role="img"
      aria-label="Campo Subbuteo con le due formazioni"
    >
      <BoardMarkings />
      {tokens.map((token) => {
        const player = roster.find((entry) => entry.slug === token.slug);
        if (!player) {
          return null;
        }
        return (
          <Figurine
            key={token.slug}
            token={token}
            player={player}
            label={playerLabel(player, roster)}
          />
        );
      })}
      <span
        className="subbuteo-ball"
        style={{
          left: `${frame.ball.x}%`,
          top: `${frame.ball.y}%`,
          zIndex: Math.round(frame.ball.y * 10) + 20,
        }}
      />
    </div>
  );
}

function Figurine({
  token,
  player,
  label,
}: {
  token: Token;
  player: Player;
  label: string;
}) {
  const away = token.side === "guest";

  return (
    <div
      className={cn("subbuteo-token", !token.onField && "opacity-55")}
      style={{
        left: `${token.x}%`,
        top: `${token.y}%`,
        zIndex: Math.round(token.y * 10) + (token.highlight ? 40 : 0),
      }}
    >
      <div className="subbuteo-figure" data-highlight={token.highlight ? "true" : "false"}>
        <span className={cn("subbuteo-face", away && "subbuteo-face-away")}>
          <PlayerPortrait
            player={player}
            kit={away ? "away" : "home"}
            className="scale-[1.45] object-top"
          />
        </span>
        <span className="subbuteo-base" data-kit={away ? "away" : "home"} />
      </div>
      <span className="subbuteo-name">{label}</span>
    </div>
  );
}

function BoardMarkings() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 size-full text-white/35"
    >
      <rect x="4" y="4" width="92" height="132" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <line x1="4" y1="70" x2="96" y2="70" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="50" cy="70" r="12" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="50" cy="70" r="0.9" fill="currentColor" />
      <rect x="26" y="4" width="48" height="18" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <rect x="36" y="4" width="28" height="8" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <rect x="26" y="118" width="48" height="18" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <rect x="36" y="128" width="28" height="8" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M4 10 A6 6 0 0 1 10 4" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M90 4 A6 6 0 0 1 96 10" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M4 130 A6 6 0 0 0 10 136" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <path d="M90 136 A6 6 0 0 0 96 130" fill="none" stroke="currentColor" strokeWidth="0.7" />
      <rect x="38" y="1.2" width="24" height="2.8" rx="0.4" fill="currentColor" opacity="0.55" />
      <rect x="38" y="136" width="24" height="2.8" rx="0.4" fill="currentColor" opacity="0.55" />
    </svg>
  );
}
