# Wall design

## Canvas and composition

Official client output: **2304 × 1344 CSS pixels**, approximately 6 × 3.5 m. The current design is a six-column wall. The earlier illustrated three-section milestone poster is historical context and is not the current runtime layout.

Fill the viewport without fixed aspect ratio, maximum width, letterboxing, or scrolling. Preview at 1600 × 900 as well as the official canvas.

The three vertical zones use 35% / 38% / 27% height:
- Header: centered ALTAMA branding when idle; each selected column's heading/story when active.
- Interaction: equal portrait cards containing the main action, submenu, or carousel, plus independent floating flags inside the lower area only while idle.
- Footer: each active column's supporting title/description, centered horizontally and vertically in its zone.

Six equal columns have 52 logical px outside padding and 20 px gaps; each card is **350 × 510.72 px**, approximately **0.685 : 1**. Idle cards are neutral gray; submenu cards are white; active carousels are dark emerald.

All zones use the same six-column grid. Header/footer text uses 28 px horizontal padding and consistent title/description space. Main labels use 24 px padding and show only the title plus localized hold cue, without numbered badges. Typography and flag artwork scale from logical canvas units; long translated labels wrap. See [style](./style.md) for the Tailwind-first implementation policy.

## Controls and geometry

`shared/installation-layout.json` owns frame/zone/control dimensions and all logical targets. CSS derives horizontal/vertical units from the viewport independently. Changing geometry requires a layout version bump and matching Sensor Service deployment.

Flag targets are 56 × 44 logical px; Back and arrow targets are 44 × 44 px. The 232 × 60 px language bar is centered 48 px above the card's lower edge only in idle. It is an absolute overlay sibling of the full-card hold button, avoiding nested interactive elements and reserved layout space. The group is hidden in submenu/carousel.

Carousel arrows sit 20 px from the left/right edges, centered vertically on the full card. Title/Back sit at the top and the counter at the bottom; portrait photo placeholders fill the card behind these controls. Flag buttons show icons only, with accessible names, selected state, and visible focus. Main/sub-item labels remain real text. Headings may wrap so full translated titles remain readable.

Hold feedback traces a 4 px SVG stroke around the button and animates an emerald inset box-shadow across the card over one second without moving target rectangles. Card corners are 14 logical px; submenu and carousel content fill the card with square internal separators and clipped outer corners. Outline arcs follow those same corners. Photo frames have 12 px corners; card panels inherit and clip to the outer radius. Reduced motion uses a static border and shadow during hold and suppresses the decorative hand animation. Release/cancel clears incomplete progress.

Pointer users hold main/sub-item buttons for one second. Enter/Space activate a focused button immediately. Language, Back, and carousel controls activate normally. Operator keys 1–6 open an idle column or go back in that column; R/Escape reset all content while retaining languages until their inactivity timeout. D toggles diagnostics only in development.

Columns 2/5 show submenu choices before their explanations. Back from a selected sub-item returns to that submenu. Carousel placeholders are development UI, not final approved photos.

## References

API usage checked with Context7 on 1 October 2026:
- [Nuxt 4 components](https://nuxt.com/docs/4.x/directory-structure/app/components)
- [Vue custom directives](https://vuejs.org/guide/reusability/custom-directives)
- [Vue scope disposal](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)
- [Pinia subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
