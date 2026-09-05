# F0 — Bootstrap TanStack Start e GitHub Pages

| Field | Value |
|-------|-------|
| Status | done |
| Phase | 0 |
| Files | `package.json`, `src/`, `.github/workflows/ci.yml`, `docs/`, `wrangler.jsonc` (CF dopo) |
| Tests | `pnpm test` (Node ≥26 + club brand); `pnpm build` |

## Goal

App TanStack Start eseguibile, identità Saccho's Team, pipeline Vitest + build, publish statico su GitHub Pages.

## Prerequisites

- Repo esteso da `anrighi/agent-repo-template`
- Node 26, pnpm 10

## Acceptance criteria

- [x] `pnpm dev` serve su `127.0.0.1:43123`
- [x] Rotte `/`, `/rosa`, `/sfida`, `/sfide` con nav mobile-bottom / desktop-top
- [x] Font MrAlex, palette navy/rosa, logo in `public/brand/`
- [x] Vitest smoke + `pnpm build`
- [x] CI: PR test+build Pages; push `main` → GitHub Pages
- [x] Manifest F0–F7, FEATURES.md, regole Cursor stack
- [x] Spec status e manifest F0 → `done`
- [ ] PR mergiata con `Closes #<issue>` su [anrighi/sacchos-team-website](https://github.com/anrighi/sacchos-team-website)

## Deliverables

- Shell branded (home + placeholder rosa/sfida/archivio)
- CI GitHub Pages, `.nvmrc`, `.env.example`
- README prodotto (template, Sheet, identità git; Cloudflare rimandato)

## Notes

F1 legge lo Sheet. Senza `ROSTER_SHEET_CSV_URL` la build non deve fallire (snapshot/empty). Deploy: GitHub Pages. `main` → https://anrighi.github.io/sacchos-team-website/ ; ogni altro branch → `/preview/<slug>/`. Cloudflare Workers e `sacchos.agescipesaro1.it` arrivano dopo; `wrangler.jsonc` resta come gancio.
