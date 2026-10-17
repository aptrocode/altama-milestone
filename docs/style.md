# Styling

Use Tailwind CSS utilities first for layout, typography, spacing, sizes, colors, borders, focus, and interaction states. Arbitrary values and CSS-variable utilities count as supported Tailwind features; do not recreate them as vanilla CSS classes.

When utilities cannot define a behavior, put the smallest necessary CSS in the owning Vue component's `<style scoped>`. Custom keyframe definitions and their animation references stay together there because Vue scopes the keyframe names. Current exceptions are the SVG hold-border dash-offset animation in WallHoldButton and the wave light sweeps/corner glow keyframes in KioskBackground. Both are disabled under reduced motion. Reduced motion uses a static hold outline and disables decorative motion.

`app/assets/css/main.css` contains the Tailwind import/theme (wall colors `wall-night`, `wall-navy`, `wall-panel`, `wall-glow`, `wall-ink`; `font-sans` Roboto Condensed and `font-display` Oswald) and global document rules that cannot be scoped to a component, such as html/body/Nuxt-root sizing. Do not put wall/card/control styles there. Use `@apply` for supported global utilities rather than rewriting their declarations.

Keep class names complete and statically discoverable by Tailwind. Prefer a small reusable component for repeated markup/interaction, as with WallHoldButton; avoid opaque class generators, barrel files, and arbitrary CSS abstractions.

## Canvas and spacing

KioskStage defines `--wall-x`/`--wall-y` (one logical pixel horizontally/vertically). Components position geometry with `rectStyle(rect, origin)` from `app/data/installation-layout.ts`, which emits `calc(N * var(--wall-x/y))` lengths straight from the canonical JSON, and use `calc(N*var(--wall-x/y))` utilities for internal presentation sizes. Horizontal dimensions and font sizes scale with canvas width; vertical spacing scales with canvas height.

- Columns: 360 px wide, 32 px insets, 16 px gaps. Idle frame 360 × 642 at y 394 with 14 px corners; open card 330 × 524 at y 480 with 46 px corners.
- Title pills: 336 × 98 with an 84 px icon ring and 31 px Oswald label; idle at y 410, open at y 258 (top transition).
- Flags: 64 × 48 hit areas with 48 × 32 artwork in a 262 × 62 bar at y 954 (20 px below the last tile, 20 px above the frame edge).
- Open card: photo frame 262 × 144 at card offset (34, 35); 44 px arrow targets with 34 px white circles; 112 × 40 page tabs at y 675; body text 14.5 px bold (14 px for long stories) from card offset 254 (with tabs), 196 (photo only), or 44 (text only).
- Never use `border` on a frame, card, bar, or other element that contains or is a sensor target: borders shift absolutely positioned children. Use `ring-*` or inset box-shadows.
- Hold outlines are inset 2 px with a 4 px stroke, normalized with pathLength, and animated alongside a blue inset box-shadow overlay using HOLD_DURATION_MS from the hold utility. They are visual overlays without their own input/timers.

The current revision uses wall-v4 geometry. Internal typography/padding may change without moving hit areas. If any interactive target changes position or size, update the canonical JSON, bump the layout version, and coordinate Sensor Service. Verify target geometry, wrapping, and column independence at both documented viewports after changes.

References checked through Context7: [Tailwind arbitrary values](https://tailwindcss.com/docs/adding-custom-styles), [Tailwind variants](https://tailwindcss.com/docs/hover-focus-and-other-states), and [Vue scoped CSS](https://vuejs.org/api/sfc-css-features).

SVG stroke normalization: [MDN pathLength](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/pathLength).
