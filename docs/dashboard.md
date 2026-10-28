# Operator dashboard

`/dashboard` is the operator configuration UI: a sidebar (a darker navy than the wall-blue content, same hue) links four pages (Wall, Hold, Font, Sensor: the wall configuration comes first), and `/dashboard` redirects to Wall. From `lg` (1024 px) the sidebar is fixed; below it is an off-canvas drawer opened from the ☰ top bar and closed by ✕, the backdrop, Escape, or navigating. The content column uses the full width and scrolls on its own (the document itself never scrolls; see `main.css`).

## Password

When the server has `NUXT_DASHBOARD_PASSWORD` (in `.env`; `start-wall.bat` passes it on, and PM2 reads it on the VPS), `/dashboard` first shows a single centred password input, nothing else (placeholder *Clue: password wifi Aptronim*). Enter unlocks it: `POST /api/dashboard/login` checks the password on the server and sets an httpOnly session cookie (`expires.signature`, an HMAC keyed by the password, never the password) for **3 days**. The session slides: `GET /api/dashboard/session` (every dashboard visit) and every settings save start the 3 days again, so an operator who opens the dashboard at least every 3 days never logs in again. **Keluar** at the bottom of the sidebar (under Reset ke default, only when a password is set) calls `POST /api/dashboard/logout` and shows the password input again. A wrong password shows *Password salah* after a short pause; changing the password signs every browser out. Without the variable the dashboard is open, as before. The password never reaches the client bundle (`runtimeConfig.dashboardPassword` is server-only); the wall itself never asks for it.

| Page | Route | Stored in |
| --- | --- | --- |
| Wall | `/dashboard/wall` | the server's SQLite (`/api/settings`) + this browser (`localStorage`) |
| Hold | `/dashboard/hold` | the server's SQLite (`/api/settings`) + this browser (`localStorage`) |
| Font | `/dashboard/font` | the server's SQLite (`/api/settings`) + this browser (`localStorage`) |
| Sensor | `/dashboard/sensor` | Sensor Service (`sensor-config.json` on the event PC) |

## Settings sync (SQLite)

Wall, Hold, and Font settings are one document in a SQLite file on the server (`NUXT_SETTINGS_DB`, default `.data/altama.sqlite`; `bun:sqlite` under Bun, `node:sqlite` under Node), so they can be changed from a phone or any device:

- `GET /api/settings` returns `{ version, updatedAt, settings }` (version 0 = nothing saved yet). It is public, `no-store`, and allows any origin, so a wall on another host can follow it.
- `PUT /api/settings` saves (values are normalized like in the browser, missing groups keep their stored value) and bumps the version. It needs the dashboard login when `NUXT_DASHBOARD_PASSWORD` is set (401 otherwise).
- `app/plugins/settings-sync.client.ts` runs on every page after `settings-storage`: it pulls on start, every 5 s, and when the tab becomes visible, and applies a newer server version to the store (which also updates `localStorage`, the offline fallback). Only `/dashboard` pushes: every store change (Simpan, import, reset) goes to the server 300 ms later; values that came from the server are never echoed back. The first dashboard that opens an empty server (version 0) seeds it with its browser's settings, also right after login.
- Saves are captured while on the local dashboard, so leaving it during the 300 ms delay still sends the saved snapshot. GET/PUT requests are ordered; the newest pending edit wins, stale reads cannot undo saves, and failed saves stay local and retry before the next poll (including after login). Remote followers and changes originating on the wall never create saves. Server versions only advance within a browser session; reload wall/dashboard tabs after restoring an older database backup.
- `NUXT_PUBLIC_SETTINGS_SYNC_URL` on another host (e.g. `https://altama-milestone.nmxavw.com` on the event PC) makes the wall **follow** that server: it pulls from there, and its own dashboard changes stay in that browser until the next change on the server. Empty = this server.
- When the database is unavailable (503, e.g. on Vercel, whose file system does not keep files) or the server cannot be reached, everything keeps working from `localStorage`.

The sidebar footer acts on every operator setting:

- **Export pengaturan** downloads `altama-settings.json` (wall, hold, and font settings).
- **Import pengaturan** applies a backup immediately (older `altama-hold-settings.json` files with only `hold` still import).
- **Fullscreen** toggles browser fullscreen.
- **Reset ke default** opens a confirmation dialog (centred on wide screens, a bottom sheet with full-width buttons on phones; Batal, the backdrop, or Escape cancel) and restores Wall, Hold, and Font defaults on **Ya, reset**.

