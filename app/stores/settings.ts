import type { HoldGroup } from '../../shared/hold-settings';
import { defineStore } from 'pinia';
import { DEFAULT_HOLD_SETTINGS, normalizeHoldSettings } from '../../shared/hold-settings';

/** localStorage key for operator settings; bump the suffix if the stored shape changes incompatibly. */
export const SETTINGS_STORAGE_KEY = 'altama.settings.v1';

/** Operator settings edited on /dashboard; persisted per browser by the settings-storage plugin. */
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    hold: normalizeHoldSettings(DEFAULT_HOLD_SETTINGS),
  }),
  getters: {
    holdRule: state => (group: HoldGroup) => state.hold[group],
  },
  actions: {
    setHold(next: unknown) {
      this.hold = normalizeHoldSettings(next);
    },
    resetHold() {
      this.hold = normalizeHoldSettings(DEFAULT_HOLD_SETTINGS);
    },
  },
});
