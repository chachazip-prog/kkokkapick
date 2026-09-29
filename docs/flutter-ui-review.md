# Flutter UI review checklist

This checklist is for Product Owner review of the actual Flutter release UI, not the legacy static PWA.

## Current implemented review flow

1. Home — intro/profile CTA, sponsored section when configured, category shortcuts, search, product grid.
2. Find — search, stage/category/brand filters, Kkokkafit-only filter, sort, reset and empty state.
3. Product detail — image, category/stage, Kkokkafit result, price alert, merchant price comparison and external-purchase disclosure.
4. Favorites — persistent local favorites and account-sync fallback behavior.
5. My — child profile, account/sync state, privacy/data controls, sign-out when authenticated.
6. Authentication surfaces — Google/Kakao/Naver/Apple placeholders plus email auth when a Supabase environment is configured.
7. Destructive flows — app-data deletion and account deletion confirmation.

## Product review questions

Review visual hierarchy, terminology, navigation, product-card information density, filters, product-detail purchase flow, Kkokkafit prominence, price-alert UX, child-profile UX, My/settings structure, and destructive-action wording.

## Preview boundary

The repository currently has an Android Flutter platform but no committed Flutter Web or iOS platform directory. The existing root GitHub Pages site is a legacy/static PWA and must not be treated as the Flutter release UI.

A shareable browser preview requires intentionally adding the Flutter Web platform and a deployment target. A device build requires the corresponding platform/signing path. Production Supabase/Firebase credentials are not required for visual review; the catalog can continue using the current demo endpoint and account/provider-dependent actions remain fail-closed.
