# Feature registry

> Last updated: 2026-09-20 | Active phase: 2 | Agent: Cursor

**Collaboration:** GitHub Issues (`label:feature`) · branch `cursor/phase-<n>-f<id>-<slug>-91b9` · PR with `Closes #N` · CI syncs manifest → issues on `main`. Workflow: `.cursor/rules/github-workflow.mdc`

## Global status

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 0 | Bootstrap | done | 100% |
| 1 | Rosa e UI | done | 100% |
| 2 | Sfida | in_progress | 50% |
| 0+ | Dopo | deferred | — |

## Active phase — what to do now

- **Current goal:** Phase 2 — sfida: schieramento, link, simulazione, tabellino
- **Remaining tasks:**
  - [x] [F3](features/F3-lineup.md) Schieramento 3-2-1 e link sfida
  - [x] [F4](features/F4-sim.md) Simulazione 2×15′ in 90s
  - [ ] [F5](features/F5-recap.md) Tabellino social e recap
  - [ ] [F6](features/F6-archive.md) Archivio partite su Google Sheet
- **Open blockers:** ruoli ancora vuoti sullo Sheet (stats 75 per tutti): la sfida gira ma i giocatori si equivalgono; F6 richiede un runtime server, Pages è statico

## Feature index

| ID | Feature | Phase | Status | Spec |
|----|---------|-------|--------|------|
| F0 | Bootstrap TanStack Start e CI Cloudflare | 0 | done | [F0-bootstrap.md](features/F0-bootstrap.md) |
| F1 | Ingest Sheet, carte FUT e filtri rosa | 1 | done | [F1-rosa.md](features/F1-rosa.md) |
| F2 | Hero, font, loghi e motion | 1 | done | [F2-visual.md](features/F2-visual.md) |
| F3 | Schieramento 3-2-1 e link sfida | 2 | done | [F3-lineup.md](features/F3-lineup.md) |
| F4 | Simulazione 2×15′ in 90s | 2 | done | [F4-sim.md](features/F4-sim.md) |
| F5 | Tabellino social e recap | 2 | not_started | [F5-recap.md](features/F5-recap.md) |
| F6 | Archivio partite su Google Sheet | 2 | not_started | [F6-archive.md](features/F6-archive.md) |
| F7 | Album fotografico | 0+ | deferred | [F7-album.md](features/F7-album.md) |

## Architecture decisions (light ADR)

| Date | Decision | Rationale | Rejected alternative |
|------|----------|-----------|---------------------|
| 2026-09-04 | Estendere `anrighi/agent-repo-template` (merge git, non copia file) | Banner GitHub *generated from* solo se il remote GitHub nasce dal template | Copiare i file a mano |
| 2026-09-04 | TanStack Start statico su GitHub Pages | Niente token Cloudflare ora; SSR/Workers dopo | Deploy Wrangler da F0 |
| 2026-09-05 | Stage per branch su GitHub Pages (`/preview/<slug>/`) | Vedere il sito fuori casa prima del merge | Solo `main`, preview Cloudflare |
| 2026-09-04 | TanStack Start + Cloudflare Workers (poi) | SSR e dominio club quando l’account CF è pronto | Next.js / Pages come stack definitivo |
| 2026-09-04 | Node 26 + pnpm | Current LTS-adjacent del template alzato; lockfile unico | Node 22 del template |
| 2026-09-04 | Rosa da Google Sheet a build, partite su Sheet in append | I giocatori editano senza DB; niente PII in repo | Postgres / JSON editato a mano |
| 2026-09-04 | Solo brand Saccho's Team; Saccios Tim = filtro | Un'identità visiva, due rose | Due loghi in nav |
| 2026-09-04 | Nickname o nome, mai cognomi/foto | Privacy scout | Foto reali, cognomi |
| 2026-09-04 | F7 album `deferred` | Fuori slice | Album in F0–F6 |
| 2026-09-19 | Fasi 0 e 1 unite su `main` (merge con radici non correlate) | `main` era un commit vuoto con root diversa: allineare prima di aprire la fase 2 | Rebase o reset di `main` con force push |
| 2026-09-19 | Ritratti rosa = DiceBear Toon Head + maglia club, trait in CSV | Niente foto, niente sprite pixel hash; la squadra può collaborare sul look | Asset South Park / generator non licenziabile |
| 2026-09-19 | Linee guida visuali in `docs/VISUAL.md` + `.cursor/rules/visual.mdc` | Stesse PNG e stessa ricetta pagina su rosa/sfida, non solo home | Restyling ad hoc per route |

