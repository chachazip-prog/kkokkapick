# Admin operating model

KKOKKAPICK is designed to be operated without routine developer intervention.

## Daily operator jobs
- inspect catalog freshness and failed provider syncs
- hide obviously bad products/offers
- review scheduled campaigns/popups
- inspect affiliate clicks and attributable revenue
- review price-alert health

## Commercial workflow
1. Create a partner inline or select an existing partner.
2. Create campaign as draft.
3. Select products / placement.
4. Preview.
5. Schedule or publish.
6. Pause/end without deployment.
7. Review impressions, clicks, conversions and attributed revenue.

## Popup workflow
1. Draft content and optional link.
2. Select app/web/all.
3. Select session/daily/forever/none dismissal.
4. Preview.
5. Schedule/publish.
6. Pause/end immediately when needed.

## Catalog workflow
Automated ingestion remains primary. Manual override is exceptional:
- hide bad product
- correct canonical brand/category/stage
- suppress bad merchant offer
- record reason and operator in audit log

## Fit evidence workflow
- candidate: source discovered but not sufficiently verified
- verified: authoritative brand/manufacturer evidence checked
- rejected: source unsuitable
Commercial relationships never change evidence status.

## Dashboard metrics
Operational:
- last provider sync
- fresh/expired product counts
- active offers
- failed syncs
Commercial:
- active/scheduled campaigns
- impressions
- merchant/campaign clicks
- conversions when provider callback/reporting supports them
- attributed revenue
Engagement:
- product views
- favorites
- price alerts
- KKOKKAFIT views
- merchant click-through rate

Revenue should distinguish estimated/attributed amounts from provider-confirmed payable commission.