Every button, switch, link, and tab (including the Sensor source tabs) shows a pointer cursor; `main.css` restores it after Tailwind's preflight reset.

## Font

Every wall text uses Roboto; the dashboard itself uses Quicksand (client request), while its samples and weight buttons here stay Roboto so they match the wall. The page sets the sizes (logical px on the 2304 × 1344 canvas) and the title weight, grouped as **Judul**, **Isi card per section**, and **Tab page**. Each row shows a live sample, − / + steppers, a ? tooltip, and a **↺ Default** chip; the save bar works as on Wall.

| Setting | Text | Default | Range |
| --- | --- | --- | --- |
| Judul section | Column title in the pill | 29 | 20–34 |
| Ketebalan judul | Title weight: Regular 400, Medium 500, Bold 700, Extra 800, Black 900 | Black (900) | – |
| Nama sub-item | Open sub-item name above the card (when it has no logo) | 32 | 24–40 |
| Caption tile | Tile labels of column 5 (Distribusi / Pemasaran) | 30 | 22–36 |
| Tab page | Page tab labels | 24 | 16–28 |

**Isi card per section** has one row per open card (`cards` in `shared/font-settings.ts`): Tentang Altama, Tekiro, RYU, Rexco, Infrastruktur, Kepercayaan Digital, Distribusi, Pemasaran, and Altama Summit 2026. Each row sets a body size range, **Min** and **Maks** (14–40 px, default 24–26 px for every card). Every page uses the largest size up to Maks that still fits the tallest card (y 1312), never less than Min, and the card grows to that text.

