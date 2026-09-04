import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sfide")({ component: ArchivePage });

function ArchivePage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">Partite</p>
      <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">
        Archivio
      </h1>
      <p className="mt-4 max-w-lg text-white/70">
        I tabellini finiti finiscono su uno Sheet a parte: chi ha giocato, chi
        ha vinto, formazioni e log eventi.
      </p>
      <p className="mt-8 rounded-sm border border-white/10 bg-navy px-4 py-6 text-sm text-white/60">
        Nessuna sfida archiviata. Senza webhook lo storico resta vuoto, i link
        delle partite continuano a funzionare.
      </p>
    </main>
  );
}
