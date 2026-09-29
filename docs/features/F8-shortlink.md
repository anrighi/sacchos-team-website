# F8 — Link corti per la sfida

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 0+ |
| Files | `src/lib/challenge/shortlink.ts`, `src/routes/s.$id.tsx`, `src/routes/s.$host.$guest.tsx`, KV `MATCHES` |
| Tests | mint/resolve round-trip; nome unico → slug; collisione nome → id; id ignoto → vuoto |

## Goal

Dopo lo schieramento, il link da mandare contiene solo il **nome della rosa** o un **id corto**. Chi apre `/s/marco` (o `/s/k7p2qm1a`) vede la sfida senza i sette slug in query.

## Prerequisites

- F3 payload `host`/`guest` (resta il formato canonico di fallback)
- F9 Worker + KV

## Acceptance criteria

- [x] `mint` → id 8 caratteri; se `normalizeName` è libero, anche slug dal nome
- [x] `GET` dello slug/id idrata la stessa `Lineup` di `encodeLineup` / `decodeLineup`
- [x] Due rose con lo stesso nome non si sovrascrivono: la seconda tiene solo l’id
- [x] Senza store: si continua a copiare `?host=` tondo
- [x] Stesso giocatore resta vietato sulle due rose (regola F3)
- [x] Spec + manifest `done`

## Deliverables

- Engine puro + Vitest, adapter KV, UI share che preferisce l’URL corto

## Notes

Forma:

- `/s/:id` — id opaco o slug del nome
- `/s/:host/:guest?seed=` — partita senza i 14 slug in query

Niente accorciatori terzi. Mapping su Workers KV (`MATCHES`), niente PII oltre al nome rosa già pubblico nel link F3.
