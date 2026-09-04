# Feature registry

> Last updated: YYYY-MM-DD | Active phase: 0 | Agent: Cursor

**Collaboration:** GitHub Issues (`label:feature`) · branch `phase-<n>/<id>-<slug>` · PR with `Closes #N` · CI syncs manifest → issues on `main`. Workflow: `.cursor/rules/github-workflow.mdc`

## Global status

| Phase | Name | Status | Completion |
|-------|------|--------|------------|
| 0 | Bootstrap | in_progress | 0% |
| 1 | Core | pending | 0% |
| 0+ | Cross-cutting | pending | 0% |

Edit phase names to match `phases[]` in `scripts/github-tasks.manifest.json`.

## Active phase — what to do now

- **Current goal:** Phase 0 — bootstrap agent workflow
- **Remaining tasks:**
  - [ ] [F0](features/F0-example-bootstrap.md) Bootstrap agent workflow
- **Open blockers:** None

## Feature index

| ID | Feature | Phase | Status | Spec |
|----|---------|-------|--------|------|
| F0 | Bootstrap agent workflow | 0 | not_started | [F0-example-bootstrap.md](features/F0-example-bootstrap.md) |

## Architecture decisions (light ADR)

| Date | Decision | Rationale | Rejected alternative |
|------|----------|-----------|---------------------|
| YYYY-MM-DD | Manifest-driven phase labels | Portable across projects | Hardcoded labels in shell |

## Handoff log (keep last ~5–10 entries)

| Date | Agent | Phase | Done | Next step | Blocker |
|------|-------|-------|------|-----------|---------|
| YYYY-MM-DD | — | 0 | Template cloned | Fill manifest `repo` + sync issues | None |

## Useful commands

```bash
pnpm install
pnpm run sync:github-tasks:dry-run
pnpm run sync:github-tasks
```

## Localization / conventions

Document language and stack choices here (e.g. UI locale, docs language, absolute imports).
