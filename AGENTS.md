# Agent conventions

This repository uses an **agent-first** workflow: features are specified in `docs/features/`, tracked in GitHub Issues (synced from a manifest), implemented on `phase-<n>/` branches, and closed via PRs with `Closes #N`.

## Before coding

1. Open feature issue (`label:feature`) matching the active phase in `docs/FEATURES.md`
2. Read the linked `docs/features/F*.md` spec
3. Follow `.cursor/rules/github-workflow.mdc`
4. Branch: `phase-<n>/<id>-<slug>` from `main`

## During work

- One feature per branch when possible
- Prefer small diffs, early returns, minimal comments
- Put architecture decisions in `docs/FEATURES.md` (ADR table), not scattered comments
- Mark deferred work explicitly as `deferred` in the manifest and spec

## End of session

1. Update the issue and feature spec
2. Update `scripts/github-tasks.manifest.json` status when completing a feature
3. Add a **Handoff log** row in `docs/FEATURES.md` with a concrete next step
4. Open or update a PR with `Closes #N`

## Commands

```bash
pnpm install
pnpm run sync:github-tasks:dry-run   # validate without writing issues
pnpm run sync:github-tasks           # create/update issues from manifest
pnpm run sync:github-tasks:force     # also refresh closed issues
```

Add your application commands (`dev`, `test`, `build`) here after scaffolding the app.
