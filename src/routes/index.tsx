import { Link, createFileRoute } from "@tanstack/react-router";
import { Button } from "#/components/ui/button";
import { club } from "#/lib/club";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <main className="relative overflow-hidden">
      <div
        aria-hidden
        className="pitch-lines pointer-events-none absolute inset-0 opacity-40"
      />
      <section className="relative mx-auto flex min-h-[100dvh] max-w-5xl flex-col justify-center gap-8 px-5 py-16 md:px-8">
        <div className="flex items-center gap-4">
          <img
            src="/brand/logo-sacchos.jpg"
            alt=""
            className="h-16 w-16 rounded-full object-cover ring-2 ring-pink/70 md:h-20 md:w-20"
          />
          <p className="text-xs uppercase tracking-[0.35em] text-pink">
            {club.group} · since {club.since}
          </p>
        </div>
        <h1 className="font-display text-5xl leading-none text-white md:text-7xl">
          SACCHO'S
          <span className="mt-2 block text-pink">TEAM</span>
        </h1>
        <p className="max-w-md text-base text-white/75 md:text-lg">
          Scoutball {club.format}. Rosa illustrata, carte da gioco e sfide da
          mandare agli amici — senza cognomi, senza foto reali.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="font-display tracking-wide">
            <Link to="/rosa">Vedi la rosa</Link>
          </Button>
          <Button asChild variant="outline" className="font-display tracking-wide">
            <Link to="/sfida">Lancia una sfida</Link>
          </Button>
        </div>
        <figure className="mt-4 max-w-xl">
          <img
            src="/brand/maglie-scoutball.jpg"
            alt="Kit casa bianco e trasferta navy con artigli rosa"
            className="w-full rounded-sm border border-white/10 object-cover"
          />
          <figcaption className="mt-2 text-xs uppercase tracking-widest text-white/50">
            Casa {club.kits.home} · trasferta {club.kits.away} · artigli rosa
          </figcaption>
        </figure>
      </section>
    </main>
  );
}