Each row also shows a fit status, checked on every page and language at once (`DashboardCardFit` renders them invisibly in the tallest card's text box): **✓ 26 px** (or the range of sizes the pages use, e.g. ✓ 24–26 px), or **⚠ Di bawah Min · N px (PAGE p, language)** when a page does not fit even at Min and the wall has to shrink it further so it is not clipped. At 24–26 px only Tekiro does: PAGE 2 Produk (ID) about 23.5 px and the award pages 22.6–24 px. Pages are never added automatically; a card that needs a larger size than fits is split into more pages in its content file.

A title word that does not fit its pill (e.g. INFRASTRUKTUR at a large size or Black) shrinks just that title (down to 60 %); long open-card pages still grow the card first and then shrink, so no setting clips text.

## Hold

| Group | Buttons | Default |
| --- | --- | --- |
| Card section (`card`) | Idle main card of columns 1/3/4/6 and the sub-item tiles of columns 2/5 | Set on the Wall page (Animasi buka konten): Tap + delay, 1.0 s |
| Button page (`page`) | Page tabs (PAGE 1–4) | Set on the Wall page (Animasi buka konten): Tap + delay, 1.0 s |
| Button slider (`slider`) | Photo arrows | Tap |
| Bahasa (`language`) | Language flags (ID / EN / 中文) | Tap (no animation) |
| Tombol close (`back`) | The open card's ✕ button | Tap |

The Hold page lists slider, language and close. Each has a **mode** (segmented **Tap / Hold / Tap + delay**) and a duration (0.3–5 s, 0.1 s steps, unused for Tap). Card section and Button page are not listed there: the Wall page's **Animasi buka konten** decides them (`effectiveHoldSettings` in `shared/wall-settings.ts`: On = Tap + delay with its duration, Off = Tap), and a note on the Hold page links to it and shows the current value. Their stored Hold values are kept but unused.

- **Hold**: the button must be held; the border progress animation follows the duration; releasing early cancels.
- **Tap + delay**: one tap starts the same border animation and the button activates when it completes, without holding (releasing does not cancel; another tap while it runs is ignored). Sensor Service treats it as a short contact and the wall plays the delay on the touched button (`wall:press`), so LiDAR and pointer input behave alike.
- **Tap**: the button activates on a normal press.
- In Hold and Tap + delay the button activates only once its border has finished drawing, and the finished border with its glow stays for 250 ms (`HOLD_SETTLE_MS`) before the content opens, so the animation always completes visibly, even when a busy wall starts it late.
- Keyboard Enter/Space always activate immediately, whatever the rule.
- Groups whose buttons the Wall page hides are hidden here as well, with a note linking to Wall: Button page while Tombol page is off, Button slider while Tombol slider is off, Tombol close while Tombol close is off. Their values are kept and return when the switch is turned on again. The list follows the saved Wall settings, also when they change in another tab.
- The save bar sticks to the bottom of the page: it counts unsaved changes; **Simpan** applies them, **Batal** discards them, **Default** loads the defaults into the form (save to apply).

## Wall

The page is grouped into five cards: **Mode konten** (Page or Scroll, at the top), **Tampilan** (language bar, card offset), **Tombol di card** (Animasi buka konten + duration, close + size/position, slider + Auto slide, page tabs, Auto page + duration), **Waktu** (reset), and **Diagnostik** (amber; touch dots + coordinate numbers + duration, with a "Masih menyala" badge while on). Each row has a one-line hint (number rows state their default), a **?** tooltip with the details (hover; a click or tap pins it and lights the **?**, closed by another click, a click elsewhere, or Escape), and, when the value differs from its default, a **↺ Default: …** chip that restores it. Switches show On/Off. Inputs that only matter while a switch is off (Auto slide, Auto page) or on (Durasi animasi, Angka koordinat, Durasi titik) sit indented under it. The language bar options are drawn as small card sketches.

| Setting | Effect | Default |
| --- | --- | --- |
| Reset otomatis | Seconds without interaction before a column returns to idle/Indonesian; one value for every column (5–600 s). While a card advances on its own (auto slide/auto page), the reset waits until the slideshow has reached its last slide (or last page) since the last interaction: e.g. a 30 s video plus 5 × 5 s images closes at 55 s, right after the last image, while 2 images (10 s) still close at the reset time. A card never waits longer than 5 minutes past the reset time, and closes at once if the operator turns the arrows/tabs back on | 30 s |
| Posisi Y card | Moves every column (frame, title, card, controls) up (−) or down (+) on the LED wall, −120 to 120 logical px; ↑/↓ nudge by 10. Open cards still end at y 1312 on screen; the phone/tablet layout ignores it | 0 |
| Letak tombol close | Shown while Tombol close is on: **Di bawah card** (a solid red capsule as wide as the content card, 330 × 74, with a white ✕ and bold TUTUP / CLOSE / 关闭, 10 px under the idle frame; open cards then stop at the idle frame's bottom, so long text can shrink below Min, see Font) or **Pojok kanan atas** (the ✕ badge on the card's corner; the size and position rows below apply only to it) | Di bawah card |
| Animasi buka konten | Opening content (main cards, the Tekiro / RYU / Rexco / Distribusi / Pemasaran tiles) and switching page tabs: On plays the hold border animation after a plain tap (no holding) and acts when it completes; Off acts at once. Flags, photo arrows and close are not affected (Hold page). Sensor Service gets the same rules | On |
| Durasi animasi | Shown while Animasi buka konten is on: how long the border runs before the content opens (0.3–5 s, 0.1 s steps) | 1 s |
| Tombol close | Shows the open card's ✕ button. Off hides it on every column and removes the Back touch target from Sensor Service; cards still close after the reset time, with operator keys 1–6, R/Escape, and OSC `/altama/back` | On |
| Ukuran tombol close | Shown while Tombol close is on: 1× (the 44 px badge), 2×, or a manual 1–2× (0.1 steps); the badge grows around its centre on the card corner | 1× |
| Posisi tombol close | Shown while Tombol close is on: X (− left / + right) and Y (− up / + down) shift of the badge, −60 to 60 logical px in 2 px steps | X 0 · Y 0 |
| Tombol slider | Shows the photo arrows on open cards. Off hides them on every column, removes the previous/next touch targets from Sensor Service, and turns on auto slide | Off |
| Auto slide | Shown only while Tombol slider is off: an open card with several photos moves to the next photo (wrapping) every N seconds, 2–60 s. A **video** slide ignores the interval: it starts from the beginning when shown, plays once, and the next slide appears when it ends (e.g. video 20 s → image 5 s → image 5 s → video …; a video that fails to play is skipped). Any photo, page, or sub-item change restarts that column's countdown; auto slide is not visitor activity; the reset only waits for the slideshow to reach its last slide (see Reset otomatis). Operator ←/→ keys and OSC still change photos | 5 s |
| Tombol page | Shows the page tabs (PAGE 1–4) on open cards. Off hides them on every column, removes the page touch targets from Sensor Service, and turns on auto page; the text then starts right below the photo | On |
| Auto page | Pages change on their own, also while the tabs are shown (always on while Tombol page is off). The next page (wrapping, photos restart at the first) appears every **Durasi auto page** seconds (3–120 s) since the last page change, so pressing a tab restarts the count. A playing video slide finishes first. **With Tombol slider also off**, a page with several photos ignores this interval and changes right after its last photo, so every photo of every page is shown (e.g. 10 + 5 photos at 5 s: page 2 at 50 s, the card closes at 75 s); pages with one photo or none keep the interval. Not visitor activity; the reset only waits for the last page (see Reset otomatis) | Off (15 s when on) |
| Titik sentuh | Calibration overlay on the wall itself (same URL): a blue dot where a pointer pressed, a red dot and dashed line where it released if it drifted, a green dot where a Sensor Service input landed, each with logical coordinates. Never blocks input. The switch is the only control (settings sync reaches every wall, including a TouchDesigner Web Render TOP), so Off always hides it | Off |
| Angka koordinat | Shown only while Titik sentuh is on: the logical x / y numbers next to each dot; Off leaves only the dots | On |
| Durasi titik | Shown only while Titik sentuh is on: seconds a dot stays after its release or sensor input (1–60 s) | 5 s |
| Tampilan bahasa | **Compact**: the flag pill in the middle of the idle frame (three 64 × 48 buttons). **Full width**: the bar spans the frame to 14 px from its edges, 76 px tall, with three equal 102 × 60 buttons and larger flags, on the same centre line. **Grid 2 + 1**: same width, ID left and EN right with 中文 centred below (155 × 60 buttons), 10 px lower than the single-row bars to leave room under the artwork; the idle frame grows 76 px downward and every column moves up 40 px (on top of Posisi Y card). Card artwork videos are redrawn on a canvas that stretches only the plain band behind the bar, so the artwork is not distorted and tiles stay aligned. Sensor Service moves the language, main, and every other target with it (`shared/language-bar.ts`) | Full width |

How the switches combine on an open card:

| Tombol slider | Auto page (or Tombol page off) | Photos | Pages | Card closes (reset time passed) |
| --- | --- | --- | --- | --- |
| On | Off | Arrows | Tabs | At the reset time |
| Off | Off | Auto slide | Tabs | After the last photo of the current page |
| On | On | Arrows | Auto page interval (tabs still work) | After the last page |
| Off | On | Auto slide | After each page's last photo | After the last photo of the last page |

Videos always play to their end while anything advances automatically, and a card never waits more than 5 minutes past the reset time.

For **Pemasaran** (nine photos), the default 30 s reset and 5 s auto slide close the card after 45 s in Scroll mode. In Page mode with automatic pages, its two nine-photo pages finish at 90 s. With manual slider/page controls it closes at the reset time. A visitor touch restarts only that section's inactivity timer; automatic photo/page changes do not count as visitor activity. If it stays open beyond the expected slideshow end with no touch, record the browser (including TouchDesigner), saved settings and elapsed time; this is not the expected wait.

**Simpan** and **Default** work as on the Hold page.

### Mode konten: Page or Scroll

**Mode konten** at the top of the page (`scrollText`) picks **Page** (text in tabbed pages, cards growing with their text) or **Scroll** (default, client request: vertically scrolling card text on every section). Like Tampilan bahasa, each option is a small card sketch: Page shows a tall card with tabs, Scroll a shorter card with a scroll bar and ⌄ above the skyline line.

- **On:** every card keeps its Font Maks size instead of shrinking. Its text scrolls up and down by touch or mouse drag, mouse wheel, or a TouchDesigner drag. A fade, a thin bar on the right, and a bouncing ⌄ show that more text follows, only when the text is longer than the tallest card; it starts at the top each time the card opens.
- **Pages while on** (`scrollPages` per column or sub-item; default all pages in one):

  | Card | Pages |
  | --- | --- |
  | Tekiro (section 2) | 2: profile + products, all awards under one heading |
  | RYU, Rexco (section 2) | 2, as usual |

  Section 2 (Merek Kami) always keeps its tabbed pages in scroll mode (client decision), and its tabs show even when Tombol page is off (`tabsAlways`; the Hold page then keeps Button page); only the other sections become one page.

  | Tentang Altama, Infrastruktur, Kepercayaan Digital, Distribusi, Pemasaran, Altama Summit | 1, no page tabs |

- **Preset when switched on:** Tombol slider turns off in the form (photos auto-slide). Tombol close and the Hold page are left as they are.
- **Card height:** every open card ends where its idle frame ends (under the flag bar: y 1068, or 76 px lower with Grid 2 + 1, moving with Posisi Y card), whatever its content, so the skyline stays visible; the text scrolls inside. Off: cards grow with their text up to y 1312 again.
- **Photo swipe:** a photo with more than one slide also swipes horizontally (left = next, right = previous, like the arrows): the photo follows the drag and snaps back, and a swipe counts when it is mostly horizontal and longer than a fifth of the frame. Touch, mouse, or a TouchDesigner drag.
- **Tombol slider:** unchanged by Scroll teks: Off still hides the arrows and auto-slides the photos.
- **Off:** the usual pages and tabs return (Tekiro 4, the others 1–2) and the text fits its card again.
- **Switching:** an open card that was on a later page shows its first page when the pages merge (`clampPage`).
- **Sensor Service:** it does not send drags yet, so on the LiDAR/TUIO path cards only take taps while scrolling is on.

### Storage and scope

- Wall, Hold, and Font live in the server's SQLite (see [Settings sync](#settings-sync-sqlite)) and, as the offline copy, in this browser's `localStorage` (`altama.settings.v1`) through `app/plugins/settings-storage.client.ts`. On one PC without a sync URL, open the dashboard in the same browser profile as the wall on the event PC: in the kiosk started by `start-wall.bat` press **Ctrl+Shift+D** (again to return to the wall; the kiosk uses its own profile in `.wall-run/browser-profile` on `http://127.0.0.1:<WALL_PORT>`). A wall already open in another tab updates immediately (storage event); no reload is needed.
- Clearing browser data restores the defaults until the next pull from the server; keep an exported JSON as an extra backup.
- With `NUXT_DASHBOARD_PASSWORD` set the dashboard asks for it (see [Password](#password)); without it anyone who can type the URL can open it.
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

- `app/pages/dashboard.vue`: shell (password gate, sidebar `NAV`, drawer, scrolling content column, backup/fullscreen/reset/logout); `app/pages/dashboard/{index,wall,hold,font,sensor}.vue`: pages with `definePageMeta({ title, description })`.
- `app/components/dashboard/`: `DashboardLogin` (password screen), `DashboardWall`, `DashboardHold`, `DashboardFont` (with `DashboardCardFit`, the invisible fit check), `DashboardSensor`, `DashboardFormActions` (Simpan/Batal/Default bar), and the shared `DashboardSection`, `DashboardSettingRow`, and `DashboardSwitch`.
- `server/utils/dashboard-session.ts`: password, session cookie, and `requireDashboardSession` (401 + 3-day renewal) for dashboard-only API routes; `server/utils/dashboard-auth.ts`: the signed token itself.
- `app/composables/useSettingsBackup.ts`: export/import; `app/composables/useSettingsSync.ts` + `app/plugins/settings-sync.client.ts`: app-owned server-sync lifecycle; `app/utils/settings-sync.ts`: request queue/retry state, independent of Nuxt; `shared/settings.ts`: browser/server document contract and normalization; `app/composables/useSensorAdmin.ts`: admin socket with reconnect, owned by the Sensor page's scope.
- `shared/hold-settings.ts`, `shared/wall-settings.ts`, `shared/font-settings.ts`: groups/settings, defaults, limits, normalizers, and the action → hold group map (`HOLD_GROUP_BY_ACTION`); `shared/sensor-config.ts`: Sensor Service config and admin contract.
- `app/stores/settings.ts`: serializable `hold`, `wall`, and `fonts` state. `WallHoldButton` reads its `group` rule and passes `{ mode, durationMs }` to the `v-hold` directive (`app/utils/hold.ts`).

To add a setting: extend the shared normalizer and store, persist it through the same plugin, and add a row to the matching page (or a new page in `NAV` in `app/pages/dashboard.vue`).
