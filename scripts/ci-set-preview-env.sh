#!/usr/bin/env bash
set -euo pipefail

write_env() {
  local key="$1" value="$2"
  if [[ -n "${GITHUB_ENV:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_ENV}"
  fi
  echo "${key}=${value}"
}

if [[ "${GITHUB_REF:-}" == "refs/heads/main" ]]; then
  write_env PREVIEW_ALIAS "main"
  exit 0
fi

REF_NAME="${GITHUB_HEAD_REF:-${GITHUB_REF_NAME:-}}"

if [[ -z "${REF_NAME}" || "${REF_NAME}" == "main" ]]; then
  write_env PREVIEW_ALIAS "main"
  exit 0
fi

SLUG="$(printf '%s' "${REF_NAME}" | sed 's/[^a-zA-Z0-9._-]/-/g; s/--*/-/g; s/^-//; s/-$//' | cut -c1-48 | sed 's/-$//')"
write_env SLUG "${SLUG}"
write_env PREVIEW_ALIAS "${SLUG}"
