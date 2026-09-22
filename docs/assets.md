# Assets

Runtime artwork lives at:

```text
public/milestones/{section}/{milestone-id}/
├── sketch.webp
└── color.webp
```

## Required rules

1. Both files must use the same width, height, crop, scale, and object position.
2. Keep both variants pixel-aligned; a small offset becomes a visible jump during reveal.
3. Artwork contains illustration only. Keep year, title, description, controls, and other UI in Vue.
4. Use a static WebP. Animated WebP fails validation.
5. The folder name is the canonical milestone ID and must start with its section name.
6. A year is not an ID. Use a suffix when two milestones share a year, such as `center-2013-a` and `center-2013-b`.
7. Do not export the entire 2304 × 1344 LED canvas for every milestone. Use the catalog dimensions.
8. Treat all entries with `contentStatus: "placeholder"` as development fixtures.

The canonical metadata is `shared/milestones.json`. Adding an asset folder alone does not add a milestone. A catalog change also requires matching hitboxes in `shared/installation-layout.json`.

## Current preview assets

The 19 pairs are 1000 × 500 pixels. Their three generated source scenes live in `scripts/fixtures/left.png`, `center.png`, and `right.png`; see `docs/design.md` for provenance and prompts. These sources are build-time fixtures and are not shipped as runtime PNGs.

Each section currently reuses one illustration. Preview sketch files duplicate the color source; CSS applies grayscale so the two versions remain registered. These are not final line-art sketches. Replace both files for each approved milestone, keep their declared dimensions, and change the catalog's approval status only after review. The fixture generator skips entries marked `approved`.

The runtime fits each pair into its shared artwork rectangle and softly masks the lower edge into the white year area. Preview the reveal after any crop change.

## Local checks

```bash
bun run assets:check
```

The validator checks IDs, required pairs, WebP format, static frame count, dimensions, and unreferenced folders. It cannot prove visual alignment. Overlay sketch and color at 50% opacity and inspect the real reveal before review.

`bun run assets:fixtures` creates only missing development fixtures. Use `bun run assets:fixtures -- --force` only when every placeholder should be regenerated.

## Asset pull requests

Limit asset-only changes to `public/milestones/` unless the issue explicitly includes catalog or layout work. List every changed milestone ID in the pull request, attach alignment/reveal evidence, and report the validator result. Follow `docs/push.md` for the complete repository workflow.

Git LFS is not currently required. Reassess it when binary size or revision frequency begins to affect repository history.
