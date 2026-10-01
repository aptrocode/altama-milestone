# Altama Interactive Wall

Fullscreen Nuxt 4 kiosk for ALTAMA's **2304 × 1344** LED installation.

Six independent columns cover About Altama, Our Brands, Infrastructure, Digital Partners, Distribution, and Summit 2026. Each idle card has floating Indonesian (default), English, and Simplified Chinese flag controls. The chosen language stays with that column through its submenu/carousel. Carousel photos and company copy remain provisional.

## Run

```bash
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Nuxt. Build with `bun run build`, create static output with `bun run generate`, and preview with `bun run preview`.

## Interaction

- Hold main/sub-item buttons for one second with mouse/touch.
- Enter/Space activate a focused button directly.
- Digits 1–6 open/go back in their column.
- R/Escape reset content immediately while preserving languages.
- After 15 seconds without activity, only that column resets to idle/Indonesian.
- D toggles diagnostics in development.
- OSC UDP Show Control on port 9000 for Resolume Arena, TouchDesigner, or QLab via `bun run osc:service`. Send test commands with `bun run osc:send /altama/column 1`.

Sensor integration uses **protocol v2 / wall-v2**. It connects to a WebSocket server at port 8787; see [docs/sensor.md](docs/sensor.md). Sensor input is disabled by default (`NUXT_PUBLIC_SENSOR_ENABLED=true` to enable).

## Project guide

Start with [AGENTS.md](AGENTS.md). Architecture, design, languages, assets, sensor, testing, push, and release instructions are split under `docs/`. Production UI lives in `app/`; shared actions/geometry live in `shared/`. `dika/` is an isolated prototype sandbox.

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
bun run generate
```

See [docs/testing.md](docs/testing.md) for behavior and browser acceptance. [MIT license](LICENSE).
