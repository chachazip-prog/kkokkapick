# Popup management

Popups are operator-managed and must never require a code deployment.

## Fields
- title / body
- optional image
- optional destination link
- surface: web / app / all
- placement: initially home; extensible later
- start / end time
- priority
- status: draft / scheduled / published / paused / ended
- dismiss policy:
  - session: once per app/web session
  - daily: hide until the next local day
  - forever: user selects "다시 보지 않기"
  - none: can be shown again according to product rules

## Operator UX
- create/edit/duplicate
- preview before publish
- schedule
- pause/end immediately
- list filters by status and surface
- show expired items separately
- conflict warning when multiple popups overlap the same placement

## Client safety
- public clients consume only published_popups
- clients enforce dismiss preference locally for anonymous users
- logged-in cross-device dismiss sync can be added later
- destination must be http/https or an approved internal deep link
- do not put secrets or personal data in popup configuration
