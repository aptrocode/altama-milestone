# Wall design

## Canvas and composition

Official client output: **2304 × 1344 CSS pixels**, approximately 6 × 3.5 m. The design follows the two ALTAMA Summit 2026 "Powering Partnership" reference mockups: mockup 1 shows every column idle, mockup 2 shows every column open. Each column switches between those two layouts on its own; opening one column never moves the other five.

Fill the viewport without fixed aspect ratio, maximum width, letterboxing, or scrolling. Preview at 1600 × 900 as well as the official canvas. All positions are logical canvas units from `shared/installation-layout.json` (`--wall-x`/`--wall-y` scale them independently).

Six columns are 360 logical px wide with 32 px outer insets and 16 px gaps (pitch 376).

- **Idle (mockup 1):** a 360 × 642 glowing frame at y 426 holds the title pill (icon + label) at the top, the artwork (or the brand/distribution tiles), and the flag bar at y 986, kept 20 px clear of the last tile.
- **Open (mockup 2):** the frame fades out, faint glow rails (from y 268 to 22 px below that column's card) mark the column edges, and the same pill rises. Expandable columns (2/5) raise it to y 290 and show the chosen sub-item (Tekiro logo, RYU/Rexco tile, or "DISTRIBUSI"/"PEMASARAN" text) under it; single columns (1/3/4/6) have no sub-item name, so their pill stops at y 394, 20 px above the card. A 330 px wide rounded content card appears at y 512 on every column, keeping arrows and page tabs at the same comfortable height. It is at least 524 tall and grows downward with its content (over the skyline) to at most y 1312.

The Summit logo is shared. Idle it is 278 px tall at y 70, narrow enough to stay between columns 3 and 4. It shrinks to 206 px at y 18 only while column 3 or 4 is open, because their open rails and pills would otherwise touch it.

## Stage background

`KioskBackground` renders, back to front: a coded radial gradient with SVG neon waves (fallback), the background media from `STAGE_MEDIA.background` (`image` or looping muted `video` with a poster), and an optional separate skyline. The current background is mockup 1 with its cards and logo filled in, so it already contains the skyline. On top of the image, `STAGE_MEDIA.waveSweeps` adds light streaks that travel along the traced neon waves in the top-left and top-right corners, plus a slow corner glow (scoped keyframes, off under reduced motion). The traced paths only match the current image: turn `waveSweeps` off when the background changes. A failed media file falls back to the coded layer. The final background is expected to be a video or image sequence from the design team; convert sequences to a looping video unless alpha is needed.

## Column content

| Column | Title (id) | Idle | Open |
| --- | --- | --- | --- |
| 1 | Tentang Altama | Building illustration | 1960 / 1996 pages, each with its own photo slider and text |
| 2 | Our Brand | Tekiro, RYU, Rexco tiles; each tile opens that brand directly | Brand logo above the card; Tekiro has PAGE 1 / PAGE 2, each with its own photos and text |
| 3 | Infrastruktur | Warehouse illustration | Photo slider and bullets |
| 4 | Digital Trust | Phone illustration | Photo slider (ODP) and bullets |
| 5 | Distribusi & Pemasaran | Captioned Distribusi / Pemasaran tiles; each opens directly | Sub-item name above the card, photo slider, bullets |
| 6 | Altama Summit 2026 | Flag ceremony illustration | Text-only Summit message |

There is no submenu: brand and distribution tiles are hold targets on the idle frame. The reference shows no visible "hold" cue, so none is drawn; the hold border animation shows progress.

## Open card

Inside the card: the photo frame (262 × 144 at card offset 34, 35) with arrows centered near its left/right edges (44 px targets, 34 px white circles). Every page owns its photos: arrows move between the current page's photos, and page tabs (112 × 40, under the photo) switch the whole page, photos and text together, restarting its slider. Tabs render only when content has more than one page; arrows only when the current page has more than one photo slot. Body text fills the rest of the card in Roboto Condensed at 18 px with the card-copy system in [style](./style.md#card-copy); the card grows to fit the tallest page, and text shrinks only when even the tallest card is not enough. Back is a ✕ badge on the card's top-right corner. A photo slot without a file shows a numbered placeholder.

## Controls and geometry

`shared/installation-layout.json` (**wall-v6**) owns every target: `main` (single columns only), `languageBar` + 18 `languages` (64 × 48), `subItems` tiles for columns 2/5, and `active.back`, `active.previous`/`next`, `active.pages`. Its `visual` block holds non-target placement (logo, pills, subtitle, artwork, photo frame, text start, rails). Changing any target requires a new layout version and matching Sensor Service deployment.

Hold rules are operator settings (see [dashboard](./dashboard.md)): by default pointer users hold main, tile, photo-arrow, and page-tab buttons for one second. Each group (card, page, slider) can be turned off (normal press) or set to 0.3–5 s on `/dashboard`. Enter/Space activate a focused button immediately. Language and Back activate on a normal press. Operator keys 1–6 open a column (columns 2/5 open their default sub-item) or close it; R/Escape reset all content while retaining languages until their inactivity timeout. Arrow keys and PageUp/PageDown move the leftmost open photo slider. D toggles diagnostics only in development. Each column returns to idle/Indonesian after **30 seconds** without interaction.

Hold feedback traces a 4 px sky stroke around the button and animates a blue inset glow over one second without moving target rectangles. Outline arcs follow the 14 px frame corners, 10 px tile corners, 7 px tab corners, or the round arrow target. Reduced motion uses a static border and shadow during hold.

## Responsive (stacked) layout

Screens narrower than 1024 px or taller than wide (`useStackedLayout`, query `(max-width: 1023px), (max-aspect-ratio: 1/1)`) show the logo on top and the six columns as a vertical list: one column per row on phones, two from 640 px. Each column renders the same `WallColumn` inside a box whose width defines a uniform logical scale (`100cqw / 384`, i.e. the 360 px column plus 12 px side margins), so pills, frames, cards, and text keep their wall proportions. The box shows only the rows a column uses (`visual.stacked` in the layout JSON: idle y 412–1082, open y 276–1050, open single column y 380–1050) and animates its height when the column opens. The page scrolls vertically (`touch-pan-y`); a scroll gesture cancels an in-progress hold. The LED wall and any wide landscape screen keep the fixed wall layout.

## Typography

Oswald is the display face (title pills, tabs); Roboto Condensed is the body face. Both load through `@nuxt/fonts` and are bundled into the build. Chinese text falls back to the system CJK font.

## References

API usage checked with Context7 on 1 October 2026:
- [Nuxt 4 components](https://nuxt.com/docs/4.x/directory-structure/app/components)
- [Vue custom directives](https://vuejs.org/guide/reusability/custom-directives)
- [Vue scope disposal](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)
- [Pinia subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
