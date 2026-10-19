# Operator dashboard

`/dashboard` is the operator configuration UI: a sidebar (a darker navy than the wall-blue content, same hue) links three pages (Wall, Hold, Sensor: the wall configuration comes first), and `/dashboard` redirects to Wall. From `lg` (1024 px) the sidebar is fixed; below it is an off-canvas drawer opened from the ☰ top bar and closed by ✕, the backdrop, Escape, or navigating. The content column uses the full width and scrolls on its own (the document itself never scrolls; see `main.css`).

| Page | Route | Stored in |
| --- | --- | --- |
| Wall | `/dashboard/wall` | this browser (`localStorage`) |
| Hold | `/dashboard/hold` | this browser (`localStorage`) |
| Sensor | `/dashboard/sensor` | Sensor Service (`sensor-config.json` on the event PC) |

The sidebar footer acts on every browser-stored setting:

- **Export pengaturan** downloads `altama-settings.json` (hold and wall settings).
- **Import pengaturan** applies a backup immediately (older `altama-hold-settings.json` files with only `hold` still import).
- **Fullscreen** toggles browser fullscreen.
- **Reset ke default** opens a confirmation dialog (centred on wide screens, a bottom sheet with full-width buttons on phones; Batal, the backdrop, or Escape cancel) and restores Hold and Wall defaults on **Ya, reset**.

Every button, switch, link, and tab (including the Sensor source tabs) shows a pointer cursor; `main.css` restores it after Tailwind's preflight reset.

## Hold

| Group | Buttons | Default |
| --- | --- | --- |
| Card section (`card`) | Idle main card of columns 1/3/4/6 and the sub-item tiles of columns 2/5 | On, 1.0 s |
| Button page (`page`) | Page tabs (1960 / 1996, PAGE 1 / PAGE 2) | On, 1.0 s |
| Button slider (`slider`) | Photo arrows | On, 1.0 s |
| Bahasa (`language`) | Language flags (ID / EN / 中文) | **Off** |
| Tombol close (`back`) | The open card's ✕ button | **Off** |

- **On** with a duration (0.3–5 s, 0.1 s steps): the button must be held; the border progress animation follows the duration.
- **Off**: the button activates on a normal press.
- Keyboard Enter/Space always activate immediately, whatever the rule.
- Groups whose buttons the Wall page hides are hidden here as well, with a note linking to Wall: Button page while Tombol page is off, Button slider while Tombol slider is off, Tombol close while Tombol close is off. Their values are kept and return when the switch is turned on again. The list follows the saved Wall settings, also when they change in another tab.
- **Simpan** applies the edit; **Default** loads the defaults into the form (save to apply).

## Wall

| Setting | Effect | Default |
| --- | --- | --- |
| Reset otomatis | Seconds without interaction before a column returns to idle/Indonesian; one value for every column (5–600 s) | 30 s |
| Posisi Y card | Moves every column (frame, title, card, controls) up (−) or down (+) on the LED wall, −120 to 120 logical px; ↑/↓ nudge by 10. Open cards still end at y 1312 on screen; the phone/tablet layout ignores it | 0 |
| Tombol close | Shows the open card's ✕ button. Off hides it on every column and removes the Back touch target from Sensor Service; cards still close after the reset time, with operator keys 1–6, R/Escape, and OSC `/altama/back` | On |
| Tombol slider | Shows the photo arrows on open cards. Off hides them on every column, removes the previous/next touch targets from Sensor Service, and turns on auto slide | On |
| Auto slide | Shown only while Tombol slider is off: an open card with several photos moves to the next photo (wrapping) every N seconds, 2–60 s. A **video** slide ignores the interval: it starts from the beginning when shown, plays once, and the next slide appears when it ends (e.g. video 20 s → image 5 s → image 5 s → video …; a video that fails to play is skipped). Any photo, page, or sub-item change restarts that column's countdown; auto slide is not visitor activity, so the reset time still closes the card. Operator ←/→ keys and OSC still change photos | 5 s |
| Tombol page | Shows the page tabs (1960 / 1996, PAGE 1 / PAGE 2) on open cards. Off hides them on every column, removes the page touch targets from Sensor Service, and turns on auto page; the text then starts right below the photo | On |
| Auto page | Shown only while Tombol page is off: an open card with several pages shows the next page (wrapping, photos restart at the first) every N seconds since the last page change, 3–120 s. A playing video slide finishes first. Not visitor activity, so the reset time still closes the card | 10 s |
| Tampilan bahasa | **Compact**: the flag pill in the middle of the idle frame (three 64 × 48 buttons). **Full width**: the bar spans the frame to 14 px from its edges, 76 px tall, with three equal 102 × 60 buttons and larger flags, on the same centre line. Sensor Service moves the language targets with it (`shared/language-bar.ts`) | Compact |

