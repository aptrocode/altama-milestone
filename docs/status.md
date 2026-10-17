# Project status

Updated 17 October 2026. Package version remains 0.3.0; the Summit revision (branch `codex/feat-summit-wall-theme`) is unreleased until its PR/release workflow completes.

## Implemented

- Fullscreen Nuxt 4 SPA with six independent wall columns on the official 2304 × 1344 canvas, laid out after the two ALTAMA Summit 2026 "Powering Partnership" reference mockups.
- Responsive stacked layout for phones (1 column) and tablets/portrait screens (2 columns) using the same column components at a uniform scale; the wall layout stays fixed on wide landscape screens.
- Content split into one file per column (`app/data/columns/`) with typed helpers and an editing guide (`docs/content.md`).
- Per-column layouts: idle glowing frame (title pill, artwork or sub-item tiles, flags) and open layout (raised pill, sub-item name, rounded content card). Opening one column leaves the other five unchanged; the shared logo shrinks only while column 3 or 4 is open.
- Our Brand (Tekiro, RYU, Rexco) and Distribusi & Pemasaran open their sub-items directly from idle tiles; there is no submenu.
- Open cards: pages that each own a photo slider and text; hold arrows move photos within the page, hold page tabs switch the whole page; bullet/paragraph copy from the references and a corner Back badge.
- Swappable stage media (`app/data/wall-media.ts`): reference-derived background image (with skyline) with animated light sweeps along its top-corner waves, coded gradient fallback, optional looping video, and logo; every media entry carries `approved`.
- Floating flag-only Indonesian (default), English, and Simplified Chinese controls inside idle frames; open content keeps the chosen locale.
- Geometry-derived SVG hold borders on main, tile, arrow, and page-tab targets with one-second perimeter progress, cancellation cleanup, and a static reduced-motion outline. Native keyboard activation and operator shortcuts remain available.
- Serializable Pinia snapshots (`phase`, `locale`, `subItem`, `photo`, `page`) and a scope-owned 30-second inactivity controller.
- Native WebSocket protocol v2 / wall-v4, semantic actions (including `page`), UI-state publication with photo/page counts, readiness/session/sequence/layout validation, and reconnect/heartbeat handling. OSC bridge supports `/altama/page`.
- Main input rejects contacts inside the language overlay; hidden actions and legacy layout input are rejected.
- Custom recovery/loading UI and development-only diagnostics.
- Validation of flags, translated labels/pages, tab labels and tab-target limits, sub-item tile ownership, idle/open target bounds, and every referenced media file.

Previous GSAP milestone reveal/cache, 19 sketch/color pairs, fixture generation, and obsolete types/utils are removed. The runtime does not render those resources.

## Dependencies

Installed project versions: Nuxt 4.6.1, Vue 3.5.43, Vue Router 5.4.0, Pinia 4.0.3, @pinia/nuxt 1.0.2, @nuxt/fonts 1.0.1, Tailwind/Vite plugin 4.3.3. Tooling: Vitest 5.0.4, vue-tsc 3.3.13, TypeScript 6.0.3, ESLint 10.12.0, @antfu/eslint-config 9.5.1.

GSAP and direct Sharp dependencies were removed in the preceding repair. The Summit revision adds no dependencies; it swaps the `@nuxt/fonts` families from League Spartan to Roboto Condensed and Oswald. Use package.json/bun.lock as the source of truth rather than assuming this snapshot is perpetually latest.

Nuxt, Vue, Pinia, Bun, and Tailwind documentation was fetched through Context7 on 1 October 2026. SVG pathLength/stroke normalization was checked against MDN. See [style](./style.md) and [design](./design.md) for references.

## Validation

- Summit revision 2 (per-page photos, hold arrows/tabs, stacked layout): lint, typecheck, 55 tests across seven files, asset/config validation (17 provisional media files), production build, and static generation passed.
- Headless Edge at 2304 × 1344 and 1600 × 900: every visible target (main, 18 flags, 5 tiles, Back, arrows, page tabs) matches wall-v4 within 0.06 logical px after transitions settle.
- Every open page fits its card without overflow in Indonesian, English, and Simplified Chinese; title pills wrap to at most two lines without clipping.
- Opening one column, choosing tiles directly, moving photos, and switching pages (photos and text together) were checked visually against the reference mockups. Phone (390 × 844) and tablet (820 × 1180) stacked layouts scroll without horizontal overflow and keep text inside cards.
- Normal browser interactions emitted no application console errors (only WebSocket connection failures when the sensor is enabled locally without a running service). The custom 404/recovery page still uses an older palette.
- Build/generate report upstream Nuxt/Nitro dependency warnings but exit successfully. Fonts are bundled into the static output.

## Production gaps

- Final assets from the design team: background video/sequence, official logos, illustrations, and full-resolution photos. Current files are mockup crops (photos 226 × 124 px, one per slider; other slots are numbered placeholders) and need client approval. Column 1's 1996 page and Tekiro PAGE 2 are placeholders, and RYU, Rexco, and Pemasaran have no reference content yet.
- Client approval of company claims and the drafted English/Chinese translations.
- Sensor Service implementation/deployment for protocol v2/wall-v4 and physical recalibration. Old services are intentionally rejected; deploy matching renderer/service geometry together before enabling input.
- Final PC/LED/Hokuyo hardware, multi-user coverage, occlusion, and long-duration performance validation.
- Offline Chinese fonts/media, browser startup/supervision, endpoint configuration, rollout, and rollback.

Physical LED/sensor behavior is not established by local tests. See [testing](./testing.md) for external acceptance.

