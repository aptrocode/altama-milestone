# Visual design

## Client canvas

The client's brief specifies a 2304 × 1344 px output for an approximately 6 × 3.5 m LED wall. The aspect ratio is 12:7. LEFT, CENTER, and RIGHT each occupy 768 × 1344 logical pixels.

The supplied reference is 1600 × 900 (16:9). Preserve its composition, colors, and reading order while adapting spacing to the official 12:7 canvas. Fill the viewport without an outer container, maximum width, letterbox, or page scrolling. Other viewport sizes are previews; the LED resolution is the acceptance target.

## Composition

- White background with illustrated clouds, foliage, hills, and a quiet footer.
- Three orange, blue, and red sections with organic speech bubbles and circular icon badges.
- Each section contains story copy, an illustration, a large year, a timeline capsule, three flag-only language buttons, and three values.
- Text, icons, year labels, and controls are real Vue/HTML/SVG elements. Do not bake them into the illustrations.
- Keep scenery behind text and controls. The artwork owns a stacking context so its retained image slots cannot cover the large year.
- Color reveals start on interaction. Initial and newly selected milestones show a grayscale preview; the story remains readable in both states.
- Diagnostics are hidden by default. In development, press D to toggle them.

| Section | Initial year | Selectable years |
| --- | --- | --- |
| LEFT | 1967 | 1967, 1996, 1999, 2006 |
| CENTER | 2007 | 2007, 2008, 2013, 2013, 2015, 2016, 2017, 2019 |
| RIGHT | 2026 | 2020, 2021, 2022, 2023, 2024, 2025, 2026 |

There are 19 buttons. The two 2013 entries have distinct IDs and accessible names.

Each section also has three independent flag controls immediately below its timeline: Indonesia, English, and Simplified Chinese. The controls have no visible text, but expose spoken names, a selected ring, and a keyboard focus indicator. Switching a language changes only its section; see [language](./language.md).

## Layout ownership

- `app/data/sections.ts`: section headings, captions, values, colors' semantic grouping, and initial IDs.
- `shared/milestones.json`: milestone years and story content.
- `shared/installation-layout.json`: logical canvas, artwork rectangles, and every timeline and language button rectangle.
- `app/utils/layout-style.ts`: maps logical rectangles into section-relative CSS percentages.
- `MilestoneInfo.vue`, `MilestoneValues.vue`, and `KioskScenery.vue`: visual composition.
- `MilestoneSection.vue`: year layer and interaction orchestration.

At the official size, artwork starts at y = 497.28, timeline buttons at y = 923.328, and language buttons at y = 1018.08. The smallest timeline targets are approximately 84.48 × 79.296 px; each language target is 76 × 75.264 px. Sensor Service must use layout-v4 and the same shared geometry; do not maintain separate guessed hitboxes.

Type scales with stage width, vertical spacing with viewport height. After editing copy, check the longest story and all heading lines in all three languages at 2304 × 1344. Preserve comfortable space between text, bubble outline, artwork, timeline, flags, values, and footer.

## Illustration provenance

Three preview illustrations were generated with the built-in ImageGen tool using the supplied poster as a style reference. They are approximations for this interface, not approved company artwork.

Saved project sources:

- `scripts/fixtures/left.png`
- `scripts/fixtures/center.png`
- `scripts/fixtures/right.png`

Shared art direction: bright hand-drawn infographic illustration, dark navy outlines, vivid green foliage and blue clouds, white background, a wide landscape composition, and no text, numbers, labels, UI, or watermark.

Retained subject prompts:

### Left

the LEFT illustration only: charming small cream single-storey founding office with a brown flat roof, orange wooden door, blue windows, large leafy tree behind its left side, lush small shrubs and flowers, bright yellow sun behind the right roof, soft blue distant city buildings and puffy blue clouds. Green gentle ground at bottom. Absolutely no text, numbers, year or lettering.

### Center

the CENTER illustration only: a modern three-storey white company headquarters with large vivid blue glass windows and dark navy outlines, smaller wing on left, lush green trees and shrubs both sides, pale blue distant high-rise buildings and blue clouds. Green gentle ground at bottom. Absolutely no text, numbers, year or lettering.

### Right

the RIGHT illustration only: a modern white distribution warehouse with orange roof trim and three loading bays, one small white-and-blue delivery truck in front, a large turquoise globe with green continents and five red location pins behind the warehouse, lush trees, pale blue distant buildings and blue clouds. Green gentle ground at bottom. Absolutely no text, numbers, year or lettering.

The fixture script exports 1000 × 500 WebP pairs to `public/milestones/{section}/{milestone-id}/`. Milestones currently reuse their section's scene. The preview sketch duplicates the color source and is desaturated by CSS to maintain exact registration. Approved deliverables require distinct, aligned sketch/color exports for each milestone; see [assets](./assets.md).

## Documentation references

The Nuxt component naming and Vue style bindings used here were checked through Context7:

- [Nuxt 4 components](https://nuxt.com/docs/4.x/directory-structure/app/components)
- [Vue class and style bindings](https://vuejs.org/guide/essentials/class-and-style)

No new runtime dependencies were needed for this design.
