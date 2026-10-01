import { createFileRoute } from "@tanstack/react-router";
import type { MatchSummary } from "#/lib/challenge/archive";
import { listMatchesFn } from "#/lib/challenge/cloud";

export const Route = createFileRoute("/sfide")({
  loader: () => listMatchesFn(),
  component: SfidePage,
});

function SfidePage() {
  const { matches } = Route.useLoaderData();

  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-16">
      <header className="mb-8">
        <p className="text-sm font-medium text-pink">Risultati</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">Archivio</h1>
      </header>
      {matches.length === 0 ? (
        <p className="text-white/50">Nessuna partita ancora.</p>
      ) : (
        <ol className="divide-y divide-white/8">
          {matches.map((m) => (
            <MatchRow key={m.seed} match={m} />
          ))}
        </ol>
      )}
    </main>
  );
}

function MatchRow({ match }: { match: MatchSummary }) {
  const date = new Date(match.timestamp).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <li>
      <a
        href={match.recapUrl}
        className="group flex items-center gap-3 py-3 hover:bg-white/4 -mx-3 px-3 rounded-xl transition-colors"
      >
        <span className="w-24 shrink-0 text-[13px] tabular-nums text-white/40">{date}</span>
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate text-[15px] font-medium text-white">{match.host.name}</span>
          <span className="shrink-0 font-display text-xl text-pink">
            {match.mete.host}–{match.mete.guest}
          </span>
          <span className="truncate text-[15px] font-medium text-white">{match.guest.name}</span>
        </span>
        <span className="text-[13px] text-white/30 transition-colors group-hover:text-white/60">→</span>
      </a>
    </li>
  );
}
