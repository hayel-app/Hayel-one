# Hayel Architecture

This directory contains the canonical architecture decisions and contracts for Hayel.

## Principles

1. Hayel is a modular platform with explicit domain boundaries.
2. Core owns canonical organization, identity, employee, authorization, audit, workflow, notification, and document concepts.
3. Workforce, Talent, Intelligence, AI, Finance, CRM, Communications, Subscriptions, and Country Packs consume canonical Core identities rather than creating competing identities.
4. Country-specific legal behavior is isolated behind versioned Country Packs and effective-dated rules.
5. Material actions are auditable.
6. AI recommendations must remain explainable and subject to human governance for material employment decisions.
7. Security and tenant isolation are platform requirements, not feature add-ons.

## Decision record index

ADRs will be added here as implementation decisions are finalized.

- ADR-0001 — Modular platform architecture
- ADR-0002 — Canonical identity and tenancy model
- ADR-0003 — Country Pack and effective-dated legal rules
- ADR-0004 — AI governance boundary
- ADR-0005 — Audit and event architecture
