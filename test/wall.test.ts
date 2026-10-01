import { createPinia } from 'pinia';
import { describe, expect, it } from 'vitest';
import { useWallStore } from '../app/stores/wall';
import { COLUMN_IDS } from '../shared/wall';

function store() {
  return useWallStore(createPinia());
}

describe('wall state and actions', () => {
  it('starts all six columns idle in Indonesian with serializable state', () => {
    const wall = store();
    expect(wall.hasAnyActive).toBe(false);
    COLUMN_IDS.forEach(id => expect(wall.columns[id]).toMatchObject({ phase: 'idle', locale: 'id', slide: 0 }));
    expect(JSON.parse(JSON.stringify(wall.$state))).toEqual(wall.$state);
  });

  it('switches one language without changing content phase, slide, or neighboring languages', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 1 });
    wall.dispatch({ type: 'next', columnId: 1 });
    wall.dispatch({ type: 'language', columnId: 1, locale: 'zh-Hans' });
    expect(wall.columns[1]).toMatchObject({ phase: 'active', slide: 1, locale: 'zh-Hans' });
    expect(wall.getColumnLocale(2)).toBe('id');
    wall.dispatch({ type: 'language', columnId: 6, locale: 'en' });
    expect(wall.getColumnLocale(1)).toBe('zh-Hans');
    expect(wall.getHeaderTitle(6)).toBe('ALTAMA SUMMIT 2026');
  });

  it('defers sub-item content until selection and keeps that selection while changing language', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 2 });
    expect(wall.getColumnState(2)).toBe('submenu');
    wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'ryu' });
    wall.dispatch({ type: 'language', columnId: 2, locale: 'zh-Hans' });
    expect(wall.getHeaderTitle(2)).toBe('RYU 电动工具');
    expect(wall.getBottomDesc(2)).toContain('现代建筑和木工需求');
    expect(wall.getColumnState(2)).toBe('active');
    wall.dispatch({ type: 'language', columnId: 2, locale: 'en' });
    expect(wall.getHeaderTitle(2)).toBe('RYU POWER TOOLS');
  });

  it('rejects a sub-item from a different column and a hidden submenu action', () => {
    const wall = store();
    expect(wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'ryu' })).toBe(false);
    wall.dispatch({ type: 'main', columnId: 5 });
    expect(wall.dispatch({ type: 'subItem', columnId: 5, subItemId: 'ryu' })).toBe(false);
    expect(wall.getColumnState(5)).toBe('submenu');
  });

  it('ignores repeated main activations rather than closing an already open column', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 1 });
    expect(wall.dispatch({ type: 'main', columnId: 1 })).toBe(false);
    expect(wall.getColumnState(1)).toBe('active');
  });

  it('wraps the carousel in both directions and rejects navigation while idle', () => {
    const wall = store();
    expect(wall.dispatch({ type: 'next', columnId: 1 })).toBe(false);
    wall.dispatch({ type: 'main', columnId: 1 });
    wall.dispatch({ type: 'previous', columnId: 1 });
    expect(wall.getCarouselIndex(1)).toBe(2);
    wall.dispatch({ type: 'next', columnId: 1 });
    expect(wall.getCarouselIndex(1)).toBe(0);
  });

  it('back returns expandable content to its menu and preserves the current language', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 2 });
    wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'rexco' });
    wall.dispatch({ type: 'language', columnId: 2, locale: 'en' });
    wall.dispatch({ type: 'next', columnId: 2 });
    wall.dispatch({ type: 'back', columnId: 2 });
    expect(wall.columns[2]).toMatchObject({ phase: 'submenu', subItem: 'rexco', slide: 0, locale: 'en' });
    wall.dispatch({ type: 'back', columnId: 2 });
    expect(wall.columns[2]).toMatchObject({ phase: 'idle', locale: 'en', subItem: 'tekiro' });
  });

  it('operator reset preserves languages; inactivity reset restores Indonesian', () => {
    const wall = store();
    wall.dispatch({ type: 'language', columnId: 1, locale: 'en' });
    wall.dispatch({ type: 'main', columnId: 1 });
    wall.resetAll();
    expect(wall.columns[1]).toMatchObject({ phase: 'idle', locale: 'en' });
    wall.resetColumn(1);
    expect(wall.getColumnLocale(1)).toBe('id');
  });
});
