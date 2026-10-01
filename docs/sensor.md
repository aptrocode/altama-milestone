# Sensor Service

Sensor Service owns raw LiDAR scans, calibration, tracking, hit detection, contact release, debounce, and dwell. The Nuxt renderer receives semantic events over native WebSocket.

## Configuration and rollout

```dotenv
NUXT_PUBLIC_SENSOR_ENABLED=true
NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
```

Static output embeds public runtime values; rebuild when these change. Mouse/keyboard operation works while sensor input is disabled.

**Breaking migration:** current protocol is **v2**, geometry is **wall-v1**. Protocol v1 / layout-v4 describes the retired three-section UI and is rejected. Deploy the new renderer and matching Sensor Service contract/geometry together, recalibrate, then enable the sensor. Keep sensor input disabled until that service is ready.

## Envelope and health

Every service message includes `version: 2`, nonempty `sessionId`, increasing integer `seq`, `layoutVersion: "wall-v1"`, and `type`.

`hello` is required once per connection and contains boolean `sensorReady`/`calibrated`. `status` updates those booleans with optional short `detail`. `heartbeat` establishes liveness. Expect heartbeat every 2 seconds; after more than 6 seconds without valid traffic the socket closes and reconnects with jittered backoff up to 10 seconds.

Input is forwarded only after handshake while device and calibration are ready. Invalid JSON, oversized frames, old protocol/layout, wrong session, replayed handshake, duplicate/out-of-order sequence, unknown actions, wrong-column sub-items, and mismatched target coordinates are rejected.

## Renderer messages and visible targets

On connection, the renderer sends:
```json
{ "version": 2, "type": "clientHello", "layoutVersion": "wall-v1", "columns": { "1": { "phase": "idle", "locale": "id", "subItem": "", "slide": 0 } } }
```
The actual `columns` payload always includes IDs 1–6. Changes send the same snapshot with `type: "clientState"`.

Sensor Service combines that snapshot with `shared/installation-layout.json`:
- language targets are always visible;
- `main` is visible only in idle;
- `submenu.items`/`submenu.back` only in submenu;
- `active.back`/`active.previous`/`active.next` only in active.

Do not detect against hidden target groups. Main and sub-item targets require one second of deliberate contact before sending one input. Immediate language/Back/carousel input should be debounced to one action per deliberate contact. Contact release is internal to Sensor Service; do not send legacy touchStart/touchEnd events.

## Input

```json
{
  "version": 2,
  "sessionId": "service-boot-id",
  "seq": 42,
  "layoutVersion": "wall-v1",
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
| `main` | `columnId` | Open an idle column |
| `subItem` | `columnId`, `subItemId` | Select an item from its visible submenu |
| `language` | `columnId`, `locale` | Change only that column's language |
| `back` | `columnId` | Return to submenu/idle |
| `previous` / `next` | `columnId` | Navigate active carousel |

Valid sub-items: column 2 = `tekiro`, `ryu`, `rexco`; column 5 = `our-way`, `brand-activation`. Languages: `id`, `en`, `zh-Hans`. The renderer validates the declared target and current phase; it does not perform raw hit detection.

## Hardware acceptance

Validate mounting/scan plane, all target boundaries, simultaneous users, occlusion, cable removal, service restart, release/dwell timing, and long runs on the event PC/LED. Browser/unit tests do not prove physical coverage.
