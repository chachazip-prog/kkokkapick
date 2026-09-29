# Remaining release blocker matrix

Updated: 2026-09-29

This matrix is intentionally limited to work that cannot be honestly closed from repository-only automation.

| Blocker | Why repository automation cannot close it | Required input/evidence | Owner |
| --- | --- | --- | --- |
| Production Supabase | Requires external project/environment and credentials | project URL/public anon key, applied migrations, production verification evidence | Product Owner + DevOps |
| Production provider rights | Legal/commercial authorization is external | written production use/retention/attribution terms | Product Owner + Source/Data |
| Authentication provider configuration | Provider set is decided: Apple, Google, Kakao, Naver, Email. External consoles remain | provider app credentials/callback configuration; verify Naver custom OAuth/OIDC | Product Owner + DevOps |
| Final app identifier registration | Identifier decided: `com.kkokkapick.app` | reserve/register the identifier in Apple/Google consoles | Product Owner + DevOps |
| Mobile signing | Private credentials cannot be invented or committed | protected Apple/Google signing setup and signed artifact checksums | Product Owner + DevOps |
| Push delivery | Requires credentialed FCM/APNs environment/device | successful send, invalid-token cleanup, retry/dedup evidence | DevOps |
| Legal/contact policy fields | Cannot invent controller/business/contact identity | final legal/business name, support/contact address, approved retention/processors | Product Owner |
| Backup/restore + rollback rehearsal | Requires production-like infrastructure | recorded backup, restore validation and rollback rehearsal | DevOps |
| Final device/accessibility QA | Depends on final UI/build and physical assistive-tech/device behavior | device matrix, VoiceOver/TalkBack, contrast/tap-target results | QA after UI feedback |
| Store assets/privacy declarations | Depend on final UI and production data/provider configuration | screenshots/assets, Apple App Privacy, Google Data Safety, reviewer account | Product Owner + QA |
| Crash/error telemetry activation | Provider decided: Firebase Crashlytics, no-cost-first and no advertising identifier | Firebase project/config plus privacy-safe production verification | DevOps |
| Final submission | Explicitly HOLD; business registration/legal identity first | final release SHA and later explicit authorization | Product Owner |

Everything else should be implemented, tested or documented in-repo before adding a new item here.
