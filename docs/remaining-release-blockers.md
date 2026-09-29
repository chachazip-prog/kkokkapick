# Remaining release blocker matrix

Updated: 2026-09-29

This matrix is intentionally limited to work that cannot be honestly closed from repository-only automation.

| Blocker | Why repository automation cannot close it | Required input/evidence | Owner |
| --- | --- | --- | --- |
| Production Supabase | Requires external project/environment and credentials | project URL/public anon key, applied migrations, production verification evidence | Product Owner + DevOps |
| Production provider rights | Legal/commercial authorization is external | written production use/retention/attribution terms | Product Owner + Source/Data |
| Authentication providers | Changes account setup and personal-data scope | enabled provider set and provider-console configuration | Product Owner |
| Final app identifiers | Must be reserved/approved before signing/store registration | Android applicationId, iOS bundle ID | Product Owner |
| Mobile signing | Private credentials cannot be invented or committed | protected Apple/Google signing setup and signed artifact checksums | Product Owner + DevOps |
| Push delivery | Requires credentialed FCM/APNs environment/device | successful send, invalid-token cleanup, retry/dedup evidence | DevOps |
| Legal/contact policy fields | Cannot invent controller/business/contact identity | final legal/business name, support/contact address, approved retention/processors | Product Owner |
| Backup/restore + rollback rehearsal | Requires production-like infrastructure | recorded backup, restore validation and rollback rehearsal | DevOps |
| Final device/accessibility QA | Depends on final UI/build and physical assistive-tech/device behavior | device matrix, VoiceOver/TalkBack, contrast/tap-target results | QA after UI feedback |
| Store assets/privacy declarations | Depend on final UI and production data/provider configuration | screenshots/assets, Apple App Privacy, Google Data Safety, reviewer account | Product Owner + QA |
| Crash/error telemetry | Product privacy/cost choice | chosen provider or explicit no-third-party-telemetry decision | Product Owner |
| Final submission | External irreversible publication action | final release SHA and explicit authorization | Product Owner |

Everything else should be implemented, tested or documented in-repo before adding a new item here.
