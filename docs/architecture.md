# Architecture

## Runtime shape

The renderer is a Nuxt 4.5 SPA with `ssr: false`. Nuxt application code lives under `app/`; static files stay in `public/`; shared catalog and geometry stay in `shared/`; tests stay in `test/`. This follows the Nuxt 4 default directory model.

`app/app.vue` owns the fullscreen root and renders `app/pages/index.vue`. The index page mounts one `KioskStage`. The stage owns one asset cache, one Sensor Service socket, keyboard simulation, and refs to three `MilestoneSection` instances.

Each section combines its own state-machine controller, scoped GSAP controller, and retained artwork slots. Presentational components receive props and emit intent. A section can reveal, switch, fail, or recover without changing the animation phase of another section.

## State flow

Input follows one path:

```text
click / keyboard / sensor message
  -> KioskStage
  -> MilestoneSection public API
  -> useMilestoneMachine
  -> cache + renderer
  -> Pinia serializable snapshot
```

The machine exposes `reveal`, `selectMilestone`, `reset`, and `dispose`. It keeps request and lifecycle counters outside Pinia. When selections arrive rapidly, only the latest target can commit. An obsolete decode may finish and remain cached, but it cannot replace the current UI.

## Rendering rules

- The kiosk and stage use the full viewport. Do not add an outer container, maximum width, fixed aspect ratio, or letterbox.
- The logical sensor canvas remains 2304 × 1344. CSS scaling and browser pixels do not change incoming logical sensor coordinates.
- Three equal grid columns represent LEFT, CENTER, and RIGHT.
- The illustrated reference composition is documented in `docs/design.md`; the official canvas is 12:7, not the reference image's 16:9.
- Sketch and color are retained as aligned image layers. The color layer is revealed with GSAP and `clip-path`.
- Initial years are 1967 / 2007 / 2026. Each section starts in IDLE, and story text remains readable before and after reveal.
- A replacement pair is decoded in the inactive DOM slot before commit, preventing a blank frame.
- Artwork and timeline positions come directly from `shared/installation-layout.json` through `layoutStyle`; update the layout version whenever sensor target geometry changes.
- Artwork creates a local stacking context; image-slot z-index values must not cover the large year or controls.

## Ownership

| Path | Responsibility |
| --- | --- |
| `app/components/kiosk/` | Fullscreen shell, diagnostics, and input routing |
| `app/components/milestone/` | Artwork, copy, timeline, and one reusable section |
| `app/composables/` | Machine, animation, cache, and socket lifecycle |
| `app/stores/` | Serializable application snapshots |
| `app/data/` | Typed adapters for shared JSON and section presentation |
| `app/types/` | Renderer-specific TypeScript contracts |
| `app/utils/` | Pure protocol validation and logical-to-CSS rectangle mapping |
| `shared/` | Canonical milestone catalog and sensor geometry |

## Dependency policy

Keep dependencies only when they solve an active requirement. Pinia stores serializable state, GSAP owns animation, Vitest checks behavior, and Sharp validates development assets. Use native browser WebSocket and image decoding. Do not add an event bus, Socket.IO, XState, VueUse, Nuxt UI, or Nuxt Image unless a measured requirement justifies it.
