# Reference-led KKOKKAPICK review

Date: 2026-10-10 UTC / 2026-10-11 KST.
Scope: public commercial-service references, current review compositions and design-independent navigation behavior. This report does not select or approve a new visual direction.

## Evidence

- Researcher opened 25 distinct public reference screens: 18 App Store images, two historical official Instagram illustrations and five public web captures. Three higher-resolution reopens are not counted as new screens.
- Root opened seven reference images and the three archived 06/08/09 HOLD home images. The independent reviewer opened six representative reference images. The report links public originals; their photographs/branding are not shipped as KKOKKAPICK merchandise or assets.
- App Store framing is promotional artwork, not the app canvas. Instagram's three-column example is dated 2021. ABLY's public home/category/Back flow was exercised; native app login and physical-device gestures were not.
- Supplier catalog photos have expired. Current functional browser checks use labeled controlled fixtures; successful fixture decoding does not establish supplier photo availability or visual merchandising quality.
- Root and independent reviewer each opened the new 20 core mobile and five PC technical screenshots. Independent review also opened eight final interaction/expiry states. Root additionally opened the photo dialog, actual expired-source state and standalone source-unavailable state. These are bounded functional checks, not approval of a new visual style.

## Findings and disposition

| Finding                                                                   | Evidence and user consequence                                                                                   | Disposition                                                                                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Photo exploration competes with stacked tool rows and repeated navigation | 08 composition/code and the official Instagram grid show different photo/tool balance.                          | Design handoff: remove redundant tools and the surrounding panel; maintain the required gapless 3×4 and fine seams. Material visual implementation awaits selection. |
| Brand directory/campaign delays the first product and price               | 06 code and previously captured controlled layouts; HOLD screenshots cannot establish real merchandise density. | Design handoff: product-first home hierarchy; brand directory becomes a supporting path.                                                                             |
| Repeated headings, boxes and status messages create equal emphasis        | 06/08/09 archived HOLD screenshots and current scene code.                                                      | Design handoff: one state message, task-specific text tabs, flat account/seller rows and deliberate borders.                                                         |
| Live typing adds one browser history entry per character                  | Reproduced in controlled Chromium: Back remains on search with a shorter query.                                 | Replace live search state; verify IME, clear, same-query submit and fast route/input transitions.                                                                    |
| Closing an app-opened product leaves duplicate list history               | Reproduced in controlled Chromium: Escape then Back remains on the same list.                                   | Consume only a validated app-owned overlay entry; deep link/reload/external hash use safe in-place close.                                                            |
| Switching tabs resets loaded rows and scroll                              | Reproduced with a 24-photo list returning as 12 at scrollY 0.                                                   | Bounded in-memory count/position retention for the same page/conditions/child context; new contexts initialize normally.                                             |
| Loading/expired totals can poison a retained quota                        | Independent delayed-source reproduction and root code review found a result count with no rendered cards.       | Separate remembered load quota from currently available item count; verify delayed source and tab return.                                                            |

## Boundary

Local typecheck, formatting, review/offline builds, 108 unit checks and 34 Chromium regressions passed. Automated viewport/accessibility checks include 320/375/390/430/1440px. Current technical compositions still delay the first product/price on mobile home, stack multiple search-tool rows and let extremely long wishlist names push price down. These observed findings remain explicit requirements for the next connected visual proposal; overall release visual QA remains HOLD.

Executed checks and code fingerprints are recorded in [commercial-reference-evidence.json](../docs/react-web/commercial-reference-evidence.json) and the latest PR #207 body. This report is a durable design input, not a blanket responsive/accessibility/visual/release PASS. The following remain open: a selected connected visual proposal, supplied material/selling-size/age facts, stable authorized image supply, fresh supplier-photo browser QA and physical iPhone Product Owner approval.

See [mobile review overview](../docs/react-web/commercial-reference-review.md) and [design handoff](../docs/react-web/reference-led-design-brief.md).
