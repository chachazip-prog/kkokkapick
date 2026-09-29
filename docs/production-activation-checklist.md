# Production activation checklist

- [ ] Final release SHA selected
- [ ] Release candidate Code Quality green
- [ ] Release candidate Flutter analyze/tests green
- [x] Android release configuration guard rejects debug signing; re-run on final release candidate
- [x] iOS unsigned release foundation build is CI-verified; re-run on final release candidate
- [ ] Independent QA_PASS recorded for final release candidate
- [ ] Security/Privacy has no unresolved high-risk finding on final release candidate
- [ ] Production Supabase created and migration backup/restore path verified
- [ ] Migrations applied and grants/RLS/RPC exposure audited
- [ ] Account deletion contract is green and deployed environment E2E verifies deletion/cascades/session invalidation
- [ ] Production config preflight is green; approved catalog read boundary configured and GitHub Pages fallback absent from store candidate
- [ ] Authentication providers approved/configured
- [ ] Final Android applicationId and iOS bundle ID approved
- [ ] Signing credentials stored only in protected CI/store secret storage
- [ ] FCM/APNs sender and invalid-token cleanup verified
- [ ] Provider production rights/attribution confirmed
- [ ] Privacy/support/account-deletion pages finalized with real legal/contact/data inventory
- [ ] Backup/restore and rollback rehearsal recorded
- [ ] Store submission pack finalized: metadata/privacy declarations/assets/reviewer access ready
- [ ] Product Owner final release/submission authorization

## Repository gates already implemented

- [x] Account deletion regression contract and customer-data inventory
- [x] Public commercial impression/click replay/rate guard contract
- [x] Technical privacy/store-data inventory
- [x] Dependency lock reproducibility/analyze gate
- [x] Android unsigned release/signing-material guard
- [x] iOS unsigned release foundation validation
- [x] Preview publication restricted to main push
- [x] Production configuration contract rejects GitHub Pages for store candidates
- [x] Store/reviewer submission template
