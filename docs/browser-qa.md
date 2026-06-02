# Browser QA For SuDo

Last updated: 2026-06-01

## Purpose

Browser QA makes frontend work visible. Build, typecheck, and unit tests are necessary, but they do not prove the interface renders well, auth redirects work in a real browser, or responsive layouts remain usable.

Use this document when a task changes UI, navigation, auth routing, modals, drawers, filters, or deployment behavior.

## Local App Setup

Start the app:

```bash
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

If another process already uses port `3000`, start Next.js on a different port and pass that URL to Playwright:

```bash
PORT=3001 npm run dev
PLAYWRIGHT_BASE_URL=http://localhost:3001 npm run test:e2e
```

## Browser Automation Options

### Codex In-App Browser

In the current Codex desktop environment, the in-app Browser plugin is available through Codex browser automation. It can open local routes, inspect DOM text, click links, and capture screenshots for review.

Use it for visual review when the user asks to inspect the local app or after meaningful UI changes. Prefer this over the user's Chrome profile unless the task explicitly depends on Chrome cookies or extensions.

Limitations:

- The in-app Browser may use a fresh session and may not share the user's signed-in Chrome/Clerk session.
- Protected `/app` routes can only be fully reviewed after signing in inside that browser session.
- Do not claim signed-in UI was verified if the browser only saw the public landing or Clerk sign-in page.

### Playwright MCP

Preferred MCP server for local app QA when available:

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/mcp@latest"]
    }
  }
}
```

Notes:

- This may open a fresh browser context.
- It may not share the user's signed-in Chrome session.
- For Clerk-authenticated pages, either manually sign in during the MCP browser session or implement a future test-only auth strategy.
- Do not store Clerk credentials, session cookies, browser profiles, or storage state in git.

Current environment status:

- Playwright MCP is documented but not directly exposed as a callable MCP tool in this Codex session.
- Composio/Rube browser tools are not exposed in this Codex session.
- The Codex in-app Browser is available and should be used for interactive visual review.
- The Playwright test runner below is the repeatable fallback.

### Playwright Test Runner Fallback

This repo includes a minimal Playwright test runner for public browser smoke checks.

Install browsers if the local machine has not already done so:

```bash
npx playwright install chromium
```

Run public smoke tests:

```bash
npm run test:e2e
```

Run headed:

```bash
npm run test:e2e:headed
```

Open Playwright UI:

```bash
npm run test:e2e:ui
```

Capture safe public screenshots:

```bash
npm run qa:screenshots
```

Generated screenshots and traces go under `test-results/`, which is gitignored.

## Current Automated Coverage

The fallback e2e suite checks:

- Landing page renders at desktop, tablet, and mobile-ish widths.
- Landing page has no horizontal overflow at those widths.
- `/sign-in` renders the Clerk sign-in surface.
- `/sign-up` renders the Clerk sign-up surface.
- Signed-out `/app` redirects to `/sign-in?redirect_url=...`.

It intentionally does not:

- Hardcode real Clerk credentials.
- Bypass production auth.
- Store or commit auth state.
- Verify signed-in workspace/project/issue flows without an authenticated browser session.

## Authenticated QA Plan

### Option A: Manual Sign-In In Browser Session

Use this now.

1. Start the app with real Clerk and database env vars.
2. Open the in-app Browser or Playwright MCP browser.
3. Navigate to `/sign-in`.
4. Manually sign in.
5. Let the agent inspect and click through:
   - `/app`
   - workspace switcher
   - project create/edit/archive
   - issue create/edit/archive
   - issue detail drawer
   - comments
   - labels
   - filters/search
   - views
   - settings

This verifies the real app without weakening auth.

### Option B: Future Test-Only Auth Strategy

Do not implement this casually.

Possible future approaches:

- Clerk-supported test mode.
- A dedicated test Clerk user with credentials supplied outside git.
- A sanitized Playwright storage state file generated locally and kept out of git.
- Mocked auth only in isolated test builds, never production.

Rules:

- Never weaken production auth for tests.
- Never commit credentials or storage state.
- Never print auth secrets in logs.
- Keep `.auth/` and `test-results/` ignored.

## Persistent Browser Profile Safety

If a tool supports persistent profiles or saved auth state:

- Store local-only state under `.auth/`.
- Keep `.auth/` gitignored.
- Do not copy cookies, Clerk session values, or local storage into docs or prompts.
- Do not use a personal browser profile for destructive tests.
- Avoid screenshots that reveal private account data unless the screenshot is intentionally sanitized and safe to share.

## Standard Browser QA Loop

For UI work:

1. Run normal checks: `npm run lint`, `npm run typecheck`, `npm run test`.
2. Start or reuse the dev server.
3. Use in-app Browser or Playwright MCP for visual inspection.
4. Run `npm run test:e2e` for public smoke coverage.
5. For protected pages, sign in inside the browser session or clearly state that signed-in browser QA was not completed.
6. Run `npm run build` and `./scripts/check.sh` before final response.

## Safety Rules

- Do not expose secrets.
- Do not commit `.env`, `.env.local`, `.auth/`, `test-results/`, or `playwright-report/`.
- Do not run destructive database actions from browser tests.
- Do not automate real production accounts without explicit confirmation.
- Do not claim protected UI was tested when only public routes were visited.
