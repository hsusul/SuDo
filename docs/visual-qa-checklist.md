# Visual QA Checklist

Last updated: 2026-06-01

Use this checklist after meaningful frontend changes. Prefer the Codex in-app Browser or Playwright MCP for inspection. Use `npm run test:e2e` for repeatable public smoke checks.

## Public Pages

- Landing page loads at `/`.
- Brand mark is visible and restrained.
- Primary CTA is clear.
- Hero copy is product-specific and not generic SaaS fluff.
- Product preview reads as an issue tracker, not fake metrics.
- No horizontal overflow at desktop, tablet, or mobile-ish widths.

## Auth Pages

- `/sign-in` loads.
- `/sign-up` loads.
- Clerk card fits inside the page with no overlapping boxes.
- Clerk development footer gradient is hidden in local development.
- Auth controls match SuDo radius and dark theme.
- Signed-out `/app` redirects to Clerk sign-in.

## App Shell

- Sidebar is stable and readable.
- Top-left SuDo mark links home.
- Workspace switcher is visible.
- Navigation preserves the selected workspace.
- Count badges are subtle and aligned.
- Active nav state is visible without looking like a loud notification pill.

## Workspace Switcher

- Current workspace is clear.
- Existing workspaces are listed.
- New workspace action is visible and compact.
- Switching workspaces resets project/issue/filter params safely.
- No workspace counts are shown unless intentionally added.

## Project Panel

- Project list is scannable.
- Empty state is concise.
- Create project opens a focused dialog.
- Edit/archive controls are clear but not dominant.
- Active issue count badges align consistently.

## Issue Panel

- Issue list is dense enough for repeated use.
- Filter bar feels like a toolbar, not a floating soft card.
- Search/status/priority/label controls align.
- Empty state distinguishes no issues from no matching filters.
- Issue rows show key, title, description, labels, status, priority, and updated date cleanly.
- Double-click edit behavior is discoverable enough for current MVP.

## Issue Detail Drawer

- Drawer opens from issue row.
- Drawer closes without losing project/filter context.
- Title, description, status, priority, project, and timestamps are readable.
- Archive action is visible but not dangerous-looking unless destructive.
- Drawer does not rely on excessive shadows or overly rounded nested boxes.

## Comments

- Empty comment state is concise.
- Comments show author, timestamp, and body clearly.
- Composer is easy to find.
- Comment layout does not look like chat unless intentionally changed.

## Labels

- Attached labels are visible on rows and drawer.
- Label colors are restrained.
- Create/attach/remove controls are compact.
- Labels do not overpower issue titles.

## Filters And Search

- Active filter state is visible.
- Clear action is visible only when useful.
- Opening an issue preserves filters.
- Archiving an issue removes it from filtered active lists.

## Views

- Built-in views are grouped clearly.
- Count badges are consistent.
- View links navigate into issue filters.
- Empty state explains that views are shortcuts, not saved custom views.

## Settings

- Settings stays account-only for v1.
- No workspace rename, deletion, role/debug context, slug/id, billing, or fake controls.
- Copy is honest about Clerk-managed account identity.

## Responsive Widths

Check at minimum:

- Desktop: `1280x900`
- Tablet-ish: `900x1000`
- Mobile-ish: `390x844`

At each width:

- No horizontal overflow.
- Text does not overlap controls.
- Buttons remain tappable.
- Dialogs fit within viewport.
- Drawer behavior remains usable or degrades gracefully.

## Anti-Vibecode Rules

- No excessive rounded corners.
- No random glows.
- No generic SaaS gradients.
- No fake metrics.
- No over-soft nested cards.
- No decorative blobs or orbs.
- No full-screen redesign unless explicitly requested.
- Preserve sharper product-grade structure: thin borders, flatter panels, controlled spacing, compact lists.
