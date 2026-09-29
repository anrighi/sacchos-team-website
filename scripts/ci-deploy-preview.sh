#!/usr/bin/env bash
set -euo pipefail

ALIAS="${PREVIEW_ALIAS:?}"
LOG="$(mktemp)"
trap 'rm -f "$LOG"' EXIT
URL=""
STATUS=0

bash scripts/ci-ensure-kv.sh

write_output() {
  local key="$1" value="$2"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_OUTPUT}"
  fi
}

plain() {
  sed 's/\x1b\[[0-9;]*[A-Za-z]//g' "$LOG"
}

capture_url() {
  local found=""
  found="$(plain | sed -nE 's/.*Version Preview Alias URL:[[:space:]]*(https:\/\/[^[:space:]]+).*/\1/p' | tail -1 || true)"
  if [[ -z "${found}" ]]; then
    found="$(plain | sed -nE 's/.*Version Preview URL:[[:space:]]*(https:\/\/[^[:space:]]+).*/\1/p' | tail -1 || true)"
  fi
  if [[ -z "${found}" ]]; then
    found="$(plain | sed -nE 's/.*(https:\/\/[a-zA-Z0-9._-]+\.workers\.dev).*/\1/p' | tail -1 || true)"
  fi
  if [[ -n "${found}" ]]; then
    URL="${found}"
  fi
}

worker_is_live() {
  plain | grep -qiE 'Uploaded sacchos|Deployed sacchos|Success! Uploaded'
}

accept_partial_domain() {
  if [[ "${STATUS}" -eq 0 ]]; then
    return 0
  fi
  if worker_is_live && [[ -n "${URL}" ]]; then
    echo "::warning::Worker pubblicato su workers.dev; custom domain non applicato (zona non nello stesso account)."
    STATUS=0
    return 0
  fi
  return "${STATUS}"
}

run_wrangler() {
  local append="$1"
  shift
  set +e
  if [[ "${append}" == "append" ]]; then
    pnpm exec wrangler "$@" 2>&1 | tee -a "$LOG"
  else
    pnpm exec wrangler "$@" 2>&1 | tee "$LOG"
  fi
  STATUS="${PIPESTATUS[0]}"
  set -e
  capture_url
}

run_wrangler overwrite versions upload --preview-alias "${ALIAS}"

if [[ "${STATUS}" -ne 0 ]] && plain | grep -qiE 'does not yet exist|run the .deploy. command first'; then
  echo "Worker sacchos assente: primo wrangler deploy."
  run_wrangler overwrite deploy
  accept_partial_domain || exit "${STATUS}"
  run_wrangler append versions upload --preview-alias "${ALIAS}"
fi

accept_partial_domain || exit "${STATUS}"

write_output deployment-url "${URL}"
if [[ -n "${URL}" ]]; then
  echo "Preview URL: ${URL}"
fi
