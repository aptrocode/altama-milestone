# Assets

All current Summit artwork and photos are **provisional crops from the two client mockups** (2000 × 1167, same ratio as the 2304 × 1344 canvas). They exist so the wall can be reviewed while the design team is away. Every entry in the content configuration carries `approved: false` until the client supplies or approves the final file.

| Path | Use | Source |
| --- | --- | --- |
| `public/summit/background.mp4` | Stage background (includes skyline) | 2304 × 1344 seamless looping H.264 video (7.16 MB) |
| `public/summit/logo-powering-partnership.webp` | Header logo | Mockup 1 crop, background keyed to transparent white |
| `public/illustrations/{column-key}.webm` | Idle card artwork for columns 1, 3, 4, 5, 6 (column 5 includes the Distribusi/Pemasaran tile panels) | Transparent VP9 WebM loop, 1050 × 1790, 30 fps, 10 s, ~3 MB, from the PNG sequence in `public/new-assets/card-button/{column-key}/` |
| `public/illustrations/distribution/{distribusi,pemasaran}.webp` | Column 5 tile images (unused while the card video is set) | Mockup 1 crops without the baked-in captions |
| `public/brands/tekiro-wordmark.webp` | Tekiro tile logo (on black) and logo above the open card | Mockup 2 crop, background keyed out |
| `public/brands/ryu-tile.webp` | RYU tile (full-bleed white panel + green band, 672 × 264) | Mockup 1 crop with the rounded/blurred mockup corners squared off |
| `public/brands/ryu-wordmark.png` | RYU logo above the open card | Transparent official logo |
| `public/brands/rexco.png`, `rexco-wordmark.png` | Rexco tile logo (on brand blue) and logo above the open card | Transparent white logo |
| `public/photos/{column-key}[/{sub-item}]/photo-1.webp` | First photo of the first page | Mockup 2 photo frames (226 × 124 px) with the baked-in arrows painted over |
| `public/flags/{indonesia,english,china}.svg` | Language controls | Local SVGs |

The photo crops are small and will look soft on the LED. Brand logos (Tekiro, RYU, Rexco, ODP, ALTAMA) are trademarks; replace the crops with official files from the client's brand kit.

Brand tiles: a sub-item with `tileBackground` shows its `image` as a transparent logo centred on that colour with the same padding on every tile (Tekiro, Rexco); without it the image is a full-bleed tile design (RYU). Prefer transparent official logos plus `tileBackground`.

Card videos from a PNG sequence: name the folder and frames in kebab-case after the column key (`public/new-assets/card-button/distribution/distribution-00000.png`), then encode a transparent loop of about 3 MB:

```bash
ffmpeg -framerate 30 -i public/new-assets/card-button/<key>/<key>-%05d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1200k -minrate 600k -maxrate 1800k -auto-alt-ref 0 -row-mt 1 -deadline good -cpu-used 2 -an public/illustrations/<key>.webm
```

`public/new-assets/` stays out of git and out of the build output.

## Replacing assets

1. Put the final file at the same path, or add a new kebab-case path and point the entry to it.
2. Set `approved: true` for that entry in its column file under `app/data/columns/` (artwork, tiles, photos) or `app/data/wall-media.ts` (background, logo, skyline). See [content](./content.md).
3. Each page's `photos` array is its slider; replace a `PHOTO_PLACEHOLDER` slot with a photo or add more slots. Paged content needs a tab label in every language and at most two pages (the wall-v6 tab targets).
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
