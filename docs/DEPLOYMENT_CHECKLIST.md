# SuDo Deployment Checklist

Use this checklist before and during the first public Vercel deployment.

## Repo Readiness

- [ ] `npm run check` passes locally.
- [ ] `npm run test:e2e` passes locally if browser dependencies are installed.
- [ ] `.gitignore` excludes local env files, generated builds, Playwright artifacts, `.vercel`, and local auth state.
- [ ] No real secrets are tracked or staged.
- [ ] `package-lock.json` is committed with `package.json`.
- [ ] `prisma/schema.prisma` is committed.
- [ ] `prisma/migrations/` is committed.
- [ ] `.env.example` is committed and contains placeholders only.

## Production Services

- [ ] GitHub repository exists: `https://github.com/hsusul/SuDo`.
- [ ] Neon production database is created.
- [ ] Neon pooled/runtime URL is copied for `DATABASE_URL`.
- [ ] Neon direct/non-pooled URL is copied for `DIRECT_DATABASE_URL`.
- [ ] Clerk production app is created.
- [ ] Clerk production publishable key is copied.
- [ ] Clerk production secret key is copied.
- [ ] Vercel project is created from the GitHub repo.

## Vercel Environment Variables

- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `DATABASE_URL`
- [ ] `DIRECT_DATABASE_URL`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/app/issues`
- [ ] `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/app/issues`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/app/issues`
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/app/issues`

## Vercel Build Settings

- [ ] Framework preset is `Next.js`.
- [ ] Install command is `npm install`.
- [ ] Build command is `npm run build`.
- [ ] Output directory uses the Next.js default.

## Clerk Production URLs

- [ ] Sign-in URL is `/sign-in`.
- [ ] Sign-up URL is `/sign-up`.
- [ ] After sign-in URL is `/app/issues`.
- [ ] After sign-up URL is `/app/issues`.
- [ ] Fallback redirects use `/app/issues`.
- [ ] First Vercel deployment URL is added to Clerk allowed origins/domains.
- [ ] Custom domain is added to Clerk allowed origins/domains if used.
- [ ] Vercel is redeployed after Clerk domain or env-var changes.

## Production Database

- [ ] Production database starts empty or contains only intentional data.
- [ ] Production migrations are applied with `npm run prisma:migrate:deploy`.
- [ ] No production reset, `db push`, or `migrate dev` command is used.
- [ ] Demo workspace creation is tested through authenticated onboarding.

## Public Smoke Test

- [ ] `/` loads.
- [ ] `/sign-in` loads production Clerk UI.
- [ ] `/sign-up` loads production Clerk UI.
- [ ] Signed-out `/app` redirects to Clerk.
- [ ] New user can sign up.
- [ ] New user can create a blank workspace.
- [ ] New user can create a demo workspace.
- [ ] Project creation works.
- [ ] Issue creation works.
- [ ] Issue drawer opens.
- [ ] Comments work.
- [ ] Labels work.
- [ ] Filters/search work.
- [ ] Views page works.
- [ ] Settings page works.
- [ ] Workspace switching works if multiple workspaces exist.

## After Deployment

- [ ] Public URL is added to README when final.
- [ ] Any post-deploy bugs are logged.
- [ ] Any deployment-specific lessons are added to `docs/codex-lessons.md`.
- [ ] No screenshots or logs containing private data are committed.
