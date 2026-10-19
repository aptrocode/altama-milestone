import type { Point2 } from '../shared/sensor-config';
import type { ScanParameters } from './scip';
import { SENSOR_CANVAS } from '../shared/sensor-config';
import { UST_10LX } from './scip';

/**
 * Synthetic UST-10LX installation for simulators and tests: a wall of 2 mm per logical px, the sensor
 * centred 80 mm above the top edge scanning down across the LED surface, and a room (side walls,
 * floor, ceiling) the scan sees outside the canvas.
 */
export interface SyntheticRig {
  mmPerPx: number;
  /** Sensor position in wall mm (origin top-left of the canvas, y down). */
  sensor: Point2;
  /** Direction of the front step in the wall frame, radians (π/2 = straight down). */
  heading: number;
  /** Room box in wall mm. */
  room: { left: number; right: number; top: number; bottom: number };
  params: ScanParameters;
}

export const DEMO_RIG: SyntheticRig = {
  mmPerPx: 2,
  sensor: { x: (SENSOR_CANVAS.width * 2) / 2, y: -80 },
  heading: Math.PI / 2,
  room: { left: -500, right: SENSOR_CANVAS.width * 2 + 500, top: -600, bottom: SENSOR_CANVAS.height * 2 + 300 },
  params: UST_10LX,
};

export interface SyntheticHand {
  /** Logical wall px. */
  x: number;
  y: number;
  radiusMm?: number;
}

/** Where the sensor sees a wall point (sensor mm, same frame as polarToSensor). */
export function wallToSensor(point: Point2, rig: SyntheticRig = DEMO_RIG): Point2 {
  const dx = point.x * rig.mmPerPx - rig.sensor.x;
  const dy = point.y * rig.mmPerPx - rig.sensor.y;
  const c = Math.cos(rig.heading);
  const s = Math.sin(rig.heading);
  return { x: dx * c + dy * s, y: -dx * s + dy * c };
}

function rayCircle(ox: number, oy: number, dx: number, dy: number, cx: number, cy: number, r: number): number | null {
  const fx = ox - cx;
  const fy = oy - cy;
  const b = fx * dx + fy * dy;
  const c = fx * fx + fy * fy - r * r;
  const disc = b * b - c;
  if (disc < 0)
    return null;
  const t = -b - Math.sqrt(disc);
  return t > 0 ? t : null;
}

/**
 * One scan (ranges in mm, steps amin..amax) of hands touching the wall. Steps that hit nothing within
 * 10 m return 0, which the sensor reports as an error and the service ignores.
 */
export function renderScan(hands: SyntheticHand[], rig: SyntheticRig = DEMO_RIG, noiseMm = 0, random: () => number = Math.random): number[] {
  const { params, sensor, room } = rig;
  const ranges: number[] = [];
  for (let step = params.amin; step <= params.amax; step++) {
    const angle = ((step - params.afrt) * 2 * Math.PI) / params.ares;
    // Sensor-frame direction rotated back into the wall frame.
    const sx = Math.cos(angle);
    const sy = Math.sin(angle);
    const dx = sx * Math.cos(rig.heading) - sy * Math.sin(rig.heading);
    const dy = sx * Math.sin(rig.heading) + sy * Math.cos(rig.heading);
    let best = Infinity;
    for (const hand of hands) {
      const t = rayCircle(sensor.x, sensor.y, dx, dy, hand.x * rig.mmPerPx, hand.y * rig.mmPerPx, hand.radiusMm ?? 40);
      if (t !== null && t < best)
        best = t;
    }
    for (const [bound, origin, direction] of [[room.left, sensor.x, dx], [room.right, sensor.x, dx], [room.top, sensor.y, dy], [room.bottom, sensor.y, dy]] as const) {
      if (Math.abs(direction) < 1e-9)
        continue;
      const t = (bound - origin) / direction;
      if (t > 0 && t < best)
        best = t;
    }
    ranges.push(best <= 10_000 ? Math.max(0, Math.round(best + (random() * 2 - 1) * noiseMm)) : 0);
  }
  return ranges;
}
