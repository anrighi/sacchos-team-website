# F0 — Bootstrap agent workflow

| Field | Value |
|-------|-------|
| Status | not_started |
| Phase | 0 |
| Files | `scripts/github-tasks.manifest.json`, `docs/FEATURES.md`, `.cursor/rules/` |
| Tests | `pnpm run sync:github-tasks:dry-run` |

## Goal

Configure this repository as an agent-first project: replace placeholders, sync the sample feature to GitHub Issues, and confirm Cursor rules apply.

## Prerequisites

- GitHub repository created from this template
- `gh` CLI authenticated (`gh auth login`)
- Node 22+ and pnpm installed

## Acceptance criteria

- [ ] `scripts/github-tasks.manifest.json` has real `repo` (`owner/name`) and `projectTitle`
- [ ] Phase table in `docs/FEATURES.md` matches `phases[]` in the manifest
- [ ] `pnpm run sync:github-tasks` creates issue `[F0] Bootstrap agent workflow`
- [ ] Branch naming and PR checklist are understood (see `.cursor/rules/github-workflow.mdc`)
- [ ] Handoff log has an entry for the next feature

## Deliverables

- Filled manifest and feature registry
- Synced GitHub Issues (+ optional Project board)
- Project-specific notes in `AGENTS.md`

## Notes

Delete or rewrite this sample once your real F0 exists. Copy `docs/features/_TEMPLATE.md` for new features.
