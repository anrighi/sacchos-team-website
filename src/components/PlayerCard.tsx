import { Link } from "@tanstack/react-router";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import { STAT_KEYS, STAT_LABELS, type Player } from "#/lib/player";
import { displayName } from "#/lib/roster";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

type CardSize = "grid" | "hero";

export function PlayerCard({
  player,
  size = "grid",
  linked = true,
}: {
  player: Player;
  size?: CardSize;
  linked?: boolean;
}) {
  const name = displayName(player);
  const card = (
    <article
      className={cn(
        "relative flex h-full flex-col overflow-hidden rounded-sm border border-pink/50 bg-linear-to-b from-[#243446] to-navy-deep p-2 shadow-[0_12px_32px_rgba(0,0,0,0.35)]",
        size === "hero" && "p-4 md:p-5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={cn(
              "font-display leading-none text-pink",
              size === "hero" ? "text-5xl md:text-6xl" : "text-3xl",
            )}
          >
            {player.overall}
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-white/70">
            {player.role ?? "—"}
          </p>
        </div>
        <img
          src={publicUrl("/brand/logo-sacchos.jpg")}
          alt="Saccho's Team"
          className={cn(
            "rounded-full object-cover ring-1 ring-pink/70",
            size === "hero" ? "h-12 w-12" : "h-8 w-8",
          )}
        />
      </div>
      <div
        className={cn(
          "relative mx-auto mt-1 aspect-3/4 w-[78%] overflow-hidden rounded-sm bg-navy",
          size === "hero" && "mt-3 w-[70%]",
        )}
      >
        <PlayerPortrait player={player} />
      </div>
      <h2
        className={cn(
          "mt-2 truncate text-center font-display uppercase tracking-wide text-white",
          size === "hero" ? "text-2xl md:text-3xl" : "text-sm",
        )}
      >
        {name}
      </h2>
      <p className="text-center text-xs text-pink">{`#${player.number}`}</p>
      <dl
        className={cn(
          "mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 border-t border-white/10 pt-2",
          size === "hero" && "mt-4 gap-y-1 pt-4",
        )}
      >
        {STAT_KEYS.map((key) => (
          <div key={key} className="flex items-baseline justify-between gap-1">
            <dt className="text-[10px] uppercase tracking-wider text-white/50">
              {STAT_LABELS[key]}
            </dt>
            <dd
              className={cn(
                "font-display text-white",
                size === "hero" ? "text-xl" : "text-sm",
              )}
            >
              {player.stats[key]}
            </dd>
          </div>
        ))}
      </dl>
    </article>
  );

  if (!linked) {
    return card;
  }

  return (
    <Link
      to="/giocatori/$slug"
      params={{ slug: player.slug }}
      className="block h-full rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-pink"
      aria-label={`${name}, numero ${player.number}, overall ${player.overall}`}
    >
      {card}
    </Link>
  );
}
