import { createFileRoute, Link } from "@tanstack/react-router";
import { players } from "#/data/players.generated";
import { listMatchesFn } from "#/lib/challenge/cloud";
import { displayName } from "#/lib/roster";

export const Route = createFileRoute("/sfide")({
  loader: () => listMatchesFn(),
  component: ArchivePage,
});

function ArchivePage() {
  const matches = Route.useLoaderData();

  return (
    <main className="bg-black text-white">
      <header className="relative isolate overflow-hidden px-5 pb-10 pt-12 text-center md:px-8 md:pt-20">
        <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
        <p className="relative text-sm font-medium text-pink">Partite</p>
        <h1 className="relative mt-3 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.9] tracking-tight">
          Archivio.
        </h1>
        <p className="relative mx-auto mt-4 max-w-xs text-white/60">Tabellini finiti, su Cloudflare.</p>
      </header>
      <section className="mx-auto max-w-2xl px-5 pb-24 md:px-8">
        {matches.length === 0 ? (
          <p className="rounded-[20px] border border-white/10 px-5 py-8 text-center text-[15px] text-white/50">
            Nessuna sfida archiviata. I link delle partite restano validi.
          </p>
        ) : (
          <ul className="space-y-3">
            {matches.map((match) => (
              <li key={match.seed}>
                <a
                  href={match.recapUrl}
                  className="block rounded-[20px] border border-pink/25 bg-pink/8 px-5 py-4"
                >
                  <p className="font-display text-2xl leading-none tracking-tight text-white">
                    {match.displayName}
                  </p>
                  <p className="mt-3 text-[15px] text-white/55">
                    {formatWhen(match.timestamp)}
                    {match.mvp ? ` · MVP ${labelOf(match.mvp)}` : ""}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
        <Link
          to="/sfida"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90"
        >
          Lancia una sfida
        </Link>
      </section>
    </main>
  );
}

function labelOf(slug: string): string {
  const player = players.find((entry) => entry.slug === slug);
  return player ? displayName(player) : slug;
}

function formatWhen(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
