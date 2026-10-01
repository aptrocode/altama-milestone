# Project status

Updated 1 October 2026. Package version remains 0.3.0; this repair is unreleased until its PR/release workflow completes.

## Implemented

- Fullscreen Nuxt 4 SPA with six independent wall columns.
- Plain translated copy and flag-only controls for Indonesian, English, and Simplified Chinese.
- Main/submenu/carousel UI, one-second pointer hold, native keyboard activation, and operator shortcuts.
- Serializable Pinia snapshots and a scope-owned 15-second inactivity controller.
- Native WebSocket protocol v2 / wall-v1, six-column semantic actions, UI-state publication, readiness/session/sequence/layout validation, and reconnect/heartbeat handling.
- Custom recovery/loading UI and development-only diagnostics.
- Validation of active flags, translated configuration, submenu ownership, and sensor target geometry.

Previous GSAP milestone reveal/cache, 19 sketch/color pairs, fixture generation, and obsolete types/utils are removed. The runtime does not render those resources.

## Dependencies

Installed project versions: Nuxt 4.5.2, Vue 3.5.43, Vue Router 5.3.1, Pinia 4.0.3, @pinia/nuxt 1.0.2, @nuxt/fonts 0.14.0, Tailwind/Vite plugin 4.3.3. Tooling: Vitest 5.0.3, vue-tsc 3.3.11, TypeScript 6.0.3, ESLint 10.11.0, @antfu/eslint-config 9.5.1.

GSAP and direct Sharp dependencies were removed. No new dependency was added; existing versions were not upgraded. Use package.json/bun.lock as the source of truth rather than assuming this snapshot is perpetually latest.

Nuxt component, Vue directive/scope, Pinia subscription, and Bun install documentation was fetched through Context7 on 1 October 2026.

## Production gaps

- Client approval of company claims, translations, and final photos. Carousel images remain placeholders.
- Sensor Service implementation/deployment for protocol v2/wall-v1 and physical calibration. Old service messages are intentionally rejected.
- Final PC/LED/Hokuyo hardware, multi-user coverage, occlusion, and long-duration performance validation.
- Offline Chinese fonts/media, browser startup/supervision, endpoint configuration, rollout, and rollback.

Physical LED/sensor behavior is not established by local tests. See [testing](./testing.md) for the required checks.

## Repair validation

- Lint, typecheck, 38 tests across five files, active asset/config validation, production build, and static generation passed.
- Measured stage bounds are exactly 2304 × 1344 and 1600 × 900, starting at (0, 0), without scrolling. Previously the 1600 × 900 stage was 1542.86 px wide.
- Enter/Space activate main/sub-item controls. Column 1 Chinese and column 6 English leave columns 2–5 Indonesian. Official target bounds differ from shared geometry by less than 0.03 CSS px.
- Normal wall interactions emitted no browser console errors. Intentional unknown-route navigation showed the custom 404, emitted Nuxt's app-initialization error diagnostic, and recovered successfully to a fresh wall.
- Before/after screenshots are under `test/evidence/`. Photos and physical sensor operation remain unapproved/unvalidated.

