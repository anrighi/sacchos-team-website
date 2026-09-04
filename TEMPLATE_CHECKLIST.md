# Template checklist

Complete this once after **Use this template**.

## 1. Identity

- [ ] Rename project references: replace `{{PROJECT_NAME}}` in `.cursor/rules/agent-maintenance.mdc` (or delete the placeholder line)
- [ ] Set `repo` to `owner/name` in `scripts/github-tasks.manifest.json`
- [ ] Set `projectTitle` (used for optional GitHub Project board)

## 2. Phases and features

- [ ] Edit `phases[]` in the manifest (ids, labels, names, colors)
- [ ] Mirror the same phases in `docs/FEATURES.md`
- [ ] Replace or rewrite `docs/features/F0-example-bootstrap.md`
- [ ] Add features with `docs/features/_TEMPLATE.md` + manifest entries

## 3. Tooling

- [ ] `pnpm install`
- [ ] `gh auth login` (scopes: `repo`; optional `project` for board sync)
- [ ] `pnpm run sync:github-tasks:dry-run`
- [ ] `pnpm run sync:github-tasks`

## 4. App stack (your code)

- [ ] Add application scaffold (any language)
- [ ] Define `test` / `build` scripts and document them in `AGENTS.md`
- [ ] Add stack-specific Cursor rules under `.cursor/rules/` (imports, lint, UI locale, etc.)

## 5. Agents

- [ ] Open the repo in Cursor — rules under `.cursor/rules/` apply automatically
- [ ] First session: pick `[F0]` (or your first issue), branch `phase-0/f0-…`, implement, PR with `Closes #N`
- [ ] Write a **Handoff log** row in `docs/FEATURES.md`
