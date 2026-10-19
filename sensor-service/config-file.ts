import type { SensorConfig } from '../shared/sensor-config';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DEFAULT_SENSOR_CONFIG, normalizeSensorConfig } from '../shared/sensor-config';

function readJson(path: string): unknown {
  try {
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
  }
  catch {
    return null;
  }
}

/** Writes through a temporary file so a crash or power loss never leaves half a config. */
function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`);
  renameSync(temporary, path);
}

export function backgroundPathFor(configPath: string): string {
  return join(dirname(configPath), 'sensor-background.json');
}

/** Loads the service config, creating it with defaults on first start. */
export function loadConfig(path: string): SensorConfig {
  const stored = readJson(path);
  const config = normalizeSensorConfig(stored ?? DEFAULT_SENSOR_CONFIG);
  if (stored === null)
    writeJson(path, config);
  return config;
}

export function saveConfig(path: string, config: SensorConfig) {
  writeJson(path, config);
}

/** Hokuyo background: closest static range per step (mm, 0 = none). */
export function loadBackground(path: string): number[] | null {
  const stored = readJson(path) as { ranges?: unknown } | null;
  const ranges = stored?.ranges;
  return Array.isArray(ranges) && ranges.every(value => typeof value === 'number' && Number.isFinite(value)) ? ranges as number[] : null;
}

export function saveBackground(path: string, ranges: number[] | null) {
  writeJson(path, { ranges: ranges ?? [] });
}
