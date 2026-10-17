# Agent guide

Nuxt 4 client-rendered kiosk with six independent columns for a **2304 × 1344** fullscreen LED wall.

Read only the document needed:
- `docs/architecture.md`: state, component boundaries, and resource lifecycles.
- `docs/design.md`: fullscreen composition, logical geometry, and interaction.
- `docs/style.md`: Tailwind-first utilities, scoped CSS exceptions, and logical spacing.
- `docs/language.md`: per-column translations and flag accessibility.
- `docs/content.md`: where each column's text, pages, photos, and tiles live and how to replace them.
- `docs/assets.md`: current assets, placeholders, and naming.
- `docs/sensor.md`: protocol v2 / wall-v4 and Sensor Service rollout.
- `docs/testing.md`: commands, regression coverage, and browser acceptance.
- `docs/push.md`: issue, branch, commit, PR, review, merge, and cleanup.
- `docs/release.md`: version, tag, metadata, and release notes when release is requested.
- `docs/status.md`: implemented scope, dependencies, and production gaps.

## Source map

- `app/components/kiosk/`: wall vs stacked (phone/tablet) layout, background media layer, operator shortcuts, socket, diagnostics.
- `app/components/wall/`: `WallColumn` (orchestrator), `WallIdleFrame` (mockup 1), `WallOpenCard` (mockup 2: page photo slider, arrows, page tabs), `WallPageCopy`, `WallColumnPill`, `WallColumnIcon`, `WallLanguageSwitcher`, and `WallHoldButton`.
- `app/composables/useWallController.ts`: shared action API and per-instance inactivity timers; `useStackedLayout.ts`: phone/tablet media query.
- `app/data/columns/`: one file per column (labels, artwork, tiles, pages, photos) plus `helpers.ts`; `app/types/wall-content.ts`: their types.
- `app/stores/`: serializable wall and system state only.
- `app/data/wall-config.ts`: column order and lookups (`getColumnConfig`, `getColumnPages`); `wall-media.ts`: background/logo/skyline/wave sweeps; `wall-copy.ts`: interface translations/flags.
- `shared/wall.ts`: column IDs, languages, snapshots, and actions; `shared/osc.ts`: OSC Show Control packet parser.
- `shared/installation-layout.json`: canonical sensor canvas and target geometry.
- `app/utils/`: strict sensor parsing and hold lifecycle.
- `app/error.vue`: global recovery UI.
- `public/`: local flags plus provisional `summit/`, `illustrations/`, `brands/`, and `photos/` media; `scripts/check-assets.ts`: active asset/config validation.
- `scripts/sensor-osc-service.ts`: OSC UDP show control bridge (Resolume/TouchDesigner) to WebSocket protocol v2.
- `test/`: state, controller, hold, protocol, osc, socket, and layout-query regression tests.

## Invariants

- All six columns select language while idle, content, and carousel position independently.
- Six independent columns follow the Summit reference mockups: idle shows a glowing frame with title pill, artwork or sub-item tiles, and flags; opening a column changes only that column (pill rises, content card appears). Columns 2/5 open sub-items directly from idle tiles; there is no submenu. Do not show numeric badges. Each content page owns its photo slider and text: arrows move photos inside the page; page tabs switch the whole page (photos and text).
- Fresh loads start idle in Indonesian. After 30 seconds without interaction, only that column returns to idle/Indonesian.
- Manual Back and R/Escape preserve languages immediately; non-default idle columns still have an inactivity timer.
- Mouse/touch hold for one second on main, tile, photo-arrow, and page-tab targets, with border progress following the button's corners; release/cancel clears it. Language and Back activate on a normal press. Native Enter/Space activate directly. Sensor Service applies equivalent dwell to the hold targets.
- Browser, operator, and sensor actions use `useWallController.dispatch`; UI never mutates Pinia directly.
- Keep DOM, sockets, timers, Promises, and animation instances outside Pinia state. Dispose browser resources with their owning scope.
- LED/wide landscape (≥ 1024 px wide and wider than tall): fill both viewport dimensions; no outer container, maximum width, fixed aspect ratio, letterboxing, or scrolling. Narrower or portrait screens use the stacked responsive layout (uniform scale per column, vertical scroll). Never let the stacked layout change wall geometry.
- Prefer Tailwind classes, including arbitrary values/CSS variables. Use Vue `<style scoped>` only when utilities cannot express the behavior; keep main.css for global theme/document rules. Read `docs/style.md` before styling changes.
- Geometry changes require a new layout version and matching Sensor Service deployment.
- Raw LiDAR, tracking, calibration, and hit detection belong to Sensor Service.
- Photos, artwork, and copy are provisional until client approval; every media entry carries `approved`. Do not describe placeholders or mockup crops as final assets. Edit content only in `app/data/columns/` (see `docs/content.md`).
- Do not recreate atoms/molecules/organisms or add barrel files without a concrete need.
- The `dika/` directory is an isolated sandbox for Dika's prototypes and mockups. Agents and contributors working in `dika/` must not edit or delete any files outside `dika/`. All production kiosk changes belong exclusively to @adydetra (Dewa).

## Change workflow

Read `package.json` before changing dependencies or framework usage. Use Context7: resolve the library, then query one concept at a time before changing APIs. If unavailable, use current official documentation and record the fallback. Follow `docs/push.md` for repository work, run relevant `docs/testing.md` checks, and update the document whose invariant changed.
