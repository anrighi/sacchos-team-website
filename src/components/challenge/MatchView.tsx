"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { AnalogClock } from "#/components/challenge/AnalogClock";
import { MatchBoard } from "#/components/challenge/MatchBoard";
import { MatchEfficiency } from "#/components/challenge/MatchEfficiency";
import { ShareChallenge } from "#/components/challenge/ShareChallenge";
import { Button } from "#/components/ui/button";
import { players } from "#/data/players.generated";
import { boardAt } from "#/lib/challenge/board";
import type { Lineup } from "#/lib/challenge/lineup";
import {
  playbackAt,
  simulateMatch,
  totalPlaybackMs,
  type MatchSim,
  type SimEvent,
} from "#/lib/challenge/sim";
import { cn } from "#/lib/utils";

export function MatchView({
  host,
  guest,
  seed,
  hostParam,
  guestParam,
  onReplay,
}: {
  host: Lineup;
  guest: Lineup;
  seed: string;
  hostParam: string;
  guestParam: string;
  onReplay: () => void;
}) {
  const match = useMemo(
    () => simulateMatch({ host, guest, roster: players, seed }),
    [guest, host, seed],
  );
  const reduced = useReducedMotion();
  const playback = usePlayback(match, reduced);
  const frame = playbackAt(match, playback.wallMs, reduced);
  const board = boardAt({
    host,
    guest,
    match,
    index: frame.index,
  });
  const happened = match.events.slice(0, Math.max(frame.index + 1, 1));
  const newestFirst = happened.toReversed();

  return (
    <section className="mx-auto flex h-[calc(100dvh-6.5rem)] w-full max-w-3xl flex-col px-4 md:h-[calc(100dvh-6rem)] md:px-8">
      <div className="shrink-0">
        <Scoreboard
          match={match}
          t={frame.t}
          event={frame.event}
          reducedMotion={reduced}
          held={playback.held}
          onToggleHold={playback.toggleHold}
          onRewind={playback.rewind}
        />
        <MatchBoard
          frame={board}
          host={host}
          guest={guest}
          roster={players}
          reducedMotion={reduced}
        />
        <Ticker event={frame.event} paused={frame.paused} />
      </div>
      <div className="relative mt-3 min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto overscroll-contain [scrollbar-width:thin]">
          <EventLog events={newestFirst} current={frame.event} />
          {frame.done ? (
            <div className="mt-6 space-y-4 pb-4">
              <MatchEfficiency seed={seed} events={match.events} roster={players} />
              <button
                type="button"
                onClick={onReplay}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-white/10 text-sm font-medium text-white hover:bg-white/20"
              >
                Rivincita
              </button>
              <ShareChallenge
                ready
                search={{ host: hostParam, guest: guestParam, seed }}
                title={`${match.hostName} ${match.score.host}–${match.score.guest} ${match.guestName}`}
                cta="Copia il link della partita"
                hint="Stesso seed, stesso tabellino. Mandalo a chi si è perso i due tempi."
                waiting=""
              />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Scoreboard({
  match,
  t,
  event,
  reducedMotion,
  held,
  onToggleHold,
  onRewind,
}: {
  match: MatchSim;
  t: number;
  event: SimEvent | null;
  reducedMotion: boolean;
  held: boolean;
  onToggleHold: () => void;
  onRewind: () => void;
}) {
  const score = event?.score ?? match.score;
  const scored = event?.kind === "meta" || event?.kind === "meta-tecnica";
  return (
    <div className="rounded-[18px] border border-white/10 bg-white/4 px-3 py-2 sm:px-5">
      <div className="flex items-center gap-2 sm:gap-4">
        <AnalogClock t={t} className="mx-0 w-16 shrink-0 md:w-[4.75rem]" />
        <div className="grid min-w-0 flex-1 grid-cols-[1fr_auto_1fr] items-center gap-2">
          <p className="truncate text-right text-[14px] font-semibold text-white sm:text-[15px]">{match.hostName}</p>
          <p
            key={`${score.host}-${score.guest}`}
            className={cn(
              "font-display text-3xl tracking-tight text-pink sm:text-4xl",
              scored && !reducedMotion && "score-pop",
            )}
          >
            {score.host}–{score.guest}
          </p>
          <p className="truncate text-left text-[14px] font-semibold text-white sm:text-[15px]">{match.guestName}</p>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={held ? "Riprendi" : "Pausa"}
            aria-pressed={held}
            onClick={onToggleHold}
            className={cn("rounded-full", held && "text-pink")}
          >
            {held ? <Play className="size-5 fill-current" /> : <Pause className="size-5" />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Ricomincia dal fischio"
            onClick={onRewind}
            className="rounded-full"
          >
            <RotateCcw className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Ticker({
  event,
  paused,
}: {
  event: SimEvent | null;
  paused: boolean;
}) {
  if (!event) {
    return (
      <p className="mt-3 text-center font-display text-[15px] tracking-[0.06em] text-white/45">
        Si va al fischio d’inizio.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "mt-3 rounded-[16px] border px-4 py-3 text-center",
        paused ? "border-pink/40 bg-pink/10" : "border-white/10 bg-white/4",
      )}
    >
      <p
        key={`${event.kind}-${event.t}-${event.text}`}
        className={cn(
          "font-display text-xl leading-tight tracking-[0.04em] text-white sm:text-2xl",
          paused && "ticker-pop",
        )}
      >
        {event.text}
      </p>
    </div>
  );
}

function EventLog({ events, current }: { events: SimEvent[]; current: SimEvent | null }) {
  return (
    <ol className="space-y-1">
      {events.map((event, index) => (
        <li
          key={`${event.kind}-${event.t}-${index}`}
          className={cn(
            "flex items-baseline justify-between gap-3 rounded-xl px-3 py-2",
            event === current ? "bg-white/8 text-white" : "text-white/55",
          )}
        >
          <span className="shrink-0 font-display text-[11px] tracking-[0.08em] text-white/40">
            {event.clock}
          </span>
          <span className="flex-1 text-left font-display text-[15px] leading-snug tracking-[0.05em]">
            {event.text}
          </span>
        </li>
      ))}
    </ol>
  );
}

function usePlayback(match: MatchSim, reduced: boolean) {
  const [wallMs, setWallMs] = useState(0);
  const [held, setHeld] = useState(false);
  const wallRef = useRef(0);
  const heldRef = useRef(false);

  useEffect(() => {
    wallRef.current = 0;
    heldRef.current = false;
    setWallMs(0);
    setHeld(false);
  }, [match, reduced]);

  useEffect(() => {
    let last = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 120);
      last = now;
      if (!heldRef.current) {
        const cap = totalPlaybackMs(match, reduced);
        const next = Math.min(cap, wallRef.current + dt);
        if (next !== wallRef.current) {
          wallRef.current = next;
          setWallMs(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [match, reduced]);

  return {
    wallMs,
    held,
    toggleHold: () => {
      heldRef.current = !heldRef.current;
      setHeld(heldRef.current);
    },
    rewind: () => {
      wallRef.current = 0;
      setWallMs(0);
    },
  };
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return reduced;
}
