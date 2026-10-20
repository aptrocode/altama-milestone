import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../app/stores/settings';
import { DEFAULT_HOLD_SETTINGS, HOLD_GROUP_BY_ACTION, normalizeHoldSettings } from '../shared/hold-settings';
import { autoPageActive, DEFAULT_WALL_SETTINGS, normalizeWallSettings } from '../shared/wall-settings';

describe('hold settings', () => {
  it('fills missing groups with defaults and clamps/rounds seconds', () => {
    expect(normalizeHoldSettings(null)).toEqual(DEFAULT_HOLD_SETTINGS);
    expect(normalizeHoldSettings({
      card: { enabled: true, seconds: 0.05 },
      page: { enabled: false, seconds: 1.26 },
      slider: { seconds: 99 },
    })).toEqual({
      card: { mode: 'hold', enabled: true, seconds: 0.3 },
      page: { mode: 'tap', enabled: false, seconds: 1.3 },
      slider: { mode: 'hold', enabled: true, seconds: 5 },
      language: DEFAULT_HOLD_SETTINGS.language,
      back: DEFAULT_HOLD_SETTINGS.back,
    });
    expect(normalizeHoldSettings({ card: { enabled: 'yes', seconds: 'x' } }).card).toEqual(DEFAULT_HOLD_SETTINGS.card);
  });

  it('has three modes; delay is not a sensor dwell', () => {
    expect(normalizeHoldSettings({ card: { mode: 'delay', seconds: 2 } }).card).toEqual({ mode: 'delay', enabled: false, seconds: 2 });
    expect(normalizeHoldSettings({ card: { mode: 'x', enabled: true } }).card.mode).toBe('hold');
    expect(DEFAULT_HOLD_SETTINGS.card.mode).toBe('hold');
  });

  it('maps every wall action to a hold group; language and back are off by default', () => {
    expect(HOLD_GROUP_BY_ACTION).toEqual({ main: 'card', subItem: 'card', page: 'page', previous: 'slider', next: 'slider', language: 'language', back: 'back' });
    expect(DEFAULT_HOLD_SETTINGS.language.enabled).toBe(false);
    expect(DEFAULT_HOLD_SETTINGS.back.enabled).toBe(false);
  });

  it('clamps wall settings: reset seconds and card offset', () => {
    expect(normalizeWallSettings(null)).toEqual(DEFAULT_WALL_SETTINGS);
    expect(DEFAULT_WALL_SETTINGS).toEqual({ resetSeconds: 30, cardOffsetY: 0, showClose: true, closeScale: 1, closeOffsetX: 0, closeOffsetY: 0, showArrows: true, autoSlideSeconds: 5, showPages: true, autoPage: true, autoPageSeconds: 15, scrollText: false, languageBar: 'compact', showTouchDots: false, touchDotSeconds: 5 });
    expect(normalizeWallSettings({ resetSeconds: 2, cardOffsetY: 999, autoSlideSeconds: 0 }))
      .toEqual({ ...DEFAULT_WALL_SETTINGS, resetSeconds: 5, cardOffsetY: 120, autoSlideSeconds: 2 });
    expect(normalizeWallSettings({ resetSeconds: 45.4, cardOffsetY: -31, showClose: false, showArrows: false, autoSlideSeconds: 7.6, showPages: false, autoPageSeconds: 500, languageBar: 'full', showTouchDots: true, touchDotSeconds: 99 }))
      .toEqual({ resetSeconds: 45, cardOffsetY: -30, showClose: false, closeScale: 1, closeOffsetX: 0, closeOffsetY: 0, showArrows: false, autoSlideSeconds: 8, showPages: false, autoPage: true, autoPageSeconds: 120, scrollText: false, languageBar: 'full', showTouchDots: true, touchDotSeconds: 60 });
    expect(normalizeWallSettings({ languageBar: 'huge' }).languageBar).toBe('compact');
    expect(normalizeWallSettings({ autoPage: false }).autoPage).toBe(false);
    expect(autoPageActive({ autoPage: false, showPages: false })).toBe(true);
    expect(autoPageActive({ autoPage: false, showPages: true })).toBe(false);
    expect(normalizeWallSettings({ closeScale: 1.26 }).closeScale).toBe(1.3);
    expect(normalizeWallSettings({ closeScale: 9 }).closeScale).toBe(2);
    expect(normalizeWallSettings({ closeOffsetX: -99, closeOffsetY: 7 })).toMatchObject({ closeOffsetX: -60, closeOffsetY: 8 });
    expect(normalizeWallSettings({ languageBar: 'grid' }).languageBar).toBe('grid');
    expect(normalizeWallSettings({ showClose: 'no', showArrows: 1 })).toMatchObject({ showClose: true, showArrows: true });
  });

  it('stores normalized settings and resets to defaults', () => {
    const settings = useSettingsStore(createPinia());
    settings.setHold({ slider: { enabled: false, seconds: 2 } });
    expect(settings.holdRule('slider')).toEqual({ mode: 'tap', enabled: false, seconds: 2 });
    expect(settings.holdRule('card')).toEqual(DEFAULT_HOLD_SETTINGS.card);
    settings.resetHold();
    expect(settings.hold).toEqual(DEFAULT_HOLD_SETTINGS);
    settings.setWall({ resetSeconds: 60, cardOffsetY: -40 });
    expect(settings.wall).toEqual({ ...DEFAULT_WALL_SETTINGS, resetSeconds: 60, cardOffsetY: -40 });
  });
});
