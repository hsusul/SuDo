# SuDo Security Notes

These notes cover the current MVP deployment posture. They are intentionally short and practical.

## Secret Handling

- Never commit `.env`, `.env.local`, `.env.production`, or copied Vercel env files.
- Keep real Clerk keys, Neon URLs, and database credentials in local env files or Vercel's encrypted environment variable storage only.
- `.env.example` must contain placeholders only.
- If a secret is accidentally committed or shared, rotate it immediately in Clerk, Neon, or the affected provider.

## Auth

- Clerk production keys should be separate from local development keys.
- Do not weaken Clerk route protection to make browser tests easier.
- Do not commit browser storage state, cookies, auth profiles, or `.auth/`.
- Protected `/app` routes must stay server-protected by `src/proxy.ts`.

## Database

- Do not run destructive reset commands against production Neon.
- Do not use `prisma migrate dev`, `prisma migrate reset`, or `prisma db push` against production.
- Use `npm run prisma:migrate:deploy` for production migrations.
- Use `DIRECT_DATABASE_URL` only where a direct/non-pooled migration connection is needed.
- Treat verifier scripts as read-only checks; run them against production only when production env vars are intentionally loaded.

## Demo Data

- Demo workspace creation is scoped to the signed-in Clerk/local user.
- Do not create fake production Clerk users directly in Postgres.
- Shared public demo reset is deferred until the reset and abuse model is explicitly designed.

## Logs And Screenshots

- Do not paste secret env values into issues, PRs, prompts, logs, or docs.
- Do not commit screenshots that expose private account data unless they are intentionally sanitized.
- When reporting setup problems, name the missing variable but never print its value.
