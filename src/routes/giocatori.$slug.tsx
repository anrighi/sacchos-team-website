import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { PlayerCard } from "#/components/PlayerCard";
import { players } from "#/data/players.generated";
import { ROLE_LABELS, STAT_KEYS, STAT_NAMES } from "#/lib/player";
import { club } from "#/lib/club";
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

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">{club.name}</p>
      <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
        {name}
      </h1>
      <p className="mt-2 text-white/65">
        #{player.number}
        {player.role ? ` · ${ROLE_LABELS[player.role]}` : ""}
        {player.birthYear ? ` · ${player.birthYear}` : ""}
      </p>
      <div className="mx-auto mt-8 max-w-sm">
        <PlayerCard player={player} size="hero" linked={false} />
      </div>
      <section className="mt-10">
        <h2 className="font-display text-2xl text-pink">Statistiche</h2>
        <dl className="mt-4 divide-y divide-white/10 rounded-sm border border-white/10 bg-navy">
          {STAT_KEYS.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <dt className="text-sm text-white/70">{STAT_NAMES[key]}</dt>
              <dd className="font-display text-2xl text-white">
                {player.stats[key]}
              </dd>
            </div>
          ))}
          <div className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm uppercase tracking-wider text-pink">
              Overall
            </dt>
            <dd className="font-display text-2xl text-pink">{player.overall}</dd>
          </div>
        </dl>
      </section>
      <Link
        to="/rosa"
        className="mt-10 inline-flex min-h-11 items-center text-sm uppercase tracking-wider text-pink"
      >
        Torna alla rosa
      </Link>
    </main>
  );
}

function PlayerMissing() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">404</p>
      <h1 className="mt-3 font-display text-4xl text-white">
        Giocatore non trovato
      </h1>
      <p className="mt-4 max-w-md text-white/70">
        Questa carta non è in rosa. Controlla il link oppure torna all’elenco.
      </p>
      <Link
        to="/rosa"
        className="mt-8 inline-flex min-h-11 items-center text-sm uppercase tracking-wider text-pink"
      >
        Vai alla rosa
      </Link>
    </main>
  );
}
