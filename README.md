# Agent repo template

Stack-agnostic GitHub **template** for building repositories with AI coding agents (Cursor and similar).

It exports the collaboration loop used in production projects:

1. Spec features in `docs/features/F*.md`
2. Track them in a JSON manifest
3. Sync to GitHub Issues (labels, bodies, open/closed)
4. Implement on `phase-<n>/<id>-slug` branches
5. Merge PRs with `Closes #N` and write a handoff log

App code is yours. This kit only provides **agent rules**, **docs skeleton**, and **thin Node tooling** for issue sync.

## Use this template

1. On GitHub: **Use this template** → create a new repository
2. Clone it and open it in Cursor
3. Follow [TEMPLATE_CHECKLIST.md](TEMPLATE_CHECKLIST.md)

Or with the CLI (after this repo is published as a template):

```bash
gh repo create my-project --template anrighi/agent-repo-template --public --clone
cd my-project
```

## Bootstrap (summary)

```bash
pnpm install
# Edit scripts/github-tasks.manifest.json → set repo + projectTitle + phases/features
# Align docs/FEATURES.md with those phases
gh auth login
pnpm run sync:github-tasks:dry-run
pnpm run sync:github-tasks
```

## Layout

```text
.cursor/rules/          # always-on agent rules
AGENTS.md               # short conventions for agents
docs/FEATURES.md        # phase registry + ADR + handoff log
docs/features/          # per-feature specs (+ _TEMPLATE.md)
scripts/                # manifest + sync + issue body renderer
.github/                # sync workflow, PR + issue templates
```

## Agent loop

```text
manifest + specs ──sync──► GitHub Issues
        ▲                      │
        │                      ▼
   handoff / status ◄── agent on phase-n/id-slug branch
                               │
                               ▼
                     PR → main (Closes #N)
```

## Manifest phases

Phase labels are **not** hardcoded in the shell script. Define them in `scripts/github-tasks.manifest.json`:

```json
{
  "repo": "owner/my-project",
  "projectTitle": "My Project Roadmap",
  "phases": [
    { "id": "0", "label": "phase-0", "name": "Bootstrap", "color": "0E8A16" },
    { "id": "1", "label": "phase-1", "name": "Core", "color": "0E8A16" },
    { "id": "0+", "label": "phase-0+", "name": "Cross-cutting", "color": "5319E7" }
  ],
  "features": [
    {
      "id": "F0",
      "title": "Bootstrap agent workflow",
      "phase": "0",
      "status": "todo",
      "spec": "docs/features/F0-example-bootstrap.md"
    }
  ]
}
```

Statuses: `todo` | `done` | `deferred`

## Requirements

- Node 22+
- [pnpm](https://pnpm.io/)
- [GitHub CLI](https://cli.github.com/) (`gh`) authenticated
- [jq](https://jqlang.github.io/jq/)

## Maintainer: publish as a template

After pushing this repository to GitHub:

1. Settings → General → **Template repository** (check)
2. Smoke-test: **Use this template** into a throwaway repo and run `pnpm run sync:github-tasks`

## License

MIT — use freely for public or private projects.
