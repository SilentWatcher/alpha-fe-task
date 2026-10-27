# Design frames

These are exported frames from the running application at 1440×900 (and 1024×900 for the
responsive set). They cover the eight required screens from the brief, plus three supporting
states.

| File | Required frame | Notes |
| --- | --- | --- |
| `01-table-default.png` | Default Table View | All seven columns, 10 supplied contacts |
| `02-board-default.png` | Board View | All four stage columns and live counts |
| `03-table-details.png` | Table with details panel open | Maya Chen selected, saved values |
| `04-board-details.png` | Board with details panel open | Underlying board and selection preserved |
| `05-unsaved-changes.png` | Unsaved changes state | Draft stage is Customer; saved card remains in Prospect |
| `06-stage-dropdown.png` | Open Stage dropdown | Keyboard-accessible custom listbox |
| `07-empty-lead.png` | Empty Lead column | Lead count is 0 with the restrained empty state |
| `08-responsive-1024.png` | Responsive layout at 1024px | Icon-rail sidebar and horizontally scrollable table |
| `09-responsive-1024-board.png` | Supporting | 1024px board with all four columns |
| `10-responsive-1024-details.png` | Supporting | 1024px table with the details drawer |
| `11-new-contact-unsaved.png` | Supporting | New-contact draft state with “New contact not saved” |

The source of truth is the running app in the repository root. Regenerate the screenshots
against the dev server (`npm run dev`) if the visual system changes.
