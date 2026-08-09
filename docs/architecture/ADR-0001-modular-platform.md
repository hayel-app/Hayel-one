# ADR-0001 — Modular Platform Architecture

**Status:** Accepted

## Context

Hayel combines operational HR capabilities with Workforce Intelligence, AI, Finance, CRM, communications, subscriptions, and country-specific legal behavior. A premature microservices architecture would increase operational complexity before scale requires it.

## Decision

Start Hayel as a modular application with explicit domain boundaries and stable contracts. Keep domains independently testable and separable. Extract services only when scale, security, deployment independence, or operational requirements justify the split.

## Domains

- Core
- Workforce
- Talent
- Intelligence
- AI
- Finance
- CRM
- Communications
- Subscriptions
- Country Packs / Legal

## Consequences

Positive:
- Faster initial delivery
- Lower operational complexity
- Clear ownership boundaries
- Easier end-to-end testing
- Future extraction remains possible

Constraints:
- Domain boundaries must be enforced in code review and tests.
- Shared data access must use explicit contracts rather than uncontrolled cross-domain coupling.
