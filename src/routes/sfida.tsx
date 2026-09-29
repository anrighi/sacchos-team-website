import { createFileRoute } from "@tanstack/react-router";
import {
  GuestFlow,
  HostFlow,
  MatchKickoff,
} from "#/components/challenge/ChallengeFlows";
import {
  clashingSlugs,
  decodeLineup,
  isLineupReady,
} from "#/lib/challenge";
import { players } from "#/data/players.generated";

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
