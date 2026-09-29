#!/usr/bin/env bash
set -euo pipefail
fail=0
check(){ if "$@"; then printf 'PASS  %s\n' "$*"; else printf 'FAIL  %s\n' "$*"; fail=1; fi; }

check test -f docs/release-readiness.md
check test -f docs/production-activation-checklist.md
check test -f docs/technical-privacy-inventory.md
check test -f docs/store-submission-pack.md
check test -f docs/release-operations-runbook.md
check test -f scripts/guard-production-config.sh
check test -f privacy.html
check test -f support.html
check test -f account-deletion.html

node test/account-deletion-contract.test.js || fail=1
node test/commercial-event-abuse-contract.test.js || fail=1
node test/release-artifact-contract.test.js || fail=1
node test/production-config-contract.test.js || fail=1

if git ls-files | grep -E '\.(jks|keystore|p12|p8|mobileprovision)$'; then
  echo 'FAIL  signing material tracked'; fail=1
else
  echo 'PASS  no tracked signing material'
fi

if [[ "${REQUIRE_PRODUCTION_CONFIG:-0}" == "1" ]]; then
  bash scripts/guard-production-config.sh || fail=1
else
  echo 'INFO  production config check skipped; set REQUIRE_PRODUCTION_CONFIG=1 for a store candidate'
fi

exit "$fail"
