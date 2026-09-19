import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { LineupEditor } from "#/components/challenge/LineupEditor";
import { Pitch } from "#/components/challenge/Pitch";
import { ShareChallenge } from "#/components/challenge/ShareChallenge";
import { players } from "#/data/players.generated";
import {
  clashingSlugs,
  decodeLineup,
  emptyLineup,
  encodeLineup,
  isLineupReady,
  lineupLabel,
  lineupSlugs,
  type Lineup,
} from "#/lib/challenge";

type ChallengeSearch = {
  host?: string;
  guest?: string;
};

export const Route = createFileRoute("/sfida")({
  validateSearch: (raw: Record<string, unknown>): ChallengeSearch => ({
    host: typeof raw.host === "string" ? raw.host : undefined,
    guest: typeof raw.guest === "string" ? raw.guest : undefined,
  }),
  component: SfidaPage,
});

function SfidaPage() {
  const search = Route.useSearch();
  const hostFromLink = decodeLineup(search.host);

  if (hostFromLink) {
    return <GuestFlow host={hostFromLink} hostParam={search.host ?? ""} initial={search.guest} />;
  }
  return <HostFlow />;
}

function HostFlow() {
  const [lineup, setLineup] = useState<Lineup>(emptyLineup);
  const ready = isLineupReady(lineup, players);

  return (
    <main className="bg-black text-white">
      <ChallengeHeader
        eyebrow="7 vs 7"
        title="Sfida"
        lead="Dai un nome alla tua rosa, schiera i sette e manda il link. Chi lo apre schiera i suoi con i giocatori rimasti."
      />
      <section className="mx-auto max-w-2xl px-5 pb-16 md:px-8">
        <LineupEditor
          lineup={lineup}
          roster={players}
          kit="home"
          blocked={EMPTY}
          namePlaceholder="La rosa di Marco"
          onChange={setLineup}
        />
        <ShareChallenge
          ready={ready}
          search={{ host: encodeLineup(lineup) }}
          title={`${lineupLabel(lineup)} ti sfida`}
          cta="Copia il link della sfida"
          hint="Il link contiene la tua formazione: chi lo apre vede chi lo sta sfidando."
          waiting="Completa la rosa per generare il link."
        />
      </section>
    </main>
  );
}

function GuestFlow({
  host,
  hostParam,
  initial,
}: {
  host: Lineup;
  hostParam: string;
  initial?: string;
}) {
  const [lineup, setLineup] = useState<Lineup>(() => decodeLineup(initial) ?? emptyLineup());
  const blocked = new Set(lineupSlugs(host));
  const clashes = clashingSlugs(host, lineup);
  const ready = isLineupReady(lineup, players) && clashes.length === 0;

  return (
    <main className="bg-black text-white">
      <ChallengeHeader
        eyebrow="Ti hanno sfidato"
        title={lineupLabel(host)}
        lead="Questa è la rosa che hai di fronte. Schiera i tuoi sette con chi è rimasto."
      />

      <section className="mx-auto max-w-2xl px-5 pb-10 md:px-8">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-tight text-white">
            {lineupLabel(host)}
          </h2>
          <span className="text-[13px] text-white/40">
            {host.formation} · maglia casa
          </span>
        </div>
        <div className="mt-3">
          <Pitch lineup={host} roster={players} kit="home" readOnly />
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 pb-16 md:px-8">
        <div className="mb-5 flex items-center gap-3">
          <Swords className="size-5 text-pink" aria-hidden />
          <h2 className="text-[15px] font-semibold tracking-tight text-white">
            La tua rosa
          </h2>
        </div>
        <LineupEditor
          lineup={lineup}
          roster={players}
          kit="away"
          blocked={blocked}
          namePlaceholder="La rosa di Luca"
          onChange={setLineup}
        />
        <ShareChallenge
          ready={ready}
          search={{ host: hostParam, guest: encodeLineup(lineup) }}
          title={`${lineupLabel(host)} contro ${lineupLabel(lineup)}`}
          cta="Copia il link della partita"
          hint="La simulazione dei due tempi da 15′ arriva con il prossimo passo: intanto il link tiene in memoria le due formazioni."
          waiting="Completa la rosa per chiudere la sfida."
        />
      </section>
    </main>
  );
}

function ChallengeHeader({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <header className="relative isolate overflow-hidden px-5 pb-8 pt-12 text-center md:px-8 md:pb-10 md:pt-20">
      <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
      <p className="relative text-sm font-medium text-pink">{eyebrow}</p>
      <h1 className="relative mt-3 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.9] tracking-tight">
        {title}
      </h1>
      <p className="relative mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/60">
        {lead}
      </p>
      <Link
        to="/rosa"
        className="relative mt-6 inline-flex min-h-11 items-center text-sm font-medium text-pink hover:text-pink/80"
      >
        Guarda la rosa
      </Link>
    </header>
  );
}

const EMPTY: ReadonlySet<string> = new Set();
