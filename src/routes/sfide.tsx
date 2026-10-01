import { Link, createFileRoute } from "@tanstack/react-router";
import { Play, Swords } from "lucide-react";
import type { MatchSide, MatchSummary } from "#/lib/challenge/archive";
import { DEFAULT_FORMATION, SQUAD_SIZE } from "#/lib/challenge/formation";
import { encodeLineup } from "#/lib/challenge/link";
import { listMatchesFn } from "#/lib/challenge/cloud";

export const Route = createFileRoute("/sfide")({
  loader: () => listMatchesFn(),
  component: SfidePage,
});

function lineupParam(side: MatchSide): string {
  const slots = Array.from({ length: SQUAD_SIZE }, (_, i) => side.slugs[i] ?? null);
  return encodeLineup({ name: side.name, formation: DEFAULT_FORMATION, slots });
}

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
    <li className="flex items-center gap-2 py-3">
      <span className="w-24 shrink-0 text-[13px] tabular-nums text-white/40">{date}</span>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        <ChallengeLink side={match.host} />
        <span className="shrink-0 font-display text-xl text-pink">
          {match.mete.host}–{match.mete.guest}
        </span>
        <ChallengeLink side={match.guest} align="left" />
      </div>

      <a
        href={match.recapUrl}
        title="Rivedi la partita"
        className="shrink-0 rounded-full p-1.5 text-white/30 transition-colors hover:bg-white/8 hover:text-white"
      >
        <Play className="size-4 fill-current" aria-hidden />
        <span className="sr-only">Rivedi</span>
      </a>
    </li>
  );
}

function ChallengeLink({ side, align = "right" }: { side: MatchSide; align?: "left" | "right" }) {
  return (
    <Link
      to="/sfida"
      search={{ host: lineupParam(side) }}
      title={`Sfida ${side.name}`}
      className={`group flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-white/8 ${align === "right" ? "flex-row-reverse" : ""}`}
    >
      <span className="truncate text-[15px] font-medium text-white group-hover:text-pink">
        {side.name}
      </span>
      <Swords className="size-3.5 shrink-0 text-white/0 transition-colors group-hover:text-pink" aria-hidden />
    </Link>
  );
}
