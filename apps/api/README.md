# Hayel API

This directory is reserved for Hayel's server-side application/API layer.

The API owns authentication and authorization enforcement, tenant context, domain orchestration, validation, audit/event emission, and integration contracts.

Domain rules must remain inside their owning modules. Country-specific legal calculations belong behind Country Pack contracts rather than in controllers.
