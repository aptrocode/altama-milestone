import type { FontSettings } from './font-settings';
import type { HoldSettings } from './hold-settings';
import type { WallSettings } from './wall-settings';
import { normalizeFontSettings } from './font-settings';
import { normalizeHoldSettings } from './hold-settings';
import { normalizeWallSettings } from './wall-settings';

/** Operator settings shared by the browser, SQLite, and /api/settings. */
export interface SyncedSettings {
  hold: HoldSettings;
  wall: WallSettings;
  fonts: FontSettings;
}

/** Version counts saves; an empty server has version 0 and null settings. */
export interface SettingsDocument {
  version: number;
  updatedAt: string | null;
  settings: SyncedSettings | null;
}

/** Missing groups keep the stored value; every provided group is normalized identically. */
export function normalizeSyncedSettings(value: unknown, fallback?: SyncedSettings | null): SyncedSettings {
  const source = (value && typeof value === 'object' ? value : {}) as Partial<Record<keyof SyncedSettings, unknown>>;
  return {
    hold: normalizeHoldSettings(source.hold ?? fallback?.hold),
    wall: normalizeWallSettings(source.wall ?? fallback?.wall),
    fonts: normalizeFontSettings(source.fonts ?? fallback?.fonts),
  };
}
