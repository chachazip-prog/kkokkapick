# React web UX contract

This map owns the migration workbench. Review-only proposal geometry and temporary interactions are intentionally isolated; the selected direction will reuse canonical interaction primitives and local/source contracts.

| Capability     | Canonical owner                                   | Source of truth                                                                      | Allowed variants                                                                                          | Verification                                                                                          |
| -------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Select/Listbox | shadcn Select / Radix Select and shared Choice    | web/src/components/ui/select.tsx; TechnicalApp Choice                                | Localized popper options, real source-derived filters; trigger width/radius/border matched                | Keyboard open/select/escape, focus restoration, width difference ≤1px                                 |
| Form           | shadcn Input/Label/Checkbox and app form handlers | web/src/screens/TechnicalApp.tsx                                                     | noValidate; Korean owned validation; numeric child and price fields; IME-safe search                      | Invalid field focus, entered data retained, denied storage, composition and success only after commit |
| Scrollbar      | Global CSS                                        | web/src/index.css                                                                    | Standards + WebKit; hidden horizontal carousel is an explicit semantic exception                          | Page/dialog/sheet long content and forced-colors/reduced-motion checks                                |
| Toast          | shadcn Sonner                                     | web/src/components/ui/sonner.tsx and App Toaster                                     | Korean local-save success; one light-theme portal                                                         | Atomic storage tests, failure persists inline rather than false success                               |
| CRUD           | Local records hook and domain stores              | web/src/hooks/use-local-records.ts; web/src/domain/{child-profiles,local-storage}.ts | Create/select/edit/remove several children; local favorites/targets/recent records; alert-dialog deletion | Complete local flow, reload, storage quota/denial, cross-tab race, selected-child guidance            |

No native date picker is used: child age is a disclosed month measurement, not a newly collected birthday. No selection table exists. No checkout/order/delivery flow is invented.

## Dialogs, filters and focus

Canonical shadcn Dialog/Sheet/AlertDialog use Radix portals, focus containment, escape and modal inert background. Contextual headings and descriptions explain purpose. Destructive child removal names its target and consequence; cancellation is explicit. Controlled product and child dialogs restore the opener when available and fall back to current navigation when source expiry removes it. Source expiry cannot erase unsaved inputs. Generated English close labels are centrally localized to 닫기.

## Navigation, search and lists

React Router HashRouter supports static per-route URLs. Search/filter/product identity lives in query parameters; selected-child values remain local. Korean IME is never submitted mid-composition. Search clear is an authored labeled action. Own price validation focuses invalid input and retains text. Filters support stage, actual source size, category, brand, seller and price; age-unverified play goods never gain inferred age eligibility.

Live search, composition completion, clear and same-query submit replace the current search entry; typing must not make browser Back erase one character at a time. An app-opened product overlay consumes only its own validated history entry when closed. A direct detail link, reload or externally altered hash closes in place and never consumes unrelated browser history. Search/filter/product opener state remains local to the app; none of this history state contains child measurements.

Fast typing immediately after a tab change resolves the route at event time, so an old render handler cannot send the user back to the previous tab. The infinite catalog remembers quota and scroll position for at most eight page/query/mode/selected-child-ID contexts in memory. It stores no additional product objects, photograph bytes, child measurements or durable records. A new context resets normally; returning to the same context restores rows and position without treating restoration as user scroll. Available item count may temporarily be zero while source data loads or expires; that must not erase the remembered quota or prevent later ready data from rendering.

No user-visible more button. Infinite append needs scrolling and keeps product keys stable; modal-only URL parameters do not reset the list. Photo mode shows a bordered, gapless 3×4 initial grid; selecting a photograph reveals its real product card and seller data. Multi-image gallery is scroll-snap/swipe/arrow/dot operable. One unavailable original can be quarantined without discarding a healthy alternate or seller facts; offline status is not permanent failure.

## Commands and evidence ownership

- `cd web && npm run typecheck`
- `cd web && npm test`
- `cd web && npm run build`
- `cd web && npm run format:check`
- `cd web && npm run test:browser` (controlled fixtures, explicitly separate from actual supplier verification)
- `python /tmp/kkokkapick-premium-audit.py . --mode strict --output /tmp/kkokkapick-premium-audit.json` (skill auditor, static ownership only)

Actual supplier-source QA must state input hash, collection time, internal image deadline, code SHA and visible browser states. It cannot relabel fixture results or a historical expired publication as fresh supplier QA. Root integration report and independent visual review are recorded in docs/react-web/verification.md before handoff.

## Second-round review surfaces (06 / 08 / 09)

These are unselected prototypes hosted beneath CatalogProvider. RefinedScenes reuses OriginalPhoto and the canonical `recoverPhoto`/generation/quarantine owner. It does not maintain a second photo retry, cache or freshness policy. Genuine healthy alternate originals remain available; offline failures wait for reconnection. ProductCollection observes the nearest internal frame or native review dialog. Scroll/wheel/touch intent permits the next batch even when the first twelve tiles fit without overflow; batches are coalesced. Surface changes reset only the revised internal scroll root.

Proposed brand names and categories derive from fresh scoped catalog data; no popularity rankings are generated. Selected saved items resolve against the full fresh source, preserving identity outside active search filters. Clothing and play searches maintain separate in-memory query/category contexts. Proposal favorites are temporary review state, distinct from the durable technical workbench records. App-owned native review dialogs remain preview patterns; the chosen production direction will reuse canonical shadcn/Radix owners.
