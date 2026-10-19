import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../app/stores/settings';
import { DEFAULT_HOLD_SETTINGS, HOLD_GROUP_BY_ACTION, normalizeHoldSettings } from '../shared/hold-settings';

describe('hold settings', () => {
  it('fills missing groups with defaults and clamps/rounds seconds', () => {
    expect(normalizeHoldSettings(null)).toEqual(DEFAULT_HOLD_SETTINGS);
    expect(normalizeHoldSettings({
      card: { enabled: true, seconds: 0.05 },
      page: { enabled: false, seconds: 1.26 },
      slider: { seconds: 99 },
    })).toEqual({
      card: { enabled: true, seconds: 0.3 },
      page: { enabled: false, seconds: 1.3 },
      slider: { enabled: true, seconds: 5 },
    });
    expect(normalizeHoldSettings({ card: { enabled: 'yes', seconds: 'x' } }).card).toEqual(DEFAULT_HOLD_SETTINGS.card);
  });

  it('maps wall actions to their hold group; language and back never hold', () => {
    expect(HOLD_GROUP_BY_ACTION).toEqual({ main: 'card', subItem: 'card', page: 'page', previous: 'slider', next: 'slider' });
  });

  it('stores normalized settings and resets to defaults', () => {
    const settings = useSettingsStore(createPinia());
    settings.setHold({ slider: { enabled: false, seconds: 2 } });
    expect(settings.holdRule('slider')).toEqual({ enabled: false, seconds: 2 });
    expect(settings.holdRule('card')).toEqual(DEFAULT_HOLD_SETTINGS.card);
    settings.resetHold();
    expect(settings.hold).toEqual(DEFAULT_HOLD_SETTINGS);
  });
});
