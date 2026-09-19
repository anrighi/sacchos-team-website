# F1 — Ingest Sheet, carte FUT e filtri rosa

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 1 |
| Files | `scripts/ingest-roster.ts`, `src/lib/portrait.ts`, `src/lib/portraits.ts`, `src/data/players.generated.ts`, `src/data/portraits.csv`, `src/components/PlayerPortrait.tsx`, `src/components/PlayerCard.tsx`, `src/routes/rosa.tsx`, `src/routes/giocatori.$slug.tsx` |
| Tests | parse/clamp/default 75–100; overall = media; riga senza number/firstName scartata; trait Toon Head da CSV |

## Goal

Rosa 24 giocatori da Google Sheet (CSV pubblicato) a build time, carte FUT illustrate, filtri squadra/ruolo, scheda `/giocatori/$slug`.

## Prerequisites

- F0 mergiato
- Seed 24 nello Sheet (stats default 75)
- Illustrazioni PNG opzionali in `public/players/{slug}.png` (mai foto reali); default Toon Head

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

Colonne Sheet: firstName, nickname, number, birthYear, team, sex, role, velocita, salto, intercetto, scalpo, finalizzazione, gk. Nickname = nome maglia dove il numero coincide con la rosa 24. Giorgia F (pappagiorgia); Chiara 81 / Rebecca / MariaLaura F. Gianluca 9 → Saccios Tim (GB). #15 Luca = Luc'Avelli (aggiornato). Veronica 93 = Vero (era 39). Maglie senza match in rosa: Ga 24, MORDECAI 6. Senza maglia in elenco: Chiara 81. Ritratti: DiceBear **Toon Head** (Johan Melin, CC BY 4.0) con maglia casa/trasferta e artigli rosa; PNG in `public/players/{slug}.png` resta un override opzionale. Niente filtro né campo presenze.

Grafica rosa (rev. 4): stesso chrome FUT, ritratto Toon Head a piena larghezza su canvas 3:4. Kit forzato (bianco Saccho's, navy Saccios Tim) con stemmi AGESCI Pesaro 1 + Saccho's sul petto e artigli rosa del kit reale. Personalizzazione viso in `src/data/portraits.csv` (condivisibile con la squadra) e/o colonne opzionali sullo Sheet (`hair`, `rearHair`, `hairColor`, `skinColor`, `eyes`, `eyebrows`, `mouth`, `beard`; alias IT: capelli, capelliDietro, coloreCapelli, carnagione, occhi, sopracciglia, bocca, barba). Celle vuote = seed dallo slug + sesso. `hairColor`/`skinColor` accettano 5 preset (black/brown/auburn/blonde/gold e deep/tan/medium/warm/light) o hex. Occhi/sopracciglia/bocca vuoti restano casuali-stabili dallo slug a runtime. `none` nasconde barba/capelli dietro. Lo Sheet vince sul file se entrambi settano lo stesso tratto.
