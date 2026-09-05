import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { PlayerCard } from "#/components/PlayerCard";
import { players } from "#/data/players.generated";
import { ROLE_LABELS, STAT_KEYS, STAT_NAMES } from "#/lib/player";
import { club } from "#/lib/club";
import { kitKind } from "#/lib/portrait";
import { displayName } from "#/lib/roster";

export const Route = createFileRoute("/giocatori/$slug")({
  loader: ({ params }) => {
    const player = players.find((item) => item.slug === params.slug);
    if (!player) {
      throw notFound();
    }
    return { player };
  },
  head: ({ loaderData }) => {
    const player = loaderData?.player;
    if (!player) {
      return { meta: [{ title: `Giocatore non trovato — ${club.name}` }] };
    }
    const name = displayName(player);
    return {
      meta: [
        { title: `${name} — ${club.name}` },
        {
          name: "description",
          content: `Carta di ${name}, numero ${player.number}, overall ${player.overall}.`,
        },
      ],
    };
  },
  component: PlayerPage,
  notFoundComponent: PlayerMissing,
});

function PlayerPage() {
  const { player } = Route.useLoaderData();
  const name = displayName(player);
  const kit = kitKind(player.team);

  return (
    <main className="relative isolate bg-black text-white">
      <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-x-0 top-0 h-[70vh]" />
      <div className="relative mx-auto max-w-5xl px-5 pb-16 pt-8 md:px-8 md:pt-14">
        <Link
          to="/rosa"
          className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-pink hover:text-pink/80"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Rosa
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-[minmax(0,320px)_1fr] md:items-start md:gap-14">
          <PlayerCard player={player} size="hero" linked={false} />

          <div className="md:pt-4">
            <p className="text-sm font-medium text-pink">{player.team}</p>
            <h1 className="mt-3 font-display text-[clamp(2.6rem,9vw,4.5rem)] leading-none tracking-tight">
              {name}
            </h1>
            <p className="mt-4 text-lg text-white/55">
              {`#${player.number}`}
              {player.role ? ` · ${ROLE_LABELS[player.role]}` : ""}
              {player.birthYear ? ` · ${player.birthYear}` : ""}
              {` · maglia ${kit === "home" ? "casa" : "trasferta"}`}
            </p>

            <div className="mt-10">
              <h2 className="text-[15px] font-semibold tracking-tight text-white">
                Statistiche
              </h2>
              <dl className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {STAT_KEYS.map((key) => (
                  <div key={key}>
                    <div className="flex items-baseline justify-between gap-3">
                      <dt className="text-[15px] text-white/60">
                        {STAT_NAMES[key]}
                      </dt>
                      <dd className="font-display text-2xl leading-none text-white">
                        {player.stats[key]}
                      </dd>
                    </div>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-pink"
                        style={{
                          width: `${Math.min(100, Math.max(6, ((player.stats[key] - 70) / 30) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </dl>
              <div className="mt-8 flex items-baseline justify-between gap-3 border-t border-white/10 pt-6">
                <p className="text-sm uppercase tracking-[0.2em] text-white/45">
                  Overall
                </p>
                <p className="font-display text-5xl leading-none text-pink">
                  {player.overall}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PlayerMissing() {
  return (
    <main className="bg-black px-5 py-24 text-center text-white">
      <p className="text-sm font-medium text-pink">404</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,8vw,4rem)] leading-none tracking-tight">
        Giocatore non trovato
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-white/55">
        Questa carta non è in rosa. Controlla il link oppure torna all’elenco.
      </p>
      <Link
        to="/rosa"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-medium text-navy-deep hover:bg-pink/90"
      >
        Vai alla rosa
      </Link>
    </main>
  );
}
