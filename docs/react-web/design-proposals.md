# KKOKKAPICK React web — 10 design proposals

Status: **reviewable proposals; Product Owner selection pending**. No proposal is the production visual system. The highlighted review tab is a viewing state, not an approval. The initial round recommended 01. The Product Owner requested a deeper second round for **06/08/09**; the current review recommendation is **08**, still unselected. See [second-round evidence](round-two-review.md).

The new React redesign request reopens visual exploration. [AGENTS.md](../../AGENTS.md) requires ten structurally distinct proposals, including home/discovery, catalog/search, detail, and changed navigation/overlay patterns, before production visual implementation. Existing engineering, normalized catalog contracts, image policy, and shadcn/Radix infrastructure can proceed independently.

## Evidence and shared constraints

The audience is Korean caregivers, especially mothers in their twenties and thirties, browsing newborn/infant clothing on phones. The latest maintained evidence is [R01 release design system](../release-ui/design-system.md) and [separate play discovery contract](../release-ui/play-expansion.md). Earlier D03/v7/v9 documents explain the evolution, but do not override the newer explicit preferences.

All ten provide clothing/play entry through the common search filter; 02 and 09 also make the switch a primary home control. All ten retain rounded Korean typography and wordmark, the approved Korean boy-and-girl hero 3, neutral/white surfaces, fine photo borders, restrained functional color, understandable Korean labels, photography before decorative UI, canonical product identity, seller offers separated from product titles, dot-controlled original-image galleries when multiple genuine images exist, multiple-child selection, and separate clothing versus play/learning context. None introduces order, delivery, payment, unsupported reviews, invented stock, fabricated size/material, inferred safety certification, or developmental promises.

The initial round placed gapless three-column/four-row photo-only discovery in 01. The revised **08** now makes this the main discovery surface with an information-view alternative. Other directions intentionally explore a different primary task; their departures are visible and documented below. Choosing another direction would be a conscious composition change.

At intake the checked-in commercial snapshot was synced at `2026-10-09T00:35:14.464Z` and expired by `2026-10-09T02:05:14.464Z`. The proposal gallery rejects expired product metadata and original supplier photos. It displays only supplied fresh data with a future expiry, or clearly identified local campaign imagery to review geometry. Campaign crops are not products; no prices, sellers, brands, stock, or clothing facts are attached to them. A later refresh does not turn campaign art into merchandise evidence.

## Review surface and interface

Implementation is isolated in `web/src/proposals/ProposalGallery.tsx`, `directions.ts`, and `proposals.css`. Revised 06/08/09 scenes and chrome are separately owned by `RefinedScenes.tsx`, `refinements.css`, and `review-shell.css`; superseded switch cases and CSS rules were removed rather than appended as overrides. It exports named and default `ProposalGallery`:

```ts
interface ProposalGalleryProps {
  products?: ProposalProduct[];
  catalogStatus?: "fresh" | "expired" | "unavailable";
  catalogExpiresAt?: string; // future ISO timestamp required to render goods
  heroImageUrl?: string; // Vite-imported approved assets/hero-proposals/hero-3.webp
}

interface ProposalProduct {
  id: string;
  name: string; // already normalized canonical identity
  brand?: string | null;
  category?: string;
  domain?: "apparel" | "play" | "toy" | "learning";
  imageUrl?: string;
  imageUrls?: string[]; // genuine alternate original photos only
  minPrice?: number;
  offers?: { merchant: string; price: number; url?: string }[];
  availableSizes?: string[];
  material?: string | null;
  fitStatus?: string;
  fitSource?: string | null;
  ageEvidence?: {
    minMonths: number;
    maxMonths: number | null;
    source: "provider" | "product_title";
    rawText: string;
  } | null;
}
```

Freshness is checked at render, every thirty seconds, and through an exact-expiry timeout that removes goods at the supplied deadline. Missing expiry is treated as unavailable. The host remains responsible for provenance and the image display ceiling; the gallery never refreshes the supplier API, lengthens a deadline, or copies source photos. The root stylesheet owns self-hosted NanumSquareRound and GowunDodum font faces. Gallery CSS consumes those names and uses no absolute asset paths.

The gallery presents a comparable ten-item composition index, screen controls, phone/desktop width controls, an explicit “open pattern” control, and per-direction rationale/hierarchy/navigation/responsive/accessibility/risk notes. Every proposal has separate home, search, and detail compositions. Review URLs use the existing hash route:

