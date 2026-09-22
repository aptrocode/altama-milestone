# Altama Interactive Milestone

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Fullscreen Nuxt 4 SPA for a 2304 × 1344 interactive LED installation. The illustrated interface has three independent sections, 19 year buttons (4 / 8 / 7), sketch-to-color GSAP reveals, and a WebSocket boundary for a separate Sensor Service.

All current copy and artwork are development placeholders. Replace them through `shared/milestones.json` and `public/milestones/` only after content approval.

## Local development

Prerequisites:

- Bun
- Node.js
- Nuxt
- Modern Chromium browser

```bash
bun install --frozen-lockfile
bun run dev
```

The initial selection is 1967 / 2007 / 2026. Click an artwork or press `1`, `2`, or `3` to reveal a section. Click any year to load its sketch. Press `R` to reset all sections; `D` toggles diagnostics in development.

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
bun run generate
```

Static deployment output is written to `.output/public` and must be served over HTTP.

## Documentation

- [Architecture](./docs/architecture.md)
- [Visual design and client canvas](./docs/design.md)
- [Assets](./docs/assets.md)
- [Sensor Service](./docs/sensor.md)
- [Testing](./docs/testing.md)
- [Issue and pull-request workflow](./docs/push.md)
- [Release workflow](./docs/release.md)
- [Current status](./docs/status.md)
- [Agent entry point](./AGENTS.md)

The application follows Nuxt 4's standard `app/`, `public/`, `shared/`, and `test/` structure. Contributors should start with the relevant document above instead of duplicating rules in source comments.

## License

The code is licensed under [MIT](LICENSE).
