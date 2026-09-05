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
| `/sfide` | Archivio Sheet (F6) |

UI in italiano, mobile-first, tema dark. **Saccho's Team** è l’unica brand; *Saccios Tim* è solo un filtro della rosa.

Privacy: nickname se c’è, altrimenti nome. Niente cognomi, niente foto reali nel repo.

## Dati

Due Google Sheet:

1. **Rosa** — lettura a **build** (`ROSTER_SHEET_CSV_URL`). I giocatori editano nickname, ruolo, stats 75–100. `pnpm ingest-roster` / `pnpm build` / CI fanno ingest; senza URL si usa lo snapshot `src/data/players.generated.ts`.
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

## Sheet rosa (`ROSTER_SHEET_CSV_URL`)

Finché l’URL non è configurato, la build tiene lo snapshot dei 24 giocatori 2026.

Quando lo Sheet è pronto:

1. Google Sheet con colonne: `firstName`, `nickname`, `number`, `birthYear`, `team`, `sex`, `role`, `velocita`, `salto`, `intercetto`, `scalpo`, `finalizzazione`, `gk`
2. File → Condividi → **Pubblica sul web** → formato **CSV**
3. Copia l’URL del CSV
4. In locale: mettilo in `.env` come `ROSTER_SHEET_CSV_URL=...` (vedi `.env.example`) e lancia `pnpm ingest-roster`
5. In CI: secret `ROSTER_SHEET_CSV_URL` (già letto da `.github/workflows/ci.yml`)

Righe senza `number` o `firstName` vengono scartate. Stats fuori da 75–100 sono clampate; vuote = 75. Overall = media arrotonda delle sei stats.

Per rigenerare lo snapshot dal seed di repo: `pnpm ingest-roster:seed`.

Cloudflare Workers (`wrangler.jsonc`) e il dominio `sacchos.agescipesaro1.it` sono rimandati: niente token, niente DNS in questo slice.

## Identità git

Commit come **anrighi** (`anrighi@users.noreply.github.com`), non con l’email di lavoro.

## Licenza

MIT.
