# Testing

## Required commands

Run relevant checks locally before opening or updating a pull request:

```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
```

Run `bun run generate` after configuration, routing, asset, or deployment changes. Use `bun install --frozen-lockfile` on clean machines and CI. Run Nuxt build, generate, and typecheck sequentially because they share generated project files.

## Browser acceptance

1. Test the official 2304 × 1344 CSS viewport, then the reference's 1600 × 900 size. Verify `innerWidth`/`innerHeight`; OS display scaling can make an automation viewport setting differ from the resulting CSS size.
2. Confirm the stage fills both dimensions without scrolling, an outer container, maximum width, or letterboxing.
3. On a fresh load, verify 1967 / 2007 / 2026 are selected and every section starts in IDLE with its sketch ready.
4. Reveal LEFT, CENTER, and RIGHT with click or keys 1, 2, and 3. Check that the colored composition follows the reference.
5. Confirm every heading, story, large year, caption, value, and footer stays readable. Check stacking at the illustration/year boundary.
6. Verify 4 / 8 / 7 timeline buttons are visible, with two separately selectable 2013 entries. Confirm active pill text fits.
7. Select several years rapidly: only the newest request should commit, with no blank image and no effect on other sections.
8. Compare DOM artwork/button bounds with the scaled rectangles in `shared/installation-layout.json`. Focus must not scroll the stage.
9. Press R: all sections return to their initial sketch. In development, D toggles diagnostics; diagnostics stay hidden by default.
10. Open an unknown route and use the custom error page's recovery button.
11. Check application console errors and repeat core interaction checks on the production output.

## Automated coverage

Current tests cover:

- Machine readiness, latest-request-wins during decode, selection during reveal, and failed target preservation.
- Cache request deduplication and decoded dimension mismatch.
- Protocol parsing: valid touch/status, malformed JSON, unsupported version, out-of-canvas coordinates, and wrong-section milestone.
- Catalog/layout target synchronization and independently addressable duplicate years.

## Remaining production validation

Exercise reset/dispose races, cache eviction/pinning/retry, WebSocket sequence/session/layout mismatches, heartbeat loss/reconnect, prolonged offline use, and performance on the final PC/LED/sensor setup. Existing unit tests do not replace this work.

Avoid tests that merely repeat markup. Add targeted behavior tests for real regressions and use controlled Promises for races.
