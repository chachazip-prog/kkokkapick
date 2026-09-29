# AI virtual try-on feasibility gate

Updated: 2026-09-29
Status: DISCOVERY / NOT APPROVED FOR PRODUCTION

## Proposal
A user supplies a photo and KKOKKAPICK generates a synthetic preview of the selected garment being worn. The likely real-world use case includes parents uploading a child's photo, so the risk model must assume minors' images even if the feature is not marketed only to children.

## Product assessment
Potential value is strong: it extends discovery -> fit evidence -> purchase confidence into visual imagination and could create a paid/shareable moment. It is not required for the core launch, and adding it to v1 would increase privacy, moderation, model-cost and store-review surface substantially.

Recommendation: do not put it on the critical path for first public release. Treat it as a post-core-release paid experiment, gated by a privacy-preserving prototype and unit economics.

## UX correction to the initial idea
Do not ask specifically for a face photo. A face-only image is insufficient for credible garment try-on and increases sensitive-data risk without enough utility. If prototyped, request the minimum image needed by the selected model (likely a clothed upper/full-body photo), allow cropping/face obscuring when technically viable, and explain that the result is a visualization, not a guarantee of garment fit, drape, color, size or stock.

## Privacy / safety architecture requirements
- Explicit, just-in-time consent before upload; guardian attestation when the image depicts a minor.
- System photo picker / one-shot selection rather than broad photo-library permission.
- No use of uploaded or generated images for model training, advertising, profiling, or unrelated analytics.
- No face recognition, identity matching, biometric templates, embeddings for identity, or cross-session person linkage.
- Process with the minimum third-party processors; disclose each AI processor and transfer location/retention before consent.
- Original upload should be ephemeral: delete immediately after successful generation where technically possible; otherwise enforce a short documented TTL.
- Generated image retention should default to device/session-only or short TTL; persistent cloud history must be opt-in.
- User-accessible deletion and consent withdrawal.
- Encryption in transit/at rest; signed short-lived object URLs; no public buckets.
- Block third-party/non-consensual image abuse and unsafe sexualization. Because minors are foreseeable, use strict input/output safety filtering.
- Clearly mark generated output as AI visualization in-product and in exported/shareable media where appropriate.
- Add in-app report/flag flow for generated content before Android production release.
- Never claim the image proves size accuracy. KKOKKAFIT evidence and virtual appearance are separate systems.

## Policy evidence checked
- Google Play AI-generated content policy covers image-to-image generative features and requires safeguards; applicable generative AI apps need an in-app reporting/flagging path.
- Apple privacy guidance requires clear disclosure of collection/use/retention/deletion and explicit permission before sharing personal data with third-party AI.
- Korean PIPC guidance treats face/biometric processing as higher-risk and has specifically recommended clear notice when images are sent to servers and review of external SDK data flows.

Re-check current policies immediately before implementation/submission.

## Architecture spike
Before choosing a vendor/model, benchmark at least two candidates against:
1. child/minor image terms and safeguards,
2. no-training/data-retention controls,
3. Korean-region/data-transfer implications,
4. garment preservation and identity preservation,
5. latency,
6. cost per successful generation,
7. deletion API/contract,
8. commercial output rights,
9. abuse moderation support.

No provider is approved by this document.

## Monetization hypothesis
Use credits rather than unlimited generation because inference cost is variable.
Candidate experiment only after cost benchmark:
- free: 1 low-resolution trial tied to a qualified product, only if unit economics permit;
- paid: small try-on credit pack or premium entitlement;
- never charge for a failed generation; define retry/idempotency policy.

Pricing must be set from measured p50/p95 generation cost + payment/store fees + failure/retry rate + target gross margin. Do not set a retail price before benchmark data exists.

## Marketing assessment
Potential acquisition hook: “사기 전에 우리 아이에게 어울리는 느낌을 미리 보기.”
Required qualification: “AI 연출 이미지이며 실제 핏·색상·사이즈를 보장하지 않음.”
Do not use uploaded child photos in ads, case studies, model improvement, or public galleries without a separate purpose-specific legal/consent review.

The feature may improve sharing and conversion, but success must be measured against qualified merchant handoff/purchase-intent proxies and paid conversion, not generation count.

## Experiment gates
GO to private prototype only if:
- provider contract supports required retention/no-training controls;
- Security/Privacy approves data flow;
- cost per successful generation is measurable and compatible with a paid SKU;
- quality test shows useful garment/identity preservation;
- abuse/minor safeguards can be enforced.

GO to public beta only if:
- privacy policy/consent/deletion/reporting are implemented;
- store declarations are prepared;
- generated output is visibly qualified as AI visualization;
- production monitoring has no raw face-photo logging.

NO-GO if a vendor retains uploads for training by default without enforceable opt-out, cannot support deletion/retention requirements, or permits unsafe minor-image transformation modes that we cannot reliably constrain.

## Release impact
Core KKOKKAPICK release: no dependency; keep feature out of v1 critical path.
Future paid experiment: candidate after core release readiness and external legal/privacy/provider review.
