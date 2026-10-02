# Technical privacy and store data inventory

This is an engineering inventory for release review. It is not final legal wording and does not invent a controller/business identity, retention promise, or processor agreement.

| Data/category | Purpose | Storage/boundary | Deletion behavior | Store-review note |
| --- | --- | --- | --- | --- |
| Account identity / email when email auth is enabled | authentication | chosen Supabase Auth environment | identity removed by authenticated account-deletion RPC | auth providers are Product Owner gate |
| OAuth PKCE verifier / pending provider method | protect an in-progress social login from code interception | secure local device storage only while one OAuth flow is pending | cleared on success, provider denial, invalid terminal exchange, cancellation or expiry | not analytics; never upload/log verifier |
| Child age/months, height, weight | fit recommendation | local device; account profile only after explicit sync | local app-data clear + account deletion | child profile is about clothing fit; do not collect child identity |
| Favorites | saved products | local device; account storage after explicit sync | local clear + account deletion | app functionality |
| Price-alert target | price notification | local/account storage | local clear + account deletion | app functionality |
| Push token | notification delivery | account-bound server table | explicit account deletion; invalid-token cleanup required in production | not analytics |
| Opaque commercial session key | impression/click dedupe and coarse abuse control | commercial event boundary, max 128 chars | retention must be finalized with production policy | no IP/device fingerprint in DB guard |
| Commercial impression/click | campaign measurement | commercial event table | retention must be finalized with provider/legal policy | public clients cannot write conversion/revenue |
| Provider catalog/product/offer data | product discovery | catalog pipeline/read boundary | governed by provider retention rights | production rights/attribution gate |

## Prohibited client-side data/secrets
- Supabase service-role credentials.
- Provider private API credentials.
- Mobile signing private keys/passwords.
- FCM/APNs sender credentials.
- Raw push tokens in diagnostic logs.
- IP/device fingerprint collection for the current commercial DB abuse guard.

## Submission boundary
Apple privacy answers, Google Data Safety, final retention periods, legal controller/contact identity, processor disclosures and authentication-provider declarations must be finalized against the actual production configuration before submission.
