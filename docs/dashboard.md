# Operator dashboard

`/dashboard` is an operator configuration page with two sections: **Hold** (dwell per button group, stored in this browser) and **Sensor** (touch source, ports, calibration, live status; stored by the Sensor Service on the event PC). On desktop screens it renders in two columns (Hold on the left, Sensor on the right); on tablets and smartphones it stacks into a single responsive column.

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
- **Simpan** applies the edit, **Default** loads the defaults (save to apply), **Export/Import** download or load `altama-settings.json` (hold and wall settings; older `altama-hold-settings.json` files still import) as a backup or to copy settings to another machine.

## Wall

| Setting | Effect | Default |
| --- | --- | --- |
| Reset otomatis | Seconds without interaction before a column returns to idle/Indonesian; one value for every column (5–600 s) | 30 s |
| Posisi Y card | Moves every column (frame, title, card, controls) up (−) or down (+) on the LED wall, −120 to 120 logical px; ↑/↓ nudge by 10. Open cards still end at y 1312 on screen; the phone/tablet layout ignores it | 0 |

Both are saved with the hold rules by the same **Simpan**.

### Storage and scope

- Settings live in this browser's `localStorage` (`altama.settings.v1`) through `app/plugins/settings-storage.client.ts`. Open the dashboard in the same browser profile as the wall on the event PC: with `start-wall.bat`, use `open-dashboard.bat` (the kiosk uses its own profile in `.wall-run/browser-profile` on `http://127.0.0.1:<WALL_PORT>`). A wall already open in another tab updates immediately (storage event); no reload is needed.
- Clearing browser data restores the defaults; keep an exported JSON as backup.
- There is no server or login. The page is not secret: anyone who can type a URL on the kiosk browser can open it. The wall runs fullscreen, so visitors cannot reach it in practice.
- `bun run generate` emits `dashboard/index.html`, so the URL works on plain static hosting too; the `Buka wall` link navigates back to `/`.

### Code

- `shared/hold-settings.ts`: groups, defaults, limits, `normalizeHoldSettings`, and the action → group map (`HOLD_GROUP_BY_ACTION`).
- `shared/wall-settings.ts`: reset seconds and card offset, limits, `normalizeWallSettings`.
- `app/stores/settings.ts`: serializable settings state.
- `app/components/wall/WallHoldButton.vue`: reads its `group` rule and passes `{ enabled, durationMs }` to the `v-hold` directive (`app/utils/hold.ts`).
- `app/components/dashboard/DashboardHold.vue`: the form.

To add another setting, extend the store state and normalizer, persist it through the same plugin, and add a section to the dashboard.

The wall publishes the current rules as `hold` and the card offset as `cardOffsetY` in every `clientHello`/`clientState` message, so LiDAR input follows the same configuration and targets move with the cards. See [sensor](./sensor.md).

## Sensor

The section talks to the Sensor Service over WebSocket (`NUXT_PUBLIC_SENSOR_WS_URL`, or `ws://<this host>:8787` when unset) and works whether or not wall sensor input is enabled. Start the service first (`bun run sensor:service`); while it is unreachable the section shows only that command and the URL.

- **Status** (top right): source and state (`Hokuyo · 40 Hz`, `belum kalibrasi`, `kalibrasi`, `Service offline`, …) and the number of connected walls.
- **Off / Hokuyo / Augmenta / TUIO**: the active touch source. `Off` keeps OSC show control only.
- **Hokuyo**: IP and port of the UST-10LX. **Augmenta / TUIO**: UDP port and **Invert Y**. **OSC show control**: UDP port for `/altama/*`.
- **Kalibrasi** (Hokuyo): wall points (logical px) with the measured sensor position (mm). **Mode kalibrasi** pauses input; **Ambil** stores the largest current cluster for that row; **+ Titik** / ✕ add or remove points (4–12). `✓` means solved; from the fifth point on the RMS error in px is shown. Background **Ambil** / **Hapus** captures or clears the static scene (nobody in front of the wall). Procedure: [sensor](./sensor.md#hokuyo-ust-10lx).
- **Preview**: the six idle frames, calibration points, and live contacts (grey = no target, blue ring = dwell progress, green = sent). The caption counts contacts, Hokuyo clusters, and inputs sent since the service started.
- **Simpan** sends the config to the service, which saves `sensor-config.json` and applies it immediately (rebinding ports or reconnecting the LiDAR). **Batal** discards edits. Changes made elsewhere (another dashboard, the file after a restart) appear unless you are editing.

### Code

- `shared/sensor-config.ts`: config shape, defaults, normalizer, and the admin message contract.
- `app/composables/useSensorAdmin.ts`: admin socket with reconnect, owned by the section's scope.
- `app/components/dashboard/DashboardHold.vue`, `DashboardSensor.vue`: the two sections; `app/pages/dashboard.vue` composes them.
