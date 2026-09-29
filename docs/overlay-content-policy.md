# Overlay and content-surface policy

Use overlays selectively so the main navigation remains predictable.

- Modal bottom sheet: contextual, reversible tasks that benefit from staying near the current content — product detail, quick filters, sort/options, price-alert setup.
- Dialog: short blocking confirmation or compact data entry — destructive deletion confirmation and small profile edits only.
- Managed popup: operator-managed announcement/campaign only. Respect dismissal policy; never stack it with another modal.
- Snackbar/banner: transient success, failure, or recoverable action feedback. Do not use dialogs for routine errors.
- Inline content surface: recommendations, child context, category shortcuts, sponsored modules, fit guidance. Prefer cards/sections over popups when the user does not need to decide immediately.

Rules:
1. Never show two overlays at once.
2. Do not show a managed popup immediately after another user-triggered modal closes.
3. Sponsored surfaces must retain disclosure inside the content area or popup.
4. Primary shopping/search flows must remain usable without dismissing promotional UI.
5. Destructive account/data actions require explicit confirmation; routine filters do not.
6. Keep modal actions thumb-reachable and use plain Korean labels.
