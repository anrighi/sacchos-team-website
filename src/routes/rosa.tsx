import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PlayerCard } from "#/components/PlayerCard";
import { Reveal } from "#/components/Reveal";
import { players } from "#/data/players.generated";
import { ROLES, TEAMS, type Role, type TeamName } from "#/lib/player";
import { displayName, filterPlayers, type RosterFilters } from "#/lib/roster";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/rosa")({
  validateSearch: validateRosaSearch,
  component: RosaPage,
});

const TEAM_LOGOS: Record<TeamName, string> = {
  "Saccho's Team": "/brand/logo-sacchos.jpg",
  "Saccios Tim": "/brand/logo-saccios-tim.jpg",
};

function validateRosaSearch(raw: Record<string, unknown>): RosterFilters {
  const team =
    raw.team === "sacchos" || raw.team === "saccios" ? raw.team : undefined;
  const role = isRole(raw.role) ? raw.role : undefined;
  return { team, role };
}

function RosaPage() {
  const search = Route.useSearch();
  const filtered = filterPlayers(sortedPlayers(players), search);

  return (
    <main className="bg-black text-white">
      <header className="relative isolate overflow-hidden px-5 pb-10 pt-12 text-center md:px-8 md:pb-14 md:pt-20">
        <div aria-hidden className="landing-hero-glow pointer-events-none absolute inset-0" />
        <p className="relative text-sm font-medium text-pink">Scoutball</p>
        <h1 className="relative mt-3 font-display text-[clamp(3rem,10vw,6rem)] leading-[0.9] tracking-tight">
          Rosa
        </h1>
        <p className="relative mx-auto mt-5 max-w-md text-lg leading-relaxed text-white/60">
          {players.length} carte illustrate. Nickname se c&apos;è, altrimenti il
          nome: il numero sulla maglia distingue chi si chiama uguale.
        </p>
      </header>

      {players.length === 0 ? (
        <EmptyState>
          Nessuna carta ancora. Lo Sheet viene letto a ogni build.
        </EmptyState>
      ) : (
        <>
          <RosaFilters search={search} />
          <RosaResults filtered={filtered} />
        </>
      )}

      <section className="border-t border-white/10 px-5 py-16 text-center md:py-24">
        <h2 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-none tracking-tight">
          Sette in campo.
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-white/55">
          Scegli la formazione e manda il link a chi ti sfida.
        </p>
        <Link
          to="/sfida"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-pink px-6 text-sm font-medium text-navy-deep hover:bg-pink/90"
        >
          Lancia una sfida
        </Link>
      </section>
    </main>
  );
}

function RosaResults({ filtered }: { filtered: typeof players }) {
  if (filtered.length === 0) {
    return (
      <EmptyState>
        Nessun giocatore corrisponde ai filtri.{" "}
        <Link to="/rosa" className="text-pink hover:text-pink/80">
          Azzera
        </Link>
      </EmptyState>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 md:px-8">
      {TEAMS.map((team) => {
        const squad = filtered.filter((player) => player.team === team);
        if (squad.length === 0) {
          return null;
        }
        return (
          <section key={team} className="pt-10 first:pt-6 md:pt-14">
            <div className="flex items-center gap-3">
              <img
                src={publicUrl(TEAM_LOGOS[team])}
                alt=""
                className="size-9 rounded-full object-cover ring-1 ring-white/15"
              />
              <h2 className="text-lg font-semibold tracking-tight text-white md:text-xl">
                {team}
              </h2>
              <span className="text-sm text-white/40">{squad.length}</span>
            </div>
            <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-5 lg:grid-cols-4 xl:grid-cols-5">
              {squad.map((player) => (
                <li key={player.slug}>
                  <Reveal>
                    <PlayerCard player={player} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="mx-auto max-w-md rounded-[20px] border border-white/10 bg-[#14181f] px-6 py-10 text-center text-[15px] text-white/60">
      {children}
    </p>
  );
}

function RosaFilters({ search }: { search: RosterFilters }) {
  const hits = (patch: Partial<RosterFilters>) =>
    filterPlayers(players, withFilter(search, patch)).length;

  return (
    <div className="sticky top-0 z-30 border-y border-white/10 bg-black/75 backdrop-blur-xl md:top-16">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:gap-6 md:px-8">
        <FilterRow label="Squadra">
          <FilterChip
            search={withFilter(search, { team: undefined })}
            active={!search.team}
            hits={hits({ team: undefined })}
          >
            Tutte
          </FilterChip>
          <FilterChip
            search={withFilter(search, { team: "sacchos" })}
            active={search.team === "sacchos"}
            hits={hits({ team: "sacchos" })}
          >
            <img
              src={publicUrl("/brand/logo-sacchos.jpg")}
              alt=""
              className="size-5 rounded-full object-cover"
            />
            Saccho&apos;s
          </FilterChip>
          <FilterChip
            search={withFilter(search, { team: "saccios" })}
            active={search.team === "saccios"}
            hits={hits({ team: "saccios" })}
          >
            <img
              src={publicUrl("/brand/logo-saccios-tim.jpg")}
              alt=""
              className="size-5 rounded-full object-cover"
            />
            Saccios Tim
          </FilterChip>
        </FilterRow>
        <FilterRow label="Ruolo">
          <FilterChip
            search={withFilter(search, { role: undefined })}
            active={!search.role}
            hits={hits({ role: undefined })}
          >
            Tutti
          </FilterChip>
          {ROLES.map((role) => (
            <FilterChip
              key={role}
              search={withFilter(search, { role })}
              active={search.role === role}
              hits={hits({ role })}
            >
              {role}
            </FilterChip>
          ))}
        </FilterRow>
      </div>
    </div>
  );
}

function FilterRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <p className="hidden shrink-0 text-[11px] uppercase tracking-[0.2em] text-white/35 md:block">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto py-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  search,
  active,
  hits,
  children,
}: {
  search: RosterFilters;
  active: boolean;
  hits: number;
  children: ReactNode;
}) {
  const shape =
    "inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium tracking-tight transition-colors";

  if (hits === 0 && !active) {
    return (
      <span
        aria-disabled
        title="Nessun giocatore con questo filtro"
        className={cn(shape, "cursor-not-allowed bg-white/5 text-white/25 [&_img]:opacity-40")}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      to="/rosa"
      search={search}
      className={cn(
        shape,
        active
          ? "bg-pink text-navy-deep"
          : "bg-white/8 text-white/70 hover:bg-white/15 hover:text-white",
      )}
    >
      {children}
    </Link>
  );
}

function withFilter(
  search: RosterFilters,
  patch: Partial<RosterFilters>,
): RosterFilters {
  return {
    team: "team" in patch ? patch.team : search.team,
    role: "role" in patch ? patch.role : search.role,
  };
}

function isRole(value: unknown): value is Role {
  return (
    value === "POR" ||
    value === "PAL" ||
    value === "CEN" ||
    value === "ALA" ||
    value === "PUN"
  );
}

function sortedPlayers(list: typeof players) {
  return [...list].sort((a, b) => {
    if (a.team !== b.team) {
      return a.team === "Saccho's Team" ? -1 : 1;
    }
    if (a.number !== b.number) {
      return a.number - b.number;
    }
    return displayName(a).localeCompare(displayName(b), "it");
  });
}
