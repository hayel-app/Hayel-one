# Hayel Persistence

Persistence owns database access and migration contracts.

Rules:

- Tenant-scoped queries must require tenant context.
- Domain code must not depend directly on database-specific query construction.
- Migrations are versioned and reviewed.
- Destructive migrations require explicit review.
- Repository methods must make tenant scope explicit for tenant-owned resources.
- Database constraints complement application authorization; they do not replace it.
