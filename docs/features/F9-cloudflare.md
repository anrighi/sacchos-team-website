# F9 — Deploy Cloudflare Workers e dominio club

| Field | Value |
|-------|-------|
| Status | in_progress |
| Phase | 0+ |
| Files | `wrangler.jsonc`, `vite.config.ts`, `.github/workflows/ci.yml`, `src/lib/club.ts`, `docs/CLOUDFLARE.md` |
| Tests | `pnpm test`; `pnpm build` con plugin Cloudflare; URL canonico `sacchos.agescipesaro1.it` |

## Goal

Sito su Cloudflare Workers (piano free), dominio `https://sacchos.agescipesaro1.it`. La rosa resta sullo Sheet Google a build. Le partite (F6) vanno su Workers KV, non su un secondo Sheet.

## Prerequisites

- Account Cloudflare free (zona `agescipesaro1.it` già su Cloudflare)
- Secret GitHub `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID` per il primo deploy live
- F0–F4 su `main`

## Acceptance criteria

- [x] `vite.config.ts` usa `@cloudflare/vite-plugin` (niente base `/sacchos-team-website/`)
- [x] `wrangler.jsonc`: Worker `sacchos`, `workers.dev` + custom domain `sacchos.agescipesaro1.it` (`compatibility_date` ≤ workerd locale)
- [x] CI: test+build; push `main` → `wrangler deploy`; altri branch → preview `versions upload`
- [x] `club.productionUrl` = `https://sacchos.agescipesaro1.it`
- [x] Rosa: ingest Sheet invariato (`ROSTER_SHEET_CSV_URL` / `roster.sheet.url`)
- [x] F6 ritargettata su KV; niente webhook Apps Script
- [x] DNS documentato in `docs/CLOUDFLARE.md` (niente cambio NS dell’apex)
- [ ] Primo deploy live (serve il token sull’account CF del gruppo)

## Deliverables

- Pipeline Workers al posto di GitHub Pages
- Guida secret + custom domain
- ADR: Workers + KV partite, Sheet solo rosa

## Notes

Custom Domain Workers richiede la zona nello **stesso** account del Worker. `agescipesaro1.it` è già su nameserver Cloudflare (`rosa` / `lakas`); non spostare l’apex. Se il Worker vive su un altro account, invitare quell’account sulla zona oppure deployare dal account che possiede la zona.

Preview: `*.workers.dev` (alias di versione), non più `/preview/<slug>/` su Pages.
