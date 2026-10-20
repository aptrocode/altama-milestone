import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '../app/stores/settings';
import { CARD_TEXT_KEYS, cardTextKey, DEFAULT_FONT_SETTINGS, normalizeFontSettings } from '../shared/font-settings';

describe('font settings', () => {
  it('defaults and clamps sizes and the title weight', () => {
    expect(normalizeFontSettings(null)).toEqual(DEFAULT_FONT_SETTINGS);
    expect(normalizeFontSettings({ titleSize: 99, tabSize: 2, titleWeight: 650 }))
      .toEqual({ ...DEFAULT_FONT_SETTINGS, titleSize: 34, tabSize: 16 });
    expect(normalizeFontSettings({ titleWeight: 900, captionSize: 'x' })).toEqual({ ...DEFAULT_FONT_SETTINGS, titleWeight: 900 });
  });

  it('keeps the previous look by default: brands at 22 px, other cards filling', () => {
    const { cards } = DEFAULT_FONT_SETTINGS;
    expect(Object.keys(cards)).toEqual([...CARD_TEXT_KEYS]);
    expect(['tekiro', 'ryu', 'rexco'].map(key => cards[key as 'tekiro'])).toEqual(Array.from({ length: 3 }, () => ({ size: 22, fill: false })));
    expect(cards['about-altama']).toEqual({ size: 18, fill: true });
  });

  it('clamps per-card sizes, keeps valid fills, and ignores unknown cards or the old body size', () => {
    const fonts = normalizeFontSettings({ bodySize: 22, cards: { ryu: { size: 99, fill: true }, tekiro: { size: 20.4, fill: 'yes' }, nope: { size: 30 } } });
    expect(fonts.cards.ryu).toEqual({ size: 40, fill: true });
    expect(fonts.cards.tekiro).toEqual({ size: 20, fill: false });
    expect('bodySize' in fonts).toBe(false);
    expect(Object.keys(fonts.cards)).toEqual([...CARD_TEXT_KEYS]);
  });

  it('maps an open card to its setting: the sub-item for columns 2 and 5, else the column', () => {
    expect(cardTextKey('our-brands', 'rexco')).toBe('rexco');
    expect(cardTextKey('infrastructure', '')).toBe('infrastructure');
    expect(cardTextKey('unknown', '')).toBeUndefined();
  });

  it('is part of the settings store', () => {
    const settings = useSettingsStore(createPinia());
    expect(settings.fonts).toEqual(DEFAULT_FONT_SETTINGS);
    settings.setFonts({ cards: { pemasaran: { size: 24, fill: false } } });
    expect(settings.fonts.cards.pemasaran).toEqual({ size: 24, fill: false });
    expect(settings.fonts.cards.distribusi).toEqual(DEFAULT_FONT_SETTINGS.cards.distribusi);
  });
});
