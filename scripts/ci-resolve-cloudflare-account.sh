#!/usr/bin/env bash
set -euo pipefail

write_output() {
  local key="$1" value="$2"
  if [[ -n "${GITHUB_OUTPUT:-}" ]]; then
    echo "${key}=${value}" >> "${GITHUB_OUTPUT}"
  fi
}

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  write_output has_token false
  echo "Niente CLOUDFLARE_API_TOKEN: skip deploy."
  exit 0
fi

write_output has_token true

if [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  write_output account_id "${CLOUDFLARE_ACCOUNT_ID}"
  echo "Using CLOUDFLARE_ACCOUNT_ID secret."
  exit 0
fi

RESPONSE="$(curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=agescipesaro1.it")"
ACCOUNT_ID="$(jq -r '.result[0].account.id // empty' <<<"${RESPONSE}")"

if [[ -z "${ACCOUNT_ID}" ]]; then
  echo "::error::Aggiungi CLOUDFLARE_ACCOUNT_ID (https://dash.cloudflare.com/?to=/:account/workers). Il token vede più account e la zona agescipesaro1.it non è stata trovata."
  exit 1
fi

write_output account_id "${ACCOUNT_ID}"
echo "Resolved Cloudflare account from zone agescipesaro1.it."
