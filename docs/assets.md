# Assets

Deployed media lives in `public/`; master files stay in the git-ignored `public/new-assets/` (below). Card videos, background, and most slider photos now come from the client; brand tiles and a few placeholders are still mockup crops. Every entry in the content configuration carries `approved: false` until the client approves the final file.

| Path | Use | Source |
| --- | --- | --- |
| `public/summit/background.mp4` | Stage background (includes skyline and wave light) | 2304 × 1344 seamless looping H.264 video (7.5 MB) from `new-assets/background/` |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser tab and phone home-screen icon | Six wall columns with the third lit (navy `#0a1872`, glow `#66ccff`); not an ALTAMA logo, since there is no official simple mark. The `.ico` holds 16/32 px drawn on whole pixels and 48 px; the 180 px touch icon is full-bleed (iOS rounds it) |
| `public/summit/logo-powering-partnership.webp` | Header logo | Mockup 1 crop, background keyed to transparent white |
| `public/illustrations/{column-key}.webm` | Idle card artwork for columns 1, 3, 4, 5, 6 (column 5 includes the Distribusi/Pemasaran tile panels) | Transparent VP9 WebM loop, 1050 × 1790, 30 fps, 10 s, ~3 MB, from the PNG sequence in `public/new-assets/card-sequences/{column-key}/` |
| `public/illustrations/distribution/{distribusi,pemasaran}.webp` | Column 5 tile images (unused while the card video is set) | Mockup 1 crops without the baked-in captions |
| `public/brands/tekiro-wordmark.webp` | Tekiro tile logo (on black) and logo above the open card | Mockup 2 crop, background keyed out |
| `public/brands/ryu-tile.webp` | RYU tile (full-bleed white panel + green band, 672 × 264) | Mockup 1 crop with the rounded/blurred mockup corners squared off |
| `public/brands/ryu-wordmark.webp` | RYU logo above the open card | Client logo `ryu/logo/ryu-logo.png` with its rounded black outline, transparent corners (lossless WebP 552 × 205) |
| `public/brands/rexco.webp`, `rexco-wordmark.webp` | Rexco tile logo (on brand blue) and logo above the open card | Client logo, transparent white; the "Cleaning • Lubricating • Protecting" tagline is cropped off (wordmark and swoosh only, lossless WebP 600 × 236 / 600 × 216) |
| `public/photos/{column-key}[/{sub-item}]/…` | Slider photos (`.webp`, 524 px wide = 2× the 262 px frame) and the infrastructure video (`.mp4`, 720p) | Client photos from `new-assets/content/` (Tekiro and some slots are still mockup crops or numbered placeholders) |
| `public/photos/about-altama/board-of-directors.webp` | All five BOD portraits together in one slide, after the history and office photos | Client replacement `new-assets/content/about-altama/slider/board-of-directors.jpeg` (1600 × 900); fitted to 512 × 288 with 6 px navy padding on each side of the 524 × 288 frame so every portrait and caption remains visible. Replaces the two split BOD slides |
| `public/photos/our-brands/{rexco,ryu}/penghargaan/` | Award logos (600 px) in each brand's PAGE 2 award grid | Client files; RYU also reuses `rexco/penghargaan/brand-choice.webp`, whose master is now named `new-assets/content/our-brands/rexco/awards/indonesia-digital-popular-brand-award-2022.png` to match its actual artwork. The deployed path is retained for existing content references |
| `public/flags/{indonesia,english,china}.svg` | Language controls | Local SVGs |

Brand logos (Tekiro, RYU, Rexco, ODP, ALTAMA) are trademarks; replace remaining mockup crops with official files from the client's brand kit.

Brand tiles: a sub-item with `tileBackground` shows its `image` as a transparent logo centred on that colour with the same padding on every tile (Tekiro, Rexco); without it the image is a full-bleed tile design (RYU). Prefer transparent official logos plus `tileBackground`.

## Master files (`public/new-assets/`)

Git-ignored and excluded from the build output (`nitro.ignore`). Names are lowercase kebab-case, grouped by the column keys used in code:

```text
public/new-assets/
  background/                  background-00000.png … + background-master.mp4
  card-sequences/<column-key>/ <column-key>-00000.png … + <column-key>.webm (last encode)
  card-sequences/archive/2026-10-23/<column-key>/ superseded original sequences
  content/<column-key>/        client sources: slider/ (page-1/, page-2/), awards/, logo/
  asset-renames-2026-10-23.json original/current paths, byte sizes, SHA-256 hashes
```

