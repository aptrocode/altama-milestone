# Assets

Deployed media lives in `public/`; master files stay in the git-ignored `public/new-assets/` (below). Card videos, background, and most slider photos now come from the client; brand tiles and a few placeholders are still mockup crops. Every entry in the content configuration carries `approved: false` until the client approves the final file.

| Path | Use | Source |
| --- | --- | --- |
| `public/summit/background.mp4` | Stage background (includes skyline and wave light) | 2304 × 1344 seamless looping H.264 video (7.5 MB) from `new-assets/background/` |
| `public/summit/logo-powering-partnership.webp` | Header logo | Mockup 1 crop, background keyed to transparent white |
| `public/illustrations/{column-key}.webm` | Idle card artwork for columns 1, 3, 4, 5, 6 (column 5 includes the Distribusi/Pemasaran tile panels) | Transparent VP9 WebM loop, 1050 × 1790, 30 fps, 10 s, ~3 MB, from the PNG sequence in `public/new-assets/card-sequences/{column-key}/` |
| `public/illustrations/distribution/{distribusi,pemasaran}.webp` | Column 5 tile images (unused while the card video is set) | Mockup 1 crops without the baked-in captions |
| `public/brands/tekiro-wordmark.webp` | Tekiro tile logo (on black) and logo above the open card | Mockup 2 crop, background keyed out |
| `public/brands/ryu-tile.webp` | RYU tile (full-bleed white panel + green band, 672 × 264) | Mockup 1 crop with the rounded/blurred mockup corners squared off |
| `public/brands/ryu-wordmark.webp` | RYU logo above the open card | Client logo, squared corners |
| `public/brands/rexco.webp`, `rexco-wordmark.webp` | Rexco tile logo (on brand blue) and logo above the open card | Client logo, transparent white |
| `public/photos/{column-key}[/{sub-item}]/…` | Slider photos (`.webp`, 524 px wide = 2× the 262 px frame) and the infrastructure video (`.mp4`, 720p) | Client photos from `new-assets/content/` (Tekiro and some slots are still mockup crops or numbered placeholders) |
| `public/photos/our-brands/{rexco,ryu}/penghargaan/` | Award logos (600 px), not placed in a card yet | Client files |
| `public/flags/{indonesia,english,china}.svg` | Language controls | Local SVGs |

Brand logos (Tekiro, RYU, Rexco, ODP, ALTAMA) are trademarks; replace remaining mockup crops with official files from the client's brand kit.

Brand tiles: a sub-item with `tileBackground` shows its `image` as a transparent logo centred on that colour with the same padding on every tile (Tekiro, Rexco); without it the image is a full-bleed tile design (RYU). Prefer transparent official logos plus `tileBackground`.

## Master files (`public/new-assets/`)

Git-ignored and excluded from the build output (`nitro.ignore`). Names are lowercase kebab-case, grouped by the column keys used in code:

```text
public/new-assets/
  background/                  background-00000.png … + background-master.mp4
  card-sequences/<column-key>/ <column-key>-00000.png … + <column-key>.webm (last encode)
  content/<column-key>/        client sources: slider/ (page-1/, page-2/), awards/, logo/
```

Column keys: `about-altama`, `our-brands` (`tekiro`, `ryu`, `rexco`), `infrastructure`, `digital-partners`, `distribution` (`distribusi`, `pemasaran`), `summit-2026`. Deployed files are derived from these: photos as WebP 524 px wide, videos as 720p H.264 without audio, logos as WebP with alpha.

Card videos from a PNG sequence (e.g. `public/new-assets/card-sequences/distribution/distribution-00000.png`): encode a transparent loop of about 3 MB:

```bash
ffmpeg -framerate 30 -i public/new-assets/card-sequences/<key>/<key>-%05d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1200k -minrate 600k -maxrate 1800k -auto-alt-ref 0 -row-mt 1 -deadline good -cpu-used 2 -an public/illustrations/<key>.webm
```

Column 5 (`distribution`) lifts its two panels 22 source px inside the frame while encoding, to leave room for the flags; its tile targets (wall-v7) match the lifted panels:

```bash
ffmpeg -framerate 30 -i public/new-assets/card-sequences/distribution/distribution-%05d.png -filter_complex "[0]split[base][src];[src]crop=962:1272:44:350[panels];[base][panels]overlay=44:328,format=yuva420p" -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1200k -minrate 600k -maxrate 1800k -auto-alt-ref 0 -row-mt 1 -deadline good -cpu-used 2 -an public/illustrations/distribution.webm
```

## Replacing assets

1. Put the final file at the same path, or add a new kebab-case path and point the entry to it.
2. Set `approved: true` for that entry in its column file under `app/data/columns/` (artwork, tiles, photos) or `app/data/wall-media.ts` (background, logo, skyline). See [content](./content.md).
3. Each page's `photos` array is its slider; replace a `PHOTO_PLACEHOLDER` slot with a photo or add more slots. Paged content needs a tab label in every language and at most two pages (the wall-v7 tab targets).
4. Run `bun run assets:check` and check both viewports.

Background media: set `STAGE_MEDIA.background` to `{ kind: 'video', src, poster, approved }` or `{ kind: 'image', src, approved }`. Preferred video: 2304 × 1344, H.264 MP4 or VP9 WebM, muted seamless loop, local file. Convert image sequences to video unless alpha is required. The current background video already contains the skyline and the wave light, so `skyline` is `null` and `waveSweeps` is `false` (the sweeps are traced from the old mockup image). If a video contains the logo, set `logo` to `null`.

## Contributor rules

Use lowercase kebab-case names, without spaces or underscores. Keep artwork/photos separate from text, language controls, and other UI; do not use crops that contain baked-in labels or controls. Client approval is required for company claims, translated content, and final media.

## Validation

```bash
bun run assets:check
```

The validator checks six ordered column IDs, labels and page copy in all three languages, tab labels and tab-target limits for paged content, sub-item tile keys against geometry, 18 flag targets, logical canvas/card bounds, every referenced media file, and the three local SVGs. It reports how many media files are still provisional. It does not prove final media readiness or visual quality.

Asset PRs must identify column/sub-item IDs, approval evidence, tested viewport, and validator results. Follow [push](./push.md).
