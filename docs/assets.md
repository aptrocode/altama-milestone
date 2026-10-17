# Assets

All current Summit artwork and photos are **provisional crops from the two client mockups** (2000 × 1167, same ratio as the 2304 × 1344 canvas). They exist so the wall can be reviewed while the design team is away. Every entry in the content configuration carries `approved: false` until the client supplies or approves the final file.

| Path | Use | Source |
| --- | --- | --- |
| `public/summit/background.webp` | Stage background (includes skyline) | Mockup 1 with the cards and logo filled by a blurred vertical blend, scaled to 2304 × 1344 |
| `public/summit/logo-powering-partnership.webp` | Header logo | Mockup 1 crop, background keyed to transparent white |
| `public/illustrations/{column-key}.webp` | Idle artwork for columns 1, 3, 4, 6 | Mockup 1 card crops, edges feathered |
| `public/illustrations/distribution/{distribusi,pemasaran}.webp` | Column 5 tiles | Mockup 1 crops without the baked-in captions |
| `public/brands/{tekiro,ryu,rexco}.webp` | Column 2 tiles (RYU/Rexco also above their open card) | Mockup 1 crops |
| `public/brands/tekiro-wordmark.webp` | Tekiro logo above the open card | Mockup 2 crop, background keyed out |
| `public/photos/{column-key}[/{sub-item}]/photo-1.webp` | First slider photo | Mockup 2 photo frames (226 × 124 px) with the baked-in arrows painted over |
| `public/flags/{indonesia,english,china}.svg` | Language controls | Local SVGs |

The photo crops are small and will look soft on the LED. Brand logos (Tekiro, RYU, Rexco, ODP, ALTAMA) are trademarks; replace the crops with official files from the client's brand kit.

## Replacing assets

1. Put the final file at the same path, or add a new kebab-case path and point the entry to it.
2. Set `approved: true` for that entry in `app/data/wall-config.ts` (artwork, tiles, photos) or `app/data/wall-media.ts` (background, logo, skyline).
3. Each content's `photos` array is the slider; replace a `null` slot (numbered placeholder) with a photo or add more entries. Text pages are separate; paged content needs a tab label in every language and at most two pages (the wall-v4 tab targets).
4. Run `bun run assets:check` and check both viewports.

Background media: set `STAGE_MEDIA.background` to `{ kind: 'video', src, poster, approved }` or `{ kind: 'image', src, approved }`. Preferred video: 2304 × 1344, H.264 MP4 or VP9 WebM, muted seamless loop, local file. Convert image sequences to video unless alpha is required. The current background image already contains the skyline, so `skyline` is `null`; set a separate skyline only if the final video lacks one. If the video contains the logo, set `logo` to `null`. Set `waveSweeps` to `false` whenever the background changes, because its animated light paths are traced from the current image.

## Contributor rules

Use lowercase kebab-case names, without spaces or underscores. Keep artwork/photos separate from text, language controls, and other UI; do not use crops that contain baked-in labels or controls. Client approval is required for company claims, translated content, and final media.

## Validation

```bash
bun run assets:check
```

The validator checks six ordered column IDs, labels and page copy in all three languages, tab labels and tab-target limits for paged content, sub-item tile keys against geometry, 18 flag targets, logical canvas/card bounds, every referenced media file, and the three local SVGs. It reports how many media files are still provisional. It does not prove final media readiness or visual quality.

Asset PRs must identify column/sub-item IDs, approval evidence, tested viewport, and validator results. Follow [push](./push.md).
