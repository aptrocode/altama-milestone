import type { HokuyoConfig, Point2 } from '../shared/sensor-config';
import type { Calibration } from './calibration';
import type { Contact } from './dwell';
import type { ScanParameters } from './scip';
import { SENSOR_CANVAS } from '../shared/sensor-config';
import { applyHomography, polarToSensor } from './calibration';

export interface ScanPoint extends Point2 { step: number; range: number }

export interface Cluster {
  /** Centroid in sensor mm. */
  center: Point2;
  points: number;
  /** Distance between the first and last point, mm. */
  size: number;
}

type ClusterOptions = Pick<HokuyoConfig, 'minRangeMm' | 'maxRangeMm' | 'clusterGapMm' | 'minPoints' | 'maxSizeMm' | 'backgroundToleranceMm'>;

/** Valid points of one scan in sensor mm; drops error codes, out-of-range values, and the static background. */
export function scanToPoints(ranges: number[], params: ScanParameters, options: ClusterOptions, background: number[] | null = null, firstStep = params.amin): ScanPoint[] {
  const points: ScanPoint[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]!;
    const step = firstStep + i;
    if (range < options.minRangeMm || range > options.maxRangeMm)
      continue;
    const bg = background?.[step] ?? 0;
    if (bg > 0 && range >= bg - options.backgroundToleranceMm)
      continue;
    points.push({ step, range, ...polarToSensor(step, range, params) });
  }
  return points;
}

/**
 * Groups angularly consecutive points (one missing step allowed) that are closer than clusterGapMm.
 * Keeps clusters with enough points and a plausible hand/arm size, largest first.
 */
export function clusterPoints(points: ScanPoint[], options: ClusterOptions): Cluster[] {
  const groups: ScanPoint[][] = [];
  let current: ScanPoint[] = [];
  for (const point of points) {
    const last = current.at(-1);
    if (last && point.step - last.step <= 2 && Math.hypot(point.x - last.x, point.y - last.y) <= options.clusterGapMm) {
      current.push(point);
      continue;
    }
    if (current.length)
      groups.push(current);
    current = [point];
  }
  if (current.length)
    groups.push(current);

  return groups
    .map((group) => {
      const first = group[0]!;
      const last = group.at(-1)!;
      return {
        center: { x: group.reduce((sum, p) => sum + p.x, 0) / group.length, y: group.reduce((sum, p) => sum + p.y, 0) / group.length },
        points: group.length,
        size: Math.hypot(last.x - first.x, last.y - first.y),
      };
    })
    .filter(cluster => cluster.points >= options.minPoints && cluster.size <= options.maxSizeMm)
    .sort((a, b) => b.points - a.points);
}

/** Maps cluster centroids to logical wall px and drops anything outside the canvas. */
export function clustersToWall(clusters: Cluster[], calibration: Calibration): Point2[] {
  return clusters.flatMap((cluster) => {
    const point = applyHomography(calibration.matrix, cluster.center);
    return point && point.x >= 0 && point.y >= 0 && point.x < SENSOR_CANVAS.width && point.y < SENSOR_CANVAS.height ? [point] : [];
  });
}

export interface TrackerOptions {
  /** Largest movement between frames that still belongs to the same contact, logical px. */
  maxJumpPx?: number;
  /** Frames a new candidate must persist before it becomes a contact (filters single-scan noise). */
  confirmFrames?: number;
  /** A lost contact keeps its identity (and dwell) for this long, covering short occlusions/dropouts. */
  holdMs?: number;
  /** Position smoothing 0–1 (1 = raw). */
  smoothing?: number;
  prefix?: string;
}

interface Track { id: string; x: number; y: number; frames: number; lastSeen: number }

/** Nearest-neighbour tracker that gives LiDAR clusters stable pointer IDs. */
export class Tracker {
  private readonly maxJumpPx: number;
  private readonly confirmFrames: number;
  private readonly holdMs: number;
  private readonly smoothing: number;
  private readonly prefix: string;
  private tracks: Track[] = [];
  private nextId = 1;

  constructor(options: TrackerOptions = {}) {
    this.maxJumpPx = options.maxJumpPx ?? 140;
    this.confirmFrames = options.confirmFrames ?? 2;
    this.holdMs = options.holdMs ?? 150;
    this.smoothing = options.smoothing ?? 0.6;
    this.prefix = options.prefix ?? 'lidar';
  }

  update(points: Point2[], now: number): Contact[] {
    const pairs: { track: Track; point: Point2; distance: number }[] = [];
    for (const track of this.tracks) {
      for (const point of points) {
        const distance = Math.hypot(point.x - track.x, point.y - track.y);
        if (distance <= this.maxJumpPx)
          pairs.push({ track, point, distance });
      }
    }
    pairs.sort((a, b) => a.distance - b.distance);
    const usedTracks = new Set<Track>();
    const usedPoints = new Set<Point2>();
    for (const pair of pairs) {
      if (usedTracks.has(pair.track) || usedPoints.has(pair.point))
        continue;
      usedTracks.add(pair.track);
      usedPoints.add(pair.point);
      pair.track.x += (pair.point.x - pair.track.x) * this.smoothing;
      pair.track.y += (pair.point.y - pair.track.y) * this.smoothing;
      pair.track.frames++;
      pair.track.lastSeen = now;
    }
    for (const point of points) {
      if (!usedPoints.has(point))
        this.tracks.push({ id: '', x: point.x, y: point.y, frames: 1, lastSeen: now });
    }
    // Unconfirmed candidates vanish immediately; confirmed contacts coast for holdMs.
    this.tracks = this.tracks.filter(track => track.lastSeen === now || (track.frames >= this.confirmFrames && now - track.lastSeen <= this.holdMs));
    const contacts: Contact[] = [];
    for (const track of this.tracks) {
      if (track.frames < this.confirmFrames)
        continue;
      if (!track.id)
        track.id = `${this.prefix}-${this.nextId++}`;
      contacts.push({ id: track.id, x: track.x, y: track.y });
    }
    return contacts;
  }

  clear() {
    this.tracks = [];
  }
}
