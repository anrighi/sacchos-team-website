import { Link, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sfida")({ component: SfidaPage });

function SfidaPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">7 vs 7</p>
      <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
        Sfida
      </h1>
      <p className="mt-4 max-w-lg text-white/70">
        Schieri 3-2-1, dai un nome alla rosa, mandi il link. L’amico completa i
        sette e la partita dura circa 90 secondi, con orologio da due tempi da
        15′.
      </p>
      <p className="mt-8 rounded-sm border border-dashed border-pink/40 bg-navy px-4 py-6 text-sm text-white/60">
        Campo e schieramento: in arrivo. Portiere obbligatorio, almeno due per
        sesso in campo.
      </p>
      <Link
        to="/rosa"
        className="mt-8 inline-flex min-h-11 items-center text-sm uppercase tracking-wider text-pink"
      >
        Guarda la rosa
      </Link>
    </main>
  );
}
