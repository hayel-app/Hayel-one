# ADR-0006 — Application Stack

**Status:** Proposed

## Context

Hayel needs a web application foundation that supports a polished bilingual product UI, a robust API, relational transactional data, background processing, AI integrations, automated testing, and future scale without premature infrastructure complexity.

## Proposed stack

- Web application: Next.js + TypeScript
- UI: React + TypeScript
- API/application services: TypeScript with a modular server-side architecture
- Database: PostgreSQL
- Cache/background jobs: Redis-compatible infrastructure when required
- Object storage: S3-compatible object storage
- Validation: schema-first runtime validation at API boundaries
- Testing: unit, integration, API, and end-to-end tests
- CI: GitHub Actions

## Constraints

This ADR remains **Proposed** until the repository's implementation confirms the stack is compatible with the final deployment and security requirements.

No secrets, production credentials, or provider-specific irreversible commitments belong in source control.
