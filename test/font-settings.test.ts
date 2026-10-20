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

  it('gives every card 24 to 26 px by default', () => {
    const { cards } = DEFAULT_FONT_SETTINGS;
    expect(Object.keys(cards)).toEqual([...CARD_TEXT_KEYS]);
    expect(Object.values(cards).every(card => card.min === 24 && card.max === 26)).toBe(true);
  });

  it('clamps per-card ranges, keeps min ≤ max, and ignores unknown cards or older fields', () => {
    const fonts = normalizeFontSettings({ bodySize: 22, cards: { ryu: { min: 99, max: 30 }, tekiro: { min: 20.4, max: 'x' }, rexco: { size: 30, fill: true }, nope: { min: 30 } } });
    expect(fonts.cards.ryu).toEqual({ min: 40, max: 40 });
    expect(fonts.cards.tekiro).toEqual({ min: 20, max: 26 });
    expect(fonts.cards.rexco).toEqual({ min: 24, max: 26 });
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
    settings.setFonts({ cards: { pemasaran: { min: 22, max: 24 } } });
    expect(settings.fonts.cards.pemasaran).toEqual({ min: 22, max: 24 });
    expect(settings.fonts.cards.distribusi).toEqual(DEFAULT_FONT_SETTINGS.cards.distribusi);
  });
});
