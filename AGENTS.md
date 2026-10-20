# Agent guide

Nuxt 4 client-rendered kiosk with six independent columns for a **2304 × 1344** fullscreen LED wall.

Read only the document needed:
- `docs/architecture.md`: state, component boundaries, and resource lifecycles.
- `docs/design.md`: fullscreen composition, logical geometry, and interaction.
- `docs/style.md`: Tailwind-first utilities, scoped CSS exceptions, and logical spacing.
- `docs/language.md`: per-column translations and flag accessibility.
- `docs/content.md`: where each column's text, pages, photos, and tiles live and how to replace them.
- `docs/dashboard.md`: operator dashboard (`/dashboard`): sidebar with Wall (reset time, card offset, close, slider, and page switches, auto slide/page, language bar mode), Hold, and Sensor pages; backup/reset.
- `docs/assets.md`: deployed media, the `public/new-assets/` master-file layout, encoding commands, and naming.
- `PANDUAN-SENSOR.md` (root, Indonesian): operator guide for connecting the LiDAR (OptiTUIO → TUIO → Sensor Service recommended over TouchDesigner mouse clicks), checking with the Sensor preview, and LiDAR-friendly dashboard settings.
- `docs/sensor.md`: protocol v2 / wall-v7, Sensor Service sources (Hokuyo, Augmenta, TUIO), calibration, admin contract, simulators, and rollout.
- `docs/testing.md`: commands, regression coverage, and browser acceptance.
- `docs/push.md`: issue, branch, commit, PR, review, merge, and cleanup.
- `docs/release.md`: version, tag, metadata, and release notes when release is requested.
- `docs/status.md`: implemented scope, dependencies, and production gaps.

## Source map

- `app/components/kiosk/`: wall vs stacked (phone/tablet) layout, background media layer, operator shortcuts, socket, diagnostics, and `KioskTouchDots` (calibration overlay: dashboard `showTouchDots` or `?dots=1`).
- `app/components/wall/`: `WallColumn` (orchestrator), `WallIdleFrame` (mockup 1), `WallOpenCard` (mockup 2: page photo slider, arrows, page tabs), `WallPageCopy`, `WallColumnPill`, `WallColumnIcon`, `WallLanguageSwitcher`, and `WallHoldButton`.
- `app/composables/useWallController.ts`: shared action API and per-instance inactivity timers; `useStackedLayout.ts`: phone/tablet media query.
- `app/data/columns/`: one file per column (labels, artwork, tiles, pages, photos) plus `helpers.ts`; `app/types/wall-content.ts`: their types.
- `app/stores/`: serializable wall, system, and operator-settings (`hold`, `wall`) state only; `app/plugins/settings-storage.client.ts` persists settings to localStorage.
- Operator dashboard: `app/pages/dashboard.vue` (sidebar shell) with `app/pages/dashboard/{hold,wall,sensor}.vue`, `app/components/dashboard/` (`DashboardHold`, `DashboardWall`, `DashboardSensor`, `DashboardFormActions`), `app/composables/useSettingsBackup.ts` (export/import), `app/composables/useSettingsDraft.ts` (draft/dirty/save/default for the browser-stored forms), and `app/composables/useSensorAdmin.ts` (admin socket).
- `app/data/wall-config.ts`: column order and lookups (`getColumnConfig`, `getColumnPages`); `wall-media.ts`: background/logo/skyline/wave sweeps; `wall-copy.ts`: interface translations/flags.
- `shared/wall.ts`: column IDs, languages, snapshots, and actions; `shared/hold-settings.ts`: hold groups, defaults, limits; `shared/wall-settings.ts`: reset time, card offset, close and slider switches, auto slide, language bar mode; `shared/language-bar.ts`: compact/full/grid language bar geometry, frame extension, and raise; `shared/osc.ts`: OSC packet parser/builder and show-control mapping; `shared/sensor-config.ts`: Sensor Service config and dashboard admin contract; `shared/sensor-targets.ts`: visible targets and hit-testing.
- `shared/installation-layout.json`: canonical sensor canvas and target geometry.
- `app/utils/`: strict sensor parsing, hold lifecycle, and `isVideoSrc` (media type).
- `app/error.vue`: global recovery UI.
- `public/`: deployed media (`summit/`, `illustrations/` card videos, `brands/`, `photos/`, `flags/`), all `approved: false` until the client signs off; `public/new-assets/` holds git-ignored master files (`background/`, `card-sequences/<column-key>/`, `content/<column-key>/`) that are excluded from builds; `scripts/check-assets.ts`: active asset/config validation.
- `sensor-service/`: Sensor Service (`main.ts` transports; `service.ts` wall/admin protocol; `hokuyo.ts`/`scip.ts` UST-10LX; `calibration.ts`, `tracker.ts`, `normalized.ts` Augmenta/TUIO, `dwell.ts`, `show-control.ts`; `simulate.ts`/`synthetic.ts` simulators). `scripts/send-osc.ts`: OSC command sender. `scripts/dev.ts` (`bun dev`): Nuxt dev server plus the Sensor Service in one terminal (reuses a service already on `WS_PORT`; `bun run dev:web` is Nuxt alone). `scripts/wall-launcher.ps1` (via the single `start-wall.bat`): one-click event-PC launcher that builds when stale, runs `.output/server` and the Sensor Service with Bun, opens the wall in a kiosk browser, and kills everything through a Windows job object when its window (or the browser) closes. `app/plugins/dashboard-shortcut.client.ts`: Ctrl+Shift+D switches between the wall and `/dashboard` inside that kiosk.
- `test/`: state, controller (incl. reset delay), hold and wall settings, protocol (incl. card offset), osc, socket, layout-query, and Sensor Service regression tests.

