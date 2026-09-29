# KKOKKAPICK Multi-Agent Orchestration

## Runtime intent
The Team Lead is the root/coordinator. Specialists are independent subagents with isolated context. Default maximum concurrent specialist workstreams: 3.

## Spawn policy
Spawn a specialist only for a bounded task with a clear deliverable.
Do not spawn for trivial sequential work.
Never allow two implementation agents to edit the same mutable files concurrently.

Suggested task names:
- planner
- source-data
- ux-ui
- mobile-fe
- backend
- qa
- security
- devops-finops
- architect (conditional)
- growth-business (conditional)
- online-marketing (launch/growth planning; paid activation requires Product Owner approval)

Every spawned task receives:
1. ROLE: point to the matching .agents/<role>.md
2. OBJECTIVE
3. IN SCOPE / OUT OF SCOPE
4. ALLOWED FILES or READ-ONLY scope
5. CONTRACTS / DEPENDENCIES
6. ACCEPTANCE CRITERIA
7. EXPECTED RETURN FORMAT

## Context isolation
Prefer fresh/isolated specialist context. Pass only task-relevant requirements, contracts, paths, and decisions.
QA MUST NOT inherit an implementation agent's reasoning as authoritative context. QA receives the Product Owner request, accepted AC, final diff/changed files, and test commands/evidence.

## Execution graph
INTAKE
  -> PLAN/DISCOVER
  -> split into independent tracks when applicable:

VISUAL TRACK
  -> UX/UI DESIGN EXPLORATION
  -> 10 DISTINCT PROPOSALS
  -> TEAM LEAD comparability check
  -> PRODUCT OWNER DESIGN SELECTION GATE
      -> NO SELECTION / ANOTHER ROUND: visual implementation remains blocked
      -> SELECTED: UX/UI refines selected proposal only
  -> VISUAL IMPLEMENTATION (Mobile FE)
  -> IMPLEMENTATION SELF-CHECK
  -> INDEPENDENT VISUAL QA

NON-VISUAL ENGINEERING TRACK
  -> INTERFACE GATE
  -> IMPLEMENT (parallel FE logic/BE/Data only on non-overlapping ownership)
  -> IMPLEMENTATION SELF-CHECK
  -> INDEPENDENT QA

TRACKS JOIN
  -> QA FAIL: route defects to owning implementation agent
  -> fix
  -> INDEPENDENT QA again
  -> QA PASS
  -> SECURITY/DATA/FINOPS conditional gates
  -> TEAM LEAD final gate
  -> PR ready

## Design Selection Gate — hard rule
For any new or materially changed user-facing visual direction:
- UX/UI must return exactly 10 reviewable, genuinely distinct proposals before visual implementation begins.
- A proposal set must be numbered `D01`–`D10` and use a comparable presentation format.
- Each proposal must cover affected key surfaces, not just a palette or mood board. For app-wide redesigns, include at minimum home/discovery, catalog/search, product detail, and changed modal/sheet/navigation patterns.
- Each proposal must document rationale, hierarchy/navigation intent, accessibility, responsive behavior, and implementation risks.
- Team Lead may reject a weak proposal set and request stronger differentiation before showing it to the Product Owner.
- Mobile Frontend must not implement the new visual direction until the Product Owner explicitly selects one proposal ID.
- After selection, UX/UI may refine the selected proposal, but may not combine rejected concepts or materially deviate without Product Owner re-approval.
- Design-agnostic engineering work must continue in parallel when dependency boundaries allow it.
- Design-selection evidence and the selected proposal ID must be retained in `docs/` or the relevant PR/issue for auditability.

## QA independence — hard rule
QA/Reviewer is never the author of the feature implementation it approves.
QA does not repair a failed implementation in the same QA task. It reports defects to Team Lead.
Team Lead routes each defect back to the responsible implementation agent.
After fixes, QA performs a fresh verification pass.
An implementation agent's own unit tests are necessary evidence, never final approval.
Only QA may emit QA_PASS / QA_FAIL / QA_BLOCKED.
For material visual work, QA must verify the implementation against the Product Owner-selected proposal ID as well as responsive/accessibility acceptance criteria.

## Required handoff envelopes
Implementation agent return:
STATUS: DONE | BLOCKED
CHANGED_FILES:
TESTS_RUN:
CONTRACT_CHANGES:
RISKS:
COST_IMPACT:
SECURITY_PRIVACY_IMPACT:
DATA_PROVIDER_IMPACT:
DESIGN_SELECTION_ID: N/A | D01..D10
QA_NOTES:

UX/UI proposal return:
DESIGN_SET_STATUS: READY | REVISE | BLOCKED
PROPOSALS: D01..D10
SURFACES_COVERED:
DIFFERENTIATION_CHECK:
ACCESSIBILITY_NOTES:
RESPONSIVE_NOTES:
IMPLEMENTATION_RISKS:
PRODUCT_OWNER_SELECTION_REQUIRED: YES

QA return:
QA_STATUS: QA_PASS | QA_FAIL | QA_BLOCKED
AC_RESULTS:
DESIGN_SELECTION_MATCH: N/A | PASS | FAIL
TESTS_RUN:
DEFECTS:
REGRESSION_RISKS:
SECURITY_FLAGS:
DATA_FLAGS:
RETEST_REQUIRED:

## Conditional gates
Invoke Security/Privacy when root AGENTS.md says mandatory.
Invoke Source/Data review for provider/data-policy/freshness/normalization changes.
Invoke DevOps/FinOps for infrastructure, schedules, storage growth, third-party services, sync frequency, deployment.
Invoke Architect only for high-reversal-cost cross-cutting decisions.
Invoke Growth/Business for commercial/economics questions.
Invoke Online Marketing for launch acquisition, ASO/SEO, campaign experiments, retention messaging and funnel measurement. Planning is repository-safe; external campaign activation or spend requires Product Owner approval.

## Stop conditions
Stop and ask Product Owner when an escalation condition in root AGENTS.md is reached.
For material visual work, stop only the visual implementation track at the Design Selection Gate; independent non-visual work continues.
Do not merge automatically unless Product Owner has explicitly authorized that operating mode.

## Auditable QA sign-off
The QA gate must leave an auditable repository artifact.
Preferred: a native GitHub review from a distinct reviewer identity when available.
Fallback: a top-level PR conversation comment beginning with `[QA_AGENT]` and containing the exact QA return envelope.
A CI success is evidence, not QA_PASS by itself.
Team Lead may mark a PR ready only after CI success (when configured) and an auditable QA_PASS artifact.
