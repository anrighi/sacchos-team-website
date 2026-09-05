import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { PlayerCard } from "#/components/PlayerCard";
import { Reveal } from "#/components/Reveal";
import { players } from "#/data/players.generated";
import { club } from "#/lib/club";
import type { Player } from "#/lib/player";
import { publicUrl } from "#/lib/public-url";

const featured = ["giorgia-bomberona", "stefano-99", "guglielmo-0"]
  .map((slug) => players.find((player) => player.slug === slug))
  .filter((player): player is Player => player != null);

export function HomeLanding() {
  return (
    <main className="bg-black text-white">
      <Hero />
      <Highlights />
      <KitChapter />
      {featured.length > 0 ? <CardsChapter /> : null}
      <IdentityChapter />
      <CloseChapter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 pb-16 pt-10 text-center md:-mt-16 md:pt-28">
      <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
      <p className="relative text-[12px] font-medium tracking-[0.18em] text-white/55">
        {club.group} · since {club.since}
      </p>
      <h1 className="relative mt-5 font-display text-[clamp(3.4rem,12vw,7.5rem)] leading-[0.86] tracking-tight">
        Saccho&apos;s
        <span className="mt-1 block text-pink">Team</span>
      </h1>
      <p className="relative mt-6 max-w-md text-lg font-medium tracking-tight text-white/70 md:text-xl">
        Scoutball {club.format}. La maglia, le carte, la sfida.
      </p>
      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-5">
        <Link
          to="/rosa"
          className="inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-medium text-navy-deep hover:bg-pink/90"
        >
          Vedi la rosa
        </Link>
        <a
          href="#maglia"
          className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-pink hover:text-pink/80"
        >
          Scopri di più
          <ChevronRight className="size-4" aria-hidden />
        </a>
      </div>
      <figure className="relative mt-12 w-full max-w-4xl md:mt-16">
        <img
          src={publicUrl("/brand/maglie-scoutball.jpg")}
          alt="Kit casa bianco e trasferta navy con artigli rosa"
          className="mx-auto w-full object-contain drop-shadow-[0_40px_80px_rgba(248,103,165,0.16)]"
        />
        <figcaption className="mt-5 text-[13px] text-white/45">
          Casa {club.kits.home} e trasferta {club.kits.away}
        </figcaption>
      </figure>
    </section>
  );
}

function Highlights() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <Reveal>
        <h2 className="text-center text-[15px] font-semibold tracking-tight text-white">
          I punti salienti.
        </h2>
      </Reveal>
      <div className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-auto md:mt-12 md:grid md:max-w-6xl md:grid-cols-3 md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="min-w-[82%] snap-center rounded-[28px] bg-[#16181d] p-7 md:min-w-0 md:p-8"
          >
            <h3 className="text-2xl font-semibold tracking-tight md:text-[28px]">
              {item.title}
            </h3>
            <p className="mt-3 text-[15px] leading-relaxed text-white/55">
              {item.body}
            </p>
            <img
              src={publicUrl(item.image)}
              alt=""
              className="mt-8 aspect-4/3 w-full rounded-2xl object-cover"
            />
          </article>
        ))}
      </div>
    </section>
  );
}

function KitChapter() {
  return (
    <section id="maglia" className="scroll-mt-24 px-5 py-20 md:px-8 md:py-32">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-pink">Maglia</p>
        <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.92] tracking-tight">
          Due kit.
          <span className="block">Un artiglio.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60">
          Casa bianca, trasferta navy, grafica solo rosa. Stemmi AGESCI Pesaro 1
          e Saccho&apos;s sul petto, tre squarci sul torso.
        </p>
      </Reveal>
      <Reveal>
        <img
          src={publicUrl("/brand/maglie-scoutball.jpg")}
          alt="Fronte e retro del kit casa e trasferta"
          className="mx-auto mt-14 w-full max-w-5xl object-contain"
        />
      </Reveal>
      <div className="mt-12 flex justify-center gap-10">
        <KitSwatch fill="#ffffff" label="Casa" />
        <KitSwatch fill="#1a2634" label="Trasferta" />
      </div>
    </section>
  );
}

function KitSwatch({ fill, label }: { fill: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        className="size-8 rounded-full ring-2 ring-white/25 ring-offset-2 ring-offset-black"
        style={{ background: fill }}
      />
      <span className="text-[13px] text-white/50">{label}</span>
    </div>
  );
}

function CardsChapter() {
  return (
    <section id="carte" className="scroll-mt-24 bg-[#0a0c10] px-5 py-20 md:px-8 md:py-32">
      <Reveal className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-medium text-pink">Carte</p>
        <h2 className="mt-4 font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.92] tracking-tight">
          Ogni giocatore,
          <span className="block">una carta.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg leading-relaxed text-white/60">
          Ritratti pixel, overall e ruolo. Nickname se c&apos;è, altrimenti il
          nome — il numero sulla maglia distingue chi si chiama uguale.
        </p>
      </Reveal>
      <ul className="mx-auto mt-16 flex max-w-5xl snap-x snap-mandatory gap-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {featured.map((player) => (
          <li
            key={player.slug}
            className="mx-auto w-[78%] min-w-[78%] snap-center sm:w-full sm:min-w-0 sm:max-w-[280px]"
          >
            <PlayerCard player={player} />
          </li>
        ))}
      </ul>
      <div className="mt-12 text-center">
        <Link
          to="/rosa"
          className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-pink hover:text-pink/80"
        >
          Tutta la rosa
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

function IdentityChapter() {
  return (
    <section className="px-5 py-24 md:px-8 md:py-36">
      <Reveal className="mx-auto max-w-3xl text-center">
        <img
          src={publicUrl("/brand/logo-sacchos.jpg")}
          alt=""
          className="mx-auto size-28 rounded-full object-cover ring-1 ring-pink/40 md:size-36"
        />
        <h2 className="mt-10 font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[0.92] tracking-tight">
          Niente cognomi.
          <span className="block">Niente foto.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-white/60">
          Siamo scout, non un album. Le carte sono illustrate. In campo conta
          il soprannome, il numero e la maglia.
        </p>
      </Reveal>
    </section>
  );
}

function CloseChapter() {
  return (
    <section className="border-t border-white/10 px-5 py-24 text-center md:py-32">
      <Reveal>
        <h2 className="font-display text-[clamp(2.6rem,8vw,6rem)] leading-none tracking-tight">
          In campo.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-lg text-white/55">
          Scegli sette, manda il link, gioca due tempi da 15 minuti in novanta
          secondi.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
          <Link
            to="/rosa"
            className="inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-medium text-navy-deep hover:bg-pink/90"
          >
            Vedi la rosa
          </Link>
          <Link
            to="/sfida"
            className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-pink hover:text-pink/80"
          >
            Lancia una sfida
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}

const highlights = [
  {
    title: "Maglia",
    body: "Bianco o navy, artigli rosa, stemmi sul petto. Niente terzi colori.",
    image: "/brand/maglie-scoutball.jpg",
  },
  {
    title: "Carte",
    body: "Sprite pixel, stats da 75 a 100, overall in evidenza. Mai una foto reale.",
    image: "/players/giorgia-bomberona.svg",
  },
  {
    title: "Sfida",
    body: "Schieramento 3-2-1, un link, una partita da mandare agli amici.",
    image: "/brand/logo-sacchos.jpg",
  },
] as const;
