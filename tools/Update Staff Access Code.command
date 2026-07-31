#!/bin/bash
set -Eeuo pipefail

TITLE="Update Greenscape Staff Access Code"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
INPUT="$ROOT/staff-access/access-code.txt"
EXAMPLE="$ROOT/staff-access/access-code.example.txt"
LIVE_URL="https://nyxdcz.github.io/greenscape-plant-library/"
FAILED_STEP="Starting"

header() {
  printf '\n============================================================\n%s\n============================================================\n' "$1"
}

fail() {
  header "STAFF ACCESS UPDATE STOPPED"
  printf 'Failed step: %s\nError: %s\n\n' "$FAILED_STEP" "${1:-Unexpected failure.}"
  printf 'No push occurred unless “GitHub main verified” was already displayed.\n\n'
  read -r -p "Press Return to close this window." _
  exit 1
}

trap 'status=$?; if [[ $status -ne 0 ]]; then fail "Unexpected command failure at line $LINENO (exit code $status)."; fi' ERR

header "$TITLE"

for tool in git node npm curl; do
  command -v "$tool" >/dev/null 2>&1 || fail "Required tool not found: $tool"
done

cd "$ROOT"

FAILED_STEP="Checking repository status"
if [[ -n "$(git status --porcelain --untracked-files=no)" ]]; then
  fail "Commit or discard existing tracked changes before updating the access code."
fi

FAILED_STEP="Updating local main"
git checkout main
git pull --ff-only origin main
BASE_SHA="$(git rev-parse HEAD)"

FAILED_STEP="Running baseline quality checks"
npm run quality

if [[ ! -f "$INPUT" ]]; then
  cp "$EXAMPLE" "$INPUT"
  printf '\nA local access-code.txt file was created and will open in TextEdit.\n'
  printf 'Replace the placeholder with the new code, save, then return here.\n'
  open -e "$INPUT" || true
  read -r -p "After saving the new code, press Return to continue." _
fi

FAILED_STEP="Generating the salted staff access hash"
npm run staff:code

FAILED_STEP="Checking changed files"
EXPECTED="$(printf '%s\n' assets/js/staff-access-config.js index.html | LC_ALL=C sort)"
ACTUAL="$(git diff --name-only | LC_ALL=C sort)"
if [[ "$ACTUAL" != "$EXPECTED" ]]; then
  printf 'Expected:\n%s\nActual:\n%s\n' "$EXPECTED" "$ACTUAL"
  fail "Only the staff access configuration and index cache key may change."
fi

FAILED_STEP="Running final quality checks"
npm run quality
git diff --check

FAILED_STEP="Checking GitHub main before commit"
git fetch origin main
if [[ "$(git rev-parse origin/main)" != "$BASE_SHA" ]]; then
  fail "GitHub main changed during the update. Nothing was pushed."
fi

FAILED_STEP="Committing the staff access update"
git add assets/js/staff-access-config.js index.html
git diff --cached --check
git commit -m "chore: update staff access code"
LOCAL_SHA="$(git rev-parse HEAD)"

FAILED_STEP="Pushing the staff access update"
git push origin HEAD:main

FAILED_STEP="Verifying GitHub main"
git fetch origin main
if [[ "$(git rev-parse origin/main)" != "$LOCAL_SHA" ]]; then
  fail "The new staff access commit could not be verified on GitHub main."
fi
printf 'GitHub main verified: %s\n' "$LOCAL_SHA"

FAILED_STEP="Verifying the live staff access configuration"
CACHE_REF="$(grep -o 'assets/js/staff-access-config.js?v=[^"]*' index.html | head -n 1)"
CONFIG_HASH="$(grep -o "codeHash: '[a-f0-9]\{64\}'" assets/js/staff-access-config.js | head -n 1 | cut -d"'" -f2)"
LIVE_OK="false"

for attempt in $(seq 1 30); do
  PAGE="$(curl -fsSL --max-time 20 "${LIVE_URL}?staff-access=${LOCAL_SHA}" || true)"
  CONFIG="$(curl -fsSL --max-time 20 "${LIVE_URL}assets/js/staff-access-config.js?verify=${LOCAL_SHA}" || true)"
  if [[ "$PAGE" == *"$CACHE_REF"* && "$CONFIG" == *"$CONFIG_HASH"* ]]; then
    LIVE_OK="true"
    break
  fi
  printf 'Deployment check %s/30 pending...\n' "$attempt"
  sleep 10
done

if [[ "$LIVE_OK" != "true" ]]; then
  fail "GitHub main was updated, but the live staff access files were not verified in time."
fi

header "SUCCESS — STAFF ACCESS CODE UPDATED"
printf 'GitHub main: %s\nLive website: %s\n' "$LOCAL_SHA" "$LIVE_URL"
printf 'The readable access-code.txt file has been deleted.\n\n'
read -r -p "Press Return to close this window." _
