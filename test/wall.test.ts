import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { WALL_CONFIG } from '../app/data/wall-config';
import { useWallStore } from '../app/stores/wall';

describe('wALL_CONFIG', () => {
  it('contains exactly 6 columns', () => {
    expect(WALL_CONFIG.columns).toHaveLength(6);
  });

  it('has our-brands (col 2) with 3 sub-items: tekiro, ryu, and rexco', () => {
    const col2 = WALL_CONFIG.columns.find(c => c.id === 2);
    expect(col2).toBeDefined();
    expect(col2?.type).toBe('expandable');
    expect(col2?.subItems?.map(s => s.key)).toEqual(['tekiro', 'ryu', 'rexco']);
  });

  it('has distribution (col 5) with 2 sub-items: our-way and brand-activation', () => {
    const col5 = WALL_CONFIG.columns.find(c => c.id === 5);
    expect(col5).toBeDefined();
    expect(col5?.type).toBe('expandable');
    expect(col5?.subItems?.map(s => s.key)).toEqual(['our-way', 'brand-activation']);
  });

  it('has summit 2026 as column 6', () => {
    const col6 = WALL_CONFIG.columns.find(c => c.id === 6);
    expect(col6).toBeDefined();
    expect(col6?.key).toBe('summit-2026');
  });

  it('has multilingual content in id, en, and zh-Hans for all 6 columns', () => {
    WALL_CONFIG.columns.forEach((col) => {
      expect(col.i18n).toBeDefined();
      expect(col.i18n?.id).toBeDefined();
      expect(col.i18n?.en).toBeDefined();
      expect(col.i18n?.['zh-Hans']).toBeDefined();
    });
  });

  it('formats all labelHtml without <br> line breaks for single-line presentation', () => {
    const locales = ['id', 'en', 'zh-Hans'] as const;
    WALL_CONFIG.columns.forEach((col) => {
      expect(col.labelHtml).not.toContain('<br');
      expect(col.labelHtml).not.toContain('\n');
      locales.forEach((loc) => {
        if (col.i18n?.[loc]?.labelHtml) {
          expect(col.i18n[loc].labelHtml).not.toContain('<br');
          expect(col.i18n[loc].labelHtml).not.toContain('\n');
        }
      });
      col.subItems?.forEach((sub) => {
        expect(sub.labelHtml).not.toContain('<br');
        expect(sub.labelHtml).not.toContain('\n');
        locales.forEach((loc) => {
          if (sub.i18n?.[loc]?.labelHtml) {
            expect(sub.i18n[loc].labelHtml).not.toContain('<br');
            expect(sub.i18n[loc].labelHtml).not.toContain('\n');
          }
        });
      });
    });
  });
});

