# Frontend Audit

Date: 2026-06-01

## What Feels Generic

- The landing preview still reads partly like implementation status instead of a product story. It should show issue-tracking value, not just stack readiness.
- Many surfaces use the same border, radius, and background treatment, which makes the hierarchy feel assembled rather than designed.
- Some empty states and footer copy describe what is technically active instead of what the user can do next.

## Hierarchy Problems

- Sidebar, topbar, and content panels all carry similar visual weight. The main work surface should feel primary, while navigation should recede.
- Project and issue panels rely on bordered containers inside bordered containers, creating a harsh grid.
- Detail drawer metadata, labels, and comments are functional but need clearer grouping and calmer spacing.

## Spacing And Layout Issues

- The app is compact in the right direction, but repeated borders and dense section headers make it feel tighter than necessary.
- Empty states are centered and readable, but they can be softened with better icon containers and less dashed-border emphasis.
- Dialogs work well structurally; they need more refined overlay, padding, and surface treatment.

## Typography Issues

- Uppercase micro-labels are overused, which gives many sections the same voice.
- Page titles, card titles, and row titles are close in size and weight.
- Metadata and helper copy can be more concise and less implementation-oriented.

## Color And Token Issues

- The dark theme is aligned with the brand direction, but the app needs warmer charcoal depth and softer borders.
- Semantic chips exist, but status, priority, and label styling should feel more unified.
- Inputs and selects have good structure but need slightly calmer backgrounds and focus states.

## Component Consistency Issues

- Buttons, inputs, selects, pills, dialog surfaces, and list rows share patterns but not a strong shared visual language.
- Project rows and issue rows use similar containers but different interaction affordances.
- The issue drawer is a right-side panel while edit/create actions are centered dialogs; this is correct, but the visual treatments should feel related.

## Empty, Loading, And Error States

- Empty states exist for projects, issues, comments, and labels.
- Error states from actions are present and should be preserved.
- Loading and pending states exist on forms, but the visual language can be more consistent through button and input tokens.

## What Should Stay

- The current data flow and server actions are sound and should not be rewritten for visual polish.
- URL-backed project, issue, and filter state should stay.
- Plus-icon creation dialogs are the right direction for dense issue tracking.
- The dark app shell matches the user preference and the SuDo brand.
- The flower mark is restrained and should remain simple.

## Anti-vibecode Cleanup

Date: 2026-06-01

### Excessive Radius

- Main app panels, dialogs, landing preview cards, empty states, inputs, nav rows, and Clerk auth surfaces were using `rounded-2xl`, `rounded-[1.5rem]`, `rounded-[1.75rem]`, or larger custom radii.
- The repeated large radius made unrelated components feel like generic soft SaaS cards instead of a structured product interface.
- `rounded-full` should remain limited to avatars and tiny count badges. Labels/status/priority chips can be compact rounded rectangles.

### Generic Surface Treatment

- Panels used large radii plus heavy shadows, which made the UI look assembled from default AI/Tailwind dashboard patterns.
- Landing used a radial-gradient hero background and oversized preview framing. The product should feel darker, flatter, and more editorial.
- Sidebar active states were pill-shaped and shadowed, which made navigation look bubbly instead of precise.

### Spacing And Hierarchy

- The issue list benefits from table-like density. Row focus states should be compact and rectangular, not card-like.
- Filter bars should feel like a controlled toolbar, not a floating soft card.
- Settings should remain honest and minimal; it should not grow fake dashboard panels just to fill space.

### Cleanup Rules

- Base radius is now restrained. Small controls use `rounded-md` or `rounded-lg`; main panels use `rounded-xl` at most.
- Avoid `rounded-2xl`, `rounded-3xl`, and oversized custom radius values unless a future task explicitly justifies them.
- Avoid heavy shadows on routine product surfaces. Prefer thin borders, flatter charcoal surfaces, and subtle dividers.
- Avoid radial/glow/gradient backgrounds for app structure. If depth is needed, use a restrained linear wash or surface contrast.
- Preserve semantic compact badges for counts, labels, statuses, and priorities, but do not make every action or container pill-shaped.

### What Should Stay Unchanged

- URL-backed workspace, project, issue, and filter behavior.
- Plus-icon creation dialogs.
- Dark app shell and restrained flower mark.
- Server-side authorization and current data flows.
