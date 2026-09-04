# Agent conventions

Sito **Saccho's Team** (Scoutball 7v7, AGESCI Pesaro 1). Workflow agent-first: spec in `docs/features/`, manifest → GitHub Issues, una PR per feature.

Generated from [anrighi/agent-repo-template](https://github.com/anrighi/agent-repo-template). GitHub: [anrighi/sacchos-team-website](https://github.com/anrighi/sacchos-team-website).

## Before coding

1. Open feature issue (`label:feature`) matching the active phase in `docs/FEATURES.md`
2. Read the linked `docs/features/F*.md` spec
3. Follow `.cursor/rules/github-workflow.mdc` and `.cursor/rules/stack.mdc`
4. Branch: `cursor/phase-<n>-f<id>-<slug>-91b9` (stack if previous PR is unmerged)

## During work

- One feature per branch
- Early returns, `#/` imports, UI italiana, pochi commenti
- ADR in `docs/FEATURES.md`
- Deferred work stays `deferred` in manifest (F7 album)

## End of session

1. Update spec + `scripts/github-tasks.manifest.json`
2. Handoff log row in `docs/FEATURES.md`
3. PR `[Fx] …` with `Closes #N` when issues exist
4. Git author: **anrighi** / `anrighi@users.noreply.github.com`

## Commands

```bash
pnpm install   # Node 26
pnpm test
pnpm dev       # http://127.0.0.1:43123
pnpm build
pnpm deploy    # build statico GitHub Pages (`dist/client`)
pnpm run sync:github-tasks:dry-run
pnpm run sync:github-tasks
```
