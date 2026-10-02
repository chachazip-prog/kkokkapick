# Store submission pack

This file is a fill-before-submission checklist. Blank values are intentional owner/external gates and must not be invented.

## Shared release metadata
- App name: 꼬까픽 (KKOKKAPICK)
- Release version/build: **TBD from final release candidate**
- Support URL: **TBD final public support URL**
- Privacy policy URL: **TBD final public privacy URL**
- Account deletion URL: **TBD final public deletion URL**
- Legal/business identity: **TBD Product Owner**
- Contact email: **TBD Product Owner**
- Production catalog/provider attribution: **TBD after provider-rights confirmation**

## Reviewer path
1. Launch as guest and verify catalog discovery/search/filtering.
2. Open a product and verify merchant handoff disclosure before external navigation.
3. If reviewer credentials are required, use the dedicated test account supplied through the store console, never this repository.
4. Verify sign-in/account sync only for authentication providers enabled in the production build.
5. Verify favorite, child fit profile and price alert persistence.
6. Verify app-data deletion and full account deletion separately.
7. Confirm the deleted account cannot regain authenticated access with the prior session.

## Apple submission inputs
- Repository bundle ID: `com.kkokkapick.app`
- Store registration / Team association: **TBD Product Owner/store registration**
- Signing/team/capabilities: **TBD protected Apple account**
- App Privacy answers: derive from `docs/technical-privacy-inventory.md` and actual production providers.
- Account deletion: reviewer path and final public URL required.
- Screenshots/icons/launch assets: final UI review/export required.

## Google Play submission inputs
- Repository application ID: `com.kkokkapick.app`
- Play Console registration: **TBD Product Owner/store registration**
- App signing: **TBD protected Play/CI credentials**
- Data Safety: derive from `docs/technical-privacy-inventory.md` and actual production providers.
- Account deletion: in-app path plus final public URL required.
- Screenshots/icon/feature graphic: final UI review/export required.

## Do not submit until
Production Supabase/RLS/RPC verification, catalog boundary, auth providers, push sender, provider rights, final legal/contact identity, backup/restore rehearsal, signed artifacts, final UI/device QA and Product Owner authorization are all complete.
