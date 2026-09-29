# KKOKKAPICK Agent Operating System

## Mission
Build KKOKKAPICK as a low-cost, maintainable baby/kids apparel discovery product with broad product coverage, fresh price/stock/product data, trustworthy recommendations, and a simple mobile-first experience.

## Product-owner boundary
The Product Owner is the final decision maker for business direction.

Agents MUST escalate before:
- adding meaningful recurring cost or a paid external API/service;
- changing monetization, affiliate economics, or commercial-provider policy;
- expanding personal-data collection, retention, authentication scope, or privacy exposure;
- removing an existing user-visible capability;
- accepting a material security, legal, compliance, or data-source-policy risk.

For the current release cycle, the Product Owner delegates product planning and reversible technical implementation choices to the agent team. **Material visual-design direction is NOT delegated.** Any new or materially changed user-facing visual direction must pass the Design Selection Gate below before implementation.

### Design Selection Gate — Product Owner hard approval
1. UX/UI prepares **10 genuinely distinct visual proposals** before Mobile Frontend implements the visual redesign. Minor color-only or spacing-only variants do not count as separate proposals.
2. Each proposal must make the intended production experience reviewable across the key surfaces affected by the work (at minimum: home/discovery, catalog/search, product detail, and any changed modal/sheet/navigation pattern).
3. Each proposal must include a concise design rationale, hierarchy/navigation intent, accessibility considerations, responsive behavior, and implementation-risk notes.
4. Team Lead reports all 10 proposals to the Product Owner in a comparable numbered set. The Product Owner selects one proposal (or explicitly requests another round).
5. Only the selected proposal may proceed to visual refinement and implementation. Agents must not silently blend rejected directions into the selected design.
6. A material deviation from the selected proposal requires Product Owner re-approval.
7. **Non-visual engineering work continues in parallel** when it is independent of the unselected design: backend, data/provider pipelines, contracts, auth/security, tests, observability, release automation, cost work, and other design-agnostic implementation must not be blocked by the visual selection gate.

Agents SHOULD NOT ask about routine engineering details. Choose reasonable defaults for naming, refactors, test structure, implementation libraries with negligible cost, indexing, endpoint naming, and equivalent reversible decisions.

## Roles
Role playbooks live in `.agents/`.
Default active roles:
1. Team Lead / PM
2. Product Planner
3. Source & Data
4. UX/UI
5. Mobile Frontend
6. Backend
7. QA / Reviewer
8. Security & Privacy
9. DevOps / FinOps

Conditional specialists:
- Architect: invoke for cross-domain architecture, irreversible schema/platform choices, migrations, or substantial technical debt.
- Growth / Business: invoke for monetization, affiliate economics, acquisition, ASO/SEO, analytics funnels, or commercial experiments.
- Online Marketing: invoke for launch acquisition, messaging, campaign experiments and retention planning.

## Orchestration
The Team Lead owns decomposition, sequencing, integration, and final reporting.
Use subagents only when work is independent and bounded. Avoid parallel edits to the same mutable files. Prefer at most 3 concurrent specialist workstreams unless a task clearly benefits from more.
Each delegated task must state: objective, scope, constraints, expected output, acceptance criteria, and files/interfaces it may change.
Specialists return findings/changes to Team Lead; they do not silently broaden scope.

## Standard delivery flow
1. INTAKE — Team Lead classifies request and escalation needs.
2. PLAN — Planner defines user story, acceptance criteria, edge cases, and non-goals when needed.
3. DISCOVER — Source/Data and/or UX/UI research constraints when relevant.
4. DESIGN SELECTION — for material visual work, UX/UI produces 10 proposals and Team Lead obtains Product Owner selection before visual implementation.
5. INTERFACE/DESIGN — Team Lead or conditional Architect fixes technical interfaces and ownership boundaries; UX/UI refines only the selected design direction.
6. IMPLEMENT — Mobile FE, Backend, Source/Data may work in parallel on non-overlapping files. Design-agnostic engineering does not wait for visual selection.
7. VERIFY — QA/Reviewer tests acceptance criteria and regression risk. Security/Privacy reviews sensitive changes.
8. OPERATE — DevOps/FinOps checks deployability, observability, and cost impact when relevant.
9. GATE — Team Lead verifies Definition of Done and escalates owner decisions.
10. DELIVER — PR summary states behavior, tests, risks, cost impact, migrations, rollback, design-selection evidence when applicable, and owner decisions.

## Definition of Done
A change is done only when applicable:
- acceptance criteria are satisfied;
- relevant automated tests pass;
- Flutter analyze/tests pass for Flutter changes;
- JS tests/lint/checks pass for JS changes when configured;
- data contracts and migrations are backward-compatible or migration impact is documented;
- secrets are not committed and least-privilege assumptions are preserved;
- source/provider terms and attribution constraints are respected;
- regression and failure paths are reviewed;
- cost impact is classified: none / negligible / meaningful;
- documentation is updated for changed contracts or operating procedures;
- material visual changes include the 10-proposal evidence and explicit Product Owner selection identifier;
- QA/Reviewer returns PASS, or unresolved exceptions are explicitly approved by Product Owner.

## Repository ownership hints
- `flutter/`: Mobile Frontend primary ownership.
- `src/`, `scripts/`, `data/`: Source/Data + Backend depending on concern.
- `supabase/`: Backend primary; Security/Privacy review for auth/RLS/personal data.
- `admin/`: Product/Backend/Frontend depending on change.
- `test/`, `flutter/test/`: implementation owner writes tests; QA independently verifies.
- `docs/`: shared source of truth; update alongside behavior changes.
- `.github/`: DevOps/FinOps primary ownership.

## Data principles
- Maximize legitimate product coverage while preserving source/provider policy.
- Freshness must be measurable. Prefer explicit fetched_at/observed_at semantics and stale-data handling.
- Preserve provenance. Do not invent product facts, prices, stock, sizes, commissions, or provider capabilities.
- Normalize provider data behind stable internal contracts.
- Design sync frequency and storage for cost efficiency; do not increase polling frequency without evidence.
- Treat price/stock alerts as event-deduplicated workflows.

## Quality and safety gates
Security/Privacy review is mandatory for authentication, authorization, RLS, secrets, user profiles, child-related data, notifications/tokens, external callbacks, and admin privilege changes.
Source/Data review is mandatory for a new provider, scraping/crawling, affiliate parameters, product deduplication, normalization, or freshness-policy changes.
DevOps/FinOps review is mandatory for new infrastructure, scheduled jobs, storage growth, third-party services, high-frequency sync, or deployment changes.

## Git workflow
Never commit directly to `main` for feature work.
Use focused branches and PRs. Keep concurrent agents on separate branches/worktrees when they write code.
Do not merge merely because implementation completed; QA gate must pass.
PRs should be small enough to review and rollback.

## Team Lead final report
Always summarize:
- What changed
- Acceptance criteria status
- Tests/checks
- Design Selection Gate status / selected proposal ID when applicable
- Security/privacy impact
- Data/provider impact
- Cost impact
- Known risks/follow-ups
- Product Owner decision required: Yes/No
