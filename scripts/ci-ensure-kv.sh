#!/usr/bin/env bash
set -euo pipefail

TITLE="${KV_NAMESPACE_TITLE:-sacchos-MATCHES}"
CONFIG="${WRANGLER_DEPLOY_CONFIG:-dist/server/wrangler.json}"

list_json() {
  pnpm exec wrangler kv namespace list 2>/dev/null || echo "[]"
}

id_from_list() {
  list_json | jq -r --arg t "$TITLE" '
    (if type=="array" then . else [] end)
    | map(select(.title==$t) | .id)
    | .[0] // empty
  '
}

ID="$(id_from_list || true)"
if [[ -z "${ID}" ]]; then
  set +e
  CREATE_OUT="$(pnpm exec wrangler kv namespace create "$TITLE" --binding MATCHES 2>&1)"
  CREATE_STATUS=$?
  set -e
  printf '%s\n' "${CREATE_OUT}"
  ID="$(printf '%s' "${CREATE_OUT}" | sed -nE 's/.*id["= ]+["'"'"']?([a-f0-9]{32}).*/\1/p' | head -1 || true)"
  if [[ -z "${ID}" && "${CREATE_STATUS}" -eq 0 ]]; then
    ID="$(id_from_list || true)"
  fi
fi

python3 - "$CONFIG" "${ID:-}" <<'PY'
import json, sys, pathlib
path = pathlib.Path(sys.argv[1])
kv_id = sys.argv[2]
if not path.exists():
    raise SystemExit(0)
data = json.loads(path.read_text())
if kv_id:
    data["kv_namespaces"] = [{"binding": "MATCHES", "id": kv_id}]
    print(f"KV MATCHES = {kv_id}")
else:
    data.pop("kv_namespaces", None)
    print("::warning::Nessun namespace KV MATCHES: shortlink e archivio restano spenti.")
path.write_text(json.dumps(data, indent=2) + "\n")
PY
