# Styling

Use Tailwind CSS utilities first for layout, typography, spacing, sizes, colors, borders, focus, and interaction states. Arbitrary values and CSS-variable utilities count as supported Tailwind features; do not recreate them as vanilla CSS classes.

When utilities cannot define a behavior, put the smallest necessary CSS in the owning Vue component's `<style scoped>`. Custom keyframe definitions and their animation references stay together there because Vue scopes the keyframe names. Current exceptions are the SVG hold-border dash-offset animation in WallHoldButton and the hand hint in WallHoldCue. Reduced motion uses a static hold outline and disables decorative motion.

`app/assets/css/main.css` contains the Tailwind import/theme and global document rules that cannot be scoped to a component, such as html/body/Nuxt-root sizing. Do not put wall/card/control styles there. Use `@apply` for supported global utilities rather than rewriting their declarations.

Keep class names complete and statically discoverable by Tailwind. Prefer a small reusable component for repeated markup/interaction, as with WallHoldButton; avoid opaque class generators, barrel files, and arbitrary CSS abstractions.

## Canvas and spacing

At 2304 × 1344, six equal 350 × 510.72 px cards occupy a grid with 52 px outer insets and 20 px gaps. Header, interaction, footer, and dividers use the same grid. Center each column's text and controls; reserve consistent title/description space so different languages keep comparable alignment.

KioskStage resolves canonical dimensions to `--wall-…-x/y` length variables. Use Tailwind such as `w-(--wall-flag-width-x)` and `px-(--wall-inset-x)`; use `calc(N*var(--wall-x/y))` for internal presentation dimensions. Horizontal dimensions and font sizes scale with canvas width; vertical spacing scales with canvas height.

- Main labels: 24 logical px padding; portrait photo frames: 12 px horizontal inset, with a bottom area for the counter.
- Header/footer text: 28 logical px horizontal padding.
- Flags: 56 × 44 logical px hit area, 40 × 26 px artwork with object-contain. The 232 × 60 px bar has 12 px horizontal / 8 px vertical padding and 20 px gaps, an absolute overlay centered inside the idle card 48 px above its bottom. It occupies no layout space and is hidden in submenu/carousel; all content uses the full card.
- Main labels: 32 px without numbered badges; header titles: 28 px; descriptions: 18 px; submenu labels: 24 px.
- Carousel arrows: 44 × 44 px at the full card midpoint, 20 px from either side. Back is also 44 × 44 px.
- Outer card corners: 14 logical px. Main, submenu, and carousel content fill the card and inherit/clip to the outer radius; internal submenu dividers stay square. Tailwind radius properties scale x/y independently, matching SVG outline arcs. Hold outlines are inset 2 px with a 4 px stroke, normalized with pathLength, and animated alongside an emerald inset box-shadow overlay using HOLD_DURATION_MS from the hold utility. They are visual overlays without their own input/timers.

The current card revision uses wall-v2 geometry. Internal typography/padding may change without moving hit areas. If any interactive target changes position or size, update the canonical JSON, bump the layout version, and coordinate Sensor Service. Verify target geometry, wrapping, column equality, and centering at both documented viewports after changes.

References checked through Context7: [Tailwind arbitrary values](https://tailwindcss.com/docs/adding-custom-styles), [Tailwind variants](https://tailwindcss.com/docs/hover-focus-and-other-states), and [Vue scoped CSS](https://vuejs.org/api/sfc-css-features).

SVG stroke normalization: [MDN pathLength](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/pathLength).
