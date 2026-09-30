# KKOKKAPICK release execution board

Updated: 2026-09-30
Owner: Team Lead / Product Owner gate
Purpose: one execution board from remaining planning through release QA. This board distinguishes repository evidence from external/physical-device evidence and must not treat role-based review in a single execution context as independent-agent approval.

## Gate model
Every release item moves through the same sequence unless marked external-only:

1. **Plan** — user problem, scope, acceptance criteria, evidence source and non-goals are explicit.
2. **Design/Data contract** — approved D03 visual direction and/or canonical data contract is identified; no unsupported data is invented.
3. **Implementation** — smallest production change that satisfies the contract.
4. **Automated QA** — analyze/tests/release workflows run without weakening assertions.
5. **Role review** — Product/Design/FE/BE/Data/Security/DevOps perspectives are recorded truthfully. A single execution context is not an independent agent.
6. **Independent QA / external verification** — physical-device, provider, production or store evidence is collected by the appropriate independent/external actor.
7. **Team Lead gate** — merge/promotion only when the evidence required for that stage exists.

## P0 — external beta blockers

| Track | Plan | Implementation | Automated QA | External / independent gate | Current next action |
| --- | --- | --- | --- | --- | --- |
| Visual RC / #110 | locked to approved D03 reference and ten-item checklist | in progress | in progress | 320/360/390/430 physical devices + iOS Safari + independent visual QA | finish #124 layout fixes, then make #126 visual contracts green against main; deployed Pages comparison follows |
| Account/data / #104 | guest-first, explicit first-sync consent, truthful offline state | repository path substantially complete | account switch, restore, deletion and local snapshot contracts exist | production Supabase/auth/RLS/deletion E2E | keep issue open until production environment evidence exists |
| Production backend | Supabase / narrow public catalog boundary selected | migrations/RLS/RPC repository foundation exists | repository preflight exists | create production project, apply migrations, run verification pack | Product Owner/DevOps activation input required |
| Catalog/provider | ADPICK server-side only, TTL fail-closed pending final rights | ingestion/grouping/title/gallery logic exists | canonical grouping release regression is wired to CI | written retention/redisplay/image/attribution rights + regenerated production evidence | next successful catalog build must prove clean titles and real multi-image coverage |
| Auth providers | Apple/Google/Kakao/Naver/Email target set | email/session foundation exists; social paths remain gated | auth boundary tests exist | provider apps/callbacks/credentials; Naver compatibility | Product Owner/DevOps external setup |
| Push price alerts | threshold, ownership, claim/finalize/retry contracts exist | repository worker/DB foundation exists | push worker contract exists | credentialed FCM/APNs device delivery + invalid-token cleanup | DevOps external setup |
| Native signing | app id `com.kkokkapick.app` fixed; unsigned CI is the repository gate | Android/iOS unsigned foundations exist | Android/iOS unsigned workflows | protected Apple/Google signing + signed checksums | store-account/signing setup |
| Legal/support | do not invent operator/contact identity | draft privacy/support/deletion surfaces exist; support stays unavailable without official channel | release contracts prevent fake support path | final business/controller/contact/retention/processors | Product Owner legal/business input |

## P1 — store submission blockers

| Track | Repository deliverable | Final gate |
| --- | --- | --- |
| Accessibility | automated 200% text/core navigation/destructive confirmation plus targeted visual regressions | VoiceOver/TalkBack, tap-target, contrast and device matrix after UI freeze |
| Store compliance | technical privacy inventory and reviewer/submission pack | Apple App Privacy + Google Data Safety generated from production configuration, final screenshots/URLs/reviewer account |
| Telemetry | Crashlytics selected; no ad identifier added solely for crash reporting | production Firebase config and privacy-safe crash verification |
| Operations | release/incident/rollback runbooks | backup/restore test, rollback rehearsal, production monitoring |
| Commercial | sponsored placement is disclosed and cannot alter organic fit evidence | provider-confirmed conversion ingestion, disclosure QA, production abuse/load verification |

## P2 — post-beta quality, not allowed to block v1 without a new Product Owner decision
- expand multi-offer and price-history depth where provider rights allow;
- expand verified first-party KKOKKAFIT brand evidence;
- improve search relevance from privacy-safe aggregate events;
- reconcile attributed vs provider-confirmed payable commission;
- evaluate premium/sponsored/direct-brand/B2B fit-widget monetization only after real retention/conversion evidence.

## Current visual RC decomposition (#110)

| # | Requirement | Repository status | Promotion rule |
| ---: | --- | --- | --- |
| 1 | Home/Search job separation | merged via #122 | keep contract green |
| 2 | category labels complete at release widths | #124 in progress | automated release-width/200% test green + device check |
| 3 | approved black wordmark + warm accent | implementation exists; #126 contract in progress | widget contract + deployed/device comparison |
| 4 | product-card visible boundary and robust small layout | boundary exists; #124 fixes overflow found by #126 | no layout exception + deployed/device comparison |
| 5 | real multi-image aggregation/swipe | canonical aggregation + CI regression merged; existing dataset has multi-image evidence | regenerated catalog QA + card/detail device test |
| 6 | clean merchant/channel prefixes | canonical cleanup + CI regression merged | regenerated catalog reports zero known channel-prefixed display titles |
| 7 | recommendation editorial hierarchy | implementation exists; contract in progress | approved-reference comparison, no awkward wrap |
| 8 | rich product detail | implementation exists; detail widget contract passes on draft #126 | keep contract green + device visual QA |
| 9 | horizontal editorial/recommendation + vertical discovery feed | implementation exists; #126 contract in progress | lazy-sliver-aware contract + device scroll QA |
| 10 | approved D03 rhythm, not generic dashboard styling | partially evidenced by code/preview only | final approved-reference and physical-device visual sign-off |

## Evidence rules
- CI SUCCESS proves only the scope that the workflow actually executes.
- A test file that is not wired into CI is not CI evidence.
- URL presence is not image-rendering/rights evidence.
- Static GitHub Pages is UX/data preview evidence, not Flutter production-backend evidence.
- Flutter preview artifact is not signed-store evidence.
- Physical-device QA cannot be inferred from widget tests.
- Role-based review in this ChatGPT session is explicitly **not** independent-agent approval.
- No Product Owner/external credential/legal decision is invented to close a gate.

## Promotion rule
The replacement visual RC can be shared only after #110 repository checks are green, the deployed preview is verified, and the required independent physical-device/iOS Safari evidence exists. External beta/store promotion additionally requires every applicable P0/P1 production gate above; final public submission remains an explicit Product Owner authorization.
