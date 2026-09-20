# F6 — Archivio partite su Google Sheet

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 2 |
| Files | `src/routes/sfide.tsx`, `src/routes/api.matches.ts` (o equivalente Worker) |
| Tests | append payload shape; `/sfide` vuoto senza CSV |

## Goal

Fine partita: `POST` webhook Apps Script → riga ricca sullo Sheet. `/sfide` legge CSV pubblicato.

## Prerequisites

- F5 recap URL

## Acceptance criteria

- [ ] Riga: timestamp, sim version, seed, displayName, winner, mete, MVP, 7 slug/lato, box score (efficienza tiri in porta), log JSON, URL tabellino
- [ ] Senza webhook: toast, link recap resta valido, archivio vuoto
- [ ] `/sfide` lista da CSV
- [ ] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Worker append, pagina archivio, README webhook

## Notes

Niente S3. Winrate/utilizzo: pivot successivi o sullo Sheet, non obbligatori in F6.
La voce **Archivio** resta fuori dalla nav (`src/lib/nav.ts`) finché questa feature non è pronta: `/sfide` esiste ma non è linkata.
