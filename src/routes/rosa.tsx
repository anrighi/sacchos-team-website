import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/rosa")({ component: RosaPage });

function RosaPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">Scoutball</p>
      <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">Rosa</h1>
      <p className="mt-4 max-w-lg text-white/70">
        Le carte FUT arrivano con lo Sheet rosa. Qui vedrai nickname (o nome),
        numero, ruolo e overall — mai i cognomi.
      </p>
      <p className="mt-8 rounded-sm border border-white/10 bg-navy px-4 py-6 text-sm text-white/60">
        Nessuna carta ancora. Lo Sheet viene letto a ogni build.
      </p>
      <Link
        to="/sfida"
        className="mt-8 inline-flex min-h-11 items-center text-sm uppercase tracking-wider text-pink"
      >
        Vai alla sfida
      </Link>
    </main>
  );
}
