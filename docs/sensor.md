# Sensor Service

Sensor Service owns raw LiDAR scans, calibration, tracking, hit detection, contact release, debounce, and dwell. The Nuxt renderer receives semantic events over native WebSocket.

The service lives in `sensor-service/` (Bun, no runtime dependencies) and runs on the event PC:

```bash
bun run sensor:service        # same as bun run osc:service
```

| Port | Use |
| --- | --- |
| WebSocket `8787` (`WS_PORT`, `WS_HOST`) | Wall protocol v2 below and the `/dashboard` admin contract |
| UDP `9000` (configurable) | OSC show control `/altama/*`, always on |
| TCP `192.168.0.10:10940` | Hokuyo UST-10LX (SCIP 2.0), when the source is `hokuyo` |
| UDP `12000` | Augmenta OSC, when the source is `augmenta` |
| UDP `3333` | TUIO 1.1 `/tuio/2Dcur`, when the source is `tuio` |

One touch source is active at a time (`off`, `hokuyo`, `augmenta`, `tuio`), chosen on `/dashboard` ([dashboard](./dashboard.md)).

## Service configuration file

The service keeps its settings in `sensor-config.json` in the working directory (override with `SENSOR_CONFIG=/path/sensor-config.json`) and the Hokuyo background in `sensor-background.json` next to it. Both are created on first start, written atomically, and ignored by git. The dashboard reads and writes them over the WebSocket, so they persist without a browser and apply before the wall opens. Shape and defaults: `shared/sensor-config.ts` (`normalizeSensorConfig` clamps every value).

```json
{
  "source": "hokuyo",
  "hokuyo": {
    "host": "192.168.0.10",
    "port": 10940,
    "minRangeMm": 100,
    "maxRangeMm": 8000,
    "clusterGapMm": 60,
    "minPoints": 3,
    "maxSizeMm": 300,
    "backgroundToleranceMm": 50,
    "calibration": [{ "wall": { "x": 32, "y": 426 }, "sensor": { "x": 922, "y": 2212 } }]
  },
  "augmenta": { "port": 12000, "invertY": false },
  "tuio": { "port": 3333, "invertY": false },
  "osc": { "port": 9000 }
}
```

Tuning values (`minRangeMm` … `backgroundToleranceMm`) are only in the file; edit it while the service is stopped, or send a partial `setConfig` (below).

## Sources

### Hokuyo UST-10LX

`sensor-service/hokuyo.ts` connects over TCP, sends `QT` and `PP` (scan parameters; UST-10LX defaults AMIN 0, AMAX 1080, AFRT 540, ARES 1440, 40 Hz), then streams `MD` continuously. Lines are checksum-verified (`sensor-service/scip.ts`); a corrupted scan is dropped. When the link drops or no scan arrives for 3 s it reconnects with 1–5 s backoff, and the wall gets `status` with `sensorReady: false` meanwhile.

Per scan (`sensor-service/tracker.ts`):
1. Ranges outside `minRangeMm`–`maxRangeMm`, error codes, and points within `backgroundToleranceMm` of the captured background are dropped.
2. Angularly neighbouring points (one missing step allowed) closer than `clusterGapMm` form a cluster; clusters with fewer than `minPoints` or larger than `maxSizeMm` (bodies, frame edges) are ignored.
3. Cluster centroids (sensor mm: x toward the front step, y counterclockwise) go through the calibration homography to logical wall px; points outside the 2304 × 1344 canvas are dropped.
4. A nearest-neighbour tracker gives stable IDs (`lidar-N`): a contact must persist two scans, may jump at most 140 px per scan, and keeps its identity through 150 ms dropouts.

**Calibration.** The homography is a least-squares fit (normalized DLT) of at least four measured points that span an area (corners plus collinear mid-edge points are fine; four nearly collinear points are rejected, as is a fit whose horizon falls between the points). Default wall points are the outer corners of the six idle frames (32,426 · 2272,426 · 2272,1068 · 32,1068). Procedure on site:
1. Mount the sensor so its scan plane is parallel to and a few cm in front of the LED surface; set the IP on the dashboard and save.
2. Press **Mode kalibrasi** (inputs stop; the wall gets `calibrated: false`).
3. Hold a hand or a round object on point 1 so it is the only (largest) cluster and press **Ambil** on row 1; repeat for every point. Extra points (up to 12, e.g. centre and mid-edges) average out error; the dashboard shows the RMS error from the fifth point on (four points always fit exactly).
4. **Simpan** (the service solves the homography), then **Selesai**.
5. With nobody in front of the wall, press Background **Ambil** (40 scans) to mask static objects inside the canvas.

Calibration uses the cluster centroid, so the hand-size bias is the same during calibration and use.

### Augmenta

