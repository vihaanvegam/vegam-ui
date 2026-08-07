---
'@vegam-ui/ui': minor
---

Phase 1 layout primitives — five new components:

- `Box` — token-typed style primitive: padding/margin (side > axis > all
  precedence), `bg`, `radius`, `borderColor` (hairline border), `shadow`,
  polymorphic `as`; every prop responsive via per-breakpoint custom
  properties consumed by static CSS. Deliberately not an `sx` escape hatch.
- `Flex` — full flexbox container surface (`direction`, `wrap`, `align`,
  `justify`, `gap`, all responsive) plus flex-item props
  (`grow`/`shrink`/`basis`). Stack remains the simple one-axis primitive.
- `Grid` — responsive equal-width `columns` with token `gap`/`rowGap`/
  `columnGap`.
- `Container` — centered page shell: `size` caps at the viewport tier's
  `content-max`; inline padding follows the current breakpoint's
  `viewport.*.margin`.
- `Divider` — themed hairline rule; horizontal `<hr>` or vertical
  `role="separator"`; tones `subtle`/`default`/`accent`.

Also public: the token scale constants/types (`spaceSteps`, `radiusSteps`,
`surfaceKeys`, `borderColorKeys`, `elevationSteps`, `dividerTones` and their
union types). `ResponsiveObject` keys are now all optional — sparse objects
like `{ tablet: 4 }` apply from that bound upward. New `componentDefaults`
keys: `Flex.gap`, `Grid.gap`, `Container.size`, `Divider.tone`.
