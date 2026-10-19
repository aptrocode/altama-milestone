import type { HoldSettings } from './hold-settings';
import rawLayout from './installation-layout.json';

/**
 * Sensor Service configuration, stored as JSON on the event PC by the service and edited on
 * /dashboard over the service WebSocket (admin messages below). One touch source is active at a time;
 * OSC show control (/altama/*) always runs next to it.
 */
export const SENSOR_SOURCES = ['off', 'hokuyo', 'augmenta', 'tuio'] as const;
export type SensorSource = typeof SENSOR_SOURCES[number];

export interface Point2 { x: number; y: number }

/** One measured pair: a logical wall point and where the LiDAR saw an object placed on it (sensor mm). */
export interface CalibrationPoint { wall: Point2; sensor: Point2 | null }

export interface HokuyoConfig {
  host: string;
  port: number;
  /** Ranges outside [min, max] are ignored. */
  minRangeMm: number;
  maxRangeMm: number;
  /** Neighbouring points closer than this belong to one contact. */
  clusterGapMm: number;
  minPoints: number;
  /** Larger clusters (bodies, frames) are ignored. */
  maxSizeMm: number;
  /** Points this close to (or behind) the captured background are ignored. */
  backgroundToleranceMm: number;
  calibration: CalibrationPoint[];
}

/** Augmenta and TUIO send normalized 0–1 positions (top-left origin) that cover the whole canvas. */
export interface NormalizedSourceConfig { port: number; invertY: boolean }

export interface SensorConfig {
  source: SensorSource;
  hokuyo: HokuyoConfig;
  augmenta: NormalizedSourceConfig;
  tuio: NormalizedSourceConfig;
  /** OSC show control (Resolume/TouchDesigner, /altama/*). */
  osc: { port: number };
}

export const SENSOR_CANVAS = rawLayout.canvas as { width: number; height: number };
export const MAX_CALIBRATION_POINTS = 12;

/** Outer corners of the six idle frames: visible glowing corners an operator can touch while calibrating. */
const FRAME_LEFT = rawLayout.columns[0]!.card;
const FRAME_RIGHT = rawLayout.columns[5]!.card;
export const DEFAULT_CALIBRATION_WALL_POINTS: Point2[] = [
  { x: FRAME_LEFT.x, y: FRAME_LEFT.y },
  { x: FRAME_RIGHT.x + FRAME_RIGHT.width, y: FRAME_RIGHT.y },
  { x: FRAME_RIGHT.x + FRAME_RIGHT.width, y: FRAME_RIGHT.y + FRAME_RIGHT.height },
  { x: FRAME_LEFT.x, y: FRAME_LEFT.y + FRAME_LEFT.height },
];

export const DEFAULT_SENSOR_CONFIG: SensorConfig = {
  source: 'off',
  hokuyo: {
    host: '192.168.0.10',
    port: 10940,
    minRangeMm: 100,
    maxRangeMm: 8000,
    clusterGapMm: 60,
    minPoints: 3,
    maxSizeMm: 300,
    backgroundToleranceMm: 50,
    calibration: DEFAULT_CALIBRATION_WALL_POINTS.map(wall => ({ wall: { ...wall }, sensor: null })),
  },
  augmenta: { port: 12000, invertY: false },
  tuio: { port: 3333, invertY: false },
  osc: { port: 9000 },
};

