# Wall design

## Canvas and composition

Official client output: **2304 × 1344 CSS pixels**, approximately 6 × 3.5 m. The current design is a six-column wall. The earlier illustrated three-section milestone poster is historical context and is not the current runtime layout.

Fill the viewport without fixed aspect ratio, maximum width, letterboxing, or scrolling. Preview at 1600 × 900 as well as the official canvas.

The three vertical zones use 35% / 40% / 25% height:
- Header: centered ALTAMA branding when idle; each selected column's heading/story when active.
- Interaction: independent flag controls above the main card, submenu, or carousel.
- Footer: each active column's supporting title/description.

Six equal columns have 20 logical px outside padding and 10 px gaps; each interactive column is 369 px wide at the official canvas. White, neutral, and emerald styling remains the current visual treatment.

## Controls and geometry

`shared/installation-layout.json` owns frame/zone/control dimensions and all logical targets. CSS derives horizontal/vertical units from the viewport independently. Changing geometry requires a layout version bump and matching Sensor Service deployment.

Flag, Back, and arrow targets are 44 × 44 logical px. Flag buttons show icons only, with accessible names, selected state, and visible focus. Main/sub-item labels remain real text. Headings may wrap so full translated titles remain readable.

Entrance/hold feedback uses opacity, border, and glow without moving the target rectangles. Hand-icon motion remains inside the fixed button bounds.

Pointer users hold main/sub-item buttons for one second. Enter/Space activate a focused button immediately. Language, Back, and carousel controls activate normally. Operator keys 1–6 open an idle column or go back in that column; R/Escape reset all content while retaining languages until their inactivity timeout. D toggles diagnostics only in development.

Columns 2/5 show submenu choices before their explanations. Back from a selected sub-item returns to that submenu. Carousel placeholders are development UI, not final approved photos.

## References

API usage checked with Context7 on 1 October 2026:
- [Nuxt 4 components](https://nuxt.com/docs/4.x/directory-structure/app/components)
- [Vue custom directives](https://vuejs.org/guide/reusability/custom-directives)
- [Vue scope disposal](https://vuejs.org/api/reactivity-advanced.html#onscopedispose)
- [Pinia subscriptions](https://pinia.vuejs.org/core-concepts/state.html#subscribing-to-the-state)
- [Tailwind CSS theme variables](https://tailwindcss.com/docs/theme)
