import type { HoldGroup } from '../../shared/hold-settings';
import { defineStore } from 'pinia';
import { DEFAULT_FONT_SETTINGS, normalizeFontSettings } from '../../shared/font-settings';
import { DEFAULT_HOLD_SETTINGS, normalizeHoldSettings } from '../../shared/hold-settings';
import { DEFAULT_WALL_SETTINGS, normalizeWallSettings } from '../../shared/wall-settings';

/** localStorage key for operator settings; bump the suffix if the stored shape changes incompatibly. */
export const SETTINGS_STORAGE_KEY = 'altama.settings.v1';

/**
 * Operator settings edited on /dashboard (wall behaviour, hold rules per button group, font sizes);
 * persisted per browser by the settings-storage plugin.
 */
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    hold: normalizeHoldSettings(DEFAULT_HOLD_SETTINGS),
    wall: normalizeWallSettings(DEFAULT_WALL_SETTINGS),
    fonts: normalizeFontSettings(DEFAULT_FONT_SETTINGS),
  }),
  getters: {
    holdRule: state => (group: HoldGroup) => state.hold?.[group] ?? DEFAULT_HOLD_SETTINGS[group],
  },
  actions: {
    setHold(next: unknown) {
      this.hold = normalizeHoldSettings(next);
    },
    setWall(next: unknown) {
      this.wall = normalizeWallSettings(next);
    },
    setFonts(next: unknown) {
      this.fonts = normalizeFontSettings(next);
    },
    resetHold() {
      this.hold = normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
    },
  },
});