## Handoff log (keep last ~5–10 entries)

| Date | Agent | Phase | Done | Next step | Blocker |
|------|-------|-------|------|-----------|---------|
| 2026-09-20 | Cursor | 1 | Ruolo PAL = Palo; stats singole 60–100 (vuoto=75) | Compilare ruoli sullo Sheet; F5 tabellino | Ruoli ancora vuoti; F6 senza nav fino al runtime server |
| 2026-09-20 | Cursor | 1 | Fascia overall 75–90: formula Sheet + ricalibro in ingest | Compilare ruoli sullo Sheet; F5 tabellino | Ruoli ancora vuoti; F6 senza nav fino al runtime server |
| 2026-09-20 | Cursor | 1 | Default look + stats 75 su ogni riga (visi custom Giorgia/Stefano/Guglielmo) | Compilare ruoli sullo Sheet; F5 tabellino | Ruoli ancora vuoti; F6 senza nav fino al runtime server |
| 2026-09-20 | Cursor | 1 | Sheet rosa in italiano con menu a tendina; niente occhi/sopracciglia/bocca; colori 3/5 | Compilare ruoli sullo Sheet; F5 tabellino | Ruoli ancora vuoti (stats 75); F6 senza nav fino al runtime server |
| 2026-09-20 | Cursor | 1 polish | Merge visual su `main`: Archivio fuori nav, MrAlex ovunque, `/rosa` senza conteggio carte | F5: tabellino `/sfida/partita` con OG e share | Ruoli/stat del seed ancora vuoti (tutti 75); F6 resta senza nav fino al runtime server |
| 2026-09-20 | Cursor | 2 | Merge F3+F4 su `main` (sfida 3-2-1, sim 2×15′, silver/gold meta) | F5: tabellino `/sfida/partita` con OG e share | Ruoli/stat del seed ancora vuoti (tutti 75); F6 Sheet per lo store |
| 2026-09-19 | Cursor | 2 | F4: extras copy silver/gold meta; niente box score a fine partita | F5: tabellino `/sfida/partita` con OG e share | Ruoli/stat del seed ancora vuoti (tutti 75); F6 Sheet per lo store |
| 2026-09-19 | Cursor | 1 | Merge nomi maglia su `main` (rosa 26, Saccios +Ga 24 +MORDECAI 6) | F3/F4 merged here | Nomi di battesimo ignoti per Ga/MORDECAI; Chiara 81 senza maglia |
| 2026-09-19 | Cursor | 1 | Merge Toon Head + kit su `main` (PNG e linee guida visuali) | F5 | Loghi SVG originali ancora in 0+ |
| 2026-09-19 | Cursor | 1 polish | Rosa: Toon Head + kit, `portraits.csv` per la squadra | F5 | Loghi PNG/SVG rinviati a fase 0+ |
| 2026-09-19 | Cursor | 1→2 | Chiusa fase 1 (F1 rosa rifatta graficamente, F2 landing a capitoli); fasi 0 e 1 unite su `main` | F3: `src/lib/challenge/` + campo 3-2-1 su `/sfida` | Loghi PNG/SVG rinviati a fase 0+ |
| 2026-09-05 | Cursor | 1 | F1: ingest CSV, snapshot 24, carte FUT, filtri `/rosa`, schede `/giocatori/$slug` | F2 solo con reference visive; pubblicare Sheet CSV (`ROSTER_SHEET_CSV_URL`) | URL CSV rosa assente |
| 2026-09-05 | Cursor | 0 | Stage Pages via branch `gh-pages` (niente env github-pages) | Impostare Pages su branch `gh-pages`; F1 | Pages source GitHub Actions era protetto |

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
- Visual / asset: [VISUAL.md](VISUAL.md)
- Test logica in `src/lib/**/*.test.ts` (Vitest, no DOM)