```text
#/proposals?proposal=01&surface=home&device=mobile
#/proposals?proposal=01&surface=search&device=desktop
#/proposals?proposal=01&surface=detail&device=mobile
```

Use proposal IDs `01` through `10`; `surface` is `home`, `search`, or `detail`; `device` is `mobile` or `desktop`. The phone frame is 390 px on a wide browser. At actual browser widths up to 520 px, the frame uses the full viewport so 320/375/390/430 px checks measure the intended layout rather than a smaller inset. Desktop preview is at most 1130 px and transforms through a container breakpoint. The gallery controls and comparison index reflow on narrow browsers.

## Comparable proposals

| ID     | Direction and signature                                                                            | Home/discovery                                                                                     | Search/catalog                                                       | Detail and open pattern                                                                                  |
| ------ | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **01** | **사진으로 쏙쏙 · Contact sheet.** Zero-gap photo contact sheet, selected information card.        | Compact campaign, category row, initial twelve photos in three columns/four rows.                  | Query and filter controls, photo results, selected information card. | Large photo + separately bounded information card. Contextual filter sheet; category stays in home.      |
| **02** | **오늘의 작은 옷장 · Editorial split.** Campaign split and horizontal product shelves.             | Bounded text/photo campaign; a horizontal product shelf and a category/card section.               | Narrow category rail and conventional information cards.             | Large showroom photo beside compact facts/offers. Product panel, mobile sheet.                           |
| **03** | **한눈에 가격 비교 · Comparison desk.** Photo-bearing comparison rows and seller table.            | Search and product/offer desk.                                                                     | Vertical product comparison rows, visible selected-offer area.       | Gallery and product on one side, seller table on the other. Compact domain/category filter dialog.       |
| **04** | **우리 아이 기준 · Child-fit workspace.** Multiple-child context and an evidence band.             | Child selector, explicit evidence explanation, clothing cards.                                     | Child context remains visible with unrestricted browsing.            | Image and identity first; child evidence and seller options are distinct sections. Multiple-child sheet. |
| **05** | **품목별 옷장 · Wardrobe matrix.** Persistent garment-category index and asymmetric photo matrix.  | Category rail and a large garment photo matrix.                                                    | Category-owned results with visible garment context.                 | Garment breadcrumb/index, gallery, facts. Full category index.                                           |
| **06** | **브랜드 산책 · Brand directory.** Korean alphabetical brand index and shelves.                    | Compact campaign, brand index, known-brand goods.                                                  | Selected-brand masthead and dense cards.                             | Brand-profile masthead, photo/facts, offers. Brand index panel.                                          |
| **07** | **바로 찾는 꼬까 · Search command.** Query dominates; applied conditions stay visible.             | Large search, direct garment choices, a small campaign context image, early photos.                | Prominent query workspace, condition summary and photo results.      | Search remains reachable above compact photo/facts. Full condition selection.                            |
| **08** | **마음에 담은 보드 · Saved board.** Visual shortlist context, save drawer, large lightbox.         | Photo mosaic beside a saved-product drawer; honest first-use empty state.                          | Information cards and saved context.                                 | Large image with a bounded facts pane. Saved drawer and product lightbox.                                |
| **09** | **입고, 놀고 · Two worlds.** Separate clothing/play workspaces and different information contexts. | Clothing default; explicit play/learning switch changes category labels and explanatory hierarchy. | Domain-owned query, categories, results; no clothing sizes in play.  | Shared gallery/offers; clothing fit versus supplied play facts. Domain-owned category index.             |
| **10** | **작은 옷 이야기 · Shoppable issue.** Evergreen chapter reading plus independent product index.    | Chapter menu, strong Korean topic title, campaign story, connected product index.                  | Functional product index outside the reading flow.                   | Photo-led product, chapter return path, compact facts column. Chapter contents panel.                    |

### 01 — 사진으로 쏙쏙

**Rationale and hierarchy:** the user's photo-first preference is the central interaction, rather than a decorative section. Brand/search → short approved campaign → categories → gapless contact sheet → selected product information. Photos stay free of price and text overlays. Selecting does not remove the feed.

**Navigation and responsive behavior:** familiar home/find/saved/my destinations. Desktop updates the selected-product side column; on phone a tap immediately opens a product card sheet while keeping the photo feed mounted. The inline information card also remains available after the sheet. Genuine products append twelve at a time through an intersection sentinel, with an honest terminal message. No “more” button and no repeated fabricated products.

