import { Link, createFileRoute } from "@tanstack/react-router";
import { club } from "#/lib/club";

export const Route = createFileRoute("/guida")({
  head: () => ({
    meta: [{ title: `Come funziona — ${club.name}` }],
  }),
  component: GuidaPage,
});

function GuidaPage() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-10 md:px-8 md:py-16">
      <header className="mb-10">
        <p className="text-sm font-medium text-pink">Guida</p>
        <h1 className="mt-2 font-display text-4xl tracking-tight">
          Come funziona.
        </h1>
        <p className="mt-3 text-white/55">
          Tutto quello che ti serve per sfidare un amico e tenere traccia delle partite.
        </p>
      </header>

      {/* Sfida */}
      <section className="mb-12">
        <h2 className="mb-5 font-display text-2xl tracking-tight">La sfida</h2>
        <ol className="space-y-6">
          <Step number={1} title="Scegli il modulo">
            Vai su{" "}
            <Link to="/sfida" className="text-pink hover:underline">
              Sfida
            </Link>{" "}
            e inserisci il nome della tua squadra. Scegli 7 giocatori tra la
            rosa e disponi il tuo schieramento nel modulo{" "}
            <span className="font-semibold text-white">3-2-1</span>: tre
            difensori, due centrocampisti, un attaccante e un portiere.
          </Step>
          <Step number={2} title="Manda il link all'avversario">
            Una volta completato lo schieramento, copia il link di sfida e
            invialo all'amico che vuoi sfidare. Il link contiene già la tua
            formazione codificata.
          </Step>
          <Step number={3} title="L'avversario risponde">
            Chi riceve il link sceglie a sua volta 6 giocatori e schiera la
            propria squadra. Appena entrambe le rose sono pronte, il match può
            partire.
          </Step>
          <Step number={4} title="Si gioca">
            La partita viene simulata con due tempi da 15 minuti. Mete,
            scalpi pieni, scalpi vuoti e tempi supplementari vengono calcolati
            in base alle statistiche dei giocatori. Puoi seguire gli highlights
            evento per evento.
          </Step>
          <Step number={5} title="Tabellino e condivisione">
            A fine partita trovi il tabellino completo: punteggio, scalpi,
            MVP e box score per ogni giocatore. Puoi condividere il link del
            tabellino o richiedere subito la rivincita.
          </Step>
        </ol>

        <div className="mt-8">
          <Link
            to="/sfida"
            className="inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-semibold text-navy-deep hover:bg-pink/90"
          >
            Prepara una sfida
          </Link>
        </div>
      </section>

      <div className="mb-12 border-t border-white/10" />

      {/* Archivio */}
      <section className="mb-12">
        <h2 className="mb-5 font-display text-2xl tracking-tight">L'archivio</h2>
        <div className="space-y-5 text-white/70">
          <p>
            Ogni partita giocata viene salvata automaticamente nell'
            <Link to="/sfide" className="text-pink hover:underline">
              Archivio
            </Link>
            . Trovi data, squadre, punteggio e scalpi di tutte le sfide
            disputate.
          </p>
          <p>
            Da ogni riga dell'archivio puoi cliccare sul nome di una squadra
            per sfidarla di nuovo con la stessa formazione, oppure aprire il
            tabellino originale per rivedere highlights e box score.
          </p>
          <p>
            Le partite vengono conservate in ordine cronologico inverso: le più
            recenti compaiono per prime.
          </p>
        </div>

        <div className="mt-8">
          <Link
            to="/sfide"
            className="inline-flex min-h-11 items-center rounded-full px-5 text-sm text-pink ring-1 ring-pink/40 hover:bg-pink/10"
          >
            Vedi le partite
          </Link>
        </div>
      </section>

      <div className="mb-12 border-t border-white/10" />

      {/* Glossario */}
      <section>
        <h2 className="mb-5 font-display text-2xl tracking-tight">Glossario</h2>
        <dl className="space-y-4">
          <GlossaryItem term="Meta">
            Il punto principale dello Scoutball 7v7. Vale 1 punto nel
            punteggio finale.
          </GlossaryItem>
          <GlossaryItem term="Scalpo pieno">
            Azione difensiva andata a buon fine: il difensore strappa la
            bandana all'attaccante prima che segni.
          </GlossaryItem>
          <GlossaryItem term="Scalpo vuoto">
            Tentativo di scalpo fallito: l'attaccante riesce a evitare il
            contatto e proseguire l'azione.
          </GlossaryItem>
          <GlossaryItem term="Modulo 3-2-1">
            Lo schieramento standard dello Scoutball 7v7: 3 difensori, 2
            centrocampisti, 1 attaccante e 1 portiere — 7 giocatori in totale.
          </GlossaryItem>
          <GlossaryItem term="MVP">
            Il giocatore più influente della partita, calcolato in base a mete
            e scalpi pieni sommati.
          </GlossaryItem>
          <GlossaryItem term="Supplementari e golden">
            Se dopo i due tempi regolamentari il punteggio è in parità, si
            disputa un tempo supplementare. In caso di ulteriore parità scatta
            il golden: vince chi segna per primo.
          </GlossaryItem>
        </dl>
      </section>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-4">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pink/15 font-display text-sm text-pink">
        {number}
      </span>
      <div className="pt-0.5">
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-white/65">{children}</p>
      </div>
    </li>
  );
}

function GlossaryItem({
  term,
  children,
}: {
  term: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/8 px-4 py-3">
      <dt className="font-semibold text-white">{term}</dt>
      <dd className="mt-1 text-sm text-white/60">{children}</dd>
    </div>
  );
}
