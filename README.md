# Hayel

Hayel is an AI-first Workforce Intelligence Platform designed to help organizations understand, decide, and act on workforce data with confidence.

## Engineering status

**Build phase: Foundation**

This repository is the canonical Hayel engineering repository.

## Engineering principles

- Decision-First: Data → Insight → Confidence → Decision → Business Outcome
- Capabilities are a first-class domain and strategic currency.
- Multi-tenancy and tenant isolation are foundational requirements.
- Legal rules are country-specific, effective-dated, auditable, and evidence-backed.
- AI augments humans; it does not silently make material employment decisions.
- Finance requires deterministic calculations and auditability.
- Gouda owns independent quality authority and release gates.
- Nova's approved brand system governs the user experience.

## Initial architecture

Hayel starts as a modular platform with clear domain boundaries. Services may be extracted later when scale or operational requirements justify it; premature distribution is avoided.

Core domains:

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

## Quality gate

No feature is complete until implementation, automated tests, security controls, observability, documentation, and Gouda QA evidence are complete.