**Accessibility and risk:** photo buttons receive canonical product names, visible focus, and a selected border. The desktop card announces updates; mobile sheets receive focus and restore the photo opener when closed. Price is one selection away, so the information card must remain immediate and its reading order explicit.

### 02 — 오늘의 작은 옷장

**Rationale and hierarchy:** a clear fashion introduction followed by short merchandise shelves offers a more editorial first visit. The campaign is bounded, with products entering early. This is browsing, not a chapter-reading content site.

**Navigation and responsive behavior:** clothing/play switch and shelf-to-catalog links; desktop split campaign becomes compact on phone. Product shelves are native scroll regions, and individual items remain keyboard reachable. Product opens a contextual panel rather than replacing the shelf.

**Accessibility and risk:** text is separate from the campaign photograph. Horizontal shelves can hide inventory depth and must expose a full-catalog route. Use automatic source category groupings and an evergreen hero to avoid ongoing merchandising cost.

### 03 — 한눈에 가격 비교

**Rationale and hierarchy:** canonical product rows expose photo, identity, known price, and offer context. Selected seller information is separated from garment identity. It supports caregivers who already have a garment in mind and want to check available sellers.

**Navigation and responsive behavior:** finding/comparing is the primary action. Desktop separates product list and offer comparison; phone stacks labeled seller rows beneath product identity. Filtering uses a compact dialog.

**Accessibility and risk:** real seller data uses table semantics and Korean currency formatting. Missing facts are explained rather than synthesized. Small widths and a mostly single-seller catalog can reduce the design's value. Never claim shipping-inclusive prices.

### 04 — 우리 아이 기준

**Rationale and hierarchy:** multiple-child selection remains an explicit context across screens. Product photography and identity still lead; a separate evidence band explains what can be checked for each child. Selecting children never asserts that every garment has a verified fit.

**Navigation and responsive behavior:** desktop side context and phone top rail/sheet. The proposal sheet uses two clearly labeled example children and does not collect or save personal information. Final implementation should reuse the approved local child contract rather than introduce accounts or new retention.

**Accessibility and risk:** checkboxes communicate multiple selection. Recommendation evidence and actual seller options remain distinct. The current catalog may lack fit evidence, so unrestricted guest browsing must work without entering child data.

### 05 — 품목별 옷장

**Rationale and hierarchy:** garment categories form a visible spatial structure; the user chooses a “wardrobe compartment” and then sees its images. This is category organization, unlike 04's child context. The layout deliberately takes a risk through a larger selected photo surrounded by smaller imagery.

**Navigation and responsive behavior:** persistent desktop category rail becomes a phone category row. Category selection stays inside home/category context. Detail retains the wardrobe path.

**Accessibility and risk:** visual image size does not change DOM reading order. Categories have text labels and selected states. Sparse categories cannot be filled with duplicates; a mobile full matrix must reduce to clear category sections.

### 06 — 브랜드 산책

**Rationale and hierarchy:** known brands provide the entry point, with actual normalized brands forming the index. Seller names remain offers, never invented brand identity. Unknown-brand goods retain an unrestricted route.

**Navigation and responsive behavior:** desktop index alongside shelves, phone grouped alphabetical controls. Brand query carries into search; detail returns to the brand context.

**Accessibility and risk:** alphabet controls have understandable names and 44 px minimum geometry. Known-brand browsing is less useful to first-time shoppers and depends on source normalization. No fake brand ranking or positioning is supplied.

### 07 — 바로 찾는 꼬까

**Rationale and hierarchy:** a dominant query field is the clearest purposeful-search route. Direct category buttons support users who do not want to type. Applied domain/category conditions remain visible. Customer copy does not expose command syntax.

**Navigation and responsive behavior:** large desktop query becomes a full-width phone input. Condition selection can expand while keeping result context. Detail retains a search-return route.

**Accessibility and risk:** visible input label for assistive technology, immediate clear button, and composition-safe Enter handling. Search is local and introduces no remote races or provider requests. Inputs are 16 px to avoid iOS focus zoom. This is the largest departure from discovery-first home and should be chosen only intentionally.

### 08 — 마음에 담은 보드

**Rationale and hierarchy:** saving and revisiting frame the exploration. The board is visually asymmetric, while the saved drawer has a separate role. Unlike 01, the primary context is a shortlist, not an unstructured discovery contact sheet.

**Navigation and responsive behavior:** desktop board plus saved column, phone board plus save summary, full product lightbox. Search switches to comparable equal-sized information cards. Favorites are reversible review-session state; no custom collection backend is introduced.

