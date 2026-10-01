# V10 visual release contract evidence

This file documents why `v10_visual_release_contract_test.dart` exists and intentionally keeps this PR in the Flutter CI path after the production layout fixes from #124 landed on `main`.

Repository contract coverage:
- approved black wordmark with warm/pink accent;
- neutral bounded product-card surface;
- gallery affordance only when multiple images exist;
- release product-detail information hierarchy;
- Home editorial rail + recommendation rail + continuous product grid.

The widget suite is repository evidence only. It does not replace independent physical-device, iOS Safari, VoiceOver/TalkBack, or approved-reference visual sign-off required by #110.
