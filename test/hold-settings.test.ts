import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../app/stores/settings';
import { DEFAULT_HOLD_SETTINGS, HOLD_GROUP_BY_ACTION, normalizeHoldSettings } from '../shared/hold-settings';
import { DEFAULT_WALL_SETTINGS, normalizeWallSettings } from '../shared/wall-settings';

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
      language: DEFAULT_HOLD_SETTINGS.language,
      back: DEFAULT_HOLD_SETTINGS.back,
    });
    expect(normalizeHoldSettings({ card: { enabled: 'yes', seconds: 'x' } }).card).toEqual(DEFAULT_HOLD_SETTINGS.card);
  });

  it('maps every wall action to a hold group; language and back are off by default', () => {
    expect(HOLD_GROUP_BY_ACTION).toEqual({ main: 'card', subItem: 'card', page: 'page', previous: 'slider', next: 'slider', language: 'language', back: 'back' });
    expect(DEFAULT_HOLD_SETTINGS.language.enabled).toBe(false);
    expect(DEFAULT_HOLD_SETTINGS.back.enabled).toBe(false);
  });

  it('clamps wall settings: reset seconds and card offset', () => {
    expect(normalizeWallSettings(null)).toEqual(DEFAULT_WALL_SETTINGS);
    expect(DEFAULT_WALL_SETTINGS).toEqual({ resetSeconds: 30, cardOffsetY: 0, showClose: true, showArrows: true, autoSlideSeconds: 5, showPages: true, autoPageSeconds: 10, languageBar: 'compact', showTouchDots: false, touchDotSeconds: 5 });
    expect(normalizeWallSettings({ resetSeconds: 2, cardOffsetY: 999, autoSlideSeconds: 0 }))
      .toEqual({ ...DEFAULT_WALL_SETTINGS, resetSeconds: 5, cardOffsetY: 120, autoSlideSeconds: 2 });
    expect(normalizeWallSettings({ resetSeconds: 45.4, cardOffsetY: -31, showClose: false, showArrows: false, autoSlideSeconds: 7.6, showPages: false, autoPageSeconds: 500, languageBar: 'full', showTouchDots: true, touchDotSeconds: 99 }))
      .toEqual({ resetSeconds: 45, cardOffsetY: -30, showClose: false, showArrows: false, autoSlideSeconds: 8, showPages: false, autoPageSeconds: 120, languageBar: 'full', showTouchDots: true, touchDotSeconds: 60 });
    expect(normalizeWallSettings({ languageBar: 'huge' }).languageBar).toBe('compact');
    expect(normalizeWallSettings({ languageBar: 'grid' }).languageBar).toBe('grid');
    expect(normalizeWallSettings({ showClose: 'no', showArrows: 1 })).toMatchObject({ showClose: true, showArrows: true });
  });

  it('stores normalized settings and resets to defaults', () => {
    const settings = useSettingsStore(createPinia());
    settings.setHold({ slider: { enabled: false, seconds: 2 } });
    expect(settings.holdRule('slider')).toEqual({ enabled: false, seconds: 2 });
    expect(settings.holdRule('card')).toEqual(DEFAULT_HOLD_SETTINGS.card);
    settings.resetHold();
    expect(settings.hold).toEqual(DEFAULT_HOLD_SETTINGS);
    settings.setWall({ resetSeconds: 60, cardOffsetY: -40 });
    expect(settings.wall).toEqual({ ...DEFAULT_WALL_SETTINGS, resetSeconds: 60, cardOffsetY: -40 });
  });
});
