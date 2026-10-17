# Testing

## Commands

```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
bun run generate
```

Run build, generate, and typecheck sequentially because they share Nuxt generated files. Generate is required after configuration, routing, asset, or deployment changes. Clean machines/CI use `bun install --frozen-lockfile`.

## Regression coverage

Behavior tests cover:
- independent idle-only language selection, hidden-language rejection, and locale retention while open;
- direct sub-item tiles, column independence, hidden-action rejection, repeated main input, photo-slider wrap, pages that switch their own photos and text, and Back/reset;
- per-column inactivity, R/Escape translated-idle regression, operator-close regression, cross-instance isolation, and scope disposal;
- one-second pointer hold, cancellation/release/blur, native keyboard activation, updated callbacks, and listener/timer cleanup;
- protocol v2 parsing, input destinations, tile/arrow/page/Back routing, missing main targets for columns 2/5, old-version rejection, and declared-target coordinates;
- the stacked-layout media query and its listener cleanup;
- socket handshake, readiness/calibration gating, replay/sequence/session/layout rejection, outgoing state snapshots, heartbeat failure, stop cleanup, and disabled reconnect.

Do not add tests that merely restate markup. Use controlled timers for behavior and browser measurements for geometry.

## Browser acceptance

1. Verify actual CSS viewports 2304 × 1344 and 1600 × 900. Stage fills both dimensions without scrolling or letterboxing.
2. Fresh load: six idle columns, all Indonesian, branding visible.
3. Choose English/Chinese independently while idle, then open those columns. Their language is retained; flags disappear while open. Return to idle to choose again.
4. Confirm flag-only controls inside each card, selected state, focus, language attributes, full translated headings, and no visible 1–6 badges.
5. Hold a main, tile, photo-arrow, or page-tab button for one second; its border traces the matching outline. Short/cancelled contact clears progress and does nothing. Reduced motion uses a static border until completion. Enter and Space activate focused buttons. Digits 1–6 open/go back in their own column.
6. Holding a Tekiro/RYU/Rexco or Distribusi/Pemasaran tile opens it directly; opening any column leaves the other five unchanged. Back returns to idle.
7. Arrows move only the current page's photos and wrap; page tabs (column 1, Tekiro) switch photos and text together and restart the slider. Both restart only that column's timer.
8. At 30 seconds without activity, only the inactive column returns to idle/Indonesian. R/Escape retain languages immediately and their timers still expire.
9. Compare every visible `data-sensor-action` button with its shared logical rectangle, including tiles, Back, arrows, and page tabs. Arrows align with the photo frame's vertical midpoint; flags float inside and centered only while idle, without reducing content height. Scale x/y independently for previews.
10. Unknown route shows the custom error page; recovery returns to the wall.
11. Production console has no application errors. D diagnostics stay hidden by default and show actual sensor state in development.
12. All six columns have equal widths and aligned edges across zones. Title pills, artwork, and language bars are centered. Check all three languages, including the Summit text and the Distribution & Marketing pill, for clipping and inconsistent padding.
13. Only the opened column's pill moves up; the logo shrinks only while column 3 or 4 is open; open expandable columns show their sub-item under the pill. Compare idle/open screens with the two reference mockups. Background media (when configured) loops, and a missing file falls back to the coded gradient.

14. Responsive: at 390 × 844 (phone) and 820 × 1180 (tablet) the layout switches to the stacked list (1 / 2 columns), scrolls vertically without horizontal overflow, opens columns in place, and keeps text inside cards. Wide landscape screens (≥ 1024 px) keep the wall layout.

## External production checks

Deploy Sensor Service v2/wall-v5, recalibrate against measured targets, and test on hardware. Validate offline font/media availability, extended memory/performance, multi-user occlusion, startup supervision, and rollback. Photos/translations need client approval separately.
