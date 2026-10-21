# Project status

Updated 20 October 2026. Package version 1.0.0 (tag `v1.0.0`, the first stable release for the event); later changes land on `main` through squash-merged PRs and are unreleased until the next release.

## Implemented

- Fullscreen Nuxt 4 SPA with six independent wall columns on the official 2304 × 1344 canvas, laid out after the two ALTAMA Summit 2026 "Powering Partnership" reference mockups.
- Responsive stacked layout for phones (1 column) and tablets/portrait screens (2 columns) using the same column components at a uniform scale; the wall layout stays fixed on wide landscape screens.
- Operator dashboard (`/dashboard`, responsive sidebar: Wall, Hold, Font, Sensor):
  - Wall: one reset time for every section; card Y offset that also moves sensor targets; close button (size and position); slider-arrow and page-tab switches; auto slide every 2–60 s (videos play to the end); auto page (default on, 15 s); the reset waits until the slideshow ends; compact, full-width, or 2 + 1 grid language bar; the Scroll teks trial; the touch-dot calibration overlay (switch or `?dots=1`). Grouped into sections with tooltips, default chips, and a sticky save bar.
  - Hold: a mode per group (card, page, slider, language, back), Tap, Hold, or Tap + delay, with 0.3–5 s; language and back default to Tap.
  - Font: title, sub-item, caption, and tab sizes, the title weight, and a per-card Min–Maks body range (default 24–26 px) with a live fit status. Roboto everywhere.
  - Sensor: source, ports, Invert Y, Hokuyo calibration/background, live status, contact preview.
  - Settings are saved in localStorage with export/import and reset, applied live to the wall, and published to Sensor Service.
- One-click event-PC launcher (`start-wall.bat`): closing its window stops everything; Ctrl+Shift+D opens the dashboard inside the kiosk.
- Sensor Service (`sensor-service/`, `bun run sensor:service`): Hokuyo UST-10LX over SCIP 2.0 (streaming, checksums, reconnect), homography calibration from 4–12 measured points, background masking, clustering and tracking; Augmenta OSC v1/v2 and TUIO 1.1 cursors with Invert Y; hit-testing against wall-v7 visible targets, dwell from published hold rules, one input per contact; protocol v2 hello/status/heartbeat/input; OSC show control `/altama/*`; config in `sensor-config.json` edited from the dashboard; Hokuyo/Augmenta/TUIO simulators.
- Content split into one file per column (`app/data/columns/`) with typed helpers and an editing guide (`docs/content.md`).
- Per-column layouts: idle glowing frame (title pill, artwork or sub-item tiles, flags) and open layout (raised pill, sub-item name, rounded content card). Opening one column leaves the other five unchanged; the shared logo shrinks only while column 3 or 4 is open.
- Our Brand (Tekiro, RYU, Rexco) and Distribusi & Pemasaran open their sub-items directly from idle tiles; there is no submenu.
- Open cards: up to four pages that each own a photo slider and text; arrows move photos within the page, page tabs switch the whole page (2 layout tabs; 3–4 as half-width 2 + 1 / 2 + 2 rows); each page's text takes the largest size in its card's Min–Maks range that fits, and the card height follows it (to y 1312); card-copy system (dot bullets, glow labels, fact tables) revealed item by item; corner Back badge. Tekiro has four pages (profile, products, awards 1–5 and 6–11); no card changes its text on its own.
- Scroll teks trial (Dashboard → Wall, default off): every card keeps its Font Maks size and scrolls its text vertically (drag, wheel); pages are grouped per card (`scrollPages`: Tekiro 2, RYU and Rexco 2, the others 1 without tabs); photos also swipe horizontally while the slider follows its own switch; off restores the pages. Sensor Service does not send drags yet.
- Idle touch hint: a light sweep and a border trace on one target at a time, quiet after a touch.
- Swappable stage media (`app/data/wall-media.ts`): looping background video (with skyline), coded gradient fallback, and logo; transparent card videos for every column except Our Brand; every media entry carries `approved`.
- Floating flag-only Indonesian (default), English, and Simplified Chinese controls inside idle frames; open content keeps the chosen locale.
- Geometry-derived SVG hold borders on main, tile, arrow, and page-tab targets with perimeter progress over the group's duration (Hold and Tap + delay modes), cancellation cleanup, and a static reduced-motion outline; native multitouch on touch overlays. Native keyboard activation and operator shortcuts remain available.
- Serializable Pinia snapshots (`phase`, `locale`, `subItem`, `photo`, `page`) and a scope-owned inactivity controller (dashboard reset time, default 30 s).
- Native WebSocket protocol v2 / wall-v7, semantic actions (including `page`), UI-state publication with photo/page counts, readiness/session/sequence/layout validation, and reconnect/heartbeat handling. OSC show control (now inside the Sensor Service) supports `/altama/page`.
- Main input rejects contacts inside the language overlay; hidden actions and legacy layout input are rejected.
- Custom recovery/loading UI and development-only diagnostics.
- Validation of flags, translated labels/pages, tab labels and tab-target limits, sub-item tile ownership, idle/open target bounds, and every referenced media file.