function record(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function int(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
}

function finite(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function port(value: unknown, fallback: number): number {
  return int(value, fallback, 1, 65_535);
}

function host(value: unknown, fallback: string): string {
  const text = typeof value === 'string' ? value.trim() : '';
  return /^[\w.:-]{1,253}$/.test(text) ? text : fallback;
}

function point(value: unknown): Point2 | null {
  const source = record(value);
  const x = finite(source.x);
  const y = finite(source.y);
  return x === null || y === null ? null : { x, y };
}

function calibration(value: unknown): CalibrationPoint[] {
  if (!Array.isArray(value))
    return DEFAULT_SENSOR_CONFIG.hokuyo.calibration.map(item => ({ wall: { ...item.wall }, sensor: null }));
  return value.slice(0, MAX_CALIBRATION_POINTS).flatMap((item) => {
    const wall = point(record(item).wall);
    if (!wall)
      return [];
    return [{
      wall: {
        x: Math.min(SENSOR_CANVAS.width, Math.max(0, Math.round(wall.x))),
        y: Math.min(SENSOR_CANVAS.height, Math.max(0, Math.round(wall.y))),
      },
      sensor: point(record(item).sensor),
    }];
  });
}

function normalizedSource(value: unknown, fallback: NormalizedSourceConfig): NormalizedSourceConfig {
  const source = record(value);
  return { port: port(source.port, fallback.port), invertY: typeof source.invertY === 'boolean' ? source.invertY : fallback.invertY };
}

/** Accepts a stored, imported, or edited config and returns a complete, clamped one. */
export function normalizeSensorConfig(value: unknown): SensorConfig {
  const source = record(value);
  const hokuyo = record(source.hokuyo);
  const defaults = DEFAULT_SENSOR_CONFIG.hokuyo;
  const minRangeMm = int(hokuyo.minRangeMm, defaults.minRangeMm, 20, 10_000);
  return {
    source: SENSOR_SOURCES.includes(source.source as SensorSource) ? source.source as SensorSource : DEFAULT_SENSOR_CONFIG.source,
    hokuyo: {
      host: host(hokuyo.host, defaults.host),
      port: port(hokuyo.port, defaults.port),
      minRangeMm,
      maxRangeMm: int(hokuyo.maxRangeMm, defaults.maxRangeMm, minRangeMm + 1, 30_000),
      clusterGapMm: int(hokuyo.clusterGapMm, defaults.clusterGapMm, 5, 500),
      minPoints: int(hokuyo.minPoints, defaults.minPoints, 1, 50),
      maxSizeMm: int(hokuyo.maxSizeMm, defaults.maxSizeMm, 10, 2_000),
      backgroundToleranceMm: int(hokuyo.backgroundToleranceMm, defaults.backgroundToleranceMm, 0, 500),
      calibration: calibration(hokuyo.calibration),
    },
    augmenta: normalizedSource(source.augmenta, DEFAULT_SENSOR_CONFIG.augmenta),
    tuio: normalizedSource(source.tuio, DEFAULT_SENSOR_CONFIG.tuio),
    osc: { port: port(record(source.osc).port, DEFAULT_SENSOR_CONFIG.osc.port) },
  };
}

/** Applies a partial config (any subset of fields, one level deep) on top of the current one. */
export function mergeSensorConfig(current: SensorConfig, patch: unknown): SensorConfig {
  const next = record(patch);
  return normalizeSensorConfig({
    ...current,
    ...next,
    hokuyo: { ...current.hokuyo, ...record(next.hokuyo) },
    augmenta: { ...current.augmenta, ...record(next.augmenta) },
    tuio: { ...current.tuio, ...record(next.tuio) },
    osc: { ...current.osc, ...record(next.osc) },
  });
}

// ---------------------------------------------------------------------------------------------
// Admin contract: /dashboard <-> Sensor Service on the same WebSocket as the wall (port 8787).
// A connection that sends `adminHello` is an admin; it never receives wall protocol frames and the
// wall never receives these.
// ---------------------------------------------------------------------------------------------

export const SENSOR_ADMIN_VERSION = 2 as const;

export interface SensorServiceStatus {
  source: SensorSource;
  /** Same values the wall receives in hello/status. */
  sensorReady: boolean;
  calibrated: boolean;
  calibrating: boolean;
  detail: string;
  /** Connected renderers that completed clientHello. */
  wallClients: number;
  /** Hold rules last published by the wall (defaults until a wall connects). */
  hold: HoldSettings;
  /** Hokuyo homography quality; null when fewer than four measured points or degenerate. */
  calibrationRmsPx: number | null;
  /** Hokuyo background steps captured; 0 = none. */
  backgroundSteps: number;
  /** Hokuyo scans per second (0 when not streaming). */
  scanRate: number;
  inputs: number;
  lastInput: string;
}

export interface SensorAdminContact {
  id: string;
  /** Logical wall px. */
  x: number;
  y: number;
  /** Target key such as `1:main` or `2:subItem:tekiro`; null outside visible targets. */
  target: string | null;
  /** Dwell progress 0–1. */
  progress: number;
  /** true after this contact sent its one input. */
  fired: boolean;
}

export type SensorAdminServerMessage
  = | { version: 2; type: 'adminState'; config: SensorConfig; status: SensorServiceStatus }
    /** ~10 Hz while an admin is connected. sensorPoints: Hokuyo clusters in sensor mm, largest first. */
    | { version: 2; type: 'adminContacts'; contacts: SensorAdminContact[]; sensorPoints: Point2[] }
    | { version: 2; type: 'adminResult'; request: SensorAdminClientMessage['type']; ok: boolean; error?: string };

export type SensorAdminClientMessage
  = | { version: 2; type: 'adminHello' }
    /** Full or partial config; missing fields keep their current value. */
    | { version: 2; type: 'setConfig'; config: Partial<SensorConfig> }
    | { version: 2; type: 'calibrate'; on: boolean }
    | { version: 2; type: 'captureBackground' }
    | { version: 2; type: 'clearBackground' };
