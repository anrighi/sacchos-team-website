import { Link } from "@tanstack/react-router";
import { PlayerPortrait } from "#/components/PlayerPortrait";
import { STAT_KEYS, STAT_LABELS, type Player, type StatKey } from "#/lib/player";
import { kitKind } from "#/lib/portrait";
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
  const hero = size === "hero";
  const kit = kitKind(player.team);

  const card = (
    <article
      className={cn(
        "group/card relative flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[#14181f] transition-transform duration-300 group-hover/link:-translate-y-1",
        hero && "rounded-[26px]",
      )}
    >
      <div className="relative aspect-3/4 overflow-hidden">
        <div
          aria-hidden
          className={cn(
            "absolute inset-0",
            kit === "home" ? "kit-glow-home" : "kit-glow-away",
          )}
        />
        <PlayerPortrait player={player} className="relative" />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
          <div className="rounded-xl bg-black/45 px-2 py-1 backdrop-blur-md">
            <p
              className={cn(
                "font-display leading-none text-pink",
                hero ? "text-4xl md:text-5xl" : "text-2xl",
              )}
            >
              {player.overall}
            </p>
            <p
              className={cn(
                "mt-0.5 font-semibold uppercase tracking-[0.2em] text-white/65",
                hero ? "text-[11px]" : "text-[9px]",
              )}
            >
              {player.role ?? "—"}
            </p>
          </div>
          <img
            src={publicUrl("/brand/logo-sacchos.jpg")}
            alt="Saccho's Team"
            className={cn(
              "rounded-full object-cover ring-1 ring-white/25",
              hero ? "size-11" : "size-7",
            )}
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/45 to-transparent px-3 pb-2.5 pt-10">
          <h2
            className={cn(
              "truncate font-display uppercase leading-none tracking-tight text-white",
              hero ? "text-3xl md:text-4xl" : "text-base",
            )}
          >
            {name}
          </h2>
          <p
            className={cn(
              "mt-1 text-white/55",
              hero ? "text-[13px]" : "text-[11px]",
            )}
          >
            {`#${player.number} · ${kit === "home" ? "Casa" : "Trasferta"}`}
          </p>
        </div>
      </div>
      <dl
        className={cn(
          "grid grid-cols-3 gap-x-2.5 gap-y-2 px-3 py-3",
          hero && "gap-x-4 gap-y-4 px-5 py-5",
        )}
      >
        {STAT_KEYS.map((key) => (
          <StatCell key={key} statKey={key} value={player.stats[key]} hero={hero} />
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
      className="group/link block h-full rounded-[20px] outline-none focus-visible:ring-2 focus-visible:ring-pink"
      aria-label={`${name}, numero ${player.number}, overall ${player.overall}`}
    >
      {card}
    </Link>
  );
}

function StatCell({
  statKey,
  value,
  hero,
}: {
  statKey: StatKey;
  value: number;
  hero: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-1">
        <dt
          className={cn(
            "uppercase tracking-wider text-white/45",
            hero ? "text-[11px]" : "text-[9px]",
          )}
        >
          {STAT_LABELS[statKey]}
        </dt>
        <dd
          className={cn(
            "font-display leading-none text-white",
            hero ? "text-xl" : "text-sm",
          )}
        >
          {value}
        </dd>
      </div>
      <div className="mt-1 h-[3px] overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-pink"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
