import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Swords } from "lucide-react";
import { LineupEditor } from "#/components/challenge/LineupEditor";
import { MatchView } from "#/components/challenge/MatchView";
import { Pitch } from "#/components/challenge/Pitch";
import { ShareChallenge } from "#/components/challenge/ShareChallenge";
import { players } from "#/data/players.generated";
import {
  clashingSlugs,
  createMatchSeed,
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
  seed?: string;
};

export const Route = createFileRoute("/sfida")({
  validateSearch: (raw: Record<string, unknown>): ChallengeSearch => ({
    host: typeof raw.host === "string" ? raw.host : undefined,
    guest: typeof raw.guest === "string" ? raw.guest : undefined,
    seed: typeof raw.seed === "string" ? raw.seed : undefined,
  }),
  component: SfidaPage,
});

function SfidaPage() {
  const search = Route.useSearch();
  const host = decodeLineup(search.host);
  const guest = decodeLineup(search.guest);
  const clashes = host && guest ? clashingSlugs(host, guest) : [];
  const kickoff =
    Boolean(host) &&
    Boolean(guest) &&
    isLineupReady(host!, players) &&
    isLineupReady(guest!, players) &&
    clashes.length === 0;

  if (kickoff && host && guest) {
    return (
      <MatchKickoff
        host={host}
        guest={guest}
        seed={search.seed}
        hostParam={search.host ?? ""}
        guestParam={search.guest ?? ""}
      />
    );
  }

  if (host) {
    return (
      <GuestFlow host={host} hostParam={search.host ?? ""} initial={search.guest} />
    );
  }

  return <HostFlow />;
}

function HostFlow() {
  const [lineup, setLineup] = useState<Lineup>(emptyLineup);
  const ready = isLineupReady(lineup, players);

  return (
    <main className="bg-black text-white">
      <ChallengeHeader eyebrow="7 vs 7" title="Sfida" />
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
  const navigate = Route.useNavigate();
  const [lineup, setLineup] = useState<Lineup>(() => decodeLineup(initial) ?? emptyLineup());
  const [seed] = useState(createMatchSeed);
  const blocked = new Set(lineupSlugs(host));
  const clashes = clashingSlugs(host, lineup);
  const ready = isLineupReady(lineup, players) && clashes.length === 0;

  return (
    <main className="bg-black text-white">
      <ChallengeHeader eyebrow="Ti hanno sfidato" title={lineupLabel(host)} />

      <section className="mx-auto max-w-2xl px-5 pb-10 md:px-8">
        <div className="mt-3">
          <Pitch lineup={host} roster={players} kit="home" readOnly />
        </div>
      </section>

      <section className="mx-auto max-w-2xl px-5 pb-16 md:px-8">
        <div className="mb-5 flex items-center gap-3">
          <Swords className="size-5 text-pink" aria-hidden />
          <h2 className="text-[15px] font-semibold tracking-tight text-white">La tua rosa</h2>
        </div>
        <LineupEditor
          lineup={lineup}
          roster={players}
          kit="away"
          blocked={blocked}
          namePlaceholder="La rosa di Luca"
          onChange={setLineup}
        />
        {clashes.length > 0 ? (
          <p className="mt-4 text-[15px] text-white/55">
            Qualcuno è già schierato dall’altra parte. Scegli altri giocatori.
          </p>
        ) : null}
        <ShareChallenge
          ready={ready}
          search={{ host: hostParam, guest: encodeLineup(lineup), seed }}
          title={`${lineupLabel(host)} contro ${lineupLabel(lineup)}`}
          cta="Copia il link della partita"
          hint="Il link apre i due tempi da 15′. Stesso seed, stessa partita."
          waiting="Completa la rosa per chiudere la sfida."
        />
        {ready ? (
          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/sfida",
                search: { host: hostParam, guest: encodeLineup(lineup), seed },
              })
            }
            className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-full bg-pink text-sm font-medium text-navy-deep hover:bg-pink/90"
          >
            Fai partire la partita
          </button>
        ) : null}
      </section>
    </main>
  );
}

function MatchKickoff({
  host,
  guest,
  seed,
  hostParam,
  guestParam,
}: {
  host: Lineup;
  guest: Lineup;
  seed?: string;
  hostParam: string;
  guestParam: string;
}) {
  const navigate = Route.useNavigate();

  useEffect(() => {
    if (seed) {
      return;
    }
    void navigate({
      to: "/sfida",
      search: { host: hostParam, guest: guestParam, seed: createMatchSeed() },
      replace: true,
    });
  }, [guestParam, hostParam, navigate, seed]);

  if (!seed) {
    return (
      <main className="bg-black pt-6 text-white md:pt-20">
        <ChallengeHeader
          eyebrow="7 vs 7"
          title={`${lineupLabel(host)} – ${lineupLabel(guest)}`}
        />
      </main>
    );
  }

  return (
    <main className="overflow-hidden bg-black text-white">
      <MatchView
        host={host}
        guest={guest}
        seed={seed}
        hostParam={hostParam}
        guestParam={guestParam}
        onReplay={() =>
          navigate({
            to: "/sfida",
            search: { host: hostParam, guest: guestParam, seed: createMatchSeed() },
          })
        }
      />
    </main>
  );
}

function ChallengeHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <header className="relative isolate overflow-hidden px-5 pb-8 pt-12 text-center md:px-8 md:pb-10 md:pt-20">
      <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
      <p className="relative text-sm font-medium text-pink">{eyebrow}</p>
      <h1 className="relative mt-3 font-display text-[clamp(2.6rem,9vw,5rem)] leading-[0.9] tracking-tight">
        {title}
      </h1>
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
