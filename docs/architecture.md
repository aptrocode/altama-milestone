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

Open content is a list of up to four pages (`getColumnPages(column, subItem, scrollText)`; with the Scroll teks trial on, pages are grouped by the content's `scrollPages`, default one); each page owns a photo slider and text. `previous`/`next` move `photo` within the current page only when it has at least two photo slots and wrap; `page` selects another page only when there are at least two, and resets `photo` to 0. Back always returns to idle. Manual reset preserves locale immediately. `publishedColumns` adds the current page's `photoCount`, the `pageCount`, and `tabsTop` to each snapshot for Sensor Service. When the page count shrinks under an open card (Scroll teks), `useWallController` calls `clampPage` so it shows its first page.

One `getColumnCopy` resolver chooses the localized column label and open sub-item label. Page copy is typed data (paragraphs, bullets with glow labels, fact tables, numbered lists) rendered as plain text by `WallPageCopy`; no HTML interpolation or localization dependency is used. Media entries are `{ src, approved }` in the column files and `wall-media.ts`.

## Resource lifecycle

`useWallController` owns a private timer map per instance. Accepted actions and activity restart only that column's timer, whose length is the dashboard reset time (`settings.wall.resetSeconds`, read when each timer starts). Idle Indonesian columns need no timer; idle English/Chinese columns do. Timeout restores the default sub-item, photo/page zero, idle phase, and Indonesian. R/Escape reschedules any remaining language timer. Scope disposal clears every timer.

Operator settings live in the `settings` store (serializable `hold` rules, `wall` settings, and `fonts`; see [dashboard](./dashboard.md)). `app/plugins/settings-storage.client.ts` loads them from localStorage, saves every change, and applies changes from other tabs through the `storage` event (an app-lifetime listener). `WallHoldButton` reads its group's rule; `WallColumn` moves its section by the card offset on the LED wall and passes its card's font range and the tallest card height to `WallOpenCard`; KioskStage sets the font CSS variables and publishes the touch-relevant settings to Sensor Service whenever they change.

`bindHold` owns pointer listeners and progress/completion timers and takes `{ onActivate, mode, durationMs }`: `tap` activates on a normal press, `hold` after the duration of holding, `delay` after the duration following one press (also from a sensor input's `wall:press` event). When the duration has passed it still waits for the border animation (`hold-border`, via `getAnimations`) to finish, because that animation only starts at the next rendered frame and a busy wall can delay it; from then on a release no longer cancels. The finished border then stays for `HOLD_SETTLE_MS` (250 ms) before `onActivate`; a border that never finishes (frozen page) is waited for at most `HOLD_STALL_MS`. Re-renders (`update` with the same mode, e.g. the idle touch hint moving on) and window blur never cancel a running Tap + delay or Hold, and `update()` puts back the `holding`/`hold-complete` classes that Vue's class patch may have dropped. A script click (`element.click()`, untrusted, detail 0) presses like a tap instead of acting at once like a keyboard click. Pointer capture is optional (`capturePointer`), since script-sent pointers cannot be captured. It accepts every touch contact, not only the primary pointer (native multitouch on a touchscreen overlay): each button follows the first pointer that pressed it, so buttons in different columns hold at the same time; a further finger on an already-held button is ignored, and one pointer drives at most one button. Leaving, cancellation (including a scroll gesture in the stacked layout), pointer release, blur, or unmount cancels incomplete contact. The directive updates its callback when Vue updates it. Native keyboard/assistive clicks activate immediately. `useStackedLayout` owns one `matchMedia` listener and removes it when its scope is disposed.

`KioskBackground` owns its optional `<video>`: it pauses and releases the source on unmount and falls back to the coded gradient when media fails to load. `WallIdleFrame` owns its card video and releases it 400 ms after unmount, because Vue runs unmount hooks when the frame's leave transition starts and the artwork must fade with the flags. `WallPageCopy` owns a ResizeObserver (size fitting within the Min–Maks range and natural height for the auto-height card) and, in scroll mode, its pointer-drag state; it disconnects on unmount. `WallOpenCard` owns a ResizeObserver on its 1000-unit probe (CSS px per logical px for the text limit) and its tab-flash timers. `DashboardCardFit` renders every card page invisibly on Dashboard → Font to report the sizes used.

`useSensorSocket` owns native WebSocket, reconnect, heartbeat, and session state. It publishes serializable UI snapshots so Sensor Service knows which target group is visible. On `/dashboard/sensor`, `useSensorAdmin` owns a separate admin socket to the same service (config, calibration, live contacts) and closes it with the Sensor page's scope. Pinia contains none of those browser resources.

The Sensor Service (`sensor-service/`, Bun) is a separate process: `main.ts` owns sockets, UDP ports, the LiDAR TCP client, and timers; `service.ts` is transport-free (wall protocol, admin contract, source selection) so tests drive it directly. Geometry and visibility come from `shared/sensor-targets.ts`, the same canonical JSON the renderer validates against.

## Geometry and dependency policy

The stage fills the viewport in both dimensions. CSS x/y units scale independently from the logical 2304 × 1344 canvas. Frame spacing and control dimensions come from `shared/installation-layout.json`. Logical sensor coordinates never use browser pixels.

WallHoldButton derives its SVG outline from the same target rectangle, with arcs matching the button corners. A scoped dash-offset animation uses the hold utility's duration; it adds no timers or state. Card panels inherit outer rounding and clip their content.

Nuxt/Vue handle rendering, Pinia stores state, Tailwind styles controls, and Vitest checks behavior. Native pointer events, WebSocket, and timers handle interaction. GSAP, Sharp, legacy milestone state/types/artwork, and fixture generation are removed because the current wall does not use them. Add a dependency only for an active requirement.
