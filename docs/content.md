# Content and media editing

Every column's text, artwork, tiles, pages, and photos live in one file. Change content there; no component or store edit is needed.

| Column | File | Kind |
| --- | --- | --- |
| 1 Tentang Altama | `app/data/columns/1-about-altama.ts` | single, 1 page with 2-photo slider |
| 2 Our Brand | `app/data/columns/2-our-brands.ts` | expandable: `tekiro`, `ryu`, `rexco` |
| 3 Infrastruktur | `app/data/columns/3-infrastructure.ts` | single, 1 page with video & 7-photo slider |
| 4 Digital Trust | `app/data/columns/4-digital-trust.ts` | single, 1 page with 2-photo slider |
| 5 Distribusi & Pemasaran | `app/data/columns/5-distribution.ts` | expandable: `distribusi`, `pemasaran` |
| 6 Altama Summit 2026 | `app/data/columns/6-summit-2026.ts` | single, text only |

Related files:
- `app/types/wall-content.ts`: the typed shape (`ColumnConfig`, `SubItem`, `ContentPage`, `ContentBlock`, `MediaAsset`).
- `app/data/columns/helpers.ts`: `provisional()`, `page()`, `onlyPage()`, `pendingPage()`, `PHOTO_PLACEHOLDER`, `PAGE_TABS`.
- `app/data/wall-config.ts`: display order and lookups only.
- `app/data/wall-media.ts`: stage background (image/video), logo, skyline, wave sweeps.
- `app/data/wall-copy.ts`: interface words (Back, Previous, Next, photo, language names).

## Model

A column (or a sub-item of columns 2/5) has `pages`. Each page has its **own photo slider** and its own text in `id`, `en`, and `zh-Hans`:

```ts
const firstPage = onlyPage([provisional('/photos/about-altama/photo-1.png'), provisional('/photos/about-altama/photo-2.png')], {

  'id': { tab: '1960', blocks: ['Paragraf...'] },
  'en': { tab: '1960', blocks: ['Paragraph...'] },
  'zh-Hans': { tab: '1960', blocks: ['段落...'] },
});
```

- Arrows move between the photos of the current page. Page tabs switch the whole page (photos and text) and restart its slider. Both are hold targets whose on/off and duration are set on `/dashboard` (default 1 s).
- Tabs show only when there are two pages (the wall-v7 layout has two tab targets). Arrows show only when the current page has two or more photo slots. A page with `[]` photos shows text only; keep the photo frame consistent across pages of one card.
- `PHOTO_PLACEHOLDER` renders a numbered "FOTO 0n" slot until a real photo exists.
- `blocks` accepts a paragraph string, `{ bullets: [{ lead, text, image }] }` (dot + glow label with the text under it; optional `image` shows one logo at the right edge; `images` shows several logos in a row under the text). Every logo file must match its exact award, brand, and years; check new logos visually before use, `{ inline: true, bullets }` (a label | value fact table for short facts), or `{ numbered: [...] }`. Styling is fixed by the card-copy rules in [style](./style.md#card-copy); the card grows with long content, so prefer complete copy over shortening it.
- Use `onlyPage()` for a single page without a tab and `pendingPage()` for a page whose copy the client has not supplied.

## Replacing a photo or artwork

1. Put the file under `public/` with a lowercase kebab-case name, e.g. `public/photos/our-brands/tekiro/photo-2.webp` (2304 × 1344 canvas: photo frames are 262 × 144 logical px; supply at least 2× for the LED).
2. Point the slot to it. Use `{ src: '/photos/…', approved: true }` once the client approves it, or `provisional('/photos/…')` while it is a stand-in.
3. Run `bun run assets:check`, then check the wall at 2304 × 1344 and a phone width.

Add photos by adding slots; add text pages by adding `page(...)` entries with a tab label in every language (two pages maximum).

## Adding or renaming a sub-item

Sub-item keys (`tekiro`, `distribusi`, …) are part of the Sensor Service contract: they appear in `shared/installation-layout.json` tile targets and OSC `/altama/subItem`. Changing them changes geometry: update the JSON, bump `layoutVersion`, and coordinate Sensor Service (see [sensor](./sensor.md)).

## Layouts

The same column components render two layouts (see [design](./design.md)): the LED wall (2304 × 1344, also any wide landscape screen ≥ 1024 px) and the stacked phone/tablet layout. Content needs no per-layout copy.
