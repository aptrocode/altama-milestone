# Styling

Use Tailwind CSS utilities first for layout, typography, spacing, sizes, colors, borders, focus, and interaction states. Arbitrary values and CSS-variable utilities count as supported Tailwind features; do not recreate them as vanilla CSS classes.

When utilities cannot define a behavior, put the smallest necessary CSS in the owning Vue component's `<style scoped>`. Custom keyframe definitions and their animation references stay together there because Vue scopes the keyframe names. Current exceptions are the SVG hold-border dash-offset animation in WallHoldButton and the wave light sweeps/corner glow keyframes in KioskBackground. Both are disabled under reduced motion. Reduced motion uses a static hold outline and disables decorative motion.

`app/assets/css/main.css` contains the Tailwind import/theme (wall colors `wall-night`, `wall-navy`, `wall-panel`, `wall-glow`, `wall-ink`; `font-sans` and `font-display` both Roboto) and global document rules that cannot be scoped to a component, such as html/body/Nuxt-root sizing. Do not put wall/card/control styles there. Use `@apply` for supported global utilities rather than rewriting their declarations.

Keep class names complete and statically discoverable by Tailwind. Prefer a small reusable component for repeated markup/interaction, as with WallHoldButton; avoid opaque class generators, barrel files, and arbitrary CSS abstractions.

## Canvas and spacing

KioskStage defines `--wall-x`/`--wall-y` (one logical pixel horizontally/vertically). Components position geometry with `rectStyle(rect, origin)` from `app/data/installation-layout.ts`, which emits `calc(N * var(--wall-x/y))` lengths straight from the canonical JSON, and use `calc(N*var(--wall-x/y))` utilities for internal presentation sizes. Horizontal dimensions scale with canvas width and vertical spacing with canvas height. Font sizes use `--wall-u` (`min(--wall-x, --wall-y)`), so text never outgrows its box on screens whose aspect ratio differs from the LED (e.g. 1920 × 1080).

- Columns: 360 px wide, 32 px insets, 16 px gaps. Idle frame 360 × 642 at y 426 with 14 px corners; open card 330 wide at y 512 with 46 px corners, 524 tall minimum and growing with its content down to `visual.openCardMaxBottom` (y 1312); the glow rails end 22 px below it.
- Title pills: 336 × 98 with an 84 px icon ring and a Roboto label (Dashboard → Font, default 27 px bold, shrinking only when a word does not fit), left-aligned next to the ring; idle at y 442; open at y 290 (columns 2/5, room for the sub-item name) or y 394 (columns 1/3/4/6, 20 px above the card); top transition.
- Flags: 64 × 48 hit areas with 48 × 32 artwork in a 262 × 62 bar at y 986 (20 px below the last tile, 20 px above the frame edge). Column 5 uses a 262 × 56 bar at y 996 (flags at y 1000) so it clears the bottom panel of its card video.
- Open card: photo frame 262 × 144 at card offset (34, 35); 44 px round arrow hold targets with 34 px white circles; 112 × 40 page-tab hold targets at y 675; body text from card offset 254 (with tabs), 196 (photo only), or 44 (text only); see "Card copy" below.
- Never use `border` on a frame, card, bar, or other element that contains or is a sensor target: borders shift absolutely positioned children. Use `ring-*` or inset box-shadows.
- Hold outlines are inset 2.5 px with a 5 px cyan stroke whose dash length is the computed perimeter, animated alongside a blue inset box-shadow overlay for the group's configured hold duration. They are visual overlays without their own input/timers.

Stacked layout (phones/tablets): KioskStage redefines `--wall-x`/`--wall-y`/`--wall-u` per column box as `calc(100cqw / 384)` inside a Tailwind `@container`, so the same `calc(N * var(--wall-x/y))` utilities scale uniformly. Use Tailwind responsive utilities (`sm:`) only for the list grid and page chrome around the boxes, never inside wall components. `touch-none` applies only to the wall layout; the stacked list uses `touch-pan-y`.

