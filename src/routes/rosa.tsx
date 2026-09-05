import { Link, createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PlayerCard } from "#/components/PlayerCard";
import { players } from "#/data/players.generated";
import { ROLES, type Role } from "#/lib/player";
import { displayName, filterPlayers, type RosterFilters } from "#/lib/roster";
import { publicUrl } from "#/lib/public-url";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/rosa")({
  validateSearch: validateRosaSearch,
  component: RosaPage,
});

function validateRosaSearch(raw: Record<string, unknown>): RosterFilters {
  const team =
    raw.team === "sacchos" || raw.team === "saccios" ? raw.team : undefined;
  const role = isRole(raw.role) ? raw.role : undefined;
  return { team, role };
}

function RosaPage() {
  const search = Route.useSearch();
  const filtered = filterPlayers(sortedPlayers(players), search);
  const emptyRoster = players.length === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-10">
      <p className="text-xs uppercase tracking-[0.35em] text-pink">Scoutball</p>
      <h1 className="mt-3 font-display text-4xl text-white md:text-5xl">Rosa</h1>
      <p className="mt-4 max-w-lg text-white/70">
        Nickname se c’è, altrimenti il nome. Il numero sulla maglia distingue
        chi si chiama uguale — mai i cognomi.
      </p>

      {emptyRoster ? (
        <p className="mt-8 rounded-sm border border-white/10 bg-navy px-4 py-6 text-sm text-white/60">
          Nessuna carta ancora. Lo Sheet viene letto a ogni build.
        </p>
      ) : (
        <>
          <RosaFilters search={search} />
          {filtered.length === 0 ? (
            <p className="mt-8 rounded-sm border border-dashed border-pink/40 bg-navy px-4 py-6 text-sm text-white/70">
              Nessun giocatore corrisponde ai filtri.
            </p>
          ) : (
            <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((player) => (
                <li key={player.slug}>
                  <PlayerCard player={player} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Link
        to="/sfida"
        className="mt-10 inline-flex min-h-11 items-center text-sm uppercase tracking-wider text-pink"
      >
        Vai alla sfida
      </Link>
    </main>
  );
}

function RosaFilters({ search }: { search: RosterFilters }) {
  return (
    <div className="mt-8 space-y-4">
      <FilterRow label="Squadra">
        <FilterChip
          search={withFilter(search, { team: undefined })}
          active={!search.team}
        >
          Tutte
        </FilterChip>
        <FilterChip
          search={withFilter(search, { team: "sacchos" })}
          active={search.team === "sacchos"}
        >
          <img
            src={publicUrl("/brand/logo-sacchos.jpg")}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
          Saccho&apos;s Team
        </FilterChip>
        <FilterChip
          search={withFilter(search, { team: "saccios" })}
          active={search.team === "saccios"}
        >
          <img
            src={publicUrl("/brand/logo-saccios-tim.jpg")}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
          Saccios Tim
        </FilterChip>
      </FilterRow>
      <FilterRow label="Ruolo">
        <FilterChip
          search={withFilter(search, { role: undefined })}
          active={!search.role}
        >
          Tutti
        </FilterChip>
        {ROLES.map((role) => (
          <FilterChip
            key={role}
            search={withFilter(search, { role })}
            active={search.role === role}
          >
            {role}
          </FilterChip>
        ))}
      </FilterRow>
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
    <div>
      <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
        {label}
      </p>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

function FilterChip({
  search,
  active,
  children,
}: {
  search: RosterFilters;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      to="/rosa"
      search={search}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-3 text-sm tracking-wide",
        active
          ? "border-pink bg-pink font-medium text-navy-deep"
          : "border-white/20 text-white/80 hover:border-pink/60 hover:text-white",
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
