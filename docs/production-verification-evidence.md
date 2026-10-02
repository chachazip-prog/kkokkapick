# Production verification evidence

Release SHA:  
Environment:  
Verified at (UTC):  
Operator/reviewer:  

## Migration / schema
- Repository latest migration:
- Migration manifest artifact/run:
- Migration manifest SHA-256 digest/reference:
- Backup/recovery point before migration:
- Production schema verification workflow run:
- `production-supabase-schema-evidence` artifact:
- Read-only verification validator: PASS / FAIL
- Required RLS tables: PASS / FAIL
- Client RPC grants: PASS / FAIL
- Trusted-worker RPC isolation: PASS / FAIL
- Legacy/direct view exposure: PASS / FAIL

## Authentication / account
- Non-destructive Email auth smoke workflow run:
- `production-email-auth-smoke` artifact:
- Password sign-in: PASS / FAIL
- Session refresh rotation: PASS / FAIL
- Authenticated `get_my_app_data`: PASS / FAIL
- Anonymous production `get_published_catalog`: PASS / FAIL
- Dedicated account-deletion E2E reference:
- Deleted account-owned row counts all zero: PASS / FAIL
- Prior access session rejected: PASS / FAIL
- Prior refresh session rejected: PASS / FAIL
- Cross-account isolation / account switch E2E: PASS / FAIL
- First-sign-in sync consent E2E: PASS / FAIL

## Catalog
- Production read boundary:
- GitHub Pages fallback absent from store build:
- Provider freshness/retention behavior checked:
- Provider attribution/redisplay rights checked:

## Notifications
- Native token acquisition/registration evidence:
- Android protected smoke workflow/artifact:
- iOS protected smoke workflow/artifact:
- FCM/APNs send received:
- Invalid token cleanup:
- Two-device partial-success/no-duplicate test:
- Concurrent target-claim test:
- Retry/dead-letter test:
- Bounded worker run/artifact:
- Worker logs/artifacts reviewed for absence of raw tokens/customer identifiers:

## Operations
- Restore target/time:
- Restore validation:
- Verification pack passes on restored target:
- Rollback/forward-fix rehearsal release SHA:
- Monitoring/alert route:
- Incident owner/contact:

## Mobile candidate
- Android applicationId:
- Android signed artifact checksum:
- iOS bundle ID:
- iOS signed artifact/build:
- Store-candidate production preflight run:
- Physical-device QA reference:
- QA_PASS reference:
- Security/Privacy review reference:

Do not place test email addresses, user UUIDs, database credentials, service-role keys, access/refresh tokens, push tokens, private keys or customer data in this evidence file.
