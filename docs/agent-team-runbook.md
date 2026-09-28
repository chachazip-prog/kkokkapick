# Agent Team Runbook

## How to ask Codex
Start a task from the repository root so root AGENTS.md is loaded. Ask the coordinator to operate as Team Lead and follow .agents/ORCHESTRATION.md.

Example:
"Operate as KKOKKAPICK Team Lead. Implement <feature>. Follow AGENTS.md and .agents/ORCHESTRATION.md. Delegate independent bounded work to role subagents, max 3 concurrently. QA must be an independent subagent and must not author implementation. Stop for Product Owner approval only at the escalation gates."

## Runtime configuration
Use a multi-agent-capable Codex/Agents runtime and enable multi-agent orchestration. Recommended concurrency for this repository: 3 specialist subagents at once. Increase only after evidence that workstreams are non-overlapping.

## Review loop
Developer agent -> self-check -> QA subagent -> FAIL back to developer -> fresh QA pass -> Team Lead gate.

## Branch/worktree rule
Parallel writers use separate branches/worktrees. Do not run concurrent writers against the same files/worktree. Team Lead integrates only after interface compatibility is checked.

## Product Owner experience
The Product Owner communicates with Team Lead. Specialist discussion stays internal unless a decision hits an escalation gate. Final report uses the template in root AGENTS.md.
