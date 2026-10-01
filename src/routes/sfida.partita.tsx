import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, Share2 } from "lucide-react";
import { useState } from "react";
import { players } from "#/data/players.generated";
import { mvpOf } from "#/lib/challenge/archive";
import { decodeLineup, isLineupReady } from "#/lib/challenge";
import { simulateMatch, type SimEvent } from "#/lib/challenge/sim";
import { club } from "#/lib/club";
import { getRequestOriginFn, ogImageMeta } from "#/lib/og";
import { displayName } from "#/lib/roster";
import { cn } from "#/lib/utils";

type PartitaSearch = {
  host?: string;
  guest?: string;
  seed?: string;
};

export const Route = createFileRoute("/sfida/partita")({
  validateSearch: (raw: Record<string, unknown>): PartitaSearch => ({
    host: typeof raw.host === "string" ? raw.host : undefined,
    guest: typeof raw.guest === "string" ? raw.guest : undefined,
    seed: typeof raw.seed === "string" ? raw.seed : undefined,
  }),
  loaderDeps: ({ search }) => ({
    host: search.host,
    guest: search.guest,
    seed: search.seed,
  }),
  loader: async ({ deps }) => {
    const host = decodeLineup(deps.host);
    const guest = decodeLineup(deps.guest);
    if (!host || !guest || !deps.seed) return null;
    if (!isLineupReady(host, players) || !isLineupReady(guest, players)) return null;

    const match = simulateMatch({ host, guest, roster: players, seed: deps.seed });
    const mvp = mvpOf(match.events);

    const boxScoreMap = new Map<string, { mete: number; scalpiPieni: number; scalpiVuoti: number }>();
    for (const e of match.events) {
      if (!e.actor) continue;
      const row = boxScoreMap.get(e.actor) ?? { mete: 0, scalpiPieni: 0, scalpiVuoti: 0 };
      if (e.kind === "meta") row.mete++;
      else if (e.kind === "scalpo-pieno") row.scalpiPieni++;
      else if (e.kind === "scalpo-vuoto") row.scalpiVuoti++;
      else continue;
      boxScoreMap.set(e.actor, row);
    }
    const boxScore = Array.from(boxScoreMap.entries()).map(([slug, stats]) => ({ slug, ...stats }));

    const scalpiHost = match.events.filter(
      (e) => e.kind === "scalpo-pieno" && e.side === "host",
    ).length;
    const scalpiGuest = match.events.filter(
      (e) => e.kind === "scalpo-pieno" && e.side === "guest",
    ).length;

    const highlights = match.events.filter(
      (e) =>
        e.kind === "meta" ||
        e.kind === "meta-tecnica" ||
        e.kind === "scalpo-pieno" ||
        e.kind === "supplementari" ||
        e.kind === "golden" ||
        e.kind === "fine",
    );

    const origin = await getRequestOriginFn();
    return {
      hostName: match.hostName,
      guestName: match.guestName,
      score: match.score,
      winner: match.winner,
      scalpi: { host: scalpiHost, guest: scalpiGuest },
      mvp,
      boxScore,
      highlights,
      hostParam: deps.host ?? "",
      guestParam: deps.guest ?? "",
      seed: deps.seed,
      origin,
    };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? club.productionUrl;
    const imgMeta = ogImageMeta(origin, "match");
    if (!loaderData) {
      return { meta: [{ title: `Tabellino — ${club.name}` }, ...imgMeta] };
    }
    const { hostName, guestName, score } = loaderData;
    const ogTitle = `${hostName} vs ${guestName} — tabellino`;
    const description = `Mete ${score.host}–${score.guest} · scalpi e MVP. Sfida ${club.name} Scoutball 7v7.`;
    return {
      meta: [
        { title: ogTitle },
        { name: "description", content: description },
        { property: "og:title", content: ogTitle },
        { property: "og:description", content: description },
        ...imgMeta,
      ],
    };
  },
  component: PartitaPage,
});

