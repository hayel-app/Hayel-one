# ADR-0005 — Audit and Event Architecture

**Status:** Accepted

## Decision

Hayel separates the immutable audit trail from the internal event bus. Audit records answer what happened and who caused it. Domain events communicate state changes to other components.

## Audit requirements

Every material mutation should capture, as applicable:

- tenant context
- actor identity or system actor
- action
- resource type and identifier
- timestamp
- outcome
- correlation/request identifier
- relevant before/after state or change summary
- source channel

Audit history is append-oriented and must not be casually editable by application users.

## Event requirements

Events must have:

- stable event name
- event version
- event identifier
- occurred-at timestamp
- tenant context where applicable
- aggregate/resource identifier
- producer
- correlation identifier
- explicit payload contract

Consumers must be idempotent because delivery may be retried.

## Consequences

Workflows, notifications, analytics, integrations, and AI pipelines can react to domain events without directly coupling to another domain's database internals. Audit remains an independent evidence trail.