## Card copy

All open-card text renders through `WallPageCopy`, the only place that styles it. Content files choose a block type; they never add styling.

- Colours (client request): every headline is white and every body text is light blue (`wall-copy`, #a6dcff), so a list never mixes white and blue headlines.
- Paragraph: body text (light blue), medium weight, 1.3 line height.
- `bullets`: a 6 px glow **dot** marks each item (never a bar or a native disc). The lead is a white semibold headline at the body size, with or without text; its text sits under it in light blue, aligned with the lead, not under the dot. An item with one logo (`image`, e.g. a certificate or award) becomes two columns: the text on the left and the logo in a fixed 78 × 36 white box at the right edge, so the logos of a list line up; text and logo are centred on one row. An item with several logos (`images`, e.g. marketplaces) shows them in a four-column row of white boxes under the text that always fits the card; a single wide logo marked `logosBelow` (JIS · ANSI · DIN) goes under the text at the full width of the text column. The dot belongs to the text block so it sits on the first text line in both cases. Match every logo file to its exact award and years, and crop client logos on their original background instead of removing it.
- `inline` bullets: a two-column fact table (white label | light blue value) with hairline dividers; use it for short facts such as year, SKU count, or certification.
- `numbered`: glow `01`, `02` numbers in a column 1.8 em wide (it scales with the text) with the light blue text beside them.
- Motion: slider arrow discs nudge 5 px left/right in their direction on a 1.6 s loop (translate only, scoped keyframes in `WallOpenCard`, off under reduced motion).
- Motion: paragraphs and list items fade up one after another in reading order (70 ms apart, 460 ms each) whenever a page becomes visible: on open, page tab, and language. Scoped keyframes in `WallPageCopy`, off under reduced motion.
- Size: body text is the open card's Dashboard → Font range (`cards` per column or sub-item, default 24–26 logical px; WallPageCopy `--copy-base` = min / 18, `--copy-scale` up to max / min, × `--wall-u`). Each page takes the largest size up to max whose text fits the tallest card's text box (WallOpenCard `textLimit`, from WallColumn's `maxCardHeight`, y 1312), in 1 % steps; the card then grows to that text (WallOpenCard reports the height, WallColumn clamps it between `active.card.height` and the tallest card). Only a page that does not fit even at min keeps shrinking, down to 65 % of min. Never clip text, and never set per-page font sizes in content.
- After content changes, check every column, sub-item, page, and language at 2304 × 1344 and a phone width: no page overflows and no card grows past y 1312.

## Card artwork and brand logos

- A column's `illustration` is its idle card artwork: usually a transparent VP9 WebM with the frame, glow, and (for expandable columns) the tile panels baked in, drawn 9 px beyond the frame on every side. Expandable columns with artwork draw transparent hold targets with 19 px corners exactly over the panels, plus their captions; the target rectangles must match the panels (measure the source frames).
- Without artwork (Our Brand) the frame redraws the videos' neon border in code (`NEON_FRAME`). Brand tiles show a transparent logo centred on `tileBackground` with the same padding, or a full-bleed tile design.
- Logos above the open card are square-cornered (no radius, no baked rounded frames), up to 300 × 92.

The current revision uses wall-v7 geometry. Internal typography/padding may change without moving hit areas. If any interactive target changes position or size, update the canonical JSON, bump the layout version, and coordinate Sensor Service. Verify target geometry, wrapping, and column independence at both documented viewports after changes.

References checked through Context7: [Tailwind arbitrary values](https://tailwindcss.com/docs/adding-custom-styles), [Tailwind variants](https://tailwindcss.com/docs/hover-focus-and-other-states), and [Vue scoped CSS](https://vuejs.org/api/sfc-css-features).

SVG stroke normalization: [MDN pathLength](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/pathLength).
