# KKOKKAPICK Admin

The admin is designed for a non-developer operator. Revenue features must not require code edits.

## Primary navigation

### Dashboard
- active / scheduled / ending campaigns
- merchant clicks and attributable conversions when provider data supports them
- revenue by partner / campaign / placement
- warnings: expired links, missing disclosure, campaigns with no products

### Sponsors & Curation
Create a campaign with:
- partner
- title / image
- placement
- selected canonical products
- display order
- start / end time
- destination
- disclosure label
- draft → scheduled → published → paused / ended

A sponsored campaign can never remove its disclosure label in the client.

### Premium Partners
Manage:
- brand / partner status
- brand description and assets
- verified official size-chart evidence
- campaign association
- contract/contact notes

Commercial payment must never automatically promote size evidence to verified. KKOKKAFIT verification remains evidence-gated.

### Commerce Affiliates
Manage adjacent categories such as shoes, hats and daycare essentials:
- category
- partner
- affiliate destination
- active period
- campaign/product association
- disclosure

### Catalog Overrides
Operator tools for exceptional cases only:
- hide a product
- correct canonical brand/category/stage
- attach verified size evidence
- blacklist a bad merchant offer
All overrides require an audit trail in production.

## Safety rails
- no API/provider secrets in browser admin code
- authenticated admin only
- public app reads published records only
- scheduling is server-time based
- draft preview before publish
- explicit sponsored disclosure
- partner payment never changes organic KKOKKAFIT evidence
- personal child-profile data is not exposed to commercial partners