function PartitaPage() {
  const data = Route.useLoaderData();

  if (!data) return <InvalidPartita />;

  const {
    hostName,
    guestName,
    score,
    winner,
    scalpi,
    mvp,
    boxScore,
    highlights,
    hostParam,
    guestParam,
    seed,
  } = data;

  const winnerName = winner === "host" ? hostName : guestName;
  const mvpPlayer = mvp ? players.find((p) => p.slug === mvp) : null;
  const matchTitle = `${hostName} ${score.host}–${score.guest} ${guestName} — tabellino`;

  return (
    <main className="mx-auto max-w-2xl px-4 pb-20 pt-6 md:px-8 md:pt-12">
      <Link
        to="/sfida"
        search={{ host: hostParam, guest: guestParam, seed }}
        className="inline-flex min-h-11 items-center gap-0.5 text-sm text-pink hover:text-pink/80"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Rivedi la partita
      </Link>

      {/* Scoreboard */}
      <div className="mt-6 rounded-[20px] border border-white/10 bg-white/4 px-5 py-6">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <p
            className={cn(
              "truncate text-right text-base font-semibold",
              winner === "host" ? "text-pink" : "text-white",
            )}
          >
            {hostName}
          </p>
          <p className="font-display text-5xl tracking-tight text-pink md:text-6xl">
            {score.host}–{score.guest}
          </p>
          <p
            className={cn(
              "truncate text-left text-base font-semibold",
              winner === "guest" ? "text-pink" : "text-white",
            )}
          >
            {guestName}
          </p>
        </div>

        <p className="mt-3 text-center text-[13px] font-semibold uppercase tracking-[0.16em] text-pink">
          Vince {winnerName}
        </p>

        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-end gap-2 text-center">
          <div>
            <p className="font-display text-2xl text-white">{scalpi.host}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">scalpi</p>
          </div>
          <div className="pb-1 text-sm text-white/20">·</div>
          <div>
            <p className="font-display text-2xl text-white">{scalpi.guest}</p>
            <p className="text-[11px] uppercase tracking-[0.14em] text-white/40">scalpi</p>
          </div>
        </div>

        {mvpPlayer ? (
          <p className="mt-4 text-center text-sm text-white/60">
            ★ MVP:{" "}
            <span className="font-semibold text-white">{displayName(mvpPlayer)}</span>
          </p>
        ) : null}
      </div>

      {/* Highlights */}
      {highlights.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Highlights
          </h2>
          <ol className="mt-3 space-y-1">
            {highlights.map((event, i) => (
              <HighlightRow
                key={`${event.kind}-${event.t}-${i}`}
                event={event}
              />
            ))}
          </ol>
        </section>
      ) : null}

      {/* Box score */}
      {boxScore.length > 0 ? (
        <section className="mt-8">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Box score
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] uppercase tracking-[0.12em] text-white/40">
                  <th className="py-2 text-left font-medium">Giocatore</th>
                  <th className="py-2 pr-4 text-right font-medium">Mete</th>
                  <th className="py-2 pr-4 text-right font-medium">S.pieni</th>
                  <th className="py-2 text-right font-medium">S.vuoti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {boxScore
                  .slice()
                  .sort(
                    (a, b) =>
                      b.mete - a.mete || b.scalpiPieni - a.scalpiPieni,
                  )
                  .map((row) => {
                    const p = players.find((pl) => pl.slug === row.slug);
                    const isMvp = row.slug === mvp;
                    return (
                      <tr
                        key={row.slug}
                        className={isMvp ? "text-white" : "text-white/70"}
                      >
                        <td className="py-2.5 text-left">
                          <span
                            className={cn(
                              "font-medium",
                              isMvp && "text-pink",
                            )}
                          >
                            {p ? displayName(p) : row.slug}
                          </span>
                          {isMvp ? (
                            <span className="ml-1.5 text-[10px] text-yellow-400">
                              ★
                            </span>
                          ) : null}
                        </td>
                        <td className="py-2.5 pr-4 text-right font-display text-base">
                          {row.mete > 0 ? (
                            row.mete
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4 text-right">
                          {row.scalpiPieni > 0 ? (
                            row.scalpiPieni
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right">
                          {row.scalpiVuoti > 0 ? (
                            row.scalpiVuoti
                          ) : (
                            <span className="text-white/30">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {/* Actions */}
      <div className="mt-10 space-y-3">
        <Link
          to="/sfida"
          search={{ host: hostParam, guest: guestParam }}
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-pink px-6 text-sm font-semibold text-navy-deep hover:bg-pink/90"
        >
          Rivincita
        </Link>
        <ShareRecap title={matchTitle} />
      </div>
    </main>
  );
}

function HighlightRow({ event }: { event: SimEvent }) {
  const isGoal = event.kind === "meta" || event.kind === "meta-tecnica";
  const isMilestone =
    event.kind === "supplementari" ||
    event.kind === "golden" ||
    event.kind === "fine";

  return (
    <li
      className={cn(
        "flex items-baseline justify-between gap-3 rounded-xl px-3 py-2",
        isGoal
          ? "bg-pink/10 text-white"
          : isMilestone
            ? "text-white/40"
            : "text-white/70",
      )}
    >
      <span className="shrink-0 font-display text-[11px] tracking-[0.08em] text-white/40">
        {event.clock}
      </span>
      <span className="flex-1 text-left font-display text-[15px] leading-snug tracking-[0.04em]">
        {event.text}
      </span>
      {event.score ? (
        <span className="shrink-0 font-display text-[13px] text-white/50">
          {event.score.host}–{event.score.guest}
        </span>
      ) : null}
    </li>
  );
}

function ShareRecap({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // fallback to copy
      }
    }
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={share}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/6 px-6 text-sm font-medium text-white hover:bg-white/10"
    >
      {copied ? (
        "Link copiato!"
      ) : (
        <>
          <Share2 className="size-4" aria-hidden />
          Condividi tabellino
        </>
      )}
    </button>
  );
}

function InvalidPartita() {
  return (
    <main className="px-5 py-24 text-center text-white">
      <p className="text-sm text-pink">Tabellino</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,8vw,4rem)] leading-none tracking-tight">
        Partita non trovata.
      </h1>
      <p className="mx-auto mt-5 max-w-sm text-white/55">
        Il link è incompleto o non corrisponde a una partita valida.
      </p>
      <Link
        to="/sfida"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-semibold text-navy-deep hover:bg-pink/90"
      >
        Prepara una sfida
      </Link>
    </main>
  );
}
