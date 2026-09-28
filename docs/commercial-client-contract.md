# Commercial client contract

Clients never read admin tables directly. They consume only the published commercial read model.

## Published campaign
- id
- title
- campaignType: sponsored_slot | curation | premium_brand | commerce_affiliate
- disclosureLabel: always rendered for paid/sponsored placement
- startsAt / endsAt
- destinationUrl
- imageUrl
- placement
- priority
- partnerName
- partnerType

## Visibility
A campaign is client-visible only when:
- campaign status = published
- partner status = active
- current server time is within start/end bounds

## Attribution
Allowed event types:
- impression
- click
- conversion

Do not attach child profile, height, weight, birth date, email or other direct personal data to commercial attribution events.

Organic recommendation ranking and KKOKKAFIT evidence are independent of commercial payment. A campaign may buy a clearly disclosed placement, but cannot alter organic fit verification.
