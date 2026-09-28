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
  -> PLAN/DISCOVER (parallel only if independent)
  -> INTERFACE GATE
  -> IMPLEMENT (parallel FE/BE/Data only on non-overlapping ownership)
  -> IMPLEMENTATION SELF-CHECK
  -> INDEPENDENT QA
      -> FAIL: route defects to owning implementation agent
      -> fix
      -> INDEPENDENT QA again
      -> PASS
  -> SECURITY/DATA/FINOPS conditional gates
  -> TEAM LEAD final gate
  -> PR ready

## QA independence — hard rule
QA/Reviewer is never the author of the feature implementation it approves.
QA does not repair a failed implementation in the same QA task. It reports defects to Team Lead.
Team Lead routes each defect back to the responsible implementation agent.
After fixes, QA performs a fresh verification pass.
An implementation agent's own unit tests are necessary evidence, never final approval.
Only QA may emit QA_PASS / QA_FAIL / QA_BLOCKED.

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
QA_NOTES:

QA return:
QA_STATUS: QA_PASS | QA_FAIL | QA_BLOCKED
AC_RESULTS:
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
Invoke Growth/Business only for commercial/growth questions.

## Stop conditions
Stop and ask Product Owner when an escalation condition in root AGENTS.md is reached.
Do not merge automatically unless Product Owner has explicitly authorized that operating mode.


## Auditable QA sign-off
The QA gate must leave an auditable repository artifact.
Preferred: a native GitHub review from a distinct reviewer identity when available.
Fallback: a top-level PR conversation comment beginning with `[QA_AGENT]` and containing the exact QA return envelope.
A CI success is evidence, not QA_PASS by itself.
Team Lead may mark a PR ready only after CI success (when configured) and an auditable QA_PASS artifact.
