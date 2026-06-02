# ADR 0001: Build As A Deployed Web App

Date: 2026-05-28

## Status

Accepted

## Context

SuDo is intended to be a serious full-stack project, not a local-only CRUD demo. The PRD requires a public demo URL, production auth, persistent Postgres data, seed data, and deployment instructions.

## Decision

Build SuDo from the beginning as a deployed web app. Vercel is the expected hosting platform, Postgres is the production database, and deployment readiness is part of the v1 acceptance criteria.

## Consequences

- Environment variables, migrations, seed scripts, and README deployment instructions must be maintained during implementation.
- Features are not complete until they work in production-like conditions.
- Local-only shortcuts should be avoided when they create deployment risk.

## Alternatives Considered

- Local-only portfolio demo: rejected because it weakens the SWE signal and does not meet the product goal.
- Static frontend mock: rejected because auth, persistence, and production architecture are core requirements.

