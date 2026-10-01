# Assets

The current runtime uses three local SVG flags:
- `public/flags/indonesia.svg`
- `public/flags/english.svg`
- `public/flags/china.svg`

Carousel slides are HTML/SVG placeholders. There are no declared approved photo assets. The previous milestone sketch/color pairs and fixture generator were removed because the six-column wall does not render them; Git history retains the old sources.

## Contributor rules

Use lowercase kebab-case names, without spaces or underscores. Keep artwork/photos separate from text, language controls, and other UI. Client approval is required for company claims, translated content, and final media.

When real photos are introduced, add explicit paths/metadata to the wall's content configuration and extend validation for file existence, format, dimensions, and approval status. Do not add unreferenced files or restore milestone artwork without an active requirement. Suggested ownership is `public/photos/{column-key}/{photo-name}.webp`, with a sub-item folder where needed.

## Validation

```bash
bun run assets:check
```

The current validator checks six ordered column IDs, translated copy, slide counts, matching submenu keys, 18 flag targets, logical canvas bounds, and the three local SVGs. It explicitly reports that carousel photos remain placeholders. It does not prove final media readiness or visual quality.

Asset PRs must identify column/sub-item IDs, approval evidence, tested viewport, and validator results. Follow [push](./push.md).
