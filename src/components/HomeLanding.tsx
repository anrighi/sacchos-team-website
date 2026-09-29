import { Link } from "@tanstack/react-router";
import { SquadCarousel } from "#/components/SquadCarousel";
import { Reveal } from "#/components/Reveal";
import { players } from "#/data/players.generated";
import { club } from "#/lib/club";
import { sortRoster } from "#/lib/roster";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

const squad = sortRoster(players);

const kitFan = [
  {
    src: "/brand/kit-home-front.png",
    alt: "Maglia casa bianca",
    className:
      "left-[-4%] top-[4%] w-[72%] -rotate-8 sm:left-[8%] sm:top-[8%] sm:w-[46%] md:left-[12%]",
    delay: "0s",
  },
  {
    src: "/brand/kit-away-front.png",
    alt: "Maglia trasferta navy",
    className:
      "right-[-6%] top-[18%] w-[72%] rotate-8 sm:right-[8%] sm:top-auto sm:bottom-[2%] sm:w-[46%] md:right-[12%]",
    delay: "-2.4s",
  },
] as const;

export function HomeLanding() {
  return (
    <main className="bg-black text-white">
      <Hero />
      {squad.length > 0 ? <CardsChapter /> : null}
      <CloseChapter />
    </main>
  );
}

function Hero() {
  return (
    <section className="relative isolate flex min-h-[100dvh] flex-col items-center overflow-hidden px-5 pb-10 pt-8 text-center md:-mt-16 md:pt-24">
      <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
      <img
        src={publicUrl("/brand/logo-sacchos.png")}
        alt={club.name}
        className="float-drift relative z-10 h-[min(28vw,9.5rem)] w-auto object-contain drop-shadow-[0_20px_40px_rgba(248,103,165,0.28)]"
      />
      <h1 className="relative z-10 mt-5 font-display text-[clamp(3.2rem,11vw,7rem)] leading-[0.86] tracking-tight">
        Saccho&apos;s
        <span className="mt-1 block text-pink">Team</span>
      </h1>
      <p className="relative z-10 mt-4 max-w-xs text-base tracking-tight text-white/65 md:max-w-md md:text-lg">
        La squadra più titolata del centro sud
      </p>
      <div className="relative z-10 mt-7 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/rosa"
          className="inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90"
        >
          Vedi la rosa
        </Link>
        <Link
          to="/sfida"
          className="inline-flex min-h-11 items-center rounded-full px-5 text-sm text-pink ring-1 ring-pink/40 hover:bg-pink/10"
        >
          Lancia una sfida
        </Link>
      </div>
      <div className="relative mx-auto mt-6 h-[min(46vh,28rem)] w-full max-w-3xl flex-1">
        {kitFan.map((kit) => (
          <div key={kit.src} className={cn("absolute", kit.className)}>
            <img
              src={publicUrl(kit.src)}
              alt={kit.alt}
              className="float-drift w-full drop-shadow-[0_28px_48px_rgba(0,0,0,0.45)]"
              style={{ animationDelay: kit.delay }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function CardsChapter() {
  return (
    <section className="px-5 py-20 md:px-8 md:py-28">
      <Reveal className="text-center">
        <h2 className="font-display text-[clamp(2.4rem,7vw,5rem)] leading-[0.92] tracking-tight">
          La squadra.
        </h2>
      </Reveal>
      <SquadCarousel players={squad} />
      <div className="mt-10 text-center">
        <Link
          to="/rosa"
          className="inline-flex min-h-11 items-center text-sm text-pink hover:text-pink/80"
        >
          Tutta la rosa
        </Link>
      </div>
    </section>
  );
}

function CloseChapter() {
  return (
    <section className="border-t border-white/10 px-5 py-20 text-center md:py-28">
      <Reveal>
        <h2 className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-none tracking-tight">
          In campo.
        </h2>
        <Link
          to="/sfida"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm text-navy-deep hover:bg-pink/90"
        >
          Lancia una sfida
        </Link>
      </Reveal>
    </section>
  );
}
