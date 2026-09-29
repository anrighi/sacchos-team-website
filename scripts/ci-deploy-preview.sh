#!/usr/bin/env bash
set -euo pipefail

ALIAS="${PREVIEW_ALIAS:?}"
LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT

write_output() {
  local key="$1" value="$2"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_OUTPUT}"
  fi
}

plain() {
  sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$LOG"
}

preview_url() {
  local url=""
  url="$(plain | sed -nE 's/.*Version Preview Alias URL:[[:space:]]*(https:\/\/[^[:space:]]+).*/\1/p' | tail -1)"
  if [[ -z "${url}" ]]; then
    url="$(plain | sed -nE 's/.*Version Preview URL:[[:space:]]*(https:\/\/[^[:space:]]+).*/\1/p' | tail -1)"
  fi
  if [[ -z "${url}" ]]; then
    url="$(plain | grep -oE 'https://[a-zA-Z0-9._-]+\.workers\.dev' | tail -1)"
  fi
  printf '%s' "${url}"
}

set +e
pnpm exec wrangler versions upload --preview-alias "${ALIAS}" 2>&1 | tee "$LOG"
STATUS="${PIPESTATUS[0]}"
set -e

if [[ "${STATUS}" -ne 0 ]]; then
  if ! plain | grep -qiE 'does not yet exist|run the .deploy. command first'; then
    exit "${STATUS}"
  fi
  echo "Worker sacchos assente: primo wrangler deploy."
  pnpm exec wrangler deploy 2>&1 | tee "$LOG"
  pnpm exec wrangler versions upload --preview-alias "${ALIAS}" 2>&1 | tee "$LOG"
fi

URL="$(preview_url)"
write_output deployment-url "${URL}"
if [[ -n "${URL}" ]]; then
  echo "Preview URL: ${URL}"
fi
