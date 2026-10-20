import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../app/stores/settings';
import { DEFAULT_FONT_SETTINGS, normalizeFontSettings } from '../shared/font-settings';

describe('font settings', () => {
  it('defaults and clamps sizes and the title weight', () => {
    expect(normalizeFontSettings(null)).toEqual(DEFAULT_FONT_SETTINGS);
    expect(DEFAULT_FONT_SETTINGS).toEqual({ titleSize: 27, titleWeight: 700, subItemSize: 32, captionSize: 30, tabSize: 24, bodySize: 18 });
    expect(normalizeFontSettings({ titleSize: 99, tabSize: 2, bodySize: 20.4, titleWeight: 650 }))
      .toEqual({ ...DEFAULT_FONT_SETTINGS, titleSize: 34, tabSize: 16, bodySize: 20 });
    expect(normalizeFontSettings({ titleWeight: 900, captionSize: 'x' })).toEqual({ ...DEFAULT_FONT_SETTINGS, titleWeight: 900 });
  });

  it('is part of the settings store', () => {
    const settings = useSettingsStore(createPinia());
    expect(settings.fonts).toEqual(DEFAULT_FONT_SETTINGS);
    settings.setFonts({ bodySize: 22 });
    expect(settings.fonts).toEqual({ ...DEFAULT_FONT_SETTINGS, bodySize: 22 });
  });
});
