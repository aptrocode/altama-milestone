import type { CalibrationPoint, Point2 } from '../shared/sensor-config';
import type { ScanParameters } from './scip';

/** Row-major 3 × 3 projective transform. */
export type Homography = [number, number, number, number, number, number, number, number, number];

export interface Calibration {
  matrix: Homography;
  /** Root-mean-square reprojection error of the measured points, logical px. */
  rmsPx: number;
  points: number;
}

/** Sensor-plane position (mm) of one scan step: x toward the front step, y counterclockwise. */
export function polarToSensor(step: number, rangeMm: number, params: ScanParameters): Point2 {
  const angle = ((step - params.afrt) * 2 * Math.PI) / params.ares;
  return { x: rangeMm * Math.cos(angle), y: rangeMm * Math.sin(angle) };
}

export function applyHomography(matrix: Homography, point: Point2): Point2 | null {
  const [a, b, c, d, e, f, g, h, i] = matrix;
  const w = g * point.x + h * point.y + i;
  if (Math.abs(w) < 1e-12)
    return null;
  return { x: (a * point.x + b * point.y + c) / w, y: (d * point.x + e * point.y + f) / w };
}

/** Hartley normalization: centroid at the origin, mean distance √2. */
function normalization(points: Point2[]): Homography {
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const mean = points.reduce((sum, p) => sum + Math.hypot(p.x - cx, p.y - cy), 0) / points.length;
  const s = mean > 1e-9 ? Math.SQRT2 / mean : 1;
  return [s, 0, -s * cx, 0, s, -s * cy, 0, 0, 1];
}

function multiply(m: Homography, n: Homography): Homography {
  const out = Array.from({ length: 9 }).fill(0) as Homography;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++)
      out[r * 3 + c] = m[r * 3]! * n[c]! + m[r * 3 + 1]! * n[3 + c]! + m[r * 3 + 2]! * n[6 + c]!;
  }
  return out;
}

function invertSimilarity(t: Homography): Homography {
  const s = t[0];
  return [1 / s, 0, -t[2] / s, 0, 1 / s, -t[5] / s, 0, 0, 1];
}

/** Gaussian elimination with partial pivoting; null when singular (e.g. three collinear points). */
function solve(matrix: number[][], vector: number[]): number[] | null {
  const n = vector.length;
  const a = matrix.map((row, i) => [...row, vector[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(a[row]![col]!) > Math.abs(a[pivot]![col]!))
        pivot = row;
    }
    if (Math.abs(a[pivot]![col]!) < 1e-10)
      return null;
    [a[col], a[pivot]] = [a[pivot]!, a[col]!];
    for (let row = 0; row < n; row++) {
      if (row === col)
        continue;
      const factor = a[row]![col]! / a[col]![col]!;
      for (let k = col; k <= n; k++)
        a[row]![k]! -= factor * a[col]![k]!;
    }
  }
  return a.map((row, i) => row[n]! / row[i]!);
}

/**
 * Least-squares homography (normalized DLT with h33 = 1) mapping `from` to `to`. Needs at least four
 * pairs, no three of them collinear; more pairs average out measurement error.
 */
export function solveHomography(pairs: { from: Point2; to: Point2 }[]): Homography | null {
  if (pairs.length < 4)
    return null;
  const tFrom = normalization(pairs.map(pair => pair.from));
  const tTo = normalization(pairs.map(pair => pair.to));
  const ata = Array.from({ length: 8 }, () => Array.from<number>({ length: 8 }).fill(0));
  const atb = Array.from<number>({ length: 8 }).fill(0);
  const accumulate = (row: number[], value: number) => {
    for (let i = 0; i < 8; i++) {
      atb[i]! += row[i]! * value;
      for (let j = 0; j < 8; j++)
        ata[i]![j]! += row[i]! * row[j]!;
    }
  };
  for (const pair of pairs) {
    const p = applyHomography(tFrom, pair.from)!;
    const q = applyHomography(tTo, pair.to)!;
    accumulate([p.x, p.y, 1, 0, 0, 0, -q.x * p.x, -q.x * p.y], q.x);
    accumulate([0, 0, 0, p.x, p.y, 1, -q.y * p.x, -q.y * p.y], q.y);
  }
  const h = solve(ata, atb);
  if (!h || h.some(value => !Number.isFinite(value)))
    return null;
  const normalized = [...h, 1] as Homography;
  const matrix = multiply(invertSimilarity(tTo), multiply(normalized, tFrom));
  const scale = matrix[8];
  if (Math.abs(scale) < 1e-12)
    return null;
  return matrix.map(value => value / scale) as Homography;
}

function cross(o: Point2, a: Point2, b: Point2): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

/**
 * Convex-hull area relative to the squared bounding-box diagonal: about 0.25 for the default frame
 * corners, near 0 when the points (almost) lie on one line and cannot define a plane mapping.
 */
export function spreadRatio(points: Point2[]): number {
  const sorted = [...points].sort((a, b) => a.x - b.x || a.y - b.y);
  if (sorted.length < 3)
    return 0;
  const half = (pass: Point2[]) => {
    const chain: Point2[] = [];
    for (const point of pass) {
      while (chain.length >= 2 && cross(chain.at(-2)!, chain.at(-1)!, point) <= 0)
        chain.pop();
      chain.push(point);
    }
    chain.pop();
    return chain;
  };
  const hull = [...half(sorted), ...half([...sorted].reverse())];
  let area = 0;
  for (let i = 0; i < hull.length; i++) {
    const a = hull[i]!;
    const b = hull[(i + 1) % hull.length]!;
    area += a.x * b.y - b.x * a.y;
  }
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const diagonal = (Math.max(...xs) - Math.min(...xs)) ** 2 + (Math.max(...ys) - Math.min(...ys)) ** 2;
  return diagonal > 0 ? Math.abs(area) / 2 / diagonal : 0;
}

/** Below this spread the measured points are treated as collinear (see spreadRatio). */
export const MIN_SPREAD_RATIO = 0.02;

/** Builds the wall calibration from measured points; null until four valid, well-spread pairs exist. */
export function buildCalibration(points: CalibrationPoint[]): Calibration | null {
  const pairs = points.flatMap(point => point.sensor ? [{ from: point.sensor, to: point.wall }] : []);
  if (spreadRatio(pairs.map(pair => pair.from)) < MIN_SPREAD_RATIO || spreadRatio(pairs.map(pair => pair.to)) < MIN_SPREAD_RATIO)
    return null;
  const matrix = solveHomography(pairs);
  if (!matrix)
    return null;
  let squared = 0;
  let sign = 0;
  for (const pair of pairs) {
    const mapped = applyHomography(matrix, pair.from);
    // The measured points must all lie on the same side of the mapping's horizon (w > 0 or w < 0).
    const w = matrix[6] * pair.from.x + matrix[7] * pair.from.y + matrix[8];
    if (!mapped || (sign !== 0 && Math.sign(w) !== sign))
      return null;
    sign = Math.sign(w);
    squared += (mapped.x - pair.to.x) ** 2 + (mapped.y - pair.to.y) ** 2;
  }
  return { matrix, rmsPx: Math.sqrt(squared / pairs.length), points: pairs.length };
}
