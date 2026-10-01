# Sensor Service

Sensor Service owns raw LiDAR scans, calibration, tracking, hit detection, contact release, debounce, and dwell. The Nuxt renderer receives semantic events over native WebSocket.

## Configuration and rollout

```dotenv
NUXT_PUBLIC_SENSOR_ENABLED=true
NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
```

Static output embeds public runtime values; rebuild when these change. Mouse/keyboard operation works while sensor input is disabled.

**Breaking migration:** current protocol is **v2**, geometry is **wall-v2**. Protocol v1 / layout-v4 describes the retired three-section UI. The preceding six-column wall-v1 placed languages above cards and arrows at the bottom. Both old layouts are rejected. Deploy the new renderer and matching Sensor Service contract/geometry together, recalibrate, then enable the sensor. Keep sensor input disabled until that service is ready.

## Envelope and health

Every service message includes `version: 2`, nonempty `sessionId`, increasing integer `seq`, `layoutVersion: "wall-v2"`, and `type`.

`hello` is required once per connection and contains boolean `sensorReady`/`calibrated`. `status` updates those booleans with optional short `detail`. `heartbeat` establishes liveness. Expect heartbeat every 2 seconds; after more than 6 seconds without valid traffic the socket closes and reconnects with jittered backoff up to 10 seconds.

Input is forwarded only after handshake while device and calibration are ready. Invalid JSON, oversized frames, old protocol/layout, wrong session, replayed handshake, duplicate/out-of-order sequence, unknown actions, wrong-column sub-items, and mismatched target coordinates are rejected.

## Renderer messages and visible targets

On connection, the renderer sends:
```json
{ "version": 2, "type": "clientHello", "layoutVersion": "wall-v2", "columns": { "1": { "phase": "idle", "locale": "id", "subItem": "", "slide": 0 } } }
```
The actual `columns` payload always includes IDs 1–6. Changes send the same snapshot with `type: "clientState"`.

Sensor Service combines that snapshot with `shared/installation-layout.json`:
- language targets are visible only in idle;
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
  "layoutVersion": "wall-v2",
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

The wall-v2 card is 350 × 510.72 logical px. Languages float inside its lower area only in idle; arrows use the full card's vertical midpoint. The main hit rectangle covers the full card, but its floating languageBar occludes that area: detect a flag there or ignore padding/gaps. Main events inside languageBar are rejected. Hidden language actions in submenu/carousel are also rejected. Submenu/active content fills the card. Refer to each column's `card` and target rectangles in the canonical JSON; do not reuse wall-v1 coordinates.

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
| `/altama/open` | `columnId: int` (1–6) | `/altama/open 3` | Open idle column directly |
| `/altama/back` | `[columnId: int]` *(optional)* | `/altama/back 2` | Back in column, or reset all if omitted |
| `/altama/next` | `columnId: int` (1–6) | `/altama/next 1` | Next slide in active carousel |
| `/altama/prev` | `columnId: int` (1–6) | `/altama/prev 1` | Previous slide in active carousel |
| `/altama/subItem` | `col: int`, `key: string` | `/altama/subItem 2 tekiro` | Select sub-item in column 2 or 5 |
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
