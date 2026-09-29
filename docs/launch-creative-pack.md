# Launch creative pack — draft

Updated: 2026-09-29
Owner role: Online Marketing Lead
Status: copy/storyboard planning only. No paid spend or external publishing is authorized.

## Frozen initial ICP
Korean mobile-shopping parents/caregivers of babies and toddlers who browse multiple stores and hesitate because sizing differs by brand. Gift buyers remain secondary until the first acquisition loop is measured.

## Message variants
- Discovery: 여러 아기옷을 한곳에서 보고, 사이즈 근거까지.
- Pain: 브랜드마다 다른 아기옷 사이즈, 먼저 확인할 사이즈부터 빠르게.
- Evidence: 아이 정보와 확인된 브랜드 사이즈표를 함께 보고 선택해요.

Never claim guaranteed fit, guaranteed stock, lowest price, or catalog breadth that has not been measured.

## 9:16 short-form storyboard A — size hesitation
0–2s: two different brand size labels on screen. Copy: 같은 80인데 왜 다르지?
2–6s: KKOKKAPICK product discovery, then child profile. Copy: 아이 정보를 한 번 등록하고
6–11s: verified KKOKKAFIT evidence screen. Copy: 확인된 사이즈표가 있는 상품은 먼저 볼 사이즈를 확인
11–15s: merchant handoff. Copy: 여러 아기옷을 보고, 근거까지. 꼬까픽

## 9:16 storyboard B — multi-store fatigue
0–3s: repeated store-search motif. Copy: 아기옷 찾느라 쇼핑몰을 계속 옮겨 다녔다면
3–8s: product-first KKOKKAPICK grid. Copy: 한곳에서 먼저 둘러보고
8–12s: favorite/price context. Copy: 마음에 드는 옷은 저장
12–15s: KKOKKAFIT evidence. Copy: 사이즈 근거가 있으면 함께 확인

## 9:16 storyboard C — evidence, not promise
0–3s: Copy: 딱 맞는다고 대신 약속하지 않아요.
3–9s: official-size-guide evidence UI. Copy: 확인된 브랜드 사이즈표를 기준으로
9–13s: recommendation result. Copy: 먼저 확인할 사이즈를 보여드려요.
13–15s: brand lockup. Copy: 선택의 근거를 더하는 아기옷 탐색, 꼬까픽

## Store screenshot copy sequence
1. 여러 아기옷을 한곳에서 둘러보세요 — product-first discovery grid.
2. 월령·카테고리·브랜드로 빠르게 좁혀보세요 — compact contextual filters.
3. 아이 정보를 등록하면 탐색이 더 쉬워져요 — child profile.
4. 꼬까핏 가능한 상품은 사이즈 근거를 함께 확인해요 — verified evidence screen.
5. 마음에 드는 상품을 저장하고 가격 변화를 확인하세요 — favorites/alert.
6. 판매처를 확인하고 구매는 해당 판매처에서 진행해요 — transparent merchant handoff.

## Privacy-safe measurement boundary
Do not add advertising IDs or a general analytics SDK merely for launch experiments. Candidate first-party aggregate events, if/when production measurement is authorized: discovery_open, product_view, profile_completed, verified_fit_view, favorite_created, price_alert_created, merchant_handoff. Never attach child height/weight/birth date, email, access token, product free-text search, or persistent cross-app advertising identifiers to marketing events.

Qualified activation candidate: a session with meaningful discovery plus at least one of verified_fit_view, favorite_created, price_alert_created, or merchant_handoff. This definition remains a measurement contract draft until production instrumentation is approved.

## Weekly experiment report
Record channel/creative, spend, landing/store visits, qualified activations, cost per qualified activation, funnel drop-off, data-quality caveats, one learning, one next action, and whether to stop/continue. CTR is diagnostic only, not the optimization goal.
