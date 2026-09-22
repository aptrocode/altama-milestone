# Sensor service

The browser renderer does not read raw Hokuyo scans. A separate local Sensor Service owns the device protocol, coordinate mapping, tracking, debounce, contact lifecycle, hit detection, and recovery. It sends only semantic interaction events over WebSocket.

## Runtime configuration

```dotenv
NUXT_PUBLIC_SENSOR_ENABLED=true
NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
```

Public runtime values are bundled into the static output, so rebuild when the endpoint changes. Keep the renderer usable through its development simulator when the Sensor Service is disabled.

## Protocol v1

Every message includes:

```json
{
  "version": 1,
  "sessionId": "service-boot-id",
  "seq": 42,
  "layoutVersion": "layout-v3",
  "type": "touchStart"
}
```

- `sessionId` changes whenever the service starts a new session.
- `seq` increases for every message in one session.
- `layoutVersion` must equal `shared/installation-layout.json`. The current layout-v3 has 19 timeline targets (4 / 8 / 7); update the Sensor Service geometry and calibration together with the renderer.
- Unknown, duplicate, out-of-order, oversized, stale-session, and invalid messages are ignored safely.

### Handshake and status

`hello` and `status` include boolean `sensorReady` and `calibrated`. `status` may include a short `detail`. `heartbeat` proves application-level liveness. An open WebSocket alone does not mean the device and calibration are ready.

### Artwork interaction

```json
{
  "version": 1,
  "sessionId": "service-boot-id",
  "seq": 43,
  "layoutVersion": "layout-v3",
  "type": "touchStart",
  "section": "center",
  "target": "artwork",
  "pointerId": "lidar-02",
  "x": 1120,
  "y": 650
}
```

`touchStart` reveals only the named section. Coordinates use the logical 2304 × 1344 canvas.

### Timeline selection

```json
{
  "version": 1,
  "sessionId": "service-boot-id",
  "seq": 44,
  "layoutVersion": "layout-v3",
  "type": "selectMilestone",
  "section": "center",
  "pointerId": "lidar-02",
  "milestoneId": "center-2013-b",
  "x": 1130,
  "y": 960
}
```

The milestone must exist in the named section. The renderer applies its normal latest-request-wins rule.

### Contact end

`touchEnd` includes `section` and `pointerId`. It releases service contact state but does not hide the active milestone. Lost tracking must eventually emit or infer a release in the service.

## Connection behavior

The renderer owns one socket. Reconnect uses jittered backoff from roughly 0.5 seconds to a 10-second ceiling. Heartbeats are expected every 2 seconds and a 6-second stale timeout marks the service unavailable. Disconnect preserves the current artwork and clears sensor readiness; reconnect starts a new handshake and never replays old input.

## Hardware work before production

1. Confirm PC OS, network path, sensor mounting, and scan plane.
2. Measure detection at every section, boundary, and with three simultaneous users.
3. Fit and validate sensor-to-canvas coordinates using distributed calibration points.
4. Derive hitbox margins, hysteresis, dwell/debounce, tracking, and release timeout from measured error.
5. Test cable removal, device/service restart, long runs, and calibration restoration.
6. Choose the implementation language and SDK only after proving continuous scan and packaging on the event PC.

Do not promise full three-user coverage until occlusion tests on the final physical installation pass.
