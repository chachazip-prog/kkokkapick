---
version: alpha
name: KKOKKAPICK React migration workbench
colors:
  background: "#f5f6f8"
  foreground: "#20232b"
  card: "#ffffff"
  secondaryText: "#566173"
  border: "#ccd2db"
  primary: "#244dd7"
  primaryForeground: "#ffffff"
  brand: "#6639bf"
  brandSecondary: "#c72863"
  destructive: "#ba2435"
typography:
  body:
    fontFamily: 'NanumSquareRound, "Apple SD Gothic Neo", system-ui, sans-serif'
    fontSize: 15px
    lineHeight: 1.55
  brand:
    fontFamily: 'GowunDodum, NanumSquareRound, sans-serif'
    fontSize: 26px
    lineHeight: 1.55
  input:
    fontFamily: 'NanumSquareRound, "Apple SD Gothic Neo", system-ui, sans-serif'
    fontSize: 16px
    lineHeight: 1.5
rounded:
  small: 6px
  medium: 10px
  large: 16px
spacing:
  1: 4px
  2: 8px
  3: 12px
  4: 16px
  5: 24px
  6: 32px
  7: 48px
components:
  Input:
    height: 44px
    typography: input
    backgroundColor: card
    textColor: foreground
    rounded: medium
  Button:
    height: 44px
    backgroundColor: primary
    textColor: primaryForeground
    typography: body
    rounded: medium
  ProductImage:
    backgroundColor: card
    rounded: medium
  Wordmark:
    typography: brand
    textColor: brand
  SecondaryText:
    typography: body
    textColor: secondaryText
  FavoriteAction:
    backgroundColor: card
    textColor: brandSecondary
  ValidationMessage:
    textColor: destructive
  App:
    backgroundColor: background
    textColor: foreground
---
# KKOKKAPICK React web design context

Status: **new visual direction pending Product Owner selection**. No release redesign is approved by this document. Existing R01 / Korean boy-and-girl hero 3 remain the inherited technical workbench baseline only. The ten proposal compositions are review artifacts, not implemented production directions.

## Overview

Korean mobile-first newborn/infant clothing discovery and seller price comparison, with a separately selectable toy/learning domain. Product photos and facts take priority over decoration. Desktop is a usable responsive web layout, not a phone screenshot scaled up. Users discover visually, compare prices, save locally and select one of several children for official size-chart guidance.

The service does not fulfill orders or deliveries. Local target prices are saved preferences, not working push notifications. Unknown material, actual selling sizes, toy ages, source rights and supplier availability must remain unknown. Brand charts never imply sale inventory.

## Authority and scope

User constraints and AGENTS.md take priority. AGENTS.md Design Selection Gate requires ten distinct reviewable proposals and explicit selection before material visual implementation. [Proposal comparison](docs/react-web/design-proposals.md) is the maintained review set. Selection ID: **none**. PO expressed interest in 06/08/09 and requested another design round; these three are revised review prototypes, not approved production directions. Independent engineering continues in web/src/domain, hooks and canonical shadcn/Radix primitives. The root legacy demo and Flutter app are retained; main is not merged and production is not deployed.

## Colors

Ownership model B: `web/src/index.css` is the canonical runtime source; this file records intent and mirrors that source. Technical workbench uses inherited cool neutral background #f5f6f8, white content surfaces, #20232b text, #566173 secondary text, #ccd2db borders, functional blue #244dd7, limited purple #6639bf and red/pink #c72863 actions. Proposal tokens are explicitly isolated in `web/src/proposals/proposals.css`, `refinements.css`, and `review-shell.css` and cannot silently become production tokens.

## Typography

Self-hosted NanumSquareRound body/control font; GowunDodum wordmark/editorial option. No external font service. Body 400, secondary 400–500, section 600 and price 700. Form inputs are at least 16px; wrapping Korean and long raw commerce names are supported.

## Layout

Required phone widths: 320/375/390/430px. Desktop review: 1440px. Four routes home/search/wishlist/my, hash routing for static review hosting. Product/modal state and search/filter state use URL query parameters without child measurements. Mobile safe-area bottom navigation and detail actions must not obstruct content. Technical product grid 2/4/6 columns; photo-only mode initially 3 columns × 4 viewport-sized rows, no gaps, scroll-driven append without more buttons. Photograph position is shown by accessible dots.

Baseline spacing 4/8/12/16/24/32/48px. Lucide line icons indicate real actions and navigation. Reduced-motion preferences disable transition animation; control responsiveness does not depend on animation completion.

## Elevation & Depth

Static product content is flat and bounded by a fine border. Shadows are confined to modal/select overlays. No nested pastel card system or decorative gradient. Only light theme is currently implemented; alternate proposal palettes are distinct review-only contexts.

## Shapes

Small/medium/large radii are 6/10/16px. Photo boundaries remain visible. Circular dots are an explicit photo-position control, not a radius rule for all components. Three-column image seams have a one-pixel boundary without spacing.

## Components

Canonical shadcn/Radix interaction owners are documented in UX-CONTRACT.md. Button, Input, Select, Dialog, Sheet and AlertDialog carry Korean labels, readable type, predictable focus and at least 44px main control height. Product price and seller information stay separate from raw product names.

## Do's and Don'ts

Lead with clothing photographs and supplied facts. Use primary colors on meaningful selected states and actions. Do not invent stock, discounts, materials, selling sizes or age eligibility. Do not turn campaign art, placeholders or expired goods into current merchandise. Distinguish controlled UI fixtures from actual supplier QA. No ten-proposal preview becomes the production direction without explicit owner selection.

## Data, states and local privacy

One catalog loader owns cancellation, source-clock expiration, five-minute bounded JSON revalidation and in-memory image quarantine. The existing approved 85-query provider plan, source collection cadence, 24-hour temporary metadata policy and 90-minute original-photo ceiling are unchanged. Photos are never permanently copied to this app. Freshness is the earliest effective deadline, not the latest fetch/decode time. Expired/unavailable source produces an explicit HOLD state and preserves local saved records. An older or failed refresh cannot overwrite still-valid newer results.

Legacy local keys `favs`, `priceAlerts`, `recentProducts`, `kkokkapickChildProfiles` and compatibility measurements are retained. Child information remains on-device; no login, account synchronization, upload, analytics or server-side child processing is introduced. Drafts survive app route changes in memory; beforeunload warns only while drafts remain. Mutations update UI and announce success only after successful storage writes.

## Verification and remaining gates

Canonical behavior owners and test commands are maintained in [UX-CONTRACT.md](UX-CONTRACT.md). The source refresh/publication evidence is separate from React UI verification in [catalog-evidence.md](docs/react-web/catalog-evidence.md). Actual browser decode, visual inspection, keyboard/IME/filter/carousel/storage/expiry failure paths and independent reviewer evidence are required. CI success alone is insufficient.

Remaining: owner selects a direction after the requested 06/08/09 second round; that direction is fully implemented across all five screens and responsive states; fresh source meets unchanged publication coverage/100% image gates; source material/selling-size/rights contract, operator details and physical iPhone Product Owner review are explicitly verified. Technical approval delegation does not provide physical-device or material-design approval.
