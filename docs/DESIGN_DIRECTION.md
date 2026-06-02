# SuDo Design Direction

Last updated: 2026-05-28

## Brand Essence

SuDo should feel calm, focused, intentional, elegant, and fast. The app is a project management tool for builders, so the interface should be work-focused rather than decorative. The product should look polished enough for a SaaS demo while staying simple enough for a summer SWE project.

The supplied logo image sets the direction:

- Minimal flower line icon.
- Thin, refined wordmark.
- Dark charcoal background.
- Soft off-white foreground.
- Subtle gray palette.
- Sparse uppercase support text.
- Premium, quiet presentation.

The UI should translate that mood into a practical product surface: clean navigation, dense issue lists, restrained controls, and clear workflows.

## Brand Interpretation

### Flower Mark

The flower mark suggests growth, clarity, and focused progress. It should be used as:

- App icon.
- Sidebar brand mark.
- Auth page mark.
- Favicon/app icon.
- Loading or empty-state accent only when restrained.

Avoid overusing flower motifs inside the product. The issue tracker should remain functional.

### Name

SuDo should be typeset with the same capitalization: `SuDo`. It should not be styled as `SUDO`, `sudo`, or `SuDO` in product copy.

### Tagline

Primary tagline from the logo:

Projects. Clarity. Flow.

Other acceptable options:

- Track the work. Keep the flow.
- Quiet project management for focused builders.
- Build with clarity.

## Visual System

### Color Direction

The mock logo implies a dark premium palette. The app can use a light or dark main experience, but the safest v1 direction is:

- Dark landing/auth surfaces for strong brand continuity.
- Light or neutral app workspace for readability and repeated use.
- Optional dark mode as stretch, not required for v1.

Suggested palette tokens:

- `ink`: near black, for landing background.
- `charcoal`: primary dark surface.
- `stone`: neutral app border and muted backgrounds.
- `paper`: warm off-white.
- `mist`: soft gray text.
- `sage`: restrained success/done accent.
- `amber`: urgent/high priority accent.
- `rose`: bug/error accent.
- `blue`: information/progress accent.

Avoid:

- Loud neon gradients.
- Purple-dominant SaaS palettes.
- One-note gray-only UI.
- Oversized color blocks that fight the calm brand.

### Typography

Recommended approach:

- Use a modern sans serif with excellent UI readability.
- If using Next.js, consider Geist Sans for the product UI.
- Use letter spacing sparingly. The logo uses wide tracking, but the app should prioritize readability.
- Keep issue rows compact and scannable.
- Avoid oversized dashboard headings inside the app shell.

Type hierarchy:

- Landing H1: refined but direct.
- App page title: compact and functional.
- Issue title: readable, not oversized.
- Metadata: muted, consistent, easy to scan.

### Shape And Spacing

- Use compact radii, generally 6px to 8px.
- Avoid cards inside cards.
- Use full-height app shell layout.
- Keep sidebar and top nav stable.
- Use consistent row heights for issue lists.
- Use clear hit targets for selectors and row actions.

### Iconography

- Use lucide-react icons where possible.
- Prefer familiar icons for actions: plus, search, filter, settings, more, check, alert, tag, message.
- Do not replace obvious icons with text-only pills.
- Provide tooltips for icon-only controls.

## Product UI Direction

### Landing Page

The landing page should introduce the brand and app quickly. It should include:

- SuDo logo/mark.
- A short value proposition.
- Primary CTA for demo workspace.
- Secondary CTA for signup.
- Product screenshot or realistic app preview once the UI exists.
- Brief feature proof, not a long marketing page.

The first viewport should show the brand and product category immediately. It should also hint at the app UI below the fold.

### Auth Pages

Auth should feel premium and simple:

- Dark branded background.
- Flower mark.
- Short tagline.
- Clean auth form.
- Minimal supporting copy.

### App Shell

The app shell should be quiet and efficient:

- Left sidebar for workspace, projects, and settings.
- Main top bar for current page, search, filters, and primary action.
- Dense issue list as the main surface.
- Detail drawer or page for focused issue work.

### Dashboard

Dashboard should answer:

- What projects exist?
- What is active?
- What changed recently?
- Where should I go next?

Recommended dashboard blocks:

- Recent projects.
- My/open issues if assignments exist.
- Recently updated issues.
- Status summary.

Avoid a decorative analytics dashboard in v1.

### Issue List

The issue list is the product's core experience. It should support:

- Issue key.
- Title.
- Project.
- Labels.
- Priority.
- Status.
- Comment count if available.
- Updated time.
- Row actions.

List requirements:

- Stable row height.
- Clear hover/focus states.
- Fast status and priority changes.
- Empty state with "Create issue" and "Clear filters" where appropriate.

### Issue Detail

Issue detail should include:

- Issue key.
- Editable title.
- Editable description.
- Status selector.
- Priority selector.
- Project selector if needed.
- Labels.
- Comments.
- Activity timeline.
- Created/updated metadata.

Drawer versus page:

- Drawer is faster and feels more product-like.
- Page is simpler for routing and sharing.
- V1 can implement page first and add drawer later, or implement a drawer if the framework setup makes it clean.

## Responsive Behavior

Desktop:

- Persistent sidebar.
- Table/list density optimized for scanning.
- Detail drawer can sit beside list.

Tablet:

- Collapsible sidebar.
- Issue list remains primary.
- Detail route may replace drawer.

Mobile:

- Functional, not native-app-level.
- Sidebar becomes sheet/drawer.
- Issue rows stack metadata below title.
- Creation form remains usable.

## Empty, Loading, And Error States

Empty states should be short and actionable:

- No projects: "Create your first project."
- No issues: "Capture the first task for this project."
- No search results: "No issues match these filters." Include reset action.

Loading states:

- Use skeleton rows for issue lists.
- Preserve layout size to avoid jumps.

Error states:

- State what failed.
- Provide retry or navigation action.
- Avoid raw technical errors in UI.

## Demo Workspace Design

Seed data should make the UI look inhabited and credible:

- Use realistic issue titles.
- Include comments that sound like a small technical team.
- Distribute work across statuses.
- Use labels and priorities in visible ways.
- Include a few completed issues to show progress.

Example projects:

- Launch Website
- Auth And Accounts
- Issue Workflow
- Mobile Polish

Example issue titles:

- Add public demo workspace route.
- Tighten issue list spacing on tablet.
- Add empty state for filtered issue results.
- Document production migration command.
- Fix label color contrast in dark sidebar.

## Design Quality Bar

Before calling UI work done:

- Text does not overflow controls.
- Issue rows are easy to scan.
- Sidebar does not dominate the workspace.
- Search/filter controls are obvious but not bulky.
- Empty states are helpful.
- Loading states preserve layout.
- Responsive layout is verified in browser.
- The logo and product name are visible without being overused.

