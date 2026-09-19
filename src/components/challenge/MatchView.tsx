"use client";

import { useEffect, useMemo, useState } from "react";
import { ShareChallenge } from "#/components/challenge/ShareChallenge";
import { players } from "#/data/players.generated";
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
  const [wallMs, setWallMs] = useState(0);

  useEffect(() => {
    setWallMs(0);
    const started = performance.now();
    const duration = totalPlaybackMs(match, reduced);
    let frame = 0;
    const tick = (now: number) => {
      setWallMs(now - started);
      if (now - started < duration) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [match, reduced]);

  const frame = playbackAt(match, wallMs, reduced);
  const log = match.events.slice(0, Math.max(frame.index + 1, 1));

  return (
    <section className="mx-auto max-w-2xl px-5 pb-16 md:px-8">
      <Scoreboard match={match} clock={frame.clock} event={frame.event} done={frame.done} />
      <Ticker event={frame.event} paused={frame.paused} done={frame.done} />
      <EventLog events={log} current={frame.index} />
      {frame.done ? (
        <div className="mt-8 space-y-4">
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
    </section>
  );
}

function Scoreboard({
  match,
  clock,
  event,
  done,
}: {
  match: MatchSim;
  clock: string;
  event: SimEvent | null;
  done: boolean;
}) {
  const score = event?.score ?? match.score;
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/4 px-5 py-6 text-center">
      <p className="font-display text-5xl tracking-tight text-white md:text-6xl">{clock}</p>
      <p className="mt-2 text-[13px] uppercase tracking-[0.28em] text-white/40">
        {done ? "Fine partita" : "Scoutball 2×15′"}
      </p>
      <div className="mt-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <TeamName name={match.hostName} kit="casa" align="right" />
        <p className="font-display text-4xl tracking-tight text-pink md:text-5xl">
          {score.host}–{score.guest}
        </p>
        <TeamName name={match.guestName} kit="trasferta" align="left" />
      </div>
    </div>
  );
}

function TeamName({
  name,
  kit,
  align,
}: {
  name: string;
  kit: string;
  align: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "text-right" : "text-left"}>
      <p className="truncate text-[15px] font-semibold text-white">{name}</p>
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">{kit}</p>
    </div>
  );
}

function Ticker({
  event,
  paused,
  done,
}: {
  event: SimEvent | null;
  paused: boolean;
  done: boolean;
}) {
  if (!event) {
    return (
      <p className="mt-6 text-center text-[15px] text-white/45">Si va al fischio d’inizio.</p>
    );
  }

  return (
    <div
      className={cn(
        "mt-6 rounded-[20px] border px-5 py-5 text-center",
        paused ? "border-pink/40 bg-pink/10" : "border-white/10 bg-white/4",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.22em] text-pink">
        {done ? "Risultato" : event.clock}
      </p>
      <p className="mt-2 font-display text-3xl leading-tight tracking-tight text-white">
        {event.text}
      </p>
    </div>
  );
}

function EventLog({ events, current }: { events: SimEvent[]; current: number }) {
  return (
    <ol className="mt-8 space-y-2">
      {events.map((event, index) => (
        <li
          key={`${event.kind}-${event.t}-${index}`}
          className={cn(
            "flex items-baseline justify-between gap-3 rounded-xl px-3 py-2 text-[14px]",
            index === current ? "bg-white/8 text-white" : "text-white/50",
          )}
        >
          <span className="tabular-nums text-[12px] text-white/35">{event.clock}</span>
          <span className="flex-1 text-left">{event.text}</span>
        </li>
      ))}
    </ol>
  );
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
