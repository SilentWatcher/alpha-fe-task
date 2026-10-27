# Alpha Contacts

A premium-feeling contacts workspace for the Alpha SaaS product, built as a realistic
React + TypeScript implementation of the design brief. It includes synchronized Table and
Board views, a draft-based details drawer, search/filter/sort, and the supplied 10-contact
dataset.

## Run locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # type-check + production build
npm run preview   # preview the production build
```

## Design frames

The eight required screens are exported at 1440×900, with supporting 1024px and
new-contact states, in [`docs/frames`](docs/frames). See
[`docs/frames/README.md`](docs/frames/README.md) for the frame-by-frame mapping.

Because Figma is not available in this environment, the deliverable is the running React app
plus these exported frames rather than a `.fig` file. The app itself is the connected
prototype: views, selection, dropdowns, save/cancel, and discard confirmation all work.

## Views and interactions

- **Table** — compact rows with sticky name column, row hover/focus states, em dashes for
  missing values, and horizontal scrolling when the viewport can't hold every column.
- **Board** — Lead / Prospect / Qualified / Customer columns with live counts, compact
  cards, an intentionally empty Lead column on first load, and horizontal scrolling when
  the details panel is open.
- **Details drawer** — opens from either view and preserves the current view behind it.
  All fields are editable, labels can be added/removed, Stage is a keyboard-accessible
  custom select, and Notes live only in the drawer.
- **Draft editing** — input changes stay in a separate draft until saved. The amber
  `Unsaved changes` bar appears as soon as the draft diverges from the saved record.
  `Save changes` commits to the shared contact state and updates both views in place.
  `Cancel` reverts the draft (and keeps the drawer open in edit mode). Closing with a dirty
  draft asks before discarding.
- **Add contact** — available from the header and from each board column. New contacts are
  added to the shared state and surfaced first under the default “Recently added” sort, so
  they immediately appear in both views. The default stage is Lead.
- **Workspace** — search, stage filtering, sorting by recency/name/company/stage, and a
  functional workspace switcher.
- **Responsive** — the sidebar collapses to an icon rail below 1180px, controls compact,
  the table scrolls horizontally, and the board remains readable at 1024px wide.

### Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl K` | Focus search |
| `Enter` / `Space` on a table row | Open contact |
| `Esc` | Close menu, drawer, or discard dialog |
| `⌘S` / `Ctrl S` | Save drawer changes |

## Architecture

`src/App.tsx` owns the single source of truth (`Contact[]`) plus the active editor state.
The editor carries its own draft:

```ts
type EditorState =
  | { mode: 'edit'; id: string; draft: ContactDraft }
  | { mode: 'create'; draft: ContactDraft }
```

`dirty` is derived by comparing the draft with the saved contact, so repeated edits,
view switches, and re-renders cannot create stale or duplicate records. Saving updates the
contact by id; creating assigns a UUID. Drafts are normalized (trimmed, de-duplicated
labels) before they are committed.

Handling unsaved edits while switching contacts or closing is centralized through a
`PendingAction`, which drives the discard confirmation dialog. Focus returns to the
selected row/card when the drawer closes.

## Design system

- Warm neutral canvas (`#f6f6f3`), white surfaces, fine `#e7e7e1` borders.
- Rem-based sizing, typography, spacing, radii, and shadows throughout — no `px` literals in
  component styles. The sidebar and drawer breakpoints are `73.75rem` and `57.5rem`.
- Inter with tight tracking for headings and tabular numerals for counts.
- Restrained stage palette: neutral Lead, sky Prospect, violet Qualified, emerald Customer.
- Compact primitives in `src/components/Primitives.tsx`: deterministic initials avatars,
  stage badges, label chips, logo mark.
- Shared select menu, toast, confirmation dialog, and table/board cards keep spacing,
  typography, and states consistent across both views.

## Files

```
src/
  App.tsx                    app state, filtering, editor/save logic
  components/
    Header.tsx               title, search, filter, sort, view switch, add
    Sidebar.tsx              workspace nav and workspace switcher
    TableView.tsx            table, sticky column, overflow affordance
    BoardView.tsx            kanban columns, cards, empty states
    ContactDrawer.tsx        draft form and validation
    SelectMenu.tsx           accessible stage/owner popover
    ConfirmDialog.tsx        discard-changes dialog
    Toast.tsx                lightweight status feedback
    Primitives.tsx           avatar, badge, chip, logo
  lib/
    data.ts                  supplied dataset and empty draft
    types.ts                 contact types and design tokens
    utils.ts                 derivation, formatting, validation
  index.css                  Tailwind theme, base styles, motion
```

Data is held in memory for the demo; reloading resets to the supplied dataset. This is
intentional so the prototype always starts from a known state.
