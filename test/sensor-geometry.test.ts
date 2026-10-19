import { describe, expect, it } from 'vitest';
import { applyHomography, buildCalibration, solveHomography } from '../sensor-service/calibration';
import { DEMO_RIG, renderScan, wallToSensor } from '../sensor-service/synthetic';
import { clusterPoints, clustersToWall, scanToPoints, Tracker } from '../sensor-service/tracker';
import { DEFAULT_CALIBRATION_WALL_POINTS, DEFAULT_SENSOR_CONFIG } from '../shared/sensor-config';

const options = DEFAULT_SENSOR_CONFIG.hokuyo;
const demoCalibration = DEFAULT_CALIBRATION_WALL_POINTS.map(wall => ({ wall, sensor: wallToSensor(wall) }));

describe('homography calibration', () => {
  it('maps sensor millimetres to logical wall px from four measured points', () => {
    const calibration = buildCalibration(demoCalibration)!;
    expect(calibration.points).toBe(4);
    expect(calibration.rmsPx).toBeLessThan(1e-6);
    for (const wall of [{ x: 212, y: 700 }, { x: 1152, y: 1000 }, { x: 2000, y: 450 }]) {
      const mapped = applyHomography(calibration.matrix, wallToSensor(wall))!;
      expect(mapped.x).toBeCloseTo(wall.x, 6);
      expect(mapped.y).toBeCloseTo(wall.y, 6);
    }
  });

  it('recovers a projective mapping and averages noisy extra points', () => {
    const truth = (p: { x: number; y: number }) => {
      const w = 0.0001 * p.x - 0.00005 * p.y + 1;
      return { x: (1.2 * p.x + 0.1 * p.y + 30) / w, y: (-0.05 * p.x + 0.9 * p.y + 400) / w };
    };
    const from = [{ x: 0, y: 0 }, { x: 1000, y: 0 }, { x: 1000, y: 800 }, { x: 0, y: 800 }, { x: 500, y: 400 }, { x: 250, y: 600 }];
    const exact = solveHomography(from.slice(0, 4).map(p => ({ from: p, to: truth(p) })))!;
    expect(applyHomography(exact, { x: 500, y: 400 })!.x).toBeCloseTo(truth({ x: 500, y: 400 }).x, 6);

    const noisy = from.map((p, i) => ({ from: p, to: { x: truth(p).x + (i % 2 ? 1.5 : -1.5), y: truth(p).y + (i % 3 ? -1 : 1) } }));
    const fitted = buildCalibration(noisy.map(pair => ({ wall: pair.to, sensor: pair.from })))!;
    expect(fitted.points).toBe(6);
    expect(fitted.rmsPx).toBeGreaterThan(0.5);
    expect(fitted.rmsPx).toBeLessThan(2.5);
  });

  it('refuses fewer than four points or collinear points', () => {
    expect(buildCalibration(demoCalibration.slice(0, 3))).toBeNull();
    expect(buildCalibration([...demoCalibration.slice(0, 3), { wall: { x: 10, y: 10 }, sensor: null }])).toBeNull();
    const line = [0, 1, 2, 3].map(i => ({ from: { x: i * 100, y: i * 50 }, to: { x: i * 10, y: i * 5 } }));
    expect(solveHomography(line)).toBeNull();
  });
});

describe('scan clustering and tracking', () => {
  const calibration = buildCalibration(demoCalibration)!;
  const params = DEMO_RIG.params;

  function wallPoints(hands: { x: number; y: number }[], background: number[] | null = null) {
    const clusters = clusterPoints(scanToPoints(renderScan(hands), params, options, background), options);
    return clustersToWall(clusters, calibration);
  }

  it('finds one contact per hand near its wall position and drops the room outside the canvas', () => {
    const points = wallPoints([{ x: 212, y: 700 }, { x: 1700, y: 900 }]);
    expect(points).toHaveLength(2);
    const sorted = [...points].sort((a, b) => a.x - b.x);
    expect(Math.hypot(sorted[0]!.x - 212, sorted[0]!.y - 700)).toBeLessThan(25);
    expect(Math.hypot(sorted[1]!.x - 1700, sorted[1]!.y - 900)).toBeLessThan(25);
    expect(wallPoints([])).toEqual([]);
  });

  it('ignores error codes, out-of-range values, and the captured background', () => {
    const empty = renderScan([]);
    expect(scanToPoints(empty.map(() => 5), params, options)).toEqual([]);
    expect(scanToPoints(empty, params, options, empty)).toEqual([]);
    expect(wallPoints([{ x: 900, y: 800 }], empty)).toHaveLength(1);
  });

  it('rejects clusters too small (noise) or too large (bodies)', () => {
    const point = (step: number, x: number) => ({ step, range: 1000, x, y: 0 });
    expect(clusterPoints([point(10, 0)], options)).toEqual([]);
    const wide = Array.from({ length: 40 }, (_, i) => point(100 + i, i * 20));
    expect(clusterPoints(wide, options)).toEqual([]);
    const hand = Array.from({ length: 5 }, (_, i) => point(200 + i, 3000 + i * 15));
    expect(clusterPoints(hand, options)).toHaveLength(1);
  });

  it('keeps stable IDs, confirms new contacts, and coasts through short dropouts', () => {
    const tracker = new Tracker({ confirmFrames: 2, holdMs: 150 });
    expect(tracker.update([{ x: 100, y: 100 }], 0)).toEqual([]);
    const [first] = tracker.update([{ x: 110, y: 100 }], 25);
    expect(first!.id).toBe('lidar-1');
    expect(tracker.update([], 50).map(c => c.id)).toEqual(['lidar-1']);
    expect(tracker.update([{ x: 120, y: 102 }, { x: 900, y: 500 }], 75).map(c => c.id)).toEqual(['lidar-1']);
    expect(tracker.update([{ x: 125, y: 102 }, { x: 905, y: 500 }], 100).map(c => c.id).sort()).toEqual(['lidar-1', 'lidar-2']);
    expect(tracker.update([], 400)).toEqual([]);
  });
});
