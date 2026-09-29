# Production verification evidence

Release SHA:  
Environment:  
Verified at (UTC):  
Operator/reviewer:  

## Database
- Migration version / latest applied migration:
- Read-only verification query result attached:
- RLS enabled on customer-owned tables:
- Public RPC grants reviewed:
- Admin RPC authorization reviewed:
- Account deletion E2E test account:
- Deleted rows/cascades verified:
- Prior access/refresh session invalid after deletion:

## Catalog
- Production read boundary:
- GitHub Pages fallback absent from store build:
- Provider freshness/retention behavior checked:
- Provider attribution checked:

## Notifications
- Test device/platform:
- FCM/APNs send received:
- Invalid token cleanup:
- Duplicate-delivery test:
- Retry/dead-letter test:

## Operations
- Backup identifier/time:
- Restore target/time:
- Restore validation:
- Rollback rehearsal release SHA:
- Monitoring/alert route:
- Incident owner/contact:

## Mobile candidate
- Android applicationId:
- Android signed artifact checksum:
- iOS bundle ID:
- iOS signed artifact/build:
- Release preflight run:
- QA_PASS reference:
- Security/Privacy review reference:

Do not place credentials, access tokens, push tokens, private keys, or customer data in this evidence file.
