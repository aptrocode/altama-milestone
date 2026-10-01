# Architecture

The renderer is a Nuxt 4 SPA (`ssr: false`). Application code is under `app/`, static assets under `public/`, shared domain/geometry under `shared/`, and behavior tests under `test/`.

## State flow

```text
pointer hold / native keyboard / operator shortcut / validated sensor input
  -> useWallController.dispatch(WallAction)
  -> wall store validates phase and column ownership
  -> serializable column snapshot
  -> presentational Vue components
```

`KioskStage` owns one wall controller and one socket. `WallColumn` receives configuration, snapshot, and copy; it emits actions/activity. `WallLanguageSwitcher`, `WallCarousel`, and `WallHoldCue` contain reusable UI. Header/footer copy renders only in the active phase.

## State and transitions

Each column has `phase`, `locale`, `subItem`, and `slide`. Columns 2/5 open a submenu; other columns open content directly. Main input opens only idle columns, so repeated sensor input does not close content. Operator digits map an open column to Back.

Sub-item selection is accepted only in its owning column's submenu. Carousel input is accepted only in active content and wraps using the configured slide count. Back from expandable content returns to the submenu; other Back input returns to idle. Manual reset preserves locale immediately.

One `getColumnCopy` resolver chooses localized column/sub-item copy. Labels are plain text; no HTML interpolation or localization dependency is used.

## Resource lifecycle

`useWallController` owns a private timer map per instance. Accepted actions and activity restart only that column's 15-second timer. Idle Indonesian columns need no timer; idle English/Chinese columns do. Timeout restores the initial sub-item, slide zero, idle phase, and Indonesian. R/Escape reschedules any remaining language timer. Scope disposal clears every timer.

`bindHold` owns pointer listeners and progress/completion timers. Leaving, cancellation, pointer release, blur, or unmount cancels incomplete contact. The directive updates its callback when Vue updates it. Native keyboard/assistive clicks activate immediately.

`useSensorSocket` owns native WebSocket, reconnect, heartbeat, and session state. It publishes serializable UI snapshots so Sensor Service knows which target group is visible. Pinia contains none of those browser resources.

## Geometry and dependency policy

The stage fills the viewport in both dimensions. CSS x/y units scale independently from the logical 2304 × 1344 canvas. Frame spacing and control dimensions come from `shared/installation-layout.json`. Logical sensor coordinates never use browser pixels.

Nuxt/Vue handle rendering, Pinia stores state, Tailwind styles controls, and Vitest checks behavior. Native pointer events, WebSocket, and timers handle interaction. GSAP, Sharp, legacy milestone state/types/artwork, and fixture generation are removed because the current wall does not use them. Add a dependency only for an active requirement.
