# SuDo Design System

## Direction Study

### 1. Terminal Ledger

A dense, near-monochrome operations interface with table-first layouts, mono metadata, hard dividers, and minimal decorative depth. Strong for issue throughput, but too severe for the public landing page and workspace onboarding.

### 2. Luminous Command Deck

Linear-style application density paired with a restrained acid-lime primary action, indigo focus accents, deep layered surfaces, and a cinematic product preview. The signed-in app stays precise while the landing page carries more visual depth.

### 3. Editorial Instrument Panel

Larger typography, asymmetric page composition, and Attio-like data panels. Distinctive, but less efficient for repeated issue scanning and compact project management.

## Selected Direction

**Luminous Command Deck** is the selected direction. It combines:

- Linear's compact issue-tracking hierarchy.
- Raycast's command-center focus and fast interaction feedback.
- Vercel and Attio's neutral surface discipline.
- Manus's strong left rail and contextual work area.
- Aceternity and Componentry's depth and motion on the public landing page.
- Huashu's direction-first workflow and critique criteria.

The previous redesign relied primarily on color, radius, and card treatment. This pass changes composition, shell structure, information hierarchy, reusable primitives, density, and interaction states together.

## Tokens

### Color

| Role | Value |
| --- | --- |
| Canvas | `#08090a` |
| Navigation / card | `#0f1011` |
| Elevated surface | `#161718` |
| Hairline border | `#23252a` |
| Secondary border | `#323334` |
| Input surface | `#383b3f` |
| Muted text | `#62666d` |
| Secondary text | `#8a8f98` |
| Tertiary text | `#d0d6e0` |
| Primary text | `#f7f8f8` |
| Primary action | `#e4f222` |
| Focus accent | `#5e6ad2` |
| Success | `#27a644` |
| Destructive | `#eb5757` |
| Informational | `#02b8cc` |

Acid lime is reserved for the primary action on a screen. Indigo carries selection, links, keyboard focus, and secondary emphasis.

### Typography

- UI: Inter with system sans fallbacks.
- Technical metadata: Geist Mono with system monospace fallbacks.
- UI weights: 400-600 only.
- Headings use compact line-height and neutral tracking.
- Issue IDs, routes, dates, counts, and keyboard hints use mono styling.

### Spacing

- Base unit: `4px`.
- Common control gaps: `6px`, `8px`, `12px`.
- Panel padding: `16px` compact, `20px` standard, `24px` spacious.
- Page section gap: `20px` mobile, `24px` desktop.
- Dense list rows target `48-60px`.

### Shape

- Buttons and inputs: `6px`.
- Cards and panels: `12px`.
- Badges: `4px`.
- Pills only for compact statuses, labels, and avatars.

### Surfaces And Elevation

- Canvas is layered with quiet radial light and optional low-opacity grid.
- App panels use `#0f1011`, a `#23252a` border, and a subtle inset highlight.
- Elevated drawers and dialogs use `#161718` with stronger border contrast.
- Shadows are low spread and dark. Glows are limited to landing visuals and focused primary actions.
- Nested cards are avoided. Internal sections use dividers and tonal changes.

## Component Rules

- `PageHeader`: title, compact supporting metadata, and one primary action.
- `AppPanel`: shared bordered surface with optional header and divided content.
- `EmptyState`: concise, action-oriented, and visually quiet.
- `SidebarItem`: fixed-height row, icon, label, plain count, and indigo active marker.
- `WorkspacePill`: compact identity row with restrained selected state.
- `StatusBadge`, `PriorityBadge`, and `LabelChip`: semantic color through border/text rather than bright fills.
- Inputs use a dark neutral surface, visible focus ring, and stable control height.
- Dialogs and drawers use direct hierarchy, restrained radius, and clear action grouping.
- Destructive red appears only in destructive actions and the danger zone.

## Motion

- Default transition duration: `140-180ms`.
- Hover elevation: at most `translateY(-2px)` with a small shadow increase.
- Buttons may compress to `scale(0.98)` on active.
- Sidebar and list selection changes use color/border transitions only.
- Landing preview may use CSS perspective, reveal, and ambient motion.
- Respect `prefers-reduced-motion`; no essential behavior depends on animation.

## Macbook Preview

The landing page uses a local CSS/Tailwind Macbook-style frame with a realistic React-rendered SuDo dashboard. It does not require Framer Motion or an external image. The preview includes a workspace rail, project navigation, issue rows, statuses, priorities, labels, and a contextual comment panel, and collapses safely on narrow screens.
