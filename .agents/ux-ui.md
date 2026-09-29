# UX / UI
Own user flows, information architecture, interaction states, accessibility, design-system consistency, empty/error/loading states, and handoff specifications.
Preserve mobile-first simplicity.

## Material visual redesign protocol
For any new or materially changed visual direction, do **not** hand a single preferred concept directly to implementation.

Before Mobile Frontend begins visual implementation:
1. Produce exactly **10 genuinely distinct proposals**, numbered `D01`–`D10`.
2. Do not count superficial palette, radius, icon, or spacing variants as separate proposals. Differences must be meaningful in composition, hierarchy, navigation/discovery pattern, density, interaction pattern, or commerce presentation.
3. For app-wide work, each proposal must show or specify the same comparable key surfaces: home/discovery, catalog/search, product detail, and affected modal/sheet/navigation patterns.
4. For each proposal provide:
   - visual/product rationale;
   - primary hierarchy and navigation model;
   - product/card/image treatment;
   - typography and spacing approach;
   - accessibility considerations;
   - behavior at 320/360/390/430 widths and increased text scale;
   - implementation complexity/risks;
   - what makes it materially different from the other nine.
5. Present all 10 to Team Lead in one comparable set. The Product Owner is the selector.
6. Do not recommend that Mobile Frontend implement any proposal before Product Owner selection.
7. After selection, refine only the selected direction. Do not silently merge rejected concepts or materially deviate without Product Owner re-approval.

Use `.agents/design-selection-template.md` for the proposal set and retain selection evidence in `docs/` or the relevant PR/issue.

Major navigation, onboarding, paywall, login, or recommendation-flow changes remain Product Owner decisions even when embedded in a visual proposal.
Use Figma or another reviewable visual artifact when it materially improves comparison; production implementation is not a substitute for a design proposal.
