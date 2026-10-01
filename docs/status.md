# Project status

Updated 24 September 2026.

## Implemented

- Fullscreen Nuxt 4 SPA for the official 2304 × 1344 LED canvas.
- Reference-inspired white illustrated interface with orange, blue, and red sections.
- 19 selectable years: LEFT 4, CENTER 8, RIGHT 7; initial years 1967, 2007, and 2026.
- Independent per-section Indonesian, English, and Simplified Chinese flag controls, with Indonesian as the fresh-load default and no added dependency.
- Real text and buttons, three illustrated scenes, icon badges, values, and decorative scenery.
- Independent sketch-to-color GSAP interaction and retained two-slot image staging.
- Latest-request-wins state coordination and bounded decoded-image cache.
- Pinia snapshots, click/keyboard simulator, hidden development diagnostics, and themed error/loading pages.
- WebSocket v1 parser/client with session, sequence, layout-version, heartbeat, stale timeout, and reconnect handling.
- Shared layout-v4 geometry drives artwork, timeline, and language-control positions.
- Asset validator, fixture generator, behavior tests, and static output.

All 19 catalog entries remain marked `placeholder`. The three opening stories follow the reference image but still require client approval. Other stories are explicitly provisional, and each section currently reuses one generated illustration. This is a functional visual implementation, not approved historical content.

## Dependency snapshot

Versions verified on 1 October 2026:

- Nuxt 4.5.2, Vue 3.5.43, and Vue Router 5.3.1
- `@nuxt/fonts` 0.14.0
- Tailwind CSS and Tailwind Vite 4.3.3
- Pinia 4.0.3 and `@pinia/nuxt` 1.0.2
- GSAP 3.15.0
- Vitest 5.0.3, vue-tsc 3.3.11, Sharp 0.35.5, and TypeScript 6.0.3

The previous dependency check found TypeScript 7.0.2, but the project retains 6.x for current vue-tsc/typescript-eslint compatibility. Recheck official documentation and peer dependencies before future upgrades; this snapshot is not a perpetual claim of being latest.

Context7 is now available and was used for the Nuxt 4 component and Vue style APIs in this design pass. See [design](./design.md) for sources and artwork provenance.

## Open production work

- Approve history, figures, brand spelling, English/Chinese translations, duplicate-year labels, and year-specific artwork with the client.
- Replace all placeholder content and preview sketch/color pairs.
- Test output offline and run a long-duration memory/performance soak.
- Decide kiosk browser launch, startup supervision, endpoint override, release, and rollback procedures.
- Deploy matching layout-v4 geometry to Sensor Service and recalibrate timeline and language targets.
- Test Hokuyo placement, occlusion, release timing, and multi-user coverage.
- Choose the Sensor Service language/SDK after the hardware spike.
- Profile the final PC, GPU, LED processor, browser, and display refresh rate.

The actual LED wall and sensor hardware have not been validated by browser checks.

## Validation on 22 September

- Lint, typecheck, 13 tests, and validation of all 19 artwork pairs passed.
- Production build and static generation passed. Nuxt/Nitro emitted upstream dependency warnings; there were no application build errors.
- Browser inspection covered 2304 × 1344 and 1600 × 900, full viewport coverage, story spacing, and all 19 year controls.
- Production interaction checks passed for initial sketches, three reveals, rapid center selections with independent neighbors, both 2013 IDs, reset, and custom 404 recovery.
- Measured timeline rectangle differences from the shared geometry were below 0.02 CSS px at the official size.
- The production console was clean during the milestone interaction checks.

The Nuxt preview query returned no Context7 matches. Preview tooling was checked with the installed Nuxt CLI help and the [official Vite CLI documentation](https://github.com/vitejs/vite/blob/main/docs/guide/cli.md) through Context7. The generated output was tested with the existing Vite preview server; no package was added. A transient Nitro development-worker failure after a loading-template reload was avoided for verification by using the generated output.

## Language validation on 24 September

- Lint, typecheck, 18 tests, asset validation, production build, and static generation passed. Nuxt/Nitro emitted upstream dependency warnings, with no application build error.
- Browser checks at the exact 2304 × 1344 CSS viewport and 1600 × 900 preview found no page scrolling or clipped stories in the three languages. The nine flag bounds matched layout-v4 at the official size.
- In the generated production output, LEFT switched to Chinese while RIGHT switched to English and CENTER stayed Indonesian. The production console had no errors. Year changes preserved a section's language; reload restored all three defaults. Custom 404 recovery worked.
- Physical LED readability, Chinese font availability on the event PC, translation approval, and Sensor Service layout-v4 calibration remain open.

## Validation & Release on 1 October 2026 (v0.3.0)

- Version 0.3.0 released.
- Lint, typecheck, 23 tests, asset validation (19 milestone pairs), and production build passed with zero errors.
- Implemented independent 15-second auto-reset per section on inactivity.
- Configured `@nuxt/fonts` with Inter weights (400-900) and verified Tailwind CSS v4 integration.
- Standardized UI to single-line responsive column titles, localized column titles/labels per active section language.
- Replaced carousel text arrows with centered modern SVG icons and adjusted hold loop animation to scale-only pulse.
- Removed legacy `mainProject/` directory, prototype branch, and obsolete standalone CSS files in favor of Tailwind CSS v4 utility classes and scoped styles.

