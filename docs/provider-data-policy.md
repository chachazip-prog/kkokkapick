# Provider data policy

Kkokkapick treats provider access and data-retention rights as separate permissions.

| Policy | Allowed use |
| --- | --- |
| persistent | Long-term storage only after explicit provider/contract verification |
| ttl_cache | Temporary cache only; every stored record must have an expiry |
| realtime_only | Do not persist provider product payloads |

## Production rules

1. A working API does not imply permission to persist, transform, or redisplay its payload indefinitely.
2. Unknown or ambiguous providers default to `realtime_only`.
3. Temporary caching requires a configured TTL and automatic expiry.
4. Product images remain provider-hosted unless separate image-storage rights are verified.
5. Affiliate URLs are stored/used only in the manner allowed by the provider.
6. Provider policy verification must record a date and reference before switching to `persistent`.
7. Development fixtures and GitHub Pages demo JSON are not production catalog storage.

## ADPICK BIZ

Current production classification: **ttl_cache**.

Default engineering TTL: **24 hours**, used as a conservative internal ceiling until the provider's applicable caching/redisplay terms are explicitly verified. This value is not a claim that ADPICK grants a 24-hour caching right.

Do not promote ADPICK BIZ to `persistent` merely because API retrieval succeeds.


## Candidate provider gate

| Provider | App/affiliate fit | Deep link/API | Persistence status | Production decision |
| --- | --- | --- | --- | --- |
| ADPICK BIZ | Yes | Search/affiliate integration | Not verified for long-term catalog retention | ttl_cache; do not promote without written verification |
| LinkPrice | Yes; official materials explicitly include mobile web/app affiliates | Deep-link API and app advertising API publicly described | Product metadata/image/price retention terms not verified in public materials | realtime_only candidate until written clarification |
| Coupang Partners | Affiliate platform exists | API availability depends on account/program access | Product metadata/image/price retention terms require applicable current terms/API docs | realtime_only candidate until verified |

### Provider promotion checklist

A provider may move to `persistent` only when all applicable items are documented:

- automated product retrieval is permitted;
- product title/merchant metadata may be stored;
- price may be cached/stored and its refresh requirement is known;
- image hotlinking or image storage/redisplay is explicitly permitted;
- affiliate/deep links may be generated and displayed in the app;
- data may be transformed for category normalization/deduplication;
- required attribution/disclosure is implemented;
- termination/deletion obligations are known;
- rate limits and commercial fees are recorded.

Unknown answers block promotion to `persistent`.
