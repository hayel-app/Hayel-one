# ADR-0003 — Country Packs and Effective-Dated Legal Rules

**Status:** Accepted

## Context

Hayel is intended for Egypt, Saudi Arabia, the UAE, Oman, and future markets. Labour and employment requirements vary by jurisdiction and can change over time.

## Decision

Country-specific behavior is isolated behind Country Packs. Legal rules are versioned and effective-dated. Legal RAG retrieves source evidence; deterministic rules apply approved rules to operational calculations.

Conceptual flow:

`Legal source → retrieval/evidence → reviewed rule → Country Pack → deterministic engine → result → audit evidence`

## Rules

- A rule must identify country/jurisdiction.
- A rule must have an effective-from date and, when applicable, an effective-to date.
- A rule must identify its source evidence.
- Historical transactions use the rule applicable to their effective date.
- Ambiguity or missing authority must be surfaced for review rather than silently invented.
- Legal source text must not be rewritten into unsupported requirements.

## Consequences

Payroll, attendance, leave, contracts, personnel operations, and statutory workflows can share common engines while using jurisdiction-specific rules.
