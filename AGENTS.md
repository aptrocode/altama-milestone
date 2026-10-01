# Agent guide

Nuxt 4 client-rendered kiosk with six independent columns for a **2304 × 1344** fullscreen LED wall.

Read only the document needed:
- `docs/architecture.md`: state, component boundaries, and resource lifecycles.
- `docs/design.md`: fullscreen composition, logical geometry, and interaction.
- `docs/style.md`: Tailwind-first utilities, scoped CSS exceptions, and logical spacing.
- `docs/language.md`: per-column translations and flag accessibility.
- `docs/assets.md`: current assets, placeholders, and naming.
- `docs/sensor.md`: protocol v2 / wall-v2 and Sensor Service rollout.
- `docs/testing.md`: commands, regression coverage, and browser acceptance.
- `docs/push.md`: issue, branch, commit, PR, review, merge, and cleanup.
- `docs/release.md`: version, tag, metadata, and release notes when release is requested.
- `docs/status.md`: implemented scope, dependencies, and production gaps.

## Source map

- `app/components/kiosk/`: viewport composition, operator shortcuts, socket, diagnostics.
- `app/components/wall/`: presentational column, flags, carousel, hold button, and hold cue.
- `app/composables/useWallController.ts`: shared action API and per-instance inactivity timers.
- `app/stores/`: serializable wall and system state only.
- `app/data/wall-config.ts`: column/sub-item copy; `wall-copy.ts`: interface translations/flags.
- `shared/wall.ts`: column IDs, languages, snapshots, and actions.
- `shared/installation-layout.json`: canonical sensor canvas and target geometry.
- `app/utils/`: strict sensor parsing and hold lifecycle.
- `app/error.vue`: global recovery UI.
- `public/flags/`: local SVG flags; `scripts/check-assets.ts`: active asset/config validation.
- `test/`: state, controller, hold, protocol, and socket regression tests.

## Invariants

- All six columns select language while idle, content, and carousel position independently.
- Six equal portrait cards use floating absolute flag controls inside their lower area only while idle; submenu/carousel content uses the full card. Do not show numeric badges; place carousel arrows at the left/right midpoint of each card.
- Fresh loads start idle in Indonesian. After 15 seconds without interaction, only that column returns to idle/Indonesian.
- Manual Back and R/Escape preserve languages immediately; non-default idle columns still have an inactivity timer.
- Mouse/touch hold for one second with border progress following the button's corners; release/cancel clears it. Native Enter/Space activate directly. Sensor Service applies equivalent dwell to main/sub-item input.
- Browser, operator, and sensor actions use `useWallController.dispatch`; UI never mutates Pinia directly.
- Keep DOM, sockets, timers, Promises, and animation instances outside Pinia state. Dispose browser resources with their owning scope.
- Fill both viewport dimensions. No outer container, maximum width, fixed aspect ratio, or letterboxing.
- Prefer Tailwind classes, including arbitrary values/CSS variables. Use Vue `<style scoped>` only when utilities cannot express the behavior; keep main.css for global theme/document rules. Read `docs/style.md` before styling changes.
- Geometry changes require a new layout version and matching Sensor Service deployment.
- Raw LiDAR, tracking, calibration, and hit detection belong to Sensor Service.
- Photos and copy are provisional until client approval. Do not describe placeholders as final assets.
- Do not recreate atoms/molecules/organisms or add barrel files without a concrete need.
- The `dika/` directory is an isolated sandbox for Dika's prototypes and mockups. Agents and contributors working in `dika/` must not edit or delete any files outside `dika/`. All production kiosk changes belong exclusively to @adydetra (Dewa).

## Change workflow

Read `package.json` before changing dependencies or framework usage. Use Context7: resolve the library, then query one concept at a time before changing APIs. If unavailable, use current official documentation and record the fallback. Follow `docs/push.md` for repository work, run relevant `docs/testing.md` checks, and update the document whose invariant changed.
