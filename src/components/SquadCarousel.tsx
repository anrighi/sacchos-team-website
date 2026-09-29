"use client";

import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import {
  HOME_CAROUSEL_INTERVAL_MS,
  closestSlideIndex,
  slideCenterOffset,
  stepIndex,
} from "#/lib/carousel";
import { SHOW_PLAYER_STATS, type Player } from "#/lib/player";
import { displayName } from "#/lib/roster";
import { cn } from "#/lib/utils";

type DragState = {
  pointerId: number;
  startX: number;
  startScroll: number;
  moved: boolean;
};

export function SquadCarousel({ players }: { players: readonly Player[] }) {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const slideRefs = useRef<(HTMLLIElement | null)[]>([]);
  const programmatic = useRef(false);
  const drag = useRef<DragState | null>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = players.length;

  function slideMids() {
    return slideRefs.current.slice(0, count).map((slide) => {
      if (!slide) {
        return 0;
      }
      return slide.offsetLeft + slide.offsetWidth / 2;
    });
  }

  function indexFromScroll() {
    const scroller = scrollerRef.current;
    if (!scroller) {
      return active;
    }
    return closestSlideIndex(slideMids(), scroller.scrollLeft + scroller.clientWidth / 2);
  }

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
    if (programmatic.current || drag.current) {
      return;
    }
    const closest = indexFromScroll();
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

  function onScrollerPointerDown(event: PointerEvent<HTMLUListElement>) {
    const scroller = scrollerRef.current;
    if (!scroller || event.pointerType === "touch") {
      return;
    }
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: scroller.scrollLeft,
      moved: false,
    };
    scroller.setPointerCapture(event.pointerId);
  }

  function onScrollerPointerMove(event: PointerEvent<HTMLUListElement>) {
    const state = drag.current;
    const scroller = scrollerRef.current;
    if (!state || !scroller || event.pointerId !== state.pointerId) {
      return;
    }
    const dx = event.clientX - state.startX;
    if (Math.abs(dx) < 8 && !state.moved) {
      return;
    }
    state.moved = true;
    programmatic.current = true;
    scroller.scrollLeft = state.startScroll - dx;
  }

  function onScrollerPointerUp(event: PointerEvent<HTMLUListElement>) {
    const state = drag.current;
    const scroller = scrollerRef.current;
    if (!state || event.pointerId !== state.pointerId) {
      return;
    }
    drag.current = null;
    programmatic.current = false;
    if (!state.moved) {
      return;
    }
    event.preventDefault();
    const closest = indexFromScroll();
    setActive(closest);
    if (scroller) {
      scrollToIndex(closest, "smooth");
    }
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
          className="home-carousel flex snap-x snap-mandatory items-end overflow-x-auto pt-4 pb-2 select-none touch-pan-x"
          onScroll={syncActiveFromScroll}
          onPointerDown={onScrollerPointerDown}
          onPointerMove={onScrollerPointerMove}
          onPointerUp={onScrollerPointerUp}
          onPointerCancel={onScrollerPointerUp}
        >
          {players.map((player, index) => (
            <li
              key={player.slug}
              ref={(node) => {
                slideRefs.current[index] = node;
              }}
              className="snap-center px-1"
            >
              <Slide
                player={player}
                delay={`${(index % 5) * -1.1}s`}
                active={index === active}
                onSelect={() => {
                  if (drag.current?.moved || index === active) {
                    return;
                  }
                  goTo(index);
                }}
              />
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
  onSelect,
}: {
  player: Player;
  delay: string;
  active: boolean;
  onSelect: () => void;
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
    return (
      <button type="button" className="block w-full text-center" aria-label={name} aria-current={active} onClick={onSelect}>
        {portrait}
      </button>
    );
  }

  return (
    <Link
      to="/giocatori/$slug"
      params={{ slug: player.slug }}
      className="block text-center outline-none focus-visible:ring-2 focus-visible:ring-pink"
      aria-label={name}
      aria-current={active}
      tabIndex={active ? 0 : -1}
      onClick={(event) => {
        if (active) {
          return;
        }
        event.preventDefault();
        onSelect();
      }}
    >
      {portrait}
    </Link>
  );
}