Previous GSAP milestone reveal/cache, 19 sketch/color pairs, fixture generation, and obsolete types/utils are removed. The runtime does not render those resources.

## Dependencies

The Sensor Service adds no dependencies (Bun `node:net`/`node:dgram`/`Bun.serve`); its typecheck uses the existing TypeScript.

Installed project versions (20 October 2026, all at their latest release): Nuxt 4.6.2, Vue 3.5.44, Vue Router 5.4.0, Pinia 4.1.0, @pinia/nuxt 1.0.3, @nuxt/fonts 1.0.1, Tailwind/Vite plugin 4.3.3. Tooling: Vitest 5.0.5, vue-tsc 3.3.13, TypeScript 6.0.3, ESLint 10.13.0, @antfu/eslint-config 9.5.1. TypeScript stays on 6.x: TypeScript 7 (native) no longer exports `typescript/lib/tsc`, so `vue-tsc` 3.3.13 and therefore `nuxt typecheck` fail with it (checked 20 October 2026); move once vue-tsc supports it.

GSAP and direct Sharp dependencies were removed in the preceding repair. The Summit revision adds no dependencies; it swaps the `@nuxt/fonts` families from League Spartan to Roboto (client request; one family, weights 400–900). Use package.json/bun.lock as the source of truth rather than assuming this snapshot is perpetually latest.

Nuxt, Vue, Pinia, Bun, and Tailwind documentation was fetched through Context7 on 1 October 2026. SVG pathLength/stroke normalization was checked against MDN. See [style](./style.md) and [design](./design.md) for references.

## Validation

- Current `main` (20 October 2026): lint, typecheck, 146 tests across 15 files, and asset validation pass. Dashboard fit check at 2304 × 1344: every card fits 24–26 px except a few Tekiro pages (22.6–23.5 px, flagged on Dashboard → Font). Scroll teks checked on/off in the browser (merge, drag, wheel, restore).
- Dashboard sidebar and wall settings (20 October 2026): lint, typecheck, 106 tests, asset validation, and build passed; dashboard checked at 1440 px and 375 px (drawer, page navigation, content scroll, reset); flags/close normal press, card offset, staggered reveal, and column 5 panel alignment checked in the browser.
- Sensor Service (19 October 2026): lint, typecheck (Nuxt and `sensor-service/tsconfig.json`), 102 tests across 13 files, asset validation, build, and generate passed. End-to-end with the dev server and simulators: dashboard calibration of the simulated UST-10LX (four corners via **Ambil**), held taps opening columns 1/4/6, a language flag, and two simultaneous hands; Augmenta v2 and v1 with flipped Y and Invert Y; TUIO cursors. Dashboard checked at 1440 px and 375 px without horizontal overflow. No physical sensor was available.

- Summit revision 2 (per-page photos, hold arrows/tabs, stacked layout): lint, typecheck, 55 tests across seven files, asset/config validation (17 provisional media files), production build, and static generation passed.
- Headless Edge at 2304 × 1344, 1920 × 1080, and 1600 × 900: every visible target (main, 18 flags, 5 tiles, Back, arrows, page tabs) matches wall-v5 within 0.06 logical px after transitions settle, and every open page fits its card (fonts scale with the smaller axis). Single-column pills sit 20 px above their card; rails keep one height on every column.
- Every open page fits its card without overflow in Indonesian, English, and Simplified Chinese; title pills wrap to at most two lines without clipping.
- Opening one column, choosing tiles directly, moving photos, and switching pages (photos and text together) were checked visually against the reference mockups. Phone (390 × 844) and tablet (820 × 1180) stacked layouts scroll without horizontal overflow and keep text inside cards.
- Normal browser interactions emitted no application console errors (only WebSocket connection failures when the sensor is enabled locally without a running service). The custom 404/recovery page still uses an older palette.
- Build/generate report upstream Nuxt/Nitro dependency warnings but exit successfully. Fonts are bundled into the static output.

## Production gaps

- Final assets from the design team: background video/sequence, official logos, illustrations, and full-resolution photos. Current files are mockup crops (photos 226 × 124 px, one per slider; other slots are numbered placeholders) and need client approval. All column copy is drafted from the client presentation and still needs approval; a few Tekiro pages are slightly below 24 px until their text is shortened.
- Client approval of company claims and the drafted English/Chinese translations.
- Scroll teks over LiDAR: Sensor Service sends taps only; scrolling there needs a drag message in the protocol and on-site testing.
- Sensor Service deployment on the event PC (supervised start), physical calibration of the UST-10LX, background capture, and tuning of cluster/tracker thresholds against real hands; multi-user tests. Only synthetic scans have been tested. Old services are intentionally rejected; deploy matching renderer/service geometry together before enabling input.
- Final PC/LED/Hokuyo hardware, multi-user coverage, occlusion, and long-duration performance validation.
- Offline Chinese fonts/media, browser startup/supervision, endpoint configuration, rollout, and rollback.

Physical LED/sensor behavior is not established by local tests. See [testing](./testing.md) for external acceptance.

