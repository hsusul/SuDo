# ADR 0002: Use Repo Memory For Agent Workflows

Date: 2026-05-28

## Status

Accepted

## Context

Codex does not self-train or update model weights between tasks. The project still needs a way to preserve lessons, conventions, pitfalls, and verification habits across future agent sessions.

## Decision

Use repo memory files as the source of continuity:

- `AGENTS.md`
- `docs/codex-lessons.md`
- `docs/dev-workflows.md`
- `docs/architecture.md`
- `docs/decisions/`
- `scripts/check.sh`

Future agents must read `AGENTS.md` and `docs/codex-lessons.md` before non-trivial work.

## Consequences

- Project conventions become inspectable and reviewable.
- Lessons can improve future work without pretending the model is self-training.
- Agents must keep repo memory concise and avoid noisy task logs.

## Alternatives Considered

- Rely on chat history only: rejected because context can be lost or compacted.
- Put all guidance in README: rejected because README should stay user-facing and setup-focused.

