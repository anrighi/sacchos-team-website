# F1 — Ingest Sheet, carte FUT e filtri rosa

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 1 |
| Files | `scripts/ingest-roster.ts`, `src/lib/roster.ts`, `src/lib/sheet-url.ts`, `src/lib/sheet-schema.ts`, `src/lib/portrait.ts`, `src/lib/portraits.ts`, `src/data/players.generated.ts`, `src/data/roster.sheet.url`, `src/data/portraits.csv`, `src/components/PlayerPortrait.tsx`, `src/components/PlayerCard.tsx`, `src/routes/rosa.tsx`, `src/routes/giocatori.$slug.tsx` |
| Tests | parse/clamp/default 75–100; overall = media in fascia 75–90; riga senza number/firstName scartata; trait Toon Head da CSV |

## Goal

Rosa 26 giocatori da Google Sheet (CSV pubblicato) a build time, carte FUT illustrate, filtri squadra/ruolo, scheda `/giocatori/$slug`.

## Prerequisites

- F0 mergiato
- Seed 26 nello Sheet (stats default 75)
- Illustrazioni PNG opzionali in `public/players/{slug}.png` (mai foto reali); default Toon Head

## Acceptance criteria

- [x] `pnpm ingest-roster` / `pnpm build` genera `src/data/players.generated.ts`
- [x] Senza `ROSTER_SHEET_CSV_URL` usa `src/data/roster.sheet.url`, poi il seed in repo
- [x] Stats clamp 75–100, default 75; overall arrotondato in fascia 75–90 (la build ricalibra)
- [x] UI: nickname se c'è, senno firstName; disambiguazione col numero
- [x] Filtri query: squadra (chip Saccios Tim = logo pennarello), ruolo
- [x] Badge carte sempre Saccho's Team
- [x] Silhouette se manca il PNG illustrato
- [x] Spec + manifest `done` e PR con `Closes #N`

## Deliverables

- Ingest CSV, tipi giocatore, griglia `/rosa`, dettaglio giocatore
- Seed snapshot dei 26 (Saccho's 12 + Saccios Tim 14)

## Notes

Colonne Sheet (IT): Nome, Soprannome, Numero, Anno, Squadra, Sesso, Ruolo, Velocità, Salto, Intercetto, Scalpo, Finalizzazione, Parate, Capelli, Capelli dietro, Colore capelli, Carnagione, Barba. Nickname = nome maglia dove il numero coincide con la rosa. Giorgia F (pappagiorgia); Chiara 81 / Rebecca / MariaLaura F. Gianluca 9 → Saccios Tim (GB). #15 Luca = Luc'Avelli. Veronica 93 = Vero. Extra Saccios Tim senza nome di battesimo noto: Ga 24, MORDECAI 6. Senza maglia in elenco: Chiara 81. Sheet condiviso: [Sacchos Data](https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/edit?gid=0#gid=0) (`src/data/roster.sheet.url`). Ritratti: DiceBear **Toon Head** (Johan Melin, CC BY 4.0) con maglia casa/trasferta e artigli rosa; PNG in `public/players/{slug}.png` resta un override opzionale. Niente filtro né campo presenze.

Grafica rosa (rev. 4): stesso chrome FUT, ritratto Toon Head a piena larghezza su canvas 3:4. Kit forzato (bianco Saccho's, navy Saccios Tim) con stemmi AGESCI Pesaro 1 + Saccho's sul petto e artigli rosa del kit reale. Personalizzazione viso sullo Sheet (menu IT) e fallback `src/data/portraits.csv`: capelli, capelli dietro, barba, colore capelli (`nero`/`castano`/`biondo`), carnagione (`scura`/`media`/`chiara`). Occhi, sopracciglia e bocca non sono editabili: seed dello slug a runtime. Ogni giocatore ha già look e stats 75 compilati (Giorgia/Stefano/Guglielmo tengono il viso custom; i colori mancanti sono riempiti). Ruolo resta vuoto finché non lo sceglie la squadra. Celle ancora vuote = stessi default a ingest. Lo Sheet vince sul file se entrambi settano lo stesso tratto.

Equilibrio (play): la media delle sei stats di ogni giocatore deve stare tra **75 e 90**. Nello Sheet: colonna `Media` (`=ROUND(AVERAGE(H2:M2);0)`) e formula rosa `=IFERROR(ROUND(AVERAGE(H2:M1000);1);"")` con nota in `A29`. `pnpm ingest-roster` / build ricalibra i valori fuori fascia (stats singole restano 75–100).
