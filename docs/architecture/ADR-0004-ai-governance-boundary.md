# ADR-0004 — AI Governance Boundary

**Status:** Accepted

## Decision

Hayel AI is an intelligence and decision-support layer. AI outputs must be traceable to the data, signals, rules, or evidence used to produce them. Material employment actions require an explicit human-controlled workflow unless a future governance decision expressly permits automation.

## Requirements

- Record model/version metadata for material AI outputs.
- Preserve relevant input references and evidence where feasible.
- Distinguish generated insight from deterministic system facts and calculations.
- Never represent an uncertain inference as an established fact.
- Provide a human review path for consequential employment recommendations.
- Apply tenant and authorization controls before exposing AI context.
- Do not allow an AI response to bypass application permissions.
- Log material AI actions and outcomes for auditability.

## Separation of concerns

`RAG retrieves evidence → model generates interpretation → policy/rules constrain action → human or approved workflow decides → audit records outcome.`

## Consequences

AI can be embedded across Hayel without becoming an uncontrolled source of truth. Deterministic domains such as payroll calculations remain deterministic; AI may explain, detect anomalies, summarize, or recommend without silently changing authoritative records.
