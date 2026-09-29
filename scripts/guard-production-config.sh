#!/usr/bin/env bash
set -euo pipefail
: "${SUPABASE_URL:?SUPABASE_URL is required for production release}"
: "${SUPABASE_ANON_KEY:?SUPABASE_ANON_KEY is required for production release}"
case "$SUPABASE_URL" in
  https://*.supabase.co|https://*) ;;
  *) echo "SUPABASE_URL must be HTTPS"; exit 1 ;;
esac
if [[ "$SUPABASE_URL" == *"github.io"* ]]; then echo "Production catalog must not use GitHub Pages"; exit 1; fi
if [[ ${#SUPABASE_ANON_KEY} -lt 20 ]]; then echo "SUPABASE_ANON_KEY does not look configured"; exit 1; fi
echo "Production public configuration gate PASS"
