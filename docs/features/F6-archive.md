# F6 — Archivio partite su Cloudflare KV

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 2 |
| Files | `src/routes/sfide.tsx`, `src/routes/api.matches.ts` (o server function Worker) |
| Tests | append payload shape; `/sfide` vuoto senza KV |

## Goal

Fine partita: `POST` sul Worker → riga su Workers KV. `/sfide` elenca le partite. La rosa resta sullo Sheet Google.

## Prerequisites

- F5 recap URL
- F9 Worker in produzione (binding `MATCHES`)

## Acceptance criteria

- [ ] Riga: timestamp, sim version, seed, displayName, winner, mete, MVP, 7 slug/lato, box score (efficienza tiri in porta), log JSON, URL tabellino
- [ ] Senza KV/binding: toast, link recap resta valido, archivio vuoto
- [ ] `/sfide` lista da KV
- [ ] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Server function append, pagina archivio, binding `MATCHES` in `wrangler.jsonc`

## Notes

Niente secondo Google Sheet, niente Apps Script, niente S3. Winrate/utilizzo: pivot successivi, non obbligatori in F6.
La voce **Archivio** resta fuori dalla nav (`src/lib/nav.ts`) finché questa feature non è pronta: `/sfide` esiste ma non è linkata.
Creare il namespace: `pnpm wrangler kv namespace create MATCHES` (vedi `docs/CLOUDFLARE.md`).
