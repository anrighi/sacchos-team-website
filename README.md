# Saccho's Team

Sito della squadra di **Scoutball 7 vs 7** dei **Saccho's Team** (AGESCI Pesaro 1, since 2016).

Produzione: [https://sacchos.agescipesaro1.it](https://sacchos.agescipesaro1.it)

Repo: [anrighi/sacchos-team-website](https://github.com/anrighi/sacchos-team-website), generated from [anrighi/agent-repo-template](https://github.com/anrighi/agent-repo-template).

## Stack

- Node **26** (`.nvmrc`) + **pnpm**
- [TanStack Start](https://tanstack.com/start) (React, Vite, file router)
- Tailwind v4, shadcn/ui per le primitive
- Vitest sulla logica (ingest, sfida)
- Deploy: **Cloudflare Workers** (`wrangler`)

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

1. **Rosa** — lettura a **build** (`ROSTER_SHEET_CSV_URL`, File → Condividi → Pubblica sul web → CSV). I giocatori editano nickname, ruolo, stats 75–100. `pnpm build` / CI fa ingest; senza URL si usa lo snapshot in repo (da F1).
2. **Partite** — append a runtime (webhook Apps Script). Senza webhook la sfida resta nel link.

Non mettere nello Sheet: cognomi, allergie, censimento, date di nascita complete, foto.

## CI e deploy

`.github/workflows/ci.yml`:

- **pull_request:** `pnpm test` + `pnpm build`
- **push `main`:** test + build + `wrangler deploy`

Secret GitHub: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, `ROSTER_SHEET_CSV_URL` (e in seguito il webhook partite).

Worker name: `sacchos`. Hostname pubblico da attaccare a mano sull’account Cloudflare: `sacchos.agescipesaro1.it` (zona `agescipesaro1.it` o CNAME dal registrar). HTTPS sul piano gratuito.

## Identità git

Commit come **anrighi** (`anrighi@users.noreply.github.com`), non con l’email di lavoro.

## Licenza

MIT.