Column keys: `about-altama`, `our-brands` (`tekiro`, `ryu`, `rexco`), `infrastructure`, `digital-partners`, `distribution` (`distribusi`, `pemasaran`), `summit-2026`. Deployed files are derived from these: photos as WebP 524 px wide, videos as 720p H.264 without audio, logos as WebP with alpha.

Keep originals in `public/new-assets/` when a client removes a photo from the wall: remove its content reference and unused deployed derivative only. Infrastruktur now uses the overview video and `photo-7.webp`–`photo-9.webp` (Toolsman logo, service-center map, ALTAMA building). The warehouse management, delivery fleet, warehouse aerial, quality-control lab, and Toolsman fleet photos were removed from the slider and deployed `photo-2.webp`–`photo-6.webp`; their original files remain in `new-assets/content/infrastructure/slider/`.

The 2026-10-23 cleanup follows the client's request to tidy master filenames. The new `BTN DISTRIBUSI PEMASARAN/r_00000.png`–`r_00301.png` files become `card-sequences/distribution/distribution-00000.png`–`distribution-00301.png`; `BTN ALTAMA SUMMIT/btn_altama summit_00000.png`–`btn_altama summit_00301.png` become `card-sequences/summit-2026/summit-2026-00000.png`–`summit-2026-00301.png`. Previous active sequences are retained under `card-sequences/archive/2026-10-23/{distribution,summit-2026}/`.

The WhatsApp BOD JPEG becomes `board-of-directors.jpeg`; the misleading Rexco award master `brand-choice.png` becomes `indonesia-digital-popular-brand-award-2022.png`. All 2,485 original files are retained byte-for-byte, with 1,211 renamed or relocated. The local JSON manifest records every original and destination path, size, and SHA-256 hash for verification and reversal. It is git-ignored and excluded from deployment along with the other masters; back it up with `public/new-assets/`. Other compliant names and frame numbering remain intact (the older infrastructure sequence starts at `00005`).

Card videos from a PNG sequence (e.g. `public/new-assets/card-sequences/distribution/distribution-00000.png`): encode a transparent loop of about 3 MB:

```bash
ffmpeg -framerate 30 -i public/new-assets/card-sequences/<key>/<key>-%05d.png -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1200k -minrate 600k -maxrate 1800k -auto-alt-ref 0 -row-mt 1 -threads 4 -deadline good -cpu-used 2 -an public/illustrations/<key>.webm
```

Column 5 (`distribution`) lifts its two panels 22 source px inside the frame while encoding, to leave room for the flags; its tile targets (wall-v7) match the lifted panels:

```bash
ffmpeg -framerate 30 -i public/new-assets/card-sequences/distribution/distribution-%05d.png -filter_complex "[0]split[base][src];[src]crop=962:1272:44:350[panels];[base][panels]overlay=44:328,format=yuva420p" -frames:v 301 -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 1200k -minrate 600k -maxrate 1800k -auto-alt-ref 0 -row-mt 1 -threads 4 -deadline good -cpu-used 2 -an public/illustrations/distribution.webm
```

The replacement distribution and summit sequences each contain 302 RGBA frames at 1050 × 1790. Distribution frame `00301` is fully transparent: retain that original PNG but add `-frames:v 301` to its encode so the deployed loop contains frames `00000`–`00300` (10.033 s) without a blank flash. Summit uses all 302 frames (10.067 s). Both run at 30 fps with no audio, keeping the existing transparent VP9/alpha playback and the distribution panel lift. Validate an intermediate output before replacing the deployed WebM and save the validated encode beside its active master sequence. For alpha checks decode with `-c:v libvpx-vp9`: the native VP9 decoder may expose only the colour plane even when WebM has `alpha_mode=1`.

The replacement's video hashes, original-file verification totals, panel alignment measurements, and browser evidence are recorded in `test/evidence/card-video-replacements-2026-10-23.json`. Browser captures cover the 2304 × 1344 LED wall, 1600 × 900 preview, and 390 × 844 phone layout.

## Replacing assets

1. Put the final file at the same path, or add a new kebab-case path and point the entry to it.
2. Set `approved: true` for that entry in its column file under `app/data/columns/` (artwork, tiles, photos) or `app/data/wall-media.ts` (background, logo, skyline). See [content](./content.md).
3. Each page's `photos` array is its slider; replace a `PHOTO_PLACEHOLDER` slot with a photo or add more slots. Paged content needs a tab label in every language and at most four pages (`MAX_PAGES` in `shared/page-tabs.ts`).
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
