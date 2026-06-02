#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "SuDo verification"

if [[ ! -f package.json ]]; then
  echo "No package.json found. App scaffold has not been created yet, so JS checks are not active."
  echo "Planning/docs-only verification complete."
  exit 0
fi

if ! command -v node >/dev/null 2>&1; then
  echo "package.json exists, but node is not available on PATH." >&2
  exit 1
fi

has_script() {
  local script_name="$1"
  node -e "const p=require('./package.json'); process.exit(p.scripts && p.scripts[process.argv[1]] ? 0 : 1)" "$script_name"
}

run_script() {
  local script_name="$1"

  if [[ -f pnpm-lock.yaml ]] && command -v pnpm >/dev/null 2>&1; then
    pnpm run "$script_name"
  elif [[ -f yarn.lock ]] && command -v yarn >/dev/null 2>&1; then
    yarn "$script_name"
  elif [[ -f bun.lockb || -f bun.lock ]] && command -v bun >/dev/null 2>&1; then
    bun run "$script_name"
  elif command -v npm >/dev/null 2>&1; then
    npm run "$script_name"
  else
    echo "No supported package manager found for script: $script_name" >&2
    exit 1
  fi
}

ran_any=0

for script in lint typecheck test build; do
  if has_script "$script"; then
    echo "Running $script..."
    run_script "$script"
    ran_any=1
  else
    echo "Skipping $script: no package.json script named '$script'."
  fi
done

if [[ "$ran_any" -eq 0 ]]; then
  echo "package.json exists, but no lint/typecheck/test/build scripts are defined yet."
fi

echo "Verification complete."

