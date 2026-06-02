# ADR 0004: Use Prisma For ORM

Date: 2026-05-28

## Status

Accepted

## Context

SuDo needs clear schema management, migrations, seed scripts, and a fast path to a deployed PostgreSQL-backed app.

## Decision

Use Prisma for the v1 ORM and migration workflow.

## Consequences

- Schema iteration and migrations should be straightforward.
- Seed scripts can use the Prisma client.
- The project must still demonstrate database depth through normalized modeling, indexes, documented relationships, and reset-safe seed logic.
- Some advanced SQL patterns may require raw SQL or careful Prisma query design.

## Alternatives Considered

- Drizzle: strong SQL-shaped control and lightweight runtime, but more manual setup and query design overhead for v1.
- Raw SQL only: rejected for v1 because it slows implementation and increases boilerplate.

