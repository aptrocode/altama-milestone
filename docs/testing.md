# Testing

## Commands

`bun dev` (wall + Sensor Service) for development; `bun run dev:web` runs Nuxt alone.

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
- direct sub-item tiles, column independence, hidden-action rejection, repeated main input, photo-slider wrap, auto slide (interval, restart, not activity), pages that switch their own photos and text, and Back/reset;
- per-column inactivity, R/Escape translated-idle regression, operator-close regression, cross-instance isolation, and scope disposal;
- one-second pointer hold, native multitouch (simultaneous holds on different buttons, independent release, a second finger on a held button ignored, one pointer per button), cancellation/release/blur, native keyboard activation, updated callbacks, and listener/timer cleanup;
- protocol v2 parsing, input destinations, tile/arrow/page/Back routing, missing main targets for columns 2/5, old-version rejection, and declared-target coordinates;
- the stacked-layout media query and its listener cleanup;
- hold settings normalization/defaults (language and back off), wall settings clamping, configurable reset delay, card-offset target shifting and input validation, configurable dwell, hold-off normal press, and the `hold` payload sent to Sensor Service;
- socket handshake, readiness/calibration gating, replay/sequence/session/layout rejection, outgoing state snapshots, heartbeat failure, stop cleanup, and disabled reconnect;
- Sensor Service: SCIP 2.0 checksums/encoding/stream parsing and PP, homography calibration (exact, noisy, degenerate), scan filtering/background/clustering/tracking, Augmenta v1/v2 and TUIO 1.1 parsing with release/timeouts and Invert Y, per-column target visibility and hit priority, dwell from hold rules with the off/language minimum, one input per contact, jitter grace, calibration suppression, admin/wall separation, config merge, OSC show control, and frames validated by the renderer's own parser (including a synthetic UST-10LX end-to-end run).

Do not add tests that merely restate markup. Use controlled timers for behavior and browser measurements for geometry.

## Browser acceptance

1. Verify actual CSS viewports 2304 × 1344 and 1600 × 900. Stage fills both dimensions without scrolling or letterboxing.
2. Fresh load: six idle columns, all Indonesian, branding visible.
3. Choose English/Chinese independently while idle, then open those columns. Their language is retained; flags disappear while open. Return to idle to choose again.
4. Confirm flag-only controls inside each card, selected state, focus, language attributes, full translated headings, and no visible 1–6 badges.
5. Hold a main, tile, photo-arrow, or page-tab button for one second; its border traces the matching outline. Short/cancelled contact clears progress and does nothing. Reduced motion uses a static border until completion. Enter and Space activate focused buttons. Digits 1–6 open/go back in their own column. On a touchscreen overlay, two fingers holding buttons in different columns both complete; a second finger on an already-held button changes nothing.
6. Holding a Tekiro/RYU/Rexco or Distribusi/Pemasaran tile opens it directly; opening any column leaves the other five unchanged. Back returns to idle.
7. Arrows move only the current page's photos and wrap; page tabs (column 1, Tekiro) switch photos and text together and restart the slider. Both restart only that column's timer. With Tombol slider off on `/dashboard/wall` the arrows disappear and photos advance every Auto slide seconds (default 5) without delaying the reset. The visible page's tab cannot be pressed, held, or triggered by sensor input; arrow discs nudge in their direction.
8. At the dashboard reset time (default 30 seconds) without activity, only the inactive column returns to idle/Indonesian. R/Escape retain languages immediately and their timers still expire.
9. Compare every visible `data-sensor-action` button with its shared logical rectangle, including tiles, Back, arrows, and page tabs. Arrows align with the photo frame's vertical midpoint; flags float inside and centered only while idle, without reducing content height. Scale x/y independently for previews.
10. Unknown route shows the custom error page; recovery returns to the wall.
11. Production console has no application errors. D diagnostics stay hidden by default and show actual sensor state in development.
12. All six columns have equal widths and aligned edges across zones. Title pills (labels left-aligned next to the icon), artwork, and language bars are centered in their columns. Check all three languages, including the Summit text and the Distribution & Marketing pill, for clipping and inconsistent padding.
13. Only the opened column's pill moves up; the logo shrinks only while column 3 or 4 is open; open expandable columns show their sub-item under the pill. Compare idle/open screens with the two reference mockups. Background media (when configured) loops, and a missing file falls back to the coded gradient.

14. Responsive: at 390 × 844 (phone) and 820 × 1180 (tablet) the layout switches to the stacked list (1 / 2 columns), scrolls vertically without horizontal overflow, opens columns in place, and keeps text inside cards. Wide landscape screens (≥ 1024 px) keep the wall layout.

15. Dashboard: `/dashboard` opens Hold; the sidebar links Hold, Wall, and Sensor (a drawer below 1024 px that closes on navigation) and the content scrolls. On Hold turn a group off and change another's duration, on Wall change the reset time and card offset, save, and confirm the wall (same browser, also an already open tab) uses the new behaviour; switch Tombol close off and confirm open cards have no ✕; Default, Export/Import, and Reset ke default (confirmation dialog) round-trip the settings; every page works at phone width.
16. Sensor (no hardware): run `bun run sensor:service`, the wall with `NUXT_PUBLIC_SENSOR_ENABLED=true NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787`, and `/dashboard`. Select Hokuyo at 127.0.0.1, start `bun run sensor:sim hokuyo --tap <x,y,900>` at each calibration point and press **Ambil** in calibration mode, save, end calibration, then run taps on targets: the preview shows contacts and progress, and the wall opens/changes only the touched column after the configured dwell. Repeat with `sensor:sim augmenta --flip-y` (Invert Y on) and `sensor:sim tuio`.

## External production checks

Deploy Sensor Service v2/wall-v7, recalibrate against measured targets, and test on hardware. Validate offline font/media availability, extended memory/performance, multi-user occlusion, startup supervision, and rollback. Photos/translations need client approval separately.
