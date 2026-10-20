# Operator dashboard

`/dashboard` is the operator configuration UI: a sidebar (a darker navy than the wall-blue content, same hue) links four pages (Wall, Hold, Font, Sensor: the wall configuration comes first), and `/dashboard` redirects to Wall. From `lg` (1024 px) the sidebar is fixed; below it is an off-canvas drawer opened from the ☰ top bar and closed by ✕, the backdrop, Escape, or navigating. The content column uses the full width and scrolls on its own (the document itself never scrolls; see `main.css`).

| Page | Route | Stored in |
| --- | --- | --- |
| Wall | `/dashboard/wall` | this browser (`localStorage`) |
| Hold | `/dashboard/hold` | this browser (`localStorage`) |
| Font | `/dashboard/font` | this browser (`localStorage`) |
| Sensor | `/dashboard/sensor` | Sensor Service (`sensor-config.json` on the event PC) |

The sidebar footer acts on every browser-stored setting:

- **Export pengaturan** downloads `altama-settings.json` (wall, hold, and font settings).
- **Import pengaturan** applies a backup immediately (older `altama-hold-settings.json` files with only `hold` still import).
- **Fullscreen** toggles browser fullscreen.
- **Reset ke default** opens a confirmation dialog (centred on wide screens, a bottom sheet with full-width buttons on phones; Batal, the backdrop, or Escape cancel) and restores Wall, Hold, and Font defaults on **Ya, reset**.

Every button, switch, link, and tab (including the Sensor source tabs) shows a pointer cursor; `main.css` restores it after Tailwind's preflight reset.

## Font

Every wall text uses Roboto. The page sets the sizes (logical px on the 2304 × 1344 canvas) and the title weight, grouped as **Judul**, **Isi card per section**, and **Tab page**. Each row shows a live sample, − / + steppers, a ? tooltip, and a **↺ Default** chip; the save bar works as on Wall.

| Setting | Text | Default | Range |
| --- | --- | --- | --- |
| Judul section | Column title in the pill | 27 | 20–34 |
| Ketebalan judul | Title weight: Regular 400, Medium 500, Bold 700, Extra 800, Black 900 | Bold | – |
| Nama sub-item | Open sub-item name above the card (when it has no logo) | 32 | 24–40 |
| Caption tile | Tile labels of column 5 (Distribusi / Pemasaran) | 30 | 22–36 |
| Tab page | Page tab labels | 24 | 16–28 |

**Isi card per section** has one row per open card (`cards` in `shared/font-settings.ts`): Tentang Altama, Tekiro, RYU, Rexco, Infrastruktur, Kepercayaan Digital, Distribusi, Pemasaran, and KTT Altama 2026. Each row sets a body size range, **Min** and **Maks** (14–40 px, default 24–26 px for every card; glow labels stay 0.82 ×). Every page uses the largest size up to Maks that still fits the tallest card (y 1312), never less than Min, and the card grows to that text.