## Invariants

- All six columns select language while idle, content, and carousel position independently.
- Six independent columns follow the Summit reference mockups: idle shows a glowing frame with title pill, artwork or sub-item tiles, and flags; opening a column changes only that column (pill rises, content card appears). Columns 2/5 open sub-items directly from idle tiles; there is no submenu. Do not show numeric badges. Each content page owns its photo slider and text: arrows move photos inside the page; page tabs switch the whole page (photos and text).
- Fresh loads start idle in Indonesian. After the dashboard reset time (`shared/wall-settings.ts`, default 30 s, one value for every column) without interaction, only that column returns to idle/Indonesian. While its card auto-advances (auto slide/page), the reset waits until the slideshow reached its last slide or page since the last interaction (capped at `MAX_RESET_WAIT_MS`, 5 min), then closes instead of wrapping.
- Manual Back and R/Escape preserve languages immediately; non-default idle columns still have an inactivity timer.
- Open-card text follows the card-copy system in `docs/style.md` (dot bullets, glow labels, fact tables, 18 px body); only `WallPageCopy` styles it. Open cards grow with the visible page up to y 1312 before any text shrinks; never clip copy. Card artwork videos and expandable tiles must line up with the layout targets (see "Card artwork" in `docs/style.md`).
- Hold rules come from the operator dashboard (`shared/hold-settings.ts`, default on and 1 s): group `card` (main + tiles), `page` (page tabs), `slider` (photo arrows), `language` (flags), `back` (✕); each can be turned off (normal press) or set to 0.3–5 s; language and back default off. Border progress follows the button's corners and the configured duration; release/cancel clears it. Enter/Space always activate directly. Never hardcode hold behaviour in components; use `WallHoldButton` with a `group`. Sensor Service receives the same rules (`hold` in client messages).
- The close (✕) button follows the dashboard `showClose` switch (default on); when off, WallColumn hides it and Sensor Service drops the Back target.
- The photo arrows follow the dashboard `showArrows` switch (default on); when off, WallOpenCard hides them, Sensor Service drops previous/next, and `useWallController` auto-slides open cards every `autoSlideSeconds` (default 5 s) without counting as activity; a video slide plays once to its end instead of the interval.
- The page tabs follow the dashboard `showPages` switch (default on); when off, WallOpenCard hides them, Sensor Service drops page targets, and `useWallController` shows the next page every `autoPageSeconds` (default 10 s), letting a playing video finish first; with `showArrows` also off, a page with several photos changes after its last photo instead of the interval. The Hold page hides the groups of buttons the Wall page hides.
- The idle language bar follows the dashboard `languageBar` mode (`compact` default, `full` width, or the 2 + 1 `grid` that makes the idle frame taller and raises every column 40 px). Its rects, the frame extension, and the raise come only from `shared/language-bar.ts` (`languageGeometry`, `extendDown`, `columnOffsetY`), which the wall drawing, wall input validation, and Sensor Service targets all use.
- Card position is the dashboard `cardOffsetY` (−120 to 120 logical px), never a hardcoded shift: WallColumn moves the whole column by it on the LED wall, Sensor Service shifts its targets by it, and the wall validates input against the shifted rects.
- Browser, operator, and sensor actions use `useWallController.dispatch`; UI never mutates Pinia directly.
- Keep DOM, sockets, timers, Promises, and animation instances outside Pinia state. Dispose browser resources with their owning scope.
- LED/wide landscape (≥ 1024 px wide and wider than tall): fill both viewport dimensions; no outer container, maximum width, fixed aspect ratio, letterboxing, or scrolling. Narrower or portrait screens use the stacked responsive layout (uniform scale per column, vertical scroll). Never let the stacked layout change wall geometry.
- Prefer Tailwind classes, including arbitrary values/CSS variables. Use Vue `<style scoped>` only when utilities cannot express the behavior; keep main.css for global theme/document rules. Read `docs/style.md` before styling changes.
- Geometry changes require a new layout version and matching Sensor Service deployment.
- Raw LiDAR, tracking, calibration, and hit detection belong to Sensor Service (`sensor-service/`); its config lives in the service's `sensor-config.json`, never in the renderer. Keep `sensor-service/` free of Nuxt/Vue imports.
- Photos, artwork, and copy are provisional until client approval; every media entry carries `approved`. Do not describe placeholders or mockup crops as final assets. Edit content only in `app/data/columns/` (see `docs/content.md`).
- Do not recreate atoms/molecules/organisms or add barrel files without a concrete need.
- The `dika/` directory is an isolated sandbox for Dika's prototypes and mockups. Agents and contributors working in `dika/` must not edit or delete any files outside `dika/`. All production kiosk changes belong exclusively to @adydetra (Dewa).

## Change workflow

Read `package.json` before changing dependencies or framework usage. Use Context7: resolve the library, then query one concept at a time before changing APIs. If unavailable, use current official documentation and record the fallback. Follow `docs/push.md` for repository work, run relevant `docs/testing.md` checks, and update the document whose invariant changed.
