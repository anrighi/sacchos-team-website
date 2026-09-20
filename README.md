# Saccho's Team

Sito della squadra di **Scoutball 7 vs 7** dei **Saccho's Team** (AGESCI Pesaro 1, since 2016).

Produzione provvisoria: [https://anrighi.github.io/sacchos-team-website/](https://anrighi.github.io/sacchos-team-website/)  
Dominio club (più avanti, Cloudflare): [https://sacchos.agescipesaro1.it](https://sacchos.agescipesaro1.it)

Repo: [anrighi/sacchos-team-website](https://github.com/anrighi/sacchos-team-website), generated from [anrighi/agent-repo-template](https://github.com/anrighi/agent-repo-template).

## Stack

- Node **26** (`.nvmrc`) + **pnpm**
- [TanStack Start](https://tanstack.com/start) (React, Vite, file router)
- Tailwind v4, shadcn/ui per le primitive
- Vitest sulla logica (ingest, sfida)
- Deploy: **GitHub Pages** (static). Cloudflare Workers + `sacchos.agescipesaro1.it` arrivano dopo.

## Avvio locale

```bash
nvm use        # o qualsiasi Node 26
pnpm install
pnpm test
pnpm dev       # http://127.0.0.1:43123
```

Copia `.env.example` in `.env` quando hai gli URL degli Sheet.

## Pagine

| Path | Contenuto |
|------|-----------|
| `/` | Home club |
| `/rosa` | Carte (F1) |
| `/giocatori/$slug` | Scheda (F1) |
| `/sfida` | Schieramento e link (F3–F4) |
| `/sfida/partita` | Tabellino (F5) |
| `/sfide` | Archivio Sheet (F6) — nascosto dalla nav finché F6 non è pronto |

UI in italiano, mobile-first, tema dark. **Saccho's Team** è l’unica brand; *Saccios Tim* è solo un filtro della rosa. Skin e asset: [docs/VISUAL.md](docs/VISUAL.md).

Privacy: nickname se c’è, altrimenti nome. Niente cognomi, niente foto reali nel repo.

## Dati

Due Google Sheet:

1. **Rosa** — lettura a **build** dallo Sheet condiviso (`src/data/roster.sheet.url`, override `ROSTER_SHEET_CSV_URL`). I giocatori editano nickname, ruolo, stats 75–100. `pnpm ingest-roster` / `pnpm build` / CI fanno ingest; Sheet vuoto o irraggiungibile → seed `src/data/roster.seed.csv`.
2. **Partite** — append a runtime (webhook Apps Script). Senza webhook la sfida resta nel link.

Non mettere nello Sheet: cognomi, allergie, censimento, date di nascita complete, foto.

## CI e deploy

`.github/workflows/ci.yml`:

- **pull_request:** `pnpm test` + `pnpm run build:pages` (base dello stage del branch)
- **push su qualsiasi branch** (tranne `gh-pages`): stesso, poi publish su **GitHub Pages**
  - `main` → https://anrighi.github.io/sacchos-team-website/
  - altri branch → `https://anrighi.github.io/sacchos-team-website/preview/<branch>/`

Esempio F0: https://anrighi.github.io/sacchos-team-website/preview/cursor-phase-0-f0-bootstrap-91b9/

In Settings → Pages: **Deploy from a branch** → `gh-pages` / `/(root)`. Non usare source “GitHub Actions”: quell’environment è protetto e accetta solo `main`, quindi lo stage dei branch veniva rifiutato.

Nessun secret Cloudflare per ora.

## Sheet rosa

Lo Sheet condiviso (chiunque con il link) è la fonte della rosa a build:

[Sacchos Data](https://docs.google.com/spreadsheets/d/10tFgbhIPJk9l5p4w3K28GV4ez7Gh-hmUEhKh9hRYGtE/edit?gid=0#gid=0)

L’URL sta in `src/data/roster.sheet.url`. `pnpm ingest-roster` lo converte in export CSV; non serve “Pubblica sul web”. Override: `ROSTER_SHEET_CSV_URL` in `.env` o secret CI.

Colonne: `firstName`, `nickname`, `number`, `birthYear`, `team`, `sex`, `role`, `velocita`, `salto`, `intercetto`, `scalpo`, `finalizzazione`, `gk`. Colonne look opzionali: `hair`, `rearHair`, `hairColor`, `skinColor`, `eyes`, `eyebrows`, `mouth`, `beard`.

Righe senza `number` o `firstName` vengono scartate. Stats fuori da 75–100 sono clampate; vuote = 75. Overall = media arrotonda delle sei stats. Sheet vuoto → seed `src/data/roster.seed.csv`.

## Ritratti (`src/data/portraits.csv`)

Le carte usano [Toon Head](https://www.dicebear.com/styles/toon-head/) (Johan Melin, CC BY 4.0) via DiceBear. La maglia è il kit del club (bianca Saccho's, navy Saccios Tim) con stemmi AGESCI Pesaro 1 e Saccho's sul petto e gli artigli rosa.

Il file `src/data/portraits.csv` è il foglio look da condividere con la squadra: una riga per giocatore, trait vuoti = avatar dallo slug. Valori ammessi:

| Colonna | Valori |
|---------|--------|
| `hair` | `bun`, `sideComed`, `spiky`, `undercut`, `none` |
| `rearHair` | `longStraight`, `longWavy`, `neckHigh`, `shoulderHigh`, `none` |
| `eyes` | `bow`, `happy`, `humble`, `wide`, `wink` |
| `eyebrows` | `angry`, `happy`, `neutral`, `raised`, `sad` |
| `mouth` | `agape`, `angry`, `laugh`, `sad`, `smile` |
| `beard` | `chin`, `chinMoustache`, `fullBeard`, `longBeard`, `moustacheTwirl`, `none` |
| `hairColor` | preset `black`, `brown`, `auburn`, `blonde`, `gold` (IT: `nero`, `castano`, `ramato`, `biondo`, `miele`) oppure hex |
| `skinColor` | preset `deep`, `tan`, `medium`, `warm`, `light` (IT: `scura`, `olivastra`, `media`, `calda`, `chiara`) oppure hex |

Si può matchare per `slug` oppure `firstName`+`number` (+ `team` se due omonimi). Alias italiani: `capelli`, `capelliDietro`, `coloreCapelli`, `carnagione`, `occhi`, `sopracciglia`, `bocca`, `barba`. Celle `eyes` / `eyebrows` / `mouth` vuote = espressione dal seed dello slug (runtime, stabile per giocatore, non a build). Se lo Sheet rosa ha le stesse colonne, quelle vincono sul file. Poi `pnpm ingest-roster`.

Per rigenerare lo snapshot dal seed di repo: `pnpm ingest-roster:seed`.

Cloudflare Workers (`wrangler.jsonc`) e il dominio `sacchos.agescipesaro1.it` sono rimandati: niente token, niente DNS in questo slice.

## Identità git

Commit come **anrighi** (`anrighi@users.noreply.github.com`), non con l’email di lavoro.

## Licenza

MIT.
