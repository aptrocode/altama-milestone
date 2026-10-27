import type { HoldGroup, HoldSettings } from '../../shared/hold-settings';
import { defineStore } from 'pinia';
import { DEFAULT_FONT_SETTINGS, normalizeFontSettings } from '../../shared/font-settings';
import { DEFAULT_HOLD_SETTINGS, normalizeHoldSettings } from '../../shared/hold-settings';
import { DEFAULT_WALL_SETTINGS, effectiveHoldSettings, normalizeWallSettings } from '../../shared/wall-settings';

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
    /** Hold rules in effect: the Wall page's content animation decides `card` and `page`. */
    effectiveHold: state => effectiveHoldSettings(state.hold, state.wall),
    holdRule(): (group: HoldGroup) => HoldSettings[HoldGroup] {
      return group => this.effectiveHold[group] ?? DEFAULT_HOLD_SETTINGS[group];
    },
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
    /**
     * Settings written by another tab or the server. Keys they leave out keep this browser's value,
     * so an older build (one that does not know a newer setting) cannot reset it to its default.
     */
    applyExternal(next: { hold?: unknown; wall?: unknown; fonts?: unknown } | null) {
      const merge = (current: object, value: unknown) => typeof value === 'object' && value !== null ? { ...current, ...value } : null;
      this.setHold(merge(this.hold, next?.hold));
      this.setWall(merge(this.wall, next?.wall));
      this.setFonts(merge(this.fonts, next?.fonts));
    },
    resetHold() {
      this.hold = normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
    },
  },
});
