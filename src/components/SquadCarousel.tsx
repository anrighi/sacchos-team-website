"use client";

import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import {
  HOME_CAROUSEL_INTERVAL_MS,
  slideCenterOffset,
  stepIndex,
} from "#/lib/carousel";
import { SHOW_PLAYER_STATS, type Player } from "#/lib/player";
import { displayName } from "#/lib/roster";
import { cn } from "#/lib/utils";

export function SquadCarousel({ players }: { players: readonly Player[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  const programmatic = useRef(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = players.length;

  function scrollToIndex(index: number, behavior: ScrollBehavior) {
    const scroller = scrollerRef.current;
    const slide = slideRefs.current[index];
    if (!scroller || !slide) {
      return;
    }
    programmatic.current = true;
    scroller.scrollTo({
      left: slideCenterOffset(slide.offsetLeft, slide.offsetWidth, scroller.clientWidth),
      behavior,
    });
    window.setTimeout(() => {
      programmatic.current = false;
    }, 500);
  }

  function goTo(index: number) {
    const wraps = (active === count - 1 && index === 0) || (active === 0 && index === count - 1);
    setActive(index);
    scrollToIndex(index, wraps ? "auto" : "smooth");
  }

  function syncActiveFromScroll() {
    if (programmatic.current) {
      return;
    }
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = active;
    let distance = Number.POSITIVE_INFINITY;
    for (let index = 0; index < count; index += 1) {
      const slide = slideRefs.current[index];
      if (!slide) {
        continue;
      }
      const mid = slide.offsetLeft + slide.offsetWidth / 2;
      const nextDistance = Math.abs(mid - center);
      if (nextDistance >= distance) {
        continue;
      }
      distance = nextDistance;
      closest = index;
    }
    if (closest === active) {
      return;
    }
    setActive(closest);
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(stepIndex(active, count, -1));
      return;
    }
    if (event.key !== "ArrowRight") {
      return;
    }
    event.preventDefault();
    goTo(stepIndex(active, count, 1));
  }

  useLayoutEffect(() => {
    scrollToIndex(0, "auto");
  }, [count]);

  useEffect(() => {
    if (count < 2 || paused) {
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }
    const timer = window.setInterval(() => {
      goTo(stepIndex(active, count, 1));
    }, HOME_CAROUSEL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [active, count, paused]);

  if (count === 0) {
    return null;
  }

  const current = players[active];
  const currentName = current ? displayName(current) : "";

  return (
    <div
      className="mt-12 sm:mt-16"
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        setPaused(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") {
          return;
        }
        setPaused(false);
      }}
      onPointerDown={(event) => {
        if (event.pointerType === "mouse") {
          return;
        }
        setPaused(true);
      }}
      onPointerUp={(event) => {
        if (event.pointerType === "mouse") {
          return;
        }
        setPaused(false);
      }}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }
        setPaused(false);
      }}
    >
      <div
        aria-roledescription="carousel"
        aria-label="La squadra"
        className="relative outline-none"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        <ul
          ref={scrollerRef}
          className="home-carousel flex snap-x snap-mandatory items-end overflow-x-auto px-[21%] pt-4 pb-2 touch-pan-x sm:px-[31%] md:px-[38%]"
          onScroll={syncActiveFromScroll}
        >
          {players.map((player, index) => (
            <li
              key={player.slug}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className="w-[58%] shrink-0 snap-center px-2 sm:w-[38%] md:w-[24%]"
            >
              <Slide player={player} delay={`${(index % 5) * -1.1}s`} active={index === active} />
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full text-pink ring-1 ring-pink/40 hover:bg-pink/10"
          aria-label="Giocatore precedente"
          onClick={() => goTo(stepIndex(active, count, -1))}
        >
          <ChevronLeft className="size-5" />
        </button>
        <p
          aria-live="polite"
          className="min-w-28 text-center font-display text-lg uppercase tracking-tight text-white sm:min-w-40 sm:text-xl"
        >
          {currentName}
        </p>
        <button
          type="button"
          className="inline-flex size-11 min-h-11 min-w-11 items-center justify-center rounded-full text-pink ring-1 ring-pink/40 hover:bg-pink/10"
          aria-label="Giocatore successivo"
          onClick={() => goTo(stepIndex(active, count, 1))}
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

function Slide({
  player,
  delay,
  active,
}: {
  player: Player;
  delay: string;
  active: boolean;
}) {
  const name = displayName(player);
  const portrait = (
    <div className={cn("transition-transform duration-500", active ? "scale-100" : "scale-[0.86]")}>
      <div
        className="float-drift aspect-3/4 w-full drop-shadow-[0_18px_28px_rgba(248,103,165,0.18)]"
        style={{ animationDelay: delay }}
      >
        <PlayerPortrait player={player} backdrop={false} />
      </div>
    </div>
  );

  if (!SHOW_PLAYER_STATS) {
    return <div className="text-center">{portrait}</div>;
  }

  return (
    <Link
      to="/giocatori/$slug"
      params={{ slug: player.slug }}
      className="block text-center outline-none focus-visible:ring-2 focus-visible:ring-pink"
      aria-label={name}
      tabIndex={active ? 0 : -1}
    >
      {portrait}
    </Link>
  );
}
