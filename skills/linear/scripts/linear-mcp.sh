#!/usr/bin/env bash
set -euo pipefail
# MCPorter wrapper: uses skill-local mcporter.json (Bearer ${LINEAR_API_KEY}).
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export MCPORTER_CONFIG="${MCPORTER_CONFIG:-$ROOT/mcporter.json}"
exec npx -y mcporter@latest --config "$MCPORTER_CONFIG" "$@"