describe('useWallStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes in idle state with id locale for all columns', () => {
    const wall = useWallStore();
    expect(wall.hasAnyActive).toBe(false);
    for (let i = 1; i <= 6; i++) {
      expect(wall.getColumnState(i)).toBe('idle');
      expect(wall.getColumnLocale(i)).toBe('id');
    }
  });

  it('maintains independent language selection per column', () => {
    const wall = useWallStore();

    // Default: col 1 and col 2 are Indonesian
    expect(wall.getColumnLocale(1)).toBe('id');
    expect(wall.getColumnLocale(2)).toBe('id');

    // Switch col 1 to English
    wall.setColumnLocale(1, 'en');
    expect(wall.getColumnLocale(1)).toBe('en');
    expect(wall.getColumnLocale(2)).toBe('id'); // col 2 remains unaffected

    // Switch col 2 to Simplified Chinese
    wall.setColumnLocale(2, 'zh-Hans');
    expect(wall.getColumnLocale(1)).toBe('en'); // col 1 remains English
    expect(wall.getColumnLocale(2)).toBe('zh-Hans');

    // Check localized titles reflect per-column language
    expect(wall.getHeaderTitle(1)).toBe('ABOUT ALTAMA');
    expect(wall.getHeaderTitle(2)).toBe('TEKIRO'); // default subitem in zh-Hans
    expect(wall.getColumnLabel(2)).toBe('旗下品牌');

    // Switch col 1 back to Indonesian
    wall.setColumnLocale(1, 'id');
    expect(wall.getHeaderTitle(1)).toBe('TENTANG ALTAMA');
    expect(wall.getColumnLabel(1)).toBe('TENTANG ALTAMA');
  });

  it('transitions expandable column 2 (our-brands) to submenu then active', () => {
    const wall = useWallStore();
    wall.onMainButtonClick(2);
    expect(wall.getColumnState(2)).toBe('submenu');

    wall.onSubButtonClick(2, 'ryu');
    expect(wall.getColumnState(2)).toBe('active');
    expect(wall.getActiveSubItem(2)).toBe('ryu');
    expect(wall.hasAnyActive).toBe(true);
  });

  it('transitions expandable column 5 (distribution) to submenu then active', () => {
    const wall = useWallStore();
    wall.onMainButtonClick(5);
    expect(wall.getColumnState(5)).toBe('submenu');

    wall.onSubButtonClick(5, 'our-way');
    expect(wall.getColumnState(5)).toBe('active');
    expect(wall.getActiveSubItem(5)).toBe('our-way');
    expect(wall.hasAnyActive).toBe(true);
  });

  it('navigates carousel', () => {
    const wall = useWallStore();
    expect(wall.getCarouselIndex(1)).toBe(0);
    wall.navigateCarousel(1, 1, 3);
    expect(wall.getCarouselIndex(1)).toBe(1);
    wall.navigateCarousel(1, 1, 3);
    expect(wall.getCarouselIndex(1)).toBe(2);
    wall.navigateCarousel(1, 1, 3);
    expect(wall.getCarouselIndex(1)).toBe(0); // wraps around
  });

  it('fully translates header title, header desc, bottom title, and bottom desc for all 6 columns', () => {
    const wall = useWallStore();
    const locales = ['id', 'en', 'zh-Hans'] as const;

    locales.forEach((locale) => {
      for (let colId = 1; colId <= 6; colId++) {
        wall.setColumnLocale(colId, locale);

        const label = wall.getColumnLabel(colId);
        const headerTitle = wall.getHeaderTitle(colId);
        const headerDesc = wall.getHeaderDesc(colId);
        const bottomTitle = wall.getBottomTitle(colId);
        const bottomDesc = wall.getBottomDesc(colId);

        expect(label).toBeTruthy();
        expect(headerTitle).toBeTruthy();
        expect(headerDesc).toBeTruthy();
        expect(bottomTitle).toBeTruthy();
        expect(bottomDesc).toBeTruthy();
      }
    });
  });

  it('updates sub-item headers and bottom descriptions reactively per language for Col 2 and Col 5', () => {
    const wall = useWallStore();

    // Col 2: Ryu in Chinese
    wall.setColumnLocale(2, 'zh-Hans');
    wall.setActiveSubItem(2, 'ryu');
    expect(wall.getHeaderTitle(2)).toBe('RYU 电动工具');
    expect(wall.getHeaderDesc(2)).toContain('强劲耐用的电动工具');
    expect(wall.getBottomTitle(2)).toBe('RYU 电动工具');
    expect(wall.getBottomDesc(2)).toContain('现代建筑和木工需求');
    expect(wall.getActiveSubItemLabel(2)).toBe('RYU');

    // Switch Col 2 to English
    wall.setColumnLocale(2, 'en');
    expect(wall.getHeaderTitle(2)).toBe('RYU POWER TOOLS');
    expect(wall.getHeaderDesc(2)).toContain('High-powered, durable power tools');
    expect(wall.getBottomTitle(2)).toBe('RYU POWER TOOLS');
    expect(wall.getBottomDesc(2)).toContain('construction and woodworking');

    // Col 5: Brand Activation in Chinese
    wall.setColumnLocale(5, 'zh-Hans');
    wall.setActiveSubItem(5, 'brand-activation');
    expect(wall.getHeaderTitle(5)).toBe('品牌推广活动');
    expect(wall.getHeaderDesc(5)).toContain('汽车展会');
    expect(wall.getBottomTitle(5)).toBe('品牌推广活动');
    expect(wall.getBottomDesc(5)).toContain('行业社群');
    expect(wall.getActiveSubItemLabel(5)).toBe('品牌推广');

    // Switch Col 5 to Indonesian
    wall.setColumnLocale(5, 'id');
    expect(wall.getHeaderTitle(5)).toBe('AKTIVASI MEREK');
    expect(wall.getHeaderDesc(5)).toContain('Aktivasi merek terpadu');
    expect(wall.getBottomTitle(5)).toBe('AKTIVASI MEREK');
    expect(wall.getBottomDesc(5)).toContain('komunitas industri');
    expect(wall.getActiveSubItemLabel(5)).toBe('AKTIVASI MEREK');
  });

  it('resets all columns to idle', () => {
    const wall = useWallStore();
    wall.onMainButtonClick(1);
    expect(wall.hasAnyActive).toBe(true);
    wall.resetAll();
    expect(wall.hasAnyActive).toBe(false);
  });
});