Each row also shows a fit status, checked on every page and language at once (`DashboardCardFit` renders them invisibly in the tallest card's text box): **✓ 26 px** (or the range of sizes the pages use, e.g. ✓ 24–26 px), or **⚠ Di bawah Min · N px (PAGE p, language)** when a page does not fit even at Min and the wall has to shrink it further so it is not clipped. At 24–26 px only Tekiro does: PAGE 2 Produk (ID) about 23.5 px and the award pages 22.6–24 px. Pages are never added automatically; a card that needs a larger size than fits is split into more pages in its content file.

A title word that does not fit its pill (e.g. INFRASTRUKTUR at a large size or Black) shrinks just that title (down to 60 %); long open-card pages still grow the card first and then shrink, so no setting clips text.

## Hold

| Group | Buttons | Default |
| --- | --- | --- |
| Card section (`card`) | Idle main card of columns 1/3/4/6 and the sub-item tiles of columns 2/5 | Hold, 1.0 s |
| Button page (`page`) | Page tabs (PAGE 1–4) | Hold, 1.0 s |
| Button slider (`slider`) | Photo arrows | Hold, 1.0 s |
| Bahasa (`language`) | Language flags (ID / EN / 中文) | **Tap** |
| Tombol close (`back`) | The open card's ✕ button | **Tap** |

Each group has a **mode** (segmented **Tap / Hold / Tap + delay**) and a duration (0.3–5 s, 0.1 s steps, unused for Tap).

- **Hold**: the button must be held; the border progress animation follows the duration; releasing early cancels.
- **Tap + delay**: one tap starts the same border animation and the button activates when it completes, without holding (releasing does not cancel; another tap while it runs is ignored). Sensor Service treats it as a short contact and the wall plays the delay on the touched button (`wall:press`), so LiDAR and pointer input behave alike.
- **Tap**: the button activates on a normal press.
- Keyboard Enter/Space always activate immediately, whatever the rule.
- Groups whose buttons the Wall page hides are hidden here as well, with a note linking to Wall: Button page while Tombol page is off, Button slider while Tombol slider is off, Tombol close while Tombol close is off. Their values are kept and return when the switch is turned on again. The list follows the saved Wall settings, also when they change in another tab.
- The save bar sticks to the bottom of the page: it counts unsaved changes; **Simpan** applies them, **Batal** discards them, **Default** loads the defaults into the form (save to apply).

## Wall

The page is grouped into four cards: **Tampilan** (language bar, card offset), **Tombol di card** (close + size/position, slider + Auto slide, page tabs, Auto page + duration, Scroll teks trial), **Waktu** (reset), and **Diagnostik** (amber; touch dots + duration, with a "Masih menyala" badge while on). Each row has a one-line hint (number rows state their default), a **?** tooltip with the details (hover; a click or tap pins it and lights the **?**, closed by another click, a click elsewhere, or Escape), and, when the value differs from its default, a **↺ Default: …** chip that restores it. Switches show On/Off. Inputs that only matter while a switch is off (Auto slide, Auto page) or on (Durasi titik) sit indented under it. The language bar options are drawn as small card sketches.

| Setting | Effect | Default |
| --- | --- | --- |
| Reset otomatis | Seconds without interaction before a column returns to idle/Indonesian; one value for every column (5–600 s). While a card advances on its own (auto slide/auto page), the reset waits until the slideshow has reached its last slide (or last page) since the last interaction: e.g. a 30 s video plus 5 × 5 s images closes at 55 s, right after the last image, while 2 images (10 s) still close at the reset time. A card never waits longer than 5 minutes past the reset time, and closes at once if the operator turns the arrows/tabs back on | 30 s |
| Posisi Y card | Moves every column (frame, title, card, controls) up (−) or down (+) on the LED wall, −120 to 120 logical px; ↑/↓ nudge by 10. Open cards still end at y 1312 on screen; the phone/tablet layout ignores it | 0 |
| Tombol close | Shows the open card's ✕ button. Off hides it on every column and removes the Back touch target from Sensor Service; cards still close after the reset time, with operator keys 1–6, R/Escape, and OSC `/altama/back` | On |
| Ukuran tombol close | Shown while Tombol close is on: 1× (the 44 px badge), 2×, or a manual 1–2× (0.1 steps); the badge grows around its centre on the card corner | 1× |
| Posisi tombol close | Shown while Tombol close is on: X (− left / + right) and Y (− up / + down) shift of the badge, −60 to 60 logical px in 2 px steps | X 0 · Y 0 |
| Tombol slider | Shows the photo arrows on open cards. Off hides them on every column, removes the previous/next touch targets from Sensor Service, and turns on auto slide | On |
| Auto slide | Shown only while Tombol slider is off: an open card with several photos moves to the next photo (wrapping) every N seconds, 2–60 s. A **video** slide ignores the interval: it starts from the beginning when shown, plays once, and the next slide appears when it ends (e.g. video 20 s → image 5 s → image 5 s → video …; a video that fails to play is skipped). Any photo, page, or sub-item change restarts that column's countdown; auto slide is not visitor activity; the reset only waits for the slideshow to reach its last slide (see Reset otomatis). Operator ←/→ keys and OSC still change photos | 5 s |
| Tombol page | Shows the page tabs (PAGE 1–4) on open cards. Off hides them on every column, removes the page touch targets from Sensor Service, and turns on auto page; the text then starts right below the photo | On |
| Auto page | Pages change on their own, also while the tabs are shown (always on while Tombol page is off). The next page (wrapping, photos restart at the first) appears every **Durasi auto page** seconds (3–120 s) since the last page change, so pressing a tab restarts the count. A playing video slide finishes first. **With Tombol slider also off**, a page with several photos ignores this interval and changes right after its last photo, so every photo of every page is shown (e.g. 10 + 5 photos at 5 s: page 2 at 50 s, the card closes at 75 s); pages with one photo or none keep the interval. Not visitor activity; the reset only waits for the last page (see Reset otomatis) | On, 15 s |
| Titik sentuh | Calibration overlay on the wall itself (same URL): a blue dot where a pointer pressed, a red dot and dashed line where it released if it drifted, a green dot where a Sensor Service input landed, each with logical coordinates. Never blocks input. `?dots=1` in the wall URL turns it on without the dashboard (for browsers with their own storage, such as a TouchDesigner Web Render TOP) | Off |
| Durasi titik | Shown only while Titik sentuh is on: seconds a dot stays after its release or sensor input (1–60 s) | 5 s |
| Tampilan bahasa | **Compact**: the flag pill in the middle of the idle frame (three 64 × 48 buttons). **Full width**: the bar spans the frame to 14 px from its edges, 76 px tall, with three equal 102 × 60 buttons and larger flags, on the same centre line. **Grid 2 + 1**: same width, ID left and EN right with 中文 centred below (155 × 60 buttons), 10 px lower than the single-row bars to leave room under the artwork; the idle frame grows 76 px downward and every column moves up 40 px (on top of Posisi Y card). Card artwork videos are redrawn on a canvas that stretches only the plain band behind the bar, so the artwork is not distorted and tiles stay aligned. Sensor Service moves the language, main, and every other target with it (`shared/language-bar.ts`) | Compact |

How the switches combine on an open card:

| Tombol slider | Auto page (or Tombol page off) | Photos | Pages | Card closes (reset time passed) |
| --- | --- | --- | --- | --- |
| On | Off | Arrows | Tabs | At the reset time |
| Off | Off | Auto slide | Tabs | After the last photo of the current page |
| On | On | Arrows | Auto page interval (tabs still work) | After the last page |
| Off | On | Auto slide | After each page's last photo | After the last photo of the last page |

Videos always play to their end while anything advances automatically, and a card never waits more than 5 minutes past the reset time.

**Simpan** and **Default** work as on the Hold page.

### Scroll teks (trial)

**Scroll teks (uji coba)** under Tombol di card (`scrollText`, default **Off**) trials vertically scrolling card text on section 6 only (`scrollMerge` in `6-summit-2026.ts`):

- **On:** its three pages show as one page without tabs, at the card's Font Maks size. The text scrolls up and down by touch or mouse drag, mouse wheel, or a TouchDesigner drag. A fade, a thin bar on the right, and a bouncing ⌄ show that more text follows, and the text starts at the top each time the card opens.
- **Off:** the card has its three pages and tabs again.
- **Switching:** an open card that was on a later page shows its first page when the pages merge (`clampPage`).
- **Sensor Service:** it does not send drags yet, so on the LiDAR/TUIO path section 6 only takes taps while scrolling is on.

### Storage and scope

- Wall, Hold, and Font live in this browser's `localStorage` (`altama.settings.v1`) through `app/plugins/settings-storage.client.ts`. Open the dashboard in the same browser profile as the wall on the event PC: in the kiosk started by `start-wall.bat` press **Ctrl+Shift+D** (again to return to the wall; the kiosk uses its own profile in `.wall-run/browser-profile` on `http://127.0.0.1:<WALL_PORT>`). A wall already open in another tab updates immediately (storage event); no reload is needed.
- Clearing browser data restores the defaults; keep an exported JSON as backup.
- There is no server or login. The page is not secret: anyone who can type a URL on the kiosk browser can open it. The wall runs fullscreen, so visitors cannot reach it in practice.
- The wall publishes the hold rules as `hold`, the card offset as `cardOffsetY`, the close switch as `showClose` (with its size and position as `closeScale`, `closeOffsetX`, `closeOffsetY`), the slider switch as `showArrows`, the page switch as `showPages`, the page count and tab position per column (`pageCount`, `tabsTop`, so Scroll teks drops section 6's tabs), and the language bar mode as `languageBar` in every `clientHello`/`clientState` message, so LiDAR input follows the same configuration and targets move with the cards. See [sensor](./sensor.md).

## Sensor

The page talks to the Sensor Service over WebSocket (`NUXT_PUBLIC_SENSOR_WS_URL`, or `ws://<this host>:8787` when unset) and works whether or not wall sensor input is enabled. Start the service first (`bun run sensor:service`; `start-wall.bat` does it); while it is unreachable the page shows only that command and the URL.

- **Status** (top right): source and state (`Hokuyo · 40 Hz`, `belum kalibrasi`, `kalibrasi`, `Service offline`, …) and the number of connected walls.
- **Off / Hokuyo / Augmenta / TUIO**: the active touch source. `Off` keeps OSC show control only.
- **Hokuyo**: IP and port of the UST-10LX. **Augmenta / TUIO**: UDP port and **Invert Y**. **OSC show control**: UDP port for `/altama/*`.
- **Kalibrasi** (Hokuyo): wall points (logical px) with the measured sensor position (mm). **Mode kalibrasi** pauses input; **Ambil** stores the largest current cluster for that row; **+ Titik** / ✕ add or remove points (4–12). `✓` means solved; from the fifth point on the RMS error in px is shown. Background **Ambil** / **Hapus** captures or clears the static scene (nobody in front of the wall). Procedure: [sensor](./sensor.md#hokuyo-ust-10lx).
- **Preview**: the six idle frames (moved by the saved card offset), calibration points, and live contacts (grey = no target, blue ring = dwell progress, green = sent). The caption counts contacts, Hokuyo clusters, and inputs sent since the service started.
- **Simpan** sends the config to the service, which saves `sensor-config.json` and applies it immediately (rebinding ports or reconnecting the LiDAR). **Batal** discards edits. Changes made elsewhere (another dashboard, the file after a restart) appear unless you are editing.

## Code

- `app/pages/dashboard.vue`: shell (sidebar `NAV`, drawer, scrolling content column, backup/fullscreen/reset); `app/pages/dashboard/{index,wall,hold,font,sensor}.vue`: pages with `definePageMeta({ title, description })`.
- `app/components/dashboard/`: `DashboardWall`, `DashboardHold`, `DashboardFont` (with `DashboardCardFit`, the invisible fit check), `DashboardSensor`, `DashboardFormActions` (Simpan/Batal/Default bar), and the shared `DashboardSection`, `DashboardSettingRow`, and `DashboardSwitch`.
- `app/composables/useSettingsBackup.ts`: export/import; `app/composables/useSensorAdmin.ts`: admin socket with reconnect, owned by the Sensor page's scope.
- `shared/hold-settings.ts`, `shared/wall-settings.ts`, `shared/font-settings.ts`: groups/settings, defaults, limits, normalizers, and the action → hold group map (`HOLD_GROUP_BY_ACTION`); `shared/sensor-config.ts`: Sensor Service config and admin contract.
- `app/stores/settings.ts`: serializable `hold`, `wall`, and `fonts` state. `WallHoldButton` reads its `group` rule and passes `{ mode, durationMs }` to the `v-hold` directive (`app/utils/hold.ts`).

To add a setting: extend the shared normalizer and store, persist it through the same plugin, and add a row to the matching page (or a new page in `NAV` in `app/pages/dashboard.vue`).
