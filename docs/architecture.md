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

`KioskStage` owns one wall controller, one socket, the shared logo, and the layout choice (`useStackedLayout`). `KioskBackground` renders the stage media. Each `WallColumn` is positioned on its logical section (wall layout) or inside its own uniformly scaled box (stacked layout, via the `origin` prop) and renders either `WallIdleFrame` or the open layout (`WallColumnPill`, sub-item name, `WallOpenCard`, Back), so a column never moves its neighbours. `WallOpenCard` renders the current page's photo slider, hold arrows, hold page tabs, and `WallPageCopy`. Positions come from `rectStyle(rect, origin)` over the canonical layout JSON. Content lives in `app/data/columns/` (one file per column, see [content](./content.md)).

## State and transitions

Each column has `phase` (`idle`/`active`), `locale`, `subItem`, `photo`, and `page`. Single columns open with `main`; columns 2/5 open directly from idle sub-item tiles (`subItem`), and operator/OSC `main` opens their default sub-item. Main/sub-item input is accepted only while idle, so repeated sensor input does not close content. Operator digits map an open column to Back.

Language selection is accepted only while idle. The chooser is an absolute sibling of the hold targets inside the idle frame; open content retains the selected locale and hides the chooser. Sensor parsing excludes the language overlay rectangle from main input, including gaps between flags.

Open content is a list of pages (`getColumnPages`); each page owns a photo slider and text. `previous`/`next` move `photo` within the current page only when it has at least two photo slots and wrap; `page` selects another page only when there are at least two, and resets `photo` to 0. Back always returns to idle. Manual reset preserves locale immediately. `publishedColumns` adds the current page's `photoCount` and the `pageCount` to each snapshot for Sensor Service.

One `getColumnCopy` resolver chooses the localized column label and open sub-item label. Page copy is typed data (paragraphs, bullets with bold leads, numbered lists) rendered as plain text; no HTML interpolation or localization dependency is used. Media entries are `{ src, approved }` in the column files and `wall-media.ts`.

## Resource lifecycle

`useWallController` owns a private timer map per instance. Accepted actions and activity restart only that column's 30-second timer. Idle Indonesian columns need no timer; idle English/Chinese columns do. Timeout restores the default sub-item, photo/page zero, idle phase, and Indonesian. R/Escape reschedules any remaining language timer. Scope disposal clears every timer.

`bindHold` owns pointer listeners and progress/completion timers. Leaving, cancellation (including a scroll gesture in the stacked layout), pointer release, blur, or unmount cancels incomplete contact. The directive updates its callback when Vue updates it. Native keyboard/assistive clicks activate immediately. `useStackedLayout` owns one `matchMedia` listener and removes it when its scope is disposed.

`KioskBackground` owns its optional `<video>`: it pauses and releases the source on unmount and falls back to the coded gradient when media fails to load.

`useSensorSocket` owns native WebSocket, reconnect, heartbeat, and session state. It publishes serializable UI snapshots so Sensor Service knows which target group is visible. Pinia contains none of those browser resources.

## Geometry and dependency policy

The stage fills the viewport in both dimensions. CSS x/y units scale independently from the logical 2304 × 1344 canvas. Frame spacing and control dimensions come from `shared/installation-layout.json`. Logical sensor coordinates never use browser pixels.

WallHoldButton derives its SVG outline from the same target rectangle, with arcs matching the button corners. A scoped dash-offset animation uses the hold utility's duration; it adds no timers or state. Card panels inherit outer rounding and clip their content.

Nuxt/Vue handle rendering, Pinia stores state, Tailwind styles controls, and Vitest checks behavior. Native pointer events, WebSocket, and timers handle interaction. GSAP, Sharp, legacy milestone state/types/artwork, and fixture generation are removed because the current wall does not use them. Add a dependency only for an active requirement.
