---
'@vegam-ui/ui': minor
---

Add `Breadcrumbs`, `Modal`, and `Blanket`. Breadcrumbs renders a trail from
`items` data with a collapsible middle (overflow trigger), per-item icons,
opt-in label truncation, and a `slots.link` render prop for router links.
Modal is a controlled dialog (sizes sm–fullscreen, appearance icon tints,
consumer footer/icon) with focus trap, scroll lock, Escape/blanket/close
dismissal, focus restore, and theme-scoped portaling. Blanket — the scrim
Modal composes — is also exported standalone. Ships `breadcrumbsClasses`,
`modalClasses`, `blanketClasses`, full `slotProps` surfaces, and
theme-defaultable `Modal.size`/`Modal.appearance`.
