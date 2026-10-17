# Sensor Service

Sensor Service owns raw LiDAR scans, calibration, tracking, hit detection, contact release, debounce, and dwell. The Nuxt renderer receives semantic events over native WebSocket.

## Configuration and rollout

```dotenv
NUXT_PUBLIC_SENSOR_ENABLED=true
NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
```

Static output embeds public runtime values; rebuild when these change. Mouse/keyboard operation works while sensor input is disabled.

**Breaking migration:** current protocol is **v2**, geometry is **wall-v4**. wall-v4 follows the Summit reference mockups: per-column idle frames, sub-item tiles chosen directly from idle (no submenu), and open-card Back, photo arrows, and page tabs. Protocol v1 / layout-v4 (three-section UI), wall-v1, wall-v2, and wall-v3 are all rejected. Deploy the new renderer and matching Sensor Service contract/geometry together, recalibrate, then enable the sensor. Keep sensor input disabled until that service is ready.

## Envelope and health

Every service message includes `version: 2`, nonempty `sessionId`, increasing integer `seq`, `layoutVersion: "wall-v4"`, and `type`.

`hello` is required once per connection and contains boolean `sensorReady`/`calibrated`. `status` updates those booleans with optional short `detail`. `heartbeat` establishes liveness. Expect heartbeat every 2 seconds; after more than 6 seconds without valid traffic the socket closes and reconnects with jittered backoff up to 10 seconds.

Input is forwarded only after handshake while device and calibration are ready. Invalid JSON, oversized frames, old protocol/layout, wrong session, replayed handshake, duplicate/out-of-order sequence, unknown actions, wrong-column sub-items, and mismatched target coordinates are rejected.

## Renderer messages and visible targets

On connection, the renderer sends:
```json
{ "version": 2, "type": "clientHello", "layoutVersion": "wall-v4", "columns": { "1": { "phase": "idle", "locale": "id", "subItem": "", "photo": 0, "page": 0, "photoCount": 2, "pageCount": 2 } } }
```
The actual `columns` payload always includes IDs 1–6. `phase` is `idle` or `active`; `photoCount` is the number of photo slots on the page currently shown and `pageCount` the number of pages of the selected content. Changes send the same snapshot with `type: "clientState"`.

Sensor Service combines that snapshot with `shared/installation-layout.json`:
- language targets are visible only in idle;
- `main` (single columns) and `subItems` tiles (columns 2/5) are visible only in idle; columns 2/5 have no `main` target;
- `active.back` only in active;
- `active.previous`/`active.next` only in active with `photoCount > 1` (it changes when the page changes);
- `active.pages[n]` only in active with `pageCount > 1` and `n < pageCount`.

Each column is independent: target visibility depends only on that column's snapshot.

Do not detect against hidden target groups. Main, sub-item tile, photo-arrow (`previous`/`next`), and page-tab targets require one second of deliberate contact before sending one input. Immediate language/Back input should be debounced to one action per deliberate contact. Contact release is internal to Sensor Service; do not send legacy touchStart/touchEnd events.

## Input

```json
{
  "version": 2,
  "sessionId": "service-boot-id",
  "seq": 42,
  "layoutVersion": "wall-v4",
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

The wall-v4 idle frame is 360 × 642 logical px at y 394; the open card is 330 × 524 at y 480. The main hit rectangle of single columns covers the whole idle frame, but its languageBar occludes that area: detect a flag there or ignore padding/gaps. Main events inside languageBar are rejected. Hidden language actions while open are also rejected. Refer to each column's `card` and target rectangles in the canonical JSON; do not reuse wall-v1/wall-v2 coordinates. The bundled OSC service reads the same JSON, so it follows layout changes automatically.

## OSC Show Control (Resolume Arena & TouchDesigner)

The repository provides a built-in TypeScript OSC & WebSocket service in `scripts/sensor-osc-service.ts` (`bun run osc:service`) with zero external runtime dependencies. It bridges OSC UDP show control messages from software like Resolume Arena, TouchDesigner, QLab, or Bitfocus Companion directly into the protocol v2 WebSocket stream on port `8787`.

### Ports and configuration

- **UDP OSC Input:** port `9000` (`OSC_PORT=9000`)
- **WebSocket Output:** port `8787` (`WS_PORT=8787`)
- **Run command:** `bun run osc:service`

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

## Hardware acceptance

Validate mounting/scan plane, all target boundaries, simultaneous users, occlusion, cable removal, service restart, release/dwell timing, and long runs on the event PC/LED. Browser/unit tests do not prove physical coverage.
