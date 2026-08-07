# Screen-reader checklist — the manual 1.0 gate

This is the one accessibility check that cannot be automated, and it is the
last gate before 1.0 (BLUEPRINT §9). Work through it yourself; nothing in CI
can do it for you.

## Why this exists

A screen reader reads the page aloud to someone who cannot see it. It does not
read what is on screen — it reads the **accessibility tree**, the structured
description the browser builds from your markup and ARIA attributes. Two
buttons that look identical can sound completely different, and a control that
works perfectly with a mouse can be silent, mislabelled, or unreachable.

The automated checks in this repo (axe via `vitest-axe`, the Storybook a11y
addon, `eslint-plugin-jsx-a11y`) catch **violations of rules** — a missing
label, a bad contrast ratio, an invalid ARIA combination. They cannot catch
whether the result makes _sense_: whether "button, collapsed, Reports" tells a
person what will happen, whether focus lands somewhere useful after a dialog
closes, or whether an update is announced at a moment that helps rather than
interrupts. Only listening tells you that.

Shipping 1.0 means the API is a promise under semver. This pass is how you find
out whether the promise is worth making.

## Setup

### NVDA (Windows — your primary)

Free, from [nvaccess.org](https://www.nvaccess.org/download/). Use it with
**Firefox or Chrome**.

| Action                       | Keys                                     |
| ---------------------------- | ---------------------------------------- |
| Start NVDA                   | `Ctrl` + `Alt` + `N`                     |
| Quit NVDA                    | `NVDA` + `Q`                             |
| **The `NVDA` key**           | `Insert` (or `CapsLock` if you set that) |
| Stop talking (panic button)  | `Ctrl`                                   |
| Read next thing              | `↓`                                      |
| Read current line again      | `NVDA` + `↑`                             |
| Next heading / button / link | `H` / `B` / `K`                          |
| Next form field / landmark   | `F` / `D`                                |
| List everything on the page  | `NVDA` + `F7`                            |
| Toggle browse ↔ focus mode   | `NVDA` + `Space`                         |

**Browse mode vs focus mode is the thing that confuses people first.** In
browse mode, arrow keys move a reading cursor through the page and single
letters are navigation shortcuts. In focus mode, keys go to the control you are
in, so you can actually type. NVDA switches automatically when you Tab into a
text field; if typing produces navigation instead of letters, press
`NVDA` + `Space`.

### VoiceOver (macOS — for the second pass)

Built in. Use it with **Safari**, which is the pairing real users have.

| Action                | Keys                 |
| --------------------- | -------------------- |
| Start/stop VoiceOver  | `Cmd` + `F5`         |
| **The `VO` keys**     | `Control` + `Option` |
| Next item             | `VO` + `→`           |
| Interact with a group | `VO` + `Shift` + `↓` |
| Stop interacting      | `VO` + `Shift` + `↑` |
| Activate              | `VO` + `Space`       |
| The rotor (jump list) | `VO` + `U`           |
| Read from here        | `VO` + `A`           |

## How to run the pass

1. `pnpm --filter @vegam-ui/ui storybook` and open <http://localhost:6006>.
2. For each component below, open the story named in its row.
3. **Click the "Open canvas in new tab" button** (the ⤢ icon in the toolbar)
   first. Storybook's own UI is a page of its own, and testing inside the docs
   iframe means you are listening to Storybook's chrome as much as the
   component.
4. Start the screen reader, put focus at the top of the page, and follow the
   steps.
5. **Close your eyes, or turn the monitor off.** This sounds theatrical; it is
   the only way to notice that an announcement is ambiguous. If you are reading
   the screen you will fill in the gaps without realising.
6. Record the result in the table at the bottom.

Expected announcements below are written as _meaning_, not verbatim text —
NVDA and VoiceOver word things differently, and both change between versions.
Judge whether a person would understand, not whether the words match.

---

## Forms

### Button

Story: **Components/Button → Primary**

1. `Tab` to it. → Hear the label, then "button". _("Button, button" is fine —
   the label happens to be the word.)_
2. `Space`, then `Enter`. → Both activate it.
3. Go to the **Disabled** story and `Tab`. → Focus **skips** the disabled
   button entirely. (Native `disabled` removes it from the tab order — that is
   intended. If you need it announced as present-but-unavailable, that is
   `aria-disabled`, which this library does not use.)

### IconButton

Story: **Components/IconButton → Default**

1. `Tab` to it. → Hear **the `aria-label` text**, then "button". You must never
   hear just "button" — the glyph is CSS and says nothing.
2. Confirm the name describes the **action** ("Delete"), not the picture
   ("trash icon").

### Input

Story: **Components/Input → Default**, then **Invalid**

1. `Tab` in. → Hear the label, "edit", and the current value (or "blank").
2. Type. → Hear the characters. If you hear navigation instead, press
   `NVDA` + `Space`.
3. In **Invalid**: → Hear "invalid entry" along with the label, and hear the
   error message as part of the field's description.
4. In the **Field** stories (Components/Field): click the visible **label
   text**. → Focus moves into the input. Then Tab in and confirm you hear the
   label, the description, **and** the error, all without leaving the field.

### Textarea

Story: **Components/Textarea → Default**

1. `Tab` in. → Hear the label and "edit, multiline".
2. Type several lines in the **Autosize** story. → It grows; the announcement
   does not repeat the whole value on every keystroke.

### Checkbox

Story: **Components/Checkbox → WithLabels**, then **Indeterminate**

1. `Tab` to it. → Hear the label, "check box", and "not checked".
2. `Space`. → Hear "checked". `Space` again → "not checked".
3. In **Indeterminate**: → Hear "**half checked**" / "mixed". This is the one
   most likely to fail, because `indeterminate` is a DOM property rather than
   an attribute — if you hear plain "not checked", that wiring has regressed.
4. Click the **label text**. → It toggles.

### Radio / RadioGroup

Story: **Components/RadioGroup → Default**

1. `Tab` into the group. → Hear the **group's** label (the legend), then the
   selected option, "radio button", and **"1 of 3"**. The position is the part
   people rely on.
2. `↓` / `↑`. → Selection **moves with focus** and each option is announced.
3. `Tab` again. → Focus leaves the whole group, not just the option. (One tab
   stop per group is correct.)

### Switch

Story: **Components/Switch → Default**

1. `Tab` to it. → Hear the label and its state ("on"/"off", or
   "pressed"/"not pressed").
2. `Space`. → The new state is announced. You should not have to look to know
   which way it went.

### Slider

Story: **Components/Slider → Default**

1. `Tab` to it. → Hear the label, "slider", and the current value.
2. `→` / `←`. → Each step announces the new value.
3. `Home` / `End`. → Jumps to min / max, both announced.
4. `PageUp` / `PageDown`. → Larger jump, announced.
5. If the story sets `aria-valuetext`, → hear the **formatted** value ("£40",
   "Medium"), not the raw number.

### Select

Story: **Components/Select → Default**

1. `Tab` to the trigger. → Hear the label, the current value (or the
   placeholder), "combo box"/"button", and "collapsed".
2. `Enter` or `↓`. → Hear "expanded" and the first option, with **"1 of N"**.
3. `↓` repeatedly. → Each option announced, with its position. **Disabled
   options are skipped.**
4. Type the first letters of an option. → It jumps there.
5. `Enter` **or `Space`**. → Commits, hear "collapsed" and the new value.
   ⚠ Space commits rather than continuing type-ahead — verify that is what you
   hear, because it means an option label starting with a space is unreachable
   by typing.
6. `Escape`. → Closes with the value **unchanged**, and focus is back on the
   trigger.

---

## Overlays

### Modal

Story: **Components/Modal → Small**

1. Activate the trigger. → Hear "dialog", then the **title**, then the
   **description**. If you only hear "dialog", the labelling has broken.
2. `Tab` repeatedly, more times than there are controls. → Focus **cycles
   inside the dialog** and never reaches the page behind it. `Shift`+`Tab`
   cycles backwards the same way.
3. In browse mode, `↓` past the end of the dialog. → You should not be able to
   read the page underneath.
4. `Escape`. → Closes, and **focus returns to the element that opened it**.
   Confirm by pressing `Enter` immediately — it should reopen the dialog.
5. Reopen and close with the **close button**. → Focus restores the same way.
6. In **Danger**: the icon must add nothing to the announcement — the title
   carries the meaning.

### Drawer

Story: **Components/Drawer → Right**

Same five checks as Modal: named on open, focus trapped, Escape closes, focus
restored, background unreadable.

### Popover

Story: **Components/Popover → Default**

1. `Tab` to the trigger. → Hear "button" and "collapsed".
2. `Enter`. → Hear "expanded", and focus moves **into** the popover.
3. `Escape`. → Closes; focus back on the trigger.
4. `Tab` out instead of pressing Escape. → It dismisses and focus continues
   sensibly — it must not jump to the top of the page.

### Tooltip

Story: **Components/Tooltip → Default**

1. `Tab` to the trigger. → Hear the trigger's own name **and** the tooltip
   text (it is wired as a description).
2. `Escape` while it is showing. → It hides.
3. ⚠ Confirm the tooltip is **not the only** source of the name. A control
   whose meaning exists only in a tooltip is unusable on touch devices.

### Menu

Story: **Components/Menu → Default**

1. `Tab` to the trigger, `Enter`. → Hear "menu" and the first item, with its
   position.
2. `↓` / `↑`. → Each item announced; **disabled items skipped**.
3. Type a letter. → Jumps to a matching item.
4. `Escape`. → Closes, focus back on the trigger.
5. **Open it with the mouse, then immediately press `↓` without touching the
   mouse again.** → Arrow keys must work. This exact path was broken once: a
   pointer-opened menu left focus on the trigger while the key handler lived on
   the portalled surface, so the menu was completely keyboard-dead while
   looking fine.

### Toast

Story: **Components/Toast → Default**

1. Trigger a toast **without moving focus**. → It is announced on its own.
   `success`/`info` should wait for a pause; `warning`/`danger` interrupt.
2. Confirm focus **does not move** to the toast — an interruption that steals
   focus loses the user's place.
3. `Tab` to the toast's action or close button. → Reachable, and named.
4. Trigger several. → Each is announced; they do not talk over each other into
   nonsense.

---

## Navigation

### Link

Story: **Components/Link → Default**, then the new-tab story

1. `Tab` to it. → Hear the text, then "link".
2. On the new-tab variant → hear "**opens in a new tab**" as part of the name.
   Listen for a run-together word like "Docsopens" — the accessible-name
   algorithm trims each element's text, so the separator has to be its own text
   node. That bug shipped once.

### Tabs

Story: **Components/Tabs → Default**

1. `Tab` into the tab list. → Hear the selected tab, "tab", "selected", and
   **"1 of 3"**.
2. `→` / `←`. → Move between tabs. With automatic activation the panel changes
   as you move; with manual, you hear the tab and must press `Enter`/`Space`.
3. `Tab` once more. → Focus goes to the **panel**, not to the second tab. One
   tab stop for the whole list is correct.
4. Confirm the panel is associated with its tab (you hear the tab's name when
   entering the panel).

### Accordion

Story: **Components/Accordion → Default**

1. `Tab` to a header. → Hear the label, "button", and "**collapsed**".
2. `Enter`. → Hear "expanded", and the content becomes readable with `↓`.
3. Collapse it, then `↓` through the page. → The hidden content must **not** be
   readable.

### Breadcrumbs

Story: **Components/Breadcrumbs → Default**, then **Collapsed**

1. Press `D` (landmarks) in NVDA. → You reach a navigation landmark. It should
   have a name — if you hear a bare "navigation", add
   `aria-label="Breadcrumb"`.
2. `↓` through the trail. → Hear each crumb as a link. The chevrons must be
   **silent**.
3. On the last crumb → hear "**current page**".
4. In **Collapsed**: `Tab` to the overflow trigger. → It has a real name from
   `overflowLabel`, never just "button". `Enter` expands the trail.

### Pagination

Story: **Components/Pagination → Default**

1. `↓` through it. → Hear a navigation landmark, then the page links.
2. The current page → announced as "current page".
3. Previous/Next → named as actions, and announced as **disabled** at the ends.
4. The ellipsis gap → silent, or announced as a non-interactive gap.

---

## Content & status

### Banner

Story: **Components/Banner → AllIntents**, then **Dismissible**

1. Load the page with a banner already present. → It is read **in document
   order**, not announced. (Live regions announce _changes_; something present
   at load has not changed. This is correct behaviour, not a bug.)
2. Render one in response to an action. → `info`/`success` are announced
   politely; `warning`/`danger` interrupt.
3. In **Dismissible**: `Tab` to the close button. → It has the name from
   `closeLabel`. Never a bare "button".
4. The leading icon must add nothing to the announcement.

### Table

Story: **Components/Table → Sortable**

1. `T` (NVDA) to jump to the table. → Hear its dimensions.
2. `Ctrl`+`Alt`+arrows to move between cells. → Each cell announces its
   **column header** as you move across, and the row header as you move down.
3. `Tab` to a sortable column header. → Hear the column name, "button", and
   the current sort state ("ascending"/"descending"/"not sorted").
4. `Enter`. → The new sort state is announced. If sorting is silent, a
   non-visual user cannot tell it happened.

### Chip

Story: **Components/Chip → Removable**

1. `Tab` to the remove control. → It is named with the **chip's label**
   ("Remove Design"), not a bare "remove".
2. Activate it. → Confirm focus goes somewhere sensible rather than to the top
   of the page.

### Progress / Spinner / Skeleton

Stories: **Components/Progress → Default**, **Spinner**, **Skeleton**

1. Progress → announced with its value or as "busy"; a determinate bar reports
   a percentage.
2. Spinner → conveys "loading"/"busy" **once**. It must not chatter.
3. Skeleton → **silent**. It is a placeholder; announcing it is noise.

### Avatar

Story: **Components/Avatar → Default**

1. With an image → hear meaningful alt text (the person's name), not a
   filename.
2. Initials-only fallback → the name is still available, or the avatar is
   hidden and the name is adjacent text.

### Static presentation

`Text`, `Badge`, `Card`, `Divider`, `Box`, `Flex`, `Grid`, `Container`,
`Stack`, `Blanket` — read a page using them and confirm:

- Headings from `Text as="h*"` appear under `NVDA`+`F7` in a sensible order,
  with **no skipped levels**.
- Badges are read as part of the surrounding text, and their text states the
  status (never colour alone).
- Layout primitives add **no** announcements of their own.
- Reading order matches visual order — flex/grid must not have reordered
  anything.

---

## Cross-cutting checks

Do these once, on a page that combines several components.

- [ ] **Tab through the entire page.** Focus is always visible, order matches
      the visual order, and nothing is unreachable or lands somewhere invisible.
- [ ] **No keyboard traps** other than the intentional ones in Modal/Drawer,
      which Escape always releases.
- [ ] `NVDA`+`F7` element list: every button and link has a name that makes
      sense **out of context** ("Delete project", not "Click here").
- [ ] Switch to dark mode. → Nothing changes in the announcements.
- [ ] Zoom the browser to 200% and set text size larger. → Content reflows,
      nothing is clipped, and nothing becomes unreachable.
- [ ] Turn on **Reduce Motion** in the OS. → Transitions collapse; no
      component depends on an animation to make sense.
- [ ] Windows **High Contrast** mode. → Controls, focus rings, and checkbox
      and radio states are all still visible. (This is where CSS-drawn glyphs
      most often disappear.)

## Recording the result

| Area                | NVDA + Firefox | VoiceOver + Safari | Notes |
| ------------------- | -------------- | ------------------ | ----- |
| Button, IconButton  |                |                    |       |
| Input, Textarea     |                |                    |       |
| Checkbox, Radio     |                |                    |       |
| Switch, Slider      |                |                    |       |
| Select              |                |                    |       |
| Field wiring        |                |                    |       |
| Modal, Drawer       |                |                    |       |
| Popover, Tooltip    |                |                    |       |
| Menu                |                |                    |       |
| Toast               |                |                    |       |
| Link, Tabs          |                |                    |       |
| Accordion           |                |                    |       |
| Breadcrumbs         |                |                    |       |
| Pagination          |                |                    |       |
| Banner              |                |                    |       |
| Table               |                |                    |       |
| Chip, Avatar        |                |                    |       |
| Progress/Spinner    |                |                    |       |
| Static presentation |                |                    |       |
| Cross-cutting       |                |                    |       |

**When something fails**, write down the component, the exact keys, what you
heard, and what you expected. That is enough to reproduce it. File it, fix it
with a regression test, and re-run only that row.

**When it all passes**, that is the last 1.0 gate: bump the versions per
[RELEASING.md](RELEASING.md) and record the pass (screen-reader and browser
versions, and the date) in DECISIONS.md — the next person needs to know what
was actually tested, not just that "a pass happened".

---

Cross-references: [BLUEPRINT.md](BLUEPRINT.md) §9 (1.0 criteria) ·
[COMPONENT_RECIPE.md](COMPONENT_RECIPE.md) (the a11y rules each component is
built to) · [REMAINING.md](REMAINING.md) §3.2 (why this stays manual) ·
[RELEASING.md](RELEASING.md) (shipping once it passes).
