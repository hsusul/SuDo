# Architecture Decision Records

Last updated: 2026-05-28

## What ADRs Are

Architecture Decision Records capture durable technical and product-engineering decisions. They explain what was decided, why, tradeoffs considered, and when the decision should be revisited.

## When To Create An ADR

Create an ADR when a decision:

- Chooses a core technology.
- Changes deployment architecture.
- Changes auth, database, or data ownership.
- Introduces meaningful operational risk.
- Resolves an open question that future agents should not reopen casually.
- Changes scope in a way that affects milestones or acceptance criteria.

Do not create ADRs for tiny implementation details that are obvious from code.

## Naming Convention

Use a four-digit sequence and short kebab-case title:

```text
0001-use-nextjs.md
0002-use-clerk-for-auth.md
```

## ADR Template

```markdown
# ADR NNNN: Title

Date: YYYY-MM-DD

## Status

Accepted | Proposed | Superseded

## Context

What problem or decision pressure exists?

## Decision

What did we decide?

## Consequences

What improves, what gets harder, and what must future work remember?

## Alternatives Considered

What did we consider and reject?
```