`sensor-service/normalized.ts` reads Augmenta Simulator / Augmenta OSC on UDP 12000:
- protocol v2 `/object/enter|update|leave`: `frame(i) id(i) slotid(i) age(f) centroid.x(f) centroid.y(f) …`;
- protocol v1 `/au/personEntered|personUpdated|personWillLeave`: `pid(i) oid(i) age(i) centroid.x(f) centroid.y(f) …`.

Extra and scene messages are ignored; an object without updates for 1 s is released. Centroids are normalized with a top-left origin and cover the whole canvas; enable **Invert Y** when the source uses a bottom-left origin. Calibrate the Augmenta scene itself so its area matches the LED.

### TUIO 1.1

`/tuio/2Dcur` on UDP 3333: `alive` lists live session IDs, `set s x y X Y m` updates one, `fseq` closes the frame (bundles supported). Cursors missing from `alive` are released; everything is released when no packet arrives for 1.5 s. Mapping and **Invert Y** work as for Augmenta.

## Hit detection, dwell, and debounce

For every source (`shared/sensor-targets.ts`, `sensor-service/dwell.ts`):
- contacts are hit-tested only against the targets visible for each column's latest snapshot (rules below); flags and Back win over the frame below them, and main ignores the language overlay;
- the visible page's tab is not a target (re-selecting the shown page does nothing);
- a hold target (main, sub-item tile, arrows, page tabs) fires after its group's dashboard duration, taken when the contact reached the target; when the group is off, and for language/Back, the contact must stay 250 ms;
- each contact sends at most one input and must be released before it acts again (no repeat while held, no chained actions when the column changes under it); contacts still present when calibration mode ends count as spent;
- only the first connected wall (primary) defines the visible targets and receives touch and show-control input; walls that connect later (a phone opening `/`) get hello/status/heartbeat only until the primary disconnects. Keep one wall open;
- leaving a target restarts the dwell, except for edge jitter shorter than 120 ms; a target that disappears (column opened/closed) is dropped at once;
- input `x`/`y` are the contact position floored to integers, inside the declared rectangle.

## Configuration and rollout

```dotenv
NUXT_PUBLIC_SENSOR_ENABLED=true
NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
```

Static output embeds public runtime values; rebuild when these change. Mouse/keyboard operation works while sensor input is disabled.

**Breaking migration:** current protocol is **v2**, geometry is **wall-v7**. It follows the Summit reference mockups: per-column idle frames, sub-item tiles chosen directly from idle (no submenu), and open-card Back, photo arrows, and page tabs. wall-v5 moved every target 32 px lower than wall-v4; wall-v6 fitted column 5 (Distribusi & Pemasaran) to its card video; wall-v7 follows the re-encoded video whose panels sit 22 source px higher: tiles 338 × 227 at y 546 and 338 × 203 at y 781, language bar 262 × 62 at y 990 with flags at y 997. Protocol v1 / layout-v4 (three-section UI) and wall-v1 to wall-v6 are all rejected. Deploy the new renderer and matching Sensor Service contract/geometry together, recalibrate, then enable the sensor. Keep sensor input disabled until that service is ready.

## Envelope and health

`clientHello` and `clientState` also carry the dashboard settings that affect touch: `hold` (rules for the groups `card`, `page`, `slider`, `language`, `back`; language and back are off by default, i.e. only the short deliberate contact), `cardOffsetY` (logical px, −120 to 120), `showClose` (default `true`; `false` removes every Back target because the wall hides its close button), and `showArrows` (default `true`; `false` removes every previous/next target because the wall hides its photo arrows and auto-slides instead). The service shifts every visible target by `cardOffsetY` before hit-testing, and the wall validates input against the same shifted rectangles, so moving the cards on `/dashboard` needs no recalibration.

Every service message includes `version: 2`, nonempty `sessionId`, increasing integer `seq`, `layoutVersion: "wall-v7"`, and `type`.

`hello` is required once per connection and contains boolean `sensorReady`/`calibrated`. `status` updates those booleans with optional short `detail`. `heartbeat` establishes liveness. Expect heartbeat every 2 seconds; after more than 6 seconds without valid traffic the socket closes and reconnects with jittered backoff up to 10 seconds.

Input is forwarded only after handshake while device and calibration are ready. Invalid JSON, oversized frames, old protocol/layout, wrong session, replayed handshake, duplicate/out-of-order sequence, unknown actions, wrong-column sub-items, and mismatched target coordinates are rejected.

## Renderer messages and visible targets

