#!/usr/bin/env bash
set -euo pipefail

REPO_BASE="/sacchos-team-website"
HOST="https://anrighi.github.io"

write_env() {
  local key="$1" value="$2"
  if [[ -n "${GITHUB_ENV:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_ENV}"
  fi
  echo "${key}=${value}"
}

if [[ "${GITHUB_REF:-}" == "refs/heads/main" ]]; then
  write_env PAGES_BASE "${REPO_BASE}/"
  write_env PAGES_DEST "root"
  write_env STAGE_URL "${HOST}${REPO_BASE}/"
  exit 0
fi

REF_NAME="${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-}}"

if [[ -z "${REF_NAME}" || "${REF_NAME}" == "main" ]]; then
  write_env PAGES_BASE "${REPO_BASE}/"
  write_env PAGES_DEST "root"
  write_env STAGE_URL "${HOST}${REPO_BASE}/"
  exit 0
fi

SLUG="$(printf '%s' "${REF_NAME}" | sed 's/[^a-zA-Z0-9._-]/-/g; s/--*/-/g; s/^-//; s/-$//')"
write_env SLUG "${SLUG}"
write_env PAGES_BASE "${REPO_BASE}/preview/${SLUG}/"
write_env PAGES_DEST "preview/${SLUG}"
write_env STAGE_URL "${HOST}${REPO_BASE}/preview/${SLUG}/"
