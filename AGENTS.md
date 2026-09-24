# Agent guide

This is a Nuxt 4 client-rendered kiosk for a 2304 × 1344 fullscreen LED installation. Read only the document needed for the task:

- `docs/architecture.md`: boundaries, state flow, directory ownership, and invariants.
- `docs/design.md`: client canvas, reference composition, year controls, and illustration provenance.
- `docs/language.md`: per-section languages, translation ownership, flag controls, and approval rules.
- `docs/assets.md`: artwork names, dimensions, validation, and contributor rules.
- `docs/sensor.md`: WebSocket v1 contract and the Sensor Service boundary.
- `docs/testing.md`: commands, browser checks, and acceptance criteria.
- `docs/push.md`: required issue, branch, commit, pull request, merge, and cleanup workflow.
- `docs/release.md`: version bump, git tag, repository metadata, and release notes style.
- `docs/status.md`: implemented scope, dependency snapshot, and open production work.

## Source map

- `app/components/kiosk/`: fullscreen composition and input routing.
- `app/components/milestone/`: reusable section UI.
- `app/composables/`: state orchestration and browser-resource lifecycles.
- `app/stores/`: serializable Pinia state only.
- `app/error.vue`: global Nuxt error UI.
- `shared/`: milestone catalog and logical sensor geometry.
- `public/milestones/`: runtime sketch/color pairs.
- `scripts/`: fixture generation and asset validation.
- `test/`: behavior tests for races, cache, and protocol validation.

## Non-negotiable rules

- LEFT, CENTER, and RIGHT animate and fail independently.
- LEFT, CENTER, and RIGHT choose language independently; Indonesian is the fresh-load default.
- The newest milestone selection replaces the previous pending selection.
- Keep the current artwork visible until the replacement pair is decoded and staged.
- Keep DOM nodes, Images, WebSockets, timers, Promises, and GSAP instances out of Pinia.
- Browser and sensor input must use the same section API.
- Raw LiDAR, tracking, calibration, and sensor hit detection belong to Sensor Service.
- The kiosk fills the viewport; do not add an outer container, `max-width`, or letterboxing.
- Do not recreate atoms/molecules/organisms or add barrel files without a concrete need.
- Treat every catalog entry marked `placeholder` as unapproved content.

## Library and change workflow

Read `package.json` to inspect the exact versions of dependencies and scripts before changing framework or library usage. Use Context7 before changing a framework/library API: resolve the library ID, then query one concept at a time. If Context7 is unavailable, use only the library's current official documentation and record this in the handoff. Follow `docs/push.md` for repository work.

Run the checks in `docs/testing.md` after relevant changes. Update the matching document whenever an invariant, protocol, asset rule, dependency, or workflow changes.
