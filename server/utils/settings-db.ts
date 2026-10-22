import type { FontSettings } from '../../shared/font-settings';
import type { HoldSettings } from '../../shared/hold-settings';
import type { WallSettings } from '../../shared/wall-settings';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { normalizeFontSettings } from '../../shared/font-settings';
import { normalizeHoldSettings } from '../../shared/hold-settings';
import { normalizeWallSettings } from '../../shared/wall-settings';

/** Every operator setting the dashboard edits, as stored and served by /api/settings. */
export interface SyncedSettings {
  hold: HoldSettings;
  wall: WallSettings;
  fonts: FontSettings;
}

/** `version` counts saves (0 = nothing saved yet, `settings` is then null). */
export interface SettingsDocument {
  version: number;
  updatedAt: string | null;
  settings: SyncedSettings | null;
}

interface SqlStatement {
  get: (...params: unknown[]) => unknown;
  run: (...params: unknown[]) => unknown;
}
interface SqlDatabase {
  exec: (sql: string) => unknown;
  prepare: (sql: string) => SqlStatement;
  close: () => unknown;
}

// Variables, so the bundler leaves both runtime-only modules alone.
const BUN_SQLITE = 'bun:sqlite';
const NODE_SQLITE = 'node:sqlite';

/** SQLite from the running runtime: `bun:sqlite` under Bun (PM2, start-wall.bat), `node:sqlite` under Node (dev). */
async function openDatabase(file: string): Promise<SqlDatabase> {
  mkdirSync(dirname(file), { recursive: true });
  if ('Bun' in globalThis) {
    const { Database } = await import(/* @vite-ignore */ BUN_SQLITE);
    return new Database(file, { create: true }) as SqlDatabase;
  }
  const { DatabaseSync } = await import(/* @vite-ignore */ NODE_SQLITE);
  return new DatabaseSync(file) as SqlDatabase;
}

/** Clamps any value into complete settings, the same way the browser store does. */
export function normalizeSyncedSettings(value: unknown, fallback?: SyncedSettings | null): SyncedSettings {
  const source = (value && typeof value === 'object' ? value : {}) as Partial<Record<keyof SyncedSettings, unknown>>;
  return {
    hold: normalizeHoldSettings(source.hold ?? fallback?.hold),
    wall: normalizeWallSettings(source.wall ?? fallback?.wall),
    fonts: normalizeFontSettings(source.fonts ?? fallback?.fonts),
  };
}

/** One-row settings table in a SQLite file. */
export async function createSettingsStore(file: string) {
  const db = await openDatabase(resolve(file));
  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    data TEXT NOT NULL,
    version INTEGER NOT NULL,
    updated_at TEXT NOT NULL
  )`);
  const select = db.prepare('SELECT data, version, updated_at FROM settings WHERE id = 1');
  const upsert = db.prepare(`INSERT INTO settings (id, data, version, updated_at) VALUES (1, ?, ?, ?)
    ON CONFLICT (id) DO UPDATE SET data = excluded.data, version = excluded.version, updated_at = excluded.updated_at`);

  function read(): SettingsDocument {
    const row = select.get() as { data: string; version: number; updated_at: string } | undefined | null;
    if (!row)
      return { version: 0, updatedAt: null, settings: null };
    return { version: Number(row.version), updatedAt: row.updated_at, settings: normalizeSyncedSettings(JSON.parse(row.data)) };
  }

  /** Saves `next` (missing groups keep their stored value) and bumps the version. */
  function write(next: unknown): SettingsDocument {
    const current = read();
    const settings = normalizeSyncedSettings(next, current.settings);
    const version = current.version + 1;
    const updatedAt = new Date().toISOString();
    upsert.run(JSON.stringify(settings), version, updatedAt);
    return { version, updatedAt, settings };
  }

  return { read, write, close: () => db.close() };
}

let store: ReturnType<typeof createSettingsStore> | undefined;
/** The server's settings store (file from NUXT_SETTINGS_DB, default `.data/altama.sqlite`); retried after a failure. */
export function useSettingsDb(file: string) {
  store ??= createSettingsStore(file).catch((error) => {
    store = undefined;
    throw error;
  });
  return store;
}
