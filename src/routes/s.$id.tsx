import { createFileRoute, Link } from "@tanstack/react-router";
import { GuestFlow } from "#/components/challenge/ChallengeFlows";
import { encodeLineup, lineupLabel } from "#/lib/challenge";
import { resolveLineupFn } from "#/lib/challenge/cloud";
import { club } from "#/lib/club";
import { getRequestOriginFn, ogImageMeta } from "#/lib/og";

export const Route = createFileRoute("/s/$id")({
  loader: async ({ params }) => {
    const [resolved, origin] = await Promise.all([
      resolveLineupFn({ data: { id: params.id } }),
      getRequestOriginFn(),
    ]);
    return { id: params.id, host: resolved.lineup, origin };
  },
  head: ({ loaderData }) => {
    const hostName = loaderData?.host ? lineupLabel(loaderData.host) : null;
    const origin = loaderData?.origin ?? club.productionUrl;
    const imgMeta = ogImageMeta(origin, "sfida");
    if (!hostName) {
      return { meta: [{ title: `Sfida — ${club.name}` }, ...imgMeta] };
    }
    const title = `${hostName} ti sfida — ${club.name}`;
    return {
      meta: [
        { title },
        { property: "og:title", content: title },
        ...imgMeta,
      ],
    };
  },
  component: ShortHostPage,
});

function ShortHostPage() {
  const { id, host } = Route.useLoaderData();
  if (!host) {
    return (
      <main className="bg-black px-5 py-16 text-white">
        <p className="text-sm font-medium text-pink">Sfida</p>
        <h1 className="mt-3 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.9] tracking-tight">
          Link vuoto.
        </h1>
        <p className="mt-4 max-w-xs text-white/60">Questa rosa non è nello store.</p>
        <Link
          to="/sfida"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90"
        >
          Prepara una sfida
        </Link>
      </main>
    );
  }

  return <GuestFlow host={host} hostParam={encodeLineup(host)} hostId={id} />;
}
