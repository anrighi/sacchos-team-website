import { createFileRoute, Link } from "@tanstack/react-router";
import { MatchKickoff } from "#/components/challenge/ChallengeFlows";
import { encodeLineup, lineupLabel } from "#/lib/challenge";
import { resolveLineupFn } from "#/lib/challenge/cloud";
import { club } from "#/lib/club";
import { getRequestOriginFn, ogImageMeta } from "#/lib/og";

type MatchSearch = { seed?: string };

export const Route = createFileRoute("/s/$host/$guest")({
  validateSearch: (raw: Record<string, unknown>): MatchSearch => ({
    seed: typeof raw.seed === "string" ? raw.seed : undefined,
  }),
  loader: async ({ params }) => {
    const [host, guest, origin] = await Promise.all([
      resolveLineupFn({ data: { id: params.host } }),
      resolveLineupFn({ data: { id: params.guest } }),
      getRequestOriginFn(),
    ]);
    return {
      hostId: params.host,
      guestId: params.guest,
      host: host.lineup,
      guest: guest.lineup,
      origin,
    };
  },
  head: ({ loaderData }) => {
    const hostName = loaderData?.host ? lineupLabel(loaderData.host) : null;
    const guestName = loaderData?.guest ? lineupLabel(loaderData.guest) : null;
    const origin = loaderData?.origin ?? club.productionUrl;
    const imgMeta = ogImageMeta(origin, "match");
    if (!hostName || !guestName) {
      return { meta: [{ title: `Partita — ${club.name}` }, ...imgMeta] };
    }
    const title = `${hostName} vs ${guestName} — ${club.name}`;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        ...imgMeta,
      ],
    };
  },
  component: ShortMatchPage,
});

function ShortMatchPage() {
  const search = Route.useSearch();
  const { host, guest, hostId, guestId } = Route.useLoaderData();
  if (!host || !guest) {
    return (
      <main className="bg-black px-5 py-16 text-white">
        <p className="text-sm font-medium text-pink">Partita</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.9] tracking-tight">
          Link vuoto.
        </h1>
        <Link
          to="/sfida"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90"
        >
          Prepara una sfida
        </Link>
      </main>
    );
  }

  return (
    <MatchKickoff
      host={host}
      guest={guest}
      seed={search.seed}
      hostParam={encodeLineup(host)}
      guestParam={encodeLineup(guest)}
      hostId={hostId}
      guestId={guestId}
    />
  );
}
