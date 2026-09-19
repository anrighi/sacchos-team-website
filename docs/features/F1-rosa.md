# F1 — Ingest Sheet, carte FUT e filtri rosa

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 1 |
| Files | `scripts/ingest-roster.ts`, `src/data/players.generated.ts`, `src/components/PlayerCard.tsx`, `src/routes/rosa.tsx`, `src/routes/giocatori.$slug.tsx` |
| Tests | parse/clamp/default 75–100; overall = media; riga senza number/firstName scartata |

## Goal

Rosa 24 giocatori da Google Sheet (CSV pubblicato) a build time, carte FUT illustrate, filtri squadra/ruolo, scheda `/giocatori/$slug`.

## Prerequisites

- F0 mergiato
- Seed 24 nello Sheet (stats default 75)
- Illustrazioni in `public/players/{slug}.png` (mai foto reali)

## Acceptance criteria

- [x] `pnpm ingest-roster` / `pnpm build` genera `src/data/players.generated.ts`
- [x] Senza `ROSTER_SHEET_CSV_URL` usa lo snapshot in repo
- [x] Stats clamp 75–100, default 75; overall arrotondato
- [x] UI: nickname se c'è, senno firstName; disambiguazione col numero
- [x] Filtri query: squadra (chip Saccios Tim = logo pennarello), ruolo
- [x] Badge carte sempre Saccho's Team
- [x] Silhouette se manca il PNG illustrato
- [x] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Ingest CSV, tipi giocatore, griglia `/rosa`, dettaglio giocatore
- Seed snapshot dei 24 (Saccho's 12 + Saccios Tim 12)

## Notes

Colonne Sheet: firstName, nickname, number, birthYear, team, sex, role, velocita, salto, intercetto, scalpo, finalizzazione, gk. Giorgia F; Chiara 81 / Rebecca / MariaLaura F. Gianluca 9 → Saccios Tim. Ritratti: sprite pixel-art in `public/players/{slug}.svg` (profilo, maglia casa/trasferta, non foto); silhouette inline se il file manca. Niente filtro né campo presenze.

Grafica rosa (rev. 2): carta con ritratto a piena larghezza, overall e ruolo su riquadro sfocato in alto a sinistra, logo in alto a destra, nome e numero su gradiente in basso, sei stat su tre colonne con barra rosa. Pagina `/rosa`: hero centrato, barra filtri sticky, griglia divisa per squadra con logo e conteggio. Lo sprite disegna il proprio fondo (alone dithered) dentro la griglia 48×64.