**Accessibility and risk:** no drag interaction is required; save and open are separate buttons. The first-use saved state is genuinely empty and returns to useful discovery. Visual mosaics make cross-product comparison slower, so uniform search results remain necessary.

### 09 — 입고, 놀고

**Rationale and hierarchy:** two domains have their own category vocabulary and information context. Clothing stays default; play/learning uses toy/teaching/learning labels and omits clothing fit. The distinction is visible in structure and content, not merely in two tabs.

**Navigation and responsive behavior:** a labeled domain switch is first in the flow, then domain-owned rail/query/results. Desktop category sidebar becomes a mobile row. Production refinement should preserve separate domain query/scroll states through the existing contract.

**Accessibility and risk:** domain selection uses text and an underline. Play descriptions only refer to supplied age/material evidence, with no inferred safety/development benefits. A sparse play dataset has an honest empty state rather than fabricated goods.

### 10 — 작은 옷 이야기

**Rationale and hierarchy:** an evergreen shopping note organizes discovery into chapters: discover photos, narrow garment categories, confirm product information. Its strong Korean typography and reading order distinguish it from 02's immediate showroom shelves.

**Navigation and responsive behavior:** desktop chapter rail, phone compact contents row, separate product index. Detail returns to the note/index context. The prototype uses a single evergreen brand introduction rather than recurring issues or made-up seasonal trends.

**Accessibility and risk:** real headings and DOM chapter order, no scroll effects required for access, independent functional search. This direction is most vulnerable to content-operation cost and postponing goods; it requires a strict above-the-fold photo budget.

## Visual system and behavior ownership

White `#FFFFFF`, ink `#182230`, quiet neutral `#F5F7FA`, secondary text `#5C6674`, and fine photo boundaries `#D6DBE3` are the common baseline. Proposal accents identify primary controls only: 01 blue `#2558D9`, 02 red `#C63748`, 03 green `#08785F`, 04 purple `#5440BD`, 05 blue `#186AAB`, 06 indigo `#263C8C`, 07 blue-green `#0C6F8D`, 08 raspberry `#B62B63`, 09 green `#146A50`, 10 purple `#5838A5`. Accent swaps do not constitute the differences; the layouts and primary tasks do.

NanumSquareRound owns Korean UI and data; GowunDodum owns restrained wordmark/campaign display. Utility identifiers use a system monospace. Photos use original aspect-preserving cover/contain modes within reserved, bordered geometry. Standard commerce cards have minimal radius and no decorative elevation. Inputs/buttons may be rounded without wrapping every section in a pastel panel.

Common controls are reusable inside this review package. Modal patterns in this review package use an app-owned native dialog with accessible title, inert background, Escape close, return focus, bounded scrolling, and reachable footer. The host's production shadcn/Radix primitives remain the maintained implementation owner after selection. Proposal styling does not alter host tokens or production components.

The gallery provides working local search/clear, product selection, reversible review-session favorites, category/domain switching, native dialog patterns, two-child example selection, image dots and touch swipes when genuine alternate photos exist, and append-only photo browsing with a terminal state. Price alert controls explicitly label their review-only state and do not create a production subscription.

## Selection advice and verification

Recommend **01** because it preserves the owner's exact contact-sheet exploration and selected-card flow. **02** is the closest editorial alternative, and **04** is the clearest child-context alternative. This recommendation is not a silent selection or permission to combine all ten.

Before reporting the package as ready: run TypeScript/build, inspect all 30 screen compositions at phone and desktop widths, open all ten overlay patterns, verify native Escape/focus restoration, verify the 320/375/390/430 widths, and check that expired catalog state shows no supplier originals or commercial facts. Independently critique structural distinctness, readability, mobile hierarchy, photography, empty state, and evidence honesty. Root owns dated browser/screenshots evidence and the final owner decision record.

Outstanding production refinement is deliberately explicit: integrate the selected direction with maintained Radix/shadcn primitives and complete routing/state restoration, original-photo failure quarantine/recovery, persisted local child profiles, verified fit, domain-specific source age filters, and the existing price/favorite contracts. Those shared behavior contracts are not ten different business rules.

Browser review and proposal-specific corrections are recorded in [proposal-visual-review.md](proposal-visual-review.md). Controlled UI fixtures are distinct from source-photo validation; they do not make expired supplier data fresh.

**Decision required:** Product Owner selects one numbered direction or requests another round. Record the selected ID before production visual work. A material change to that selection requires renewed review per AGENTS.md.
