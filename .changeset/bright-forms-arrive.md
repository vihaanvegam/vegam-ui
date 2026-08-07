---
'@vegam-ui/ui': minor
---

Phase 2 forms — seven new components plus field wiring for the existing
controls:

- `Field` — label/description/error wiring around exactly one control via a
  new `FieldContext` (+ public `useField()` for custom controls). Error
  presence drives `aria-invalid`; `required` renders a consumer-provided
  marker slot and sets `aria-required`. **Input, Checkbox, and Select now
  read the context automatically** (id, `aria-describedby`, `aria-invalid`,
  `aria-required`, `disabled`) — additive; explicit props always win.
- `IconButton` — Button's square sibling, composing Button's variant classes;
  the accessible name (`aria-label` or `aria-labelledby`) is required at the
  type level. Default variant `ghost`.
- `Textarea` — Input's multi-line sibling; `minRows`/`maxRows` opt into
  content-tracking autosize (fixed `rows` otherwise).
- `Radio` + `RadioGroup` — native radios with a drawn appearance (checked
  ring on the `border-width.selected` token; forced-colors falls back to
  native); the group owns selection (controlled/uncontrolled), name, size,
  and disabled.
- `Switch` — a native checkbox with `role="switch"`, track/thumb drawn on
  the input from the `size.switch-track-*` tokens.
- `Slider` — APG slider: drag via new framework-free `utils/drag.ts`
  (pointer capture), keyboard steps, step snapping, hidden form input via
  `name`, component-custom-property geometry. Widget ARIA
  (`aria-valuetext`, `aria-errormessage`, and the label/description props)
  is routed to the `role="slider"` thumb; the ref forwards there too, while
  everything else spreads on the root. `aria-orientation` is omitted from the
  props — this slider is horizontal-only. A wrapping Field's `required` is
  deliberately not forwarded, since `aria-required` is unsupported on the
  `slider` role.

New `componentDefaults` keys: `IconButton` (variant, size), `Textarea`
(size), `Radio` (size).