On connection, the renderer sends:
```json
{ "version": 2, "type": "clientHello", "layoutVersion": "wall-v7", "columns": { "1": { "phase": "idle", "locale": "id", "subItem": "", "photo": 0, "page": 0, "photoCount": 2, "pageCount": 2 } } }
```
Both messages also carry `hold`, the operator's dwell rules from `/dashboard`:
```json
{ "hold": { "card": { "enabled": true, "seconds": 1 }, "page": { "enabled": false, "seconds": 1 }, "slider": { "enabled": true, "seconds": 2.4 } } }
```
`card` covers `main` and `subItem`, `page` covers `page`, `slider` covers `previous`/`next` (`HOLD_GROUP_BY_ACTION` in `shared/hold-settings.ts`). Apply the rule current at contact start. When a group is disabled, still require a short deliberate contact (about 0.2–0.3 s) and send one input per contact, so passers-by do not trigger it. If `hold` is missing, use the defaults (all enabled, 1 s).

The actual `columns` payload always includes IDs 1–6. `phase` is `idle` or `active`; `photoCount` is the number of photo slots on the page currently shown and `pageCount` the number of pages of the selected content. Changes send the same snapshot with `type: "clientState"`.

Sensor Service combines that snapshot with `shared/installation-layout.json`:
- language targets are visible only in idle;
- `main` (single columns) and `subItems` tiles (columns 2/5) are visible only in idle; columns 2/5 have no `main` target;
- `active.back` only in active;
- `active.previous`/`active.next` only in active with `photoCount > 1` (it changes when the page changes);
- `active.pages[n]` only in active with `pageCount > 1` and `n < pageCount`.

Each column is independent: target visibility depends only on that column's snapshot.

Do not detect against hidden target groups. Main, sub-item tile, photo-arrow (`previous`/`next`), and page-tab targets follow the `hold` rules above (default one second of deliberate contact before one input). Immediate language/Back input should be debounced to one action per deliberate contact. Contact release is internal to Sensor Service; do not send legacy touchStart/touchEnd events.

## Input

```json
{
  "version": 2,
  "sessionId": "service-boot-id",
  "seq": 42,
  "layoutVersion": "wall-v7",
  "type": "input",
  "pointerId": "lidar-02",
  "x": 1310,
  "y": 700,
  "action": { "type": "main", "columnId": 4 }
}
```

Coordinates are logical 2304 × 1344 pixels inside the declared target. All six columns use one `WallAction` contract from `shared/wall.ts`:

| Action type | Additional fields | Behavior |
| --- | --- | --- |
| `main` | `columnId` | Open an idle single column (operator/OSC: opens the default sub-item of columns 2/5) |
| `subItem` | `columnId`, `subItemId` | Open that sub-item from its idle tile |
| `language` | `columnId`, `locale` | Change only that column's language |
| `back` | `columnId` | Return to idle |
| `previous` / `next` | `columnId` | Move the current page's photo slider (hold target) |
| `page` | `columnId`, `page` (0-based) | Show that page, its photos and text (hold target) |

Valid sub-items: column 2 = `tekiro`, `ryu`, `rexco`; column 5 = `distribusi`, `pemasaran`. Languages: `id`, `en`, `zh-Hans`. The renderer validates the declared target and current phase; it does not perform raw hit detection.

### Readiness reported by the service

| Source | `sensorReady` | `calibrated` | `detail` examples |
| --- | --- | --- | --- |
| `off` | true | true | `osc only` |
| `hokuyo` | scans arriving | homography solved | `hokuyo connecting`, `hokuyo no scans`, `hokuyo not calibrated` |
| `augmenta` / `tuio` | UDP port bound | true | bind error (e.g. port used by another app) |

While **Mode kalibrasi** is on, `calibrated` is false and `detail` is `calibrating`. The renderer drops every input, OSC show control included, unless both flags are true; select source `off` for show-control-only operation.

The wall-v7 idle frame is 360 × 642 logical px at y 426; the open card is 330 wide at y 512, at least 524 tall and growing with its content to y 1312 (it is not a target). The main hit rectangle of single columns covers the whole idle frame, but its languageBar occludes that area: detect a flag there or ignore padding/gaps. Main events inside languageBar are rejected. Hidden language actions while open are also rejected. Refer to each column's `card` and target rectangles in the canonical JSON; do not reuse wall-v1/wall-v2 coordinates. The bundled OSC service reads the same JSON, so it follows layout changes automatically.

## OSC Show Control (Resolume Arena & TouchDesigner)

The Sensor Service always listens for OSC show control from Resolume Arena, TouchDesigner, QLab, or Bitfocus Companion and sends the matching protocol v2 input at the centre of the declared target (`sensor-service/show-control.ts`). Show control bypasses dwell and target visibility; the renderer still validates the phase. Commands without a wall-v7 target (a page that does not exist, an unknown sub-item) are dropped instead of being sent.

### Ports and configuration

- **UDP OSC Input:** port `9000` (`osc.port` in `sensor-config.json` / dashboard)
- **WebSocket Output:** port `8787` (`WS_PORT=8787`)
- **Run command:** `bun run sensor:service` (alias `bun run osc:service`)