**Simpan** and **Default** work as on the Hold page.

### Storage and scope

- Hold and Wall live in this browser's `localStorage` (`altama.settings.v1`) through `app/plugins/settings-storage.client.ts`. Open the dashboard in the same browser profile as the wall on the event PC: in the kiosk started by `start-wall.bat` press **Ctrl+Shift+D** (again to return to the wall; the kiosk uses its own profile in `.wall-run/browser-profile` on `http://127.0.0.1:<WALL_PORT>`). A wall already open in another tab updates immediately (storage event); no reload is needed.
- Clearing browser data restores the defaults; keep an exported JSON as backup.
- There is no server or login. The page is not secret: anyone who can type a URL on the kiosk browser can open it. The wall runs fullscreen, so visitors cannot reach it in practice.
- The wall publishes the hold rules as `hold`, the card offset as `cardOffsetY`, the close switch as `showClose`, the slider switch as `showArrows`, the page switch as `showPages`, and the language bar mode as `languageBar` in every `clientHello`/`clientState` message, so LiDAR input follows the same configuration and targets move with the cards. See [sensor](./sensor.md).

## Sensor

The page talks to the Sensor Service over WebSocket (`NUXT_PUBLIC_SENSOR_WS_URL`, or `ws://<this host>:8787` when unset) and works whether or not wall sensor input is enabled. Start the service first (`bun run sensor:service`; `start-wall.bat` does it); while it is unreachable the page shows only that command and the URL.

- **Status** (top right): source and state (`Hokuyo · 40 Hz`, `belum kalibrasi`, `kalibrasi`, `Service offline`, …) and the number of connected walls.
- **Off / Hokuyo / Augmenta / TUIO**: the active touch source. `Off` keeps OSC show control only.
- **Hokuyo**: IP and port of the UST-10LX. **Augmenta / TUIO**: UDP port and **Invert Y**. **OSC show control**: UDP port for `/altama/*`.
- **Kalibrasi** (Hokuyo): wall points (logical px) with the measured sensor position (mm). **Mode kalibrasi** pauses input; **Ambil** stores the largest current cluster for that row; **+ Titik** / ✕ add or remove points (4–12). `✓` means solved; from the fifth point on the RMS error in px is shown. Background **Ambil** / **Hapus** captures or clears the static scene (nobody in front of the wall). Procedure: [sensor](./sensor.md#hokuyo-ust-10lx).
- **Preview**: the six idle frames (moved by the saved card offset), calibration points, and live contacts (grey = no target, blue ring = dwell progress, green = sent). The caption counts contacts, Hokuyo clusters, and inputs sent since the service started.
- **Simpan** sends the config to the service, which saves `sensor-config.json` and applies it immediately (rebinding ports or reconnecting the LiDAR). **Batal** discards edits. Changes made elsewhere (another dashboard, the file after a restart) appear unless you are editing.

## Code

- `app/pages/dashboard.vue`: shell (sidebar `NAV`, drawer, scrolling content column, backup/fullscreen/reset); `app/pages/dashboard/{index,hold,wall,sensor}.vue`: pages with `definePageMeta({ title, description })`.
- `app/components/dashboard/`: `DashboardHold`, `DashboardWall`, `DashboardSensor`, and `DashboardFormActions` (Simpan/Default bar).
- `app/composables/useSettingsBackup.ts`: export/import; `app/composables/useSensorAdmin.ts`: admin socket with reconnect, owned by the Sensor page's scope.
- `shared/hold-settings.ts`, `shared/wall-settings.ts`: groups/settings, defaults, limits, normalizers, and the action → hold group map (`HOLD_GROUP_BY_ACTION`); `shared/sensor-config.ts`: Sensor Service config and admin contract.
- `app/stores/settings.ts`: serializable `hold` and `wall` state. `WallHoldButton` reads its `group` rule and passes `{ enabled, durationMs }` to the `v-hold` directive (`app/utils/hold.ts`).

To add a setting: extend the shared normalizer and store, persist it through the same plugin, and add a row to the matching page (or a new page in `NAV` in `app/pages/dashboard.vue`).
