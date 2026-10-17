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
    COLUMN_IDS.forEach(id => expect(wall.columns[id]).toMatchObject({ phase: 'idle', locale: 'id', photo: 0, page: 0 }));
    expect(JSON.parse(JSON.stringify(wall.$state))).toEqual(wall.$state);
  });

  it('chooses one idle language and retains it through content without changing neighboring languages', () => {
    const wall = store();
    wall.dispatch({ type: 'language', columnId: 1, locale: 'zh-Hans' });
    wall.dispatch({ type: 'main', columnId: 1 });
    wall.dispatch({ type: 'next', columnId: 1 });
    expect(wall.dispatch({ type: 'language', columnId: 1, locale: 'en' })).toBe(false);
    expect(wall.columns[1]).toMatchObject({ phase: 'active', photo: 1, locale: 'zh-Hans' });
    expect(wall.getColumnLocale(2)).toBe('id');
    expect(wall.getColumnCopy(1).label).toBe('关于 ALTAMA');
    wall.dispatch({ type: 'language', columnId: 6, locale: 'en' });
    expect(wall.getColumnCopy(6).label).toBe('ALTAMA SUMMIT 2026');
  });

  it('opens a brand directly from its idle tile and returns to idle on Back', () => {
    const wall = store();
    wall.dispatch({ type: 'language', columnId: 2, locale: 'zh-Hans' });
    expect(wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'ryu' })).toBe(true);
    expect(wall.columns[2]).toMatchObject({ phase: 'active', subItem: 'ryu', photo: 0, page: 0, locale: 'zh-Hans' });
    expect(wall.getColumnCopy(2)).toEqual({ label: '旗下品牌', activeLabel: 'RYU' });
    expect(wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'rexco' })).toBe(false);
    wall.dispatch({ type: 'back', columnId: 2 });
    expect(wall.columns[2]).toMatchObject({ phase: 'idle', subItem: 'tekiro', locale: 'zh-Hans' });
    wall.dispatch({ type: 'language', columnId: 2, locale: 'en' });
    wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'ryu' });
    expect(wall.getColumnCopy(2)).toEqual({ label: 'OUR BRANDS', activeLabel: 'RYU' });
  });

  it('opens the default sub-item for operator main input and rejects sub-items of other columns', () => {
    const wall = store();
    expect(wall.dispatch({ type: 'subItem', columnId: 5, subItemId: 'ryu' })).toBe(false);
    wall.dispatch({ type: 'main', columnId: 5 });
    expect(wall.columns[5]).toMatchObject({ phase: 'active', subItem: 'distribusi' });
  });

  it('changes only the opened column', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 1 });
    COLUMN_IDS.filter(id => id !== 1).forEach(id => expect(wall.getColumnState(id)).toBe('idle'));
  });

  it('ignores repeated main activations rather than closing an already open column', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 1 });
    expect(wall.dispatch({ type: 'main', columnId: 1 })).toBe(false);
    expect(wall.getColumnState(1)).toBe('active');
  });

  it('wraps the photo slider in both directions and rejects navigation while idle', () => {
    const wall = store();
    expect(wall.dispatch({ type: 'next', columnId: 4 })).toBe(false);
    wall.dispatch({ type: 'main', columnId: 4 });
    wall.dispatch({ type: 'previous', columnId: 4 });
    expect(wall.getPhotoIndex(4)).toBe(1);
    wall.dispatch({ type: 'next', columnId: 4 });
    expect(wall.getPhotoIndex(4)).toBe(0);
  });

  it('switches the whole page, including its own photo slider', () => {
    const wall = store();
    wall.dispatch({ type: 'subItem', columnId: 2, subItemId: 'tekiro' });
    wall.dispatch({ type: 'next', columnId: 2 });
    expect(wall.columns[2]).toMatchObject({ photo: 1, page: 0 });
    expect(wall.dispatch({ type: 'page', columnId: 2, page: 1 })).toBe(true);
    expect(wall.columns[2]).toMatchObject({ photo: 0, page: 1 });
    expect(wall.publishedColumns[2]).toMatchObject({ page: 1, photoCount: 2, pageCount: 2 });
    expect(wall.dispatch({ type: 'page', columnId: 2, page: 2 })).toBe(false);
    expect(wall.dispatch({ type: 'page', columnId: 3, page: 1 })).toBe(false);
  });

  it('rejects arrows and tabs for content without them', () => {
    const wall = store();
    wall.dispatch({ type: 'main', columnId: 6 });
    expect(wall.dispatch({ type: 'next', columnId: 6 })).toBe(false);
    wall.dispatch({ type: 'main', columnId: 3 });
    expect(wall.dispatch({ type: 'page', columnId: 3, page: 0 })).toBe(false);
  });

  it('publishes arrow and tab counts with each snapshot', () => {
    const wall = store();
    expect(wall.publishedColumns[2]).toMatchObject({ subItem: 'tekiro', photoCount: 2, pageCount: 2 });
    expect(wall.publishedColumns[6]).toMatchObject({ photoCount: 0, pageCount: 1 });
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

  it.each([1, 2] as const)('rejects a hidden language action after column %i leaves idle', (columnId) => {
    const wall = store();
    wall.dispatch({ type: 'language', columnId, locale: 'en' });
    wall.dispatch({ type: 'main', columnId });
    const snapshot = { ...wall.columns[columnId] };
    expect(wall.dispatch({ type: 'language', columnId, locale: 'zh-Hans' })).toBe(false);
    expect(wall.columns[columnId]).toEqual(snapshot);
  });
});
