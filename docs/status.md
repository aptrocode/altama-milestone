# Project status

Updated 1 October 2026. Package version remains 0.3.0; this card revision is unreleased until its PR/release workflow completes.

## Implemented

- Fullscreen Nuxt 4 SPA with six independent wall columns.
- Six equal 350 × 510.72 px portrait cards on the official 2304 × 1344 canvas; 35% / 38% / 27% zones.
- Floating flag-only Indonesian (default), English, and Simplified Chinese controls inside idle cards. Submenu/carousel retain the chosen locale, hide the flags, and fill the card.
- Tailwind-first grids, logical typography/padding, centered copy, and matching clipped card/inner corners. Global CSS contains theme/document rules; custom animations are scoped to Vue components.
- Geometry-derived SVG hold borders with one-second perimeter progress, cancellation cleanup, and a static reduced-motion outline. Native keyboard activation and operator shortcuts remain available.
- Main/submenu/carousel UI with centered left/right arrows and a bottom counter.
- Serializable Pinia snapshots and a scope-owned 15-second inactivity controller.
- Native WebSocket protocol v2 / wall-v2, semantic actions, UI-state publication, readiness/session/sequence/layout validation, and reconnect/heartbeat handling.
- Main input rejects contacts inside the language overlay; hidden language actions and legacy layout input are rejected.
- Custom recovery/loading UI and development-only diagnostics.
- Validation of flags, translated configuration, submenu ownership, and target bounds inside each card.

Previous GSAP milestone reveal/cache, 19 sketch/color pairs, fixture generation, and obsolete types/utils are removed. The runtime does not render those resources.

## Dependencies

Installed project versions: Nuxt 4.5.2, Vue 3.5.43, Vue Router 5.3.1, Pinia 4.0.3, @pinia/nuxt 1.0.2, @nuxt/fonts 0.14.0, Tailwind/Vite plugin 4.3.3. Tooling: Vitest 5.0.3, vue-tsc 3.3.11, TypeScript 6.0.3, ESLint 10.11.0, @antfu/eslint-config 9.5.1.

GSAP and direct Sharp dependencies were removed in the preceding repair. This revision adds no dependencies or version upgrades. Use package.json/bun.lock as the source of truth rather than assuming this snapshot is perpetually latest.

Nuxt, Vue, Pinia, Bun, and Tailwind documentation was fetched through Context7 on 1 October 2026. SVG pathLength/stroke normalization was checked against MDN. See [style](./style.md) and [design](./design.md) for references.

## Validation

- Lint, typecheck, 43 tests across five files, active asset/config validation, production build, and static generation passed.
- Measured stage bounds are exactly 2304 × 1344 and 1600 × 900, starting at (0, 0), without scrolling.
- All six cards are 350 px wide at the official canvas. Preview widths differ by at most 0.016 px from each other through browser rounding.
- Canonical target differences stay below 0.03 CSS px at the official canvas and 0.05 px at the preview, across flags, submenu/active Back controls, submenu items, and arrows.
- Indonesian, English, and Simplified Chinese submenu/carousel copy wrap without clipping. Idle labels/flags also fit; independent selection, Enter/Space, previous-slide wrap, and returning to idle were checked.
- Production CSS contains matching scoped hold keyframes/state selectors, a 1000 ms duration, and reduced-motion rules. Pointer hold/cancellation lifecycles are unit-tested; a live pointer hold animation still needs manual visual acceptance.
- Normal browser interactions emitted no console errors. The custom 404/recovery was verified in the preceding repair.
- Before/after screenshots are under test/evidence/. Final screenshots use the wall-styled- prefix.
- Build/generate report upstream Nuxt/Nitro dependency warnings but exit successfully.

## Production gaps

- Client approval of company claims, translations, and final photos. Carousel images remain placeholders.
- Sensor Service implementation/deployment for protocol v2/wall-v2 and physical recalibration. Old services are intentionally rejected; deploy matching renderer/service geometry together before enabling input.
- Final PC/LED/Hokuyo hardware, multi-user coverage, occlusion, and long-duration performance validation.
- Offline Chinese fonts/media, browser startup/supervision, endpoint configuration, rollout, and rollback.

Physical LED/sensor behavior is not established by local tests. See [testing](./testing.md) for external acceptance.

