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
- independent column languages and phase/sub-item/slide preservation;
- submenu ownership, hidden-action rejection, repeated main input, carousel wrap, and Back/reset;
- per-column inactivity, R/Escape translated-idle regression, operator-close regression, cross-instance isolation, and scope disposal;
- one-second pointer hold, cancellation/release/blur, native keyboard activation, updated callbacks, and listener/timer cleanup;
- protocol v2 parsing, all six input destinations, submenu/carousel/Back routing, old-version rejection, and declared-target coordinates;
- socket handshake, readiness/calibration gating, replay/sequence/session/layout rejection, outgoing state snapshots, heartbeat failure, stop cleanup, and disabled reconnect.

Do not add tests that merely restate markup. Use controlled timers for behavior and browser measurements for geometry.

## Browser acceptance

1. Verify actual CSS viewports 2304 × 1344 and 1600 × 900. Stage fills both dimensions without scrolling or letterboxing.
2. Fresh load: six idle columns, all Indonesian, branding visible.
3. Switch separate columns to English/Chinese; neighboring language, phase, and slide stay unchanged.
4. Confirm flag-only controls, selected state, focus, language attributes, and full translated headings.
5. Hold a main/sub-item button for one second; short/cancelled contact does nothing. Enter and Space activate focused buttons. Digits 1–6 open/go back in their own column.
6. Columns 2/5 show submenu choices before selected content. Back returns correctly.
7. Carousel arrows wrap; they restart only that column's timer.
8. At 15 seconds without activity, only the inactive column returns to idle/Indonesian. R/Escape retain languages immediately and their timers still expire.
9. Compare every visible `data-sensor-action` button with its shared logical rectangle, including both submenu and active Back targets. Scale x/y independently for previews.
10. Unknown route shows the custom error page; recovery returns to the wall.
11. Production console has no application errors. D diagnostics stay hidden by default and show actual sensor state in development.

## External production checks

Deploy Sensor Service v2/wall-v1, recalibrate against measured targets, and test on hardware. Validate offline font/media availability, extended memory/performance, multi-user occlusion, startup supervision, and rollback. Photos/translations need client approval separately.