### OSC Address Reference

| OSC Address | Arguments | Example | Description |
| --- | --- | --- | --- |
| `/altama/column` | `columnId: int` (1–6) | `/altama/column 1` | Toggle main or back on specified column |
| `/altama/col/<id>` | *(none)* | `/altama/col/2` | Toggle main or back on column from path |
| `/altama/open` | `columnId: int` (1–6) | `/altama/open 3` | Open idle column directly (columns 2/5: first tile) |
| `/altama/back` | `[columnId: int]` *(optional)* | `/altama/back 2` | Back in column, or reset all if omitted |
| `/altama/next` | `columnId: int` (1–6) | `/altama/next 1` | Next photo in the open slider |
| `/altama/prev` | `columnId: int` (1–6) | `/altama/prev 1` | Previous photo in the open slider |
| `/altama/page` | `col: int`, `page: int` (1-based) | `/altama/page 2 2` | Show text page 2 of column 2 |
| `/altama/subItem` | `col: int`, `key: string` | `/altama/subItem 2 tekiro` | Open sub-item in idle column 2 or 5 |
| `/altama/lang` | `[col: int]`, `locale: string` | `/altama/lang en` | Switch language (`id`, `en`, `zh-Hans`) |
| `/altama/reset` | *(none)* | `/altama/reset` | Reset all open columns to idle standby |

### Testing OSC commands

Send commands from terminal without third-party software:
```bash
bun run osc:send /altama/column 1
bun run osc:send /altama/subItem 2 tekiro
bun run osc:send /altama/reset
```

## Dashboard admin contract

`/dashboard` connects to the same WebSocket. A connection whose first message is `adminHello` is an admin: it never receives wall frames, walls never receive admin frames, and only admins may change settings. Types: `SensorAdmin*` in `shared/sensor-config.ts`; every message carries `version: 2`.

| Direction | `type` | Fields | Notes |
| --- | --- | --- | --- |
| dashboard → service | `adminHello` | — | Replies with `adminState` |
| dashboard → service | `setConfig` | `config` (full or partial) | Merged, normalized, saved, applied (ports rebound, LiDAR reconnected); replies `adminResult`. Refused when the active Augmenta/TUIO port equals the OSC port |
| dashboard → service | `calibrate` | `on: boolean` | Calibration mode (not saved) |
| dashboard → service | `captureBackground` / `clearBackground` | — | Hokuyo only; capture replies after 40 scans, or with an error after 5 s, when the LiDAR drops, or when the source changes |
| service → dashboard | `adminState` | `config`, `status` | On hello and whenever config, readiness, wall count, hold rules, or inputs change |
| service → dashboard | `adminContacts` | `contacts[]` (`id`, `x`, `y`, `target`, `progress`, `fired`), `sensorPoints[]` | 10 Hz; `sensorPoints` are Hokuyo clusters in sensor mm, largest first (**Ambil** takes the first) |
| service → dashboard | `adminResult` | `request`, `ok`, `error?` | Reply to a request |

`status` carries `source`, `sensorReady`, `calibrated`, `calibrating`, `detail`, `wallClients`, `hold`, `calibrationRmsPx`, `backgroundSteps`, `scanRate`, `inputs`, and `lastInput`. The WebSocket has no authentication: keep port 8787 on the installation network, or set `WS_HOST=127.0.0.1` when wall and dashboard run on the event PC.

## Simulators

No hardware is needed for development:

```bash
bun run sensor:sim hokuyo --print-calibration          # calibration points for the simulated rig
bun run sensor:sim hokuyo --tap 212,700,1.5 --loop     # UST-10LX on tcp 10940 (dashboard IP 127.0.0.1)
bun run sensor:sim augmenta --tap 1340,700 --v1 --flip-y
bun run sensor:sim tuio --tap 212,700+588,700,1.5      # "+" = simultaneous contacts
```

Taps are logical wall px held for the given seconds (default 1.5). The Hokuyo simulator answers `PP`/`MD`/`QT` like the sensor and renders scans of 40 mm hands with noise and a surrounding room (`sensor-service/synthetic.ts`: sensor 80 mm above the top centre, 2 mm per px). Run the wall with `NUXT_PUBLIC_SENSOR_ENABLED=true NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787 bun run dev`.

## Hardware acceptance

Validate mounting/scan plane, all target boundaries, simultaneous users, occlusion, cable removal, service restart, release/dwell timing, and long runs on the event PC/LED. Unit tests and simulators do not prove physical coverage: tracker thresholds, cluster sizes, and calibration have only been exercised with synthetic scans, so **physical calibration and multi-user tests on the event hardware are still required**. Run the service under a supervisor (Task Scheduler/NSSM) so it restarts with the PC.
