# Section languages

Each of the three sections has its own language choice: Indonesian (`id`, default), English (`en`), or Simplified Chinese (`zh-Hans`). The three flag-only controls sit directly below that section's year timeline. Switching a language changes only that section's heading, story, caption, values, loading text, and accessible names. Its selected year, artwork, reveal phase, and the other sections are untouched. The R key resets artwork but keeps the current language. A page reload starts all sections in Indonesian. The shared footer remains Indonesian because it is outside the three sections.

## Ownership

- `app/stores/milestone.ts` owns one serializable `locale` per section and the `setLocale` action.
- `app/data/sections.ts` and `shared/milestones.json` remain the Indonesian source copy.
- `app/data/localization.ts` owns English and Chinese translations plus the language-specific interface phrases. It derives provisional year stories from a shared template. The three opening stories have explicit translations.
- `app/components/milestone/MilestoneLanguageSwitcher.vue` renders the controls. The SVG flags in `public/flags/` are local assets; no language or icon dependency is needed.
- `shared/installation-layout.json` owns the nine logical flag hitboxes, and `MilestoneSection` exposes `setLocale` to mouse and sensor input through the same section API.

The catalog currently marks all stories `placeholder`, including the opening stories and their translations. A future `approved` milestone must have explicit English and Chinese translations. `getMilestoneCopy` throws when one is missing; the localization test walks the whole catalog in all three languages. Do not treat generated placeholder copy or translated historical claims as client-approved content.

## Interaction and accessibility

The controls show flags only, with no visible language labels. Each button has a spoken name and `aria-pressed`; the selected flag has a themed border and outer ring, and keyboard focus has a separate outline. The parent section sets its own `lang` attribute so assistive technology can pronounce mixed-language sections correctly. The English option uses a UK flag as a language cue, and Chinese uses the China flag for Simplified Chinese. If the client requests different regional semantics, change the icons and labels together.

The official layout is 2304 × 1344. Each flag target is 76 × 75.264 logical pixels. The layout is `layout-v4`; Sensor Service must use its language rectangles and emit the `selectLanguage` event described in [sensor](./sensor.md). Mouse interaction works without the service. Language selection is immediate and does not stage new artwork.

## Current framework references

The implementation follows [Nuxt 4 component auto-imports](https://nuxt.com/docs/4.x/directory-structure/app/components), [Vue 3 `defineExpose`](https://vuejs.org/guide/essentials/template-refs.html), and [Pinia 4 option stores and reactive access](https://github.com/vuejs/pinia/blob/v4/packages/docs/core-concepts/index.md), checked through Context7 on 24 September 2026. No new dependency was added.
