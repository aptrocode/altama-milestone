import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createSettingsStore } from '../server/utils/settings-db';
import { DEFAULT_FONT_SETTINGS } from '../shared/font-settings';
import { DEFAULT_HOLD_SETTINGS } from '../shared/hold-settings';
import { DEFAULT_WALL_SETTINGS } from '../shared/wall-settings';

const dirs: string[] = [];
const open: Array<{ close: () => unknown }> = [];
async function storeAt(file: string) {
  const store = await createSettingsStore(file);
  open.push(store);
  return store;
}
function tempFile() {
  const dir = mkdtempSync(join(tmpdir(), 'altama-settings-'));
  dirs.push(dir);
  return join(dir, 'nested', 'altama.sqlite');
}
afterEach(() => {
  // Windows cannot delete a SQLite file that is still open.
  for (const store of open.splice(0))
    store.close();
  for (const dir of dirs.splice(0))
    rmSync(dir, { recursive: true, force: true });
});

describe('settings database (SQLite)', () => {
  it('starts empty at version 0', async () => {
    const store = await storeAt(tempFile());
    expect(store.read()).toEqual({ version: 0, updatedAt: null, settings: null });
  });

  it('saves, normalizes, and bumps the version on every write', async () => {
    const file = tempFile();
    const store = await storeAt(file);
    const first = store.write({ hold: DEFAULT_HOLD_SETTINGS, wall: { ...DEFAULT_WALL_SETTINGS, resetSeconds: 45 }, fonts: DEFAULT_FONT_SETTINGS });
    expect(first.version).toBe(1);
    expect(first.settings?.wall.resetSeconds).toBe(45);

    // Out-of-range values are clamped like in the browser; missing groups keep their stored value.
    const second = store.write({ wall: { ...DEFAULT_WALL_SETTINGS, resetSeconds: 99_999 } });
    expect(second.version).toBe(2);
    expect(second.settings?.wall.resetSeconds).toBeLessThan(99_999);
    expect(second.settings?.hold).toEqual(first.settings?.hold);

    // A new connection to the same file (server restart) reads the saved document.
    const reopened = await storeAt(file);
    expect(reopened.read()).toEqual(second);
  });

  it('turns garbage into complete default settings', async () => {
    const store = await storeAt(tempFile());
    const saved = store.write({ hold: 'x', wall: 42, fonts: null });
    expect(saved.settings).toEqual({ hold: DEFAULT_HOLD_SETTINGS, wall: DEFAULT_WALL_SETTINGS, fonts: DEFAULT_FONT_SETTINGS });
  });
});
