# F6 — Archivio partite su Cloudflare KV

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 2 |
| Files | `src/lib/challenge/archive.ts`, `src/lib/challenge/cloud.ts`, `src/routes/sfide.tsx` |
| Tests | append payload shape; seed duplicato ignorato; nav senza Archivio |

## Goal

Fine partita: `POST` sul Worker → riga su Workers KV. **Niente pagina pubblica.** La rosa resta sullo Sheet Google.

## Prerequisites

- F4 sim (tabellino F5 può arrivare dopo: il recap URL è il link della partita)
- F9 Worker in produzione (binding `MATCHES`)

## Acceptance criteria

- [x] Riga: timestamp, sim version, seed, displayName, winner, mete, MVP, 7 slug/lato, box score (efficienza tiri in porta), log JSON, URL tabellino
- [x] Senza KV/binding: messaggio in partita, link recap resta valido
- [x] Nessuna lista pubblica: `/sfide` redirige a `/`, Archivio fuori nav, niente RPC di elenco
- [x] Spec + manifest `done`

## Deliverables

- Server function append, binding `MATCHES` in `wrangler.jsonc`

## Notes

Niente secondo Google Sheet, niente Apps Script, niente S3. Winrate/utilizzo: pivot successivi, non obbligatori in F6.
CI crea il namespace `sacchos-MATCHES` al deploy se manca.
