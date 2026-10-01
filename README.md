# Altama Interactive Wall & Milestone

Fullscreen interactive application for the 2304 × 1344 (12:7 aspect ratio) ALTAMA interactive LED wall.

## System Overview

The application features a 6-column interactive layout:
1. **ABOUT ALTAMA** — Single button with photo carousel and descriptions
2. **OUR BRANDS** — Expandable category with sub-menu (TEKIRO, RYU, REXCO) and photo carousels
3. **INFRASTRUCTURE** — Single button with photo carousel and descriptions
4. **DIGITAL PARTNERS** — Single button with photo carousel and descriptions
5. **DISTRIBUTION** — Expandable category with sub-menu (OUR WAY FOR DISTRIBUTION, BRAND ACTIVATION)
6. **SUMMIT 2026** — Single button with photo carousel and normalized navigation controls

### Key Interactions

- **Hold-to-Activate (1 Second)**: Prevents accidental triggers on touch screens / LIDAR sensor wall.
  - Multi-layer luminous emerald neon glow (`filter: drop-shadow`).
  - Animated white-hot laser spark tracer (`@property --hold-angle` conic-gradient).
  - Subtle guide track and tactile press feedback.
  - Applied consistently across:
    - Main Category Buttons
    - Sub-Menu Buttons (TEKIRO, RYU, REXCO, etc.)
    - Carousel Navigation Buttons (←, →)
- **Sensor Service Integration**: Native WebSocket support via `useSensorSocket` for Hokuyo LiDAR touch events.
- **Keyboard Shortcuts**:
  - `Escape` or `KeyR`: Reset all columns to idle state.
  - `1` to `6`: Directly toggle/activate columns 1 to 6.
  - `KeyD`: Toggle diagnostics overlay (Sensor & WebSocket status).

## Project Structure

```text
altama-milestone/
├── app/                  # Nuxt 4 Vue 3 TypeScript Application
│   ├── assets/css/       # Modular design system & animations
│   ├── components/kiosk/ # KioskStage (Interactive Wall), KioskStatus
│   ├── composables/      # useSensorSocket
│   ├── data/             # wall-config.ts, installation-layout.ts
│   ├── plugins/          # hold-directive.client.ts (v-hold)
│   ├── stores/           # wall.ts (Pinia state), system.ts
│   └── pages/index.vue   # Main interactive wall view
├── standalone/           # Standalone HTML/CSS/JS version
│   ├── index.html        # Direct double-click browser preview
│   ├── css/              # Standalone stylesheets
│   └── js/               # Standalone vanilla scripts
├── shared/               # Shared geometry and configuration
├── test/                 # Vitest test suite
└── nuxt.config.ts        # Nuxt configuration
```

## Running the Application

### Option A: Standalone Preview (No Node/Bun required)
Open `standalone/altama-wallmessage.html` directly in any modern Chromium browser (Chrome or Edge).

### Option B: Nuxt 4 Application
```bash
bun install
bun run dev
# or: npm install && npm run dev
```

## License

The code is licensed under [MIT](LICENSE).
