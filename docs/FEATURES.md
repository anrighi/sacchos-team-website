# Feature registry

> Last updated: 2026-09-04 | Active phase: 1 | Agent: Cursor

**Collaboration:** GitHub Issues (`label:feature`) · branch `cursor/phase-<n>-f<id>-<slug>-91b9` · PR with `Closes #N` · CI syncs manifest → issues on `main`. Workflow: `.cursor/rules/github-workflow.mdc`

## Global status

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 0 | Bootstrap | done | 100% |
| 1 | Rosa e UI | in_progress | 0% |
| 2 | Sfida | pending | 0% |
| 0+ | Dopo | deferred | — |

## Active phase — what to do now

- **Current goal:** Phase 1 — rosa da Sheet, carte FUT, poi hero/motion
- **Remaining tasks:**
  - [ ] [F1](features/F1-rosa.md) Ingest Sheet, carte, illustrazioni, filtri
  - [ ] [F2](features/F2-visual.md) Hero, font, loghi, motion
- **Open blockers:** URL CSV dello Sheet rosa; Pages source = GitHub Actions

## Feature index

| ID | Feature | Phase | Status | Spec |
|----|---------|-------|--------|------|
| F0 | Bootstrap TanStack Start e CI Cloudflare | 0 | done | [F0-bootstrap.md](features/F0-bootstrap.md) |
| F1 | Ingest Sheet, carte FUT e filtri rosa | 1 | not_started | [F1-rosa.md](features/F1-rosa.md) |
| F2 | Hero, font, loghi e motion | 1 | not_started | [F2-visual.md](features/F2-visual.md) |
| F3 | Schieramento 3-2-1 e link sfida | 2 | not_started | [F3-lineup.md](features/F3-lineup.md) |
| F4 | Simulazione 2×15′ in 90s | 2 | not_started | [F4-sim.md](features/F4-sim.md) |
| F5 | Tabellino social e recap | 2 | not_started | [F5-recap.md](features/F5-recap.md) |
| F6 | Archivio partite su Google Sheet | 2 | not_started | [F6-archive.md](features/F6-archive.md) |
| F7 | Album fotografico | 0+ | deferred | [F7-album.md](features/F7-album.md) |

## Architecture decisions (light ADR)

| Date | Decision | Rationale | Rejected alternative |
|------|----------|-----------|---------------------|
| 2026-09-04 | Estendere `anrighi/agent-repo-template` (merge git, non copia file) | Banner GitHub *generated from* solo se il remote GitHub nasce dal template | Copiare i file a mano |
| 2026-09-04 | TanStack Start statico su GitHub Pages | Niente token Cloudflare ora; SSR/Workers dopo | Deploy Wrangler da F0 |
| 2026-09-04 | TanStack Start + Cloudflare Workers (poi) | SSR e dominio club quando l’account CF è pronto | Next.js / Pages come stack definitivo |
| 2026-09-04 | Node 26 + pnpm | Current LTS-adjacent del template alzato; lockfile unico | Node 22 del template |
| 2026-09-04 | Rosa da Google Sheet a build, partite su Sheet in append | I giocatori editano senza DB; niente PII in repo | Postgres / JSON editato a mano |
| 2026-09-04 | Solo brand Saccho's Team; Saccios Tim = filtro | Un'identità visiva, due rose | Due loghi in nav |
| 2026-09-04 | Nickname o nome, mai cognomi/foto | Privacy scout | Foto reali, cognomi |
| 2026-09-04 | F7 album `deferred` | Fuori slice | Album in F0–F6 |

## Handoff log (keep last ~5–10 entries)

| Date | Agent | Phase | Done | Next step | Blocker |
|------|-------|-------|------|-----------|---------|
| 2026-09-04 | Cursor | 0 | Deploy F0 su GitHub Pages (static) | Merge PR #9; F1 ingest Sheet | Pages: source GitHub Actions |

## Useful commands

```bash
pnpm install          # Node 26 (nvm use / .nvmrc)
pnpm test
pnpm dev              # http://127.0.0.1:43123
pnpm build
pnpm run sync:github-tasks:dry-run
pnpm run sync:github-tasks
```

## Localization / conventions

- UI **italiana**, `lang="it"`
- Import `#/` → `src/`
- Mobile-first, dark fisso
- Test logica in `src/lib/**/*.test.ts` (Vitest, no DOM)
