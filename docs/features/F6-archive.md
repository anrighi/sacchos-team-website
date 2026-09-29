# F6 — Archivio partite su Cloudflare KV

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 2 |
| Files | `src/routes/sfide.tsx`, `src/lib/challenge/archive.ts`, `src/lib/challenge/cloud.ts` |
| Tests | append payload shape; `/sfide` vuoto senza KV; seed duplicato ignorato |

## Goal

Fine partita: `POST` sul Worker → riga su Workers KV. `/sfide` elenca le partite. La rosa resta sullo Sheet Google.

## Prerequisites

- F4 sim (tabellino F5 può arrivare dopo: il recap URL è il link della partita)
- F9 Worker in produzione (binding `MATCHES`)

## Acceptance criteria

- [x] Riga: timestamp, sim version, seed, displayName, winner, mete, MVP, 7 slug/lato, box score (efficienza tiri in porta), log JSON, URL tabellino
- [x] Senza KV/binding: messaggio, link recap resta valido, archivio vuoto
- [x] `/sfide` lista da KV
- [x] Spec + manifest `done`

## Deliverables

- Server function append, pagina archivio, binding `MATCHES` in `wrangler.jsonc`

## Notes

Niente secondo Google Sheet, niente Apps Script, niente S3. Winrate/utilizzo: pivot successivi, non obbligatori in F6.
CI crea il namespace `sacchos-MATCHES` al deploy se manca.
