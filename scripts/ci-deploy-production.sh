#!/usr/bin/env bash
set -euo pipefail

LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

plain() {
  sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$LOG"
}

live_url() {
  plain | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | tail -1
}

set +e
pnpm exec wrangler deploy 2>&1 | tee "$LOG"
STATUS="${PIPESTATUS[0]}"
set -e

if [[ "${STATUS}" -eq 0 ]]; then
  exit 0
fi

if plain | grep -qiE 'Uploaded sacchos|Deployed sacchos' && [[ -n "$(live_url)" ]]; then
  echo "::warning::Worker pubblicato su workers.dev; custom domain non applicato (zona non nello stesso account)."
  exit 0
fi

exit "${STATUS}"
