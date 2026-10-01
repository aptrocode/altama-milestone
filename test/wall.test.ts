import { describe, expect, it, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { WALL_CONFIG } from '../app/data/wall-config';
import { useWallStore } from '../app/stores/wall';

describe('WALL_CONFIG', () => {
  it('contains exactly 6 columns', () => {
    expect(WALL_CONFIG.columns).toHaveLength(6);
  });

  it('has summit 2026 as column 6 without carousel swap', () => {
    const col6 = WALL_CONFIG.columns.find(c => c.id === 6);
    expect(col6).toBeDefined();
    expect(col6?.key).toBe('summit-2026');
  });

  it('has our-brands with tekiro, ryu, and rexco', () => {
    const col2 = WALL_CONFIG.columns.find(c => c.id === 2);
    expect(col2).toBeDefined();
    expect(col2?.subItems?.map(s => s.key)).toEqual(['tekiro', 'ryu', 'rexco']);
  });
});

describe('useWallStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('initializes in idle state', () => {
    const wall = useWallStore();
    expect(wall.hasAnyActive).toBe(false);
    expect(wall.getColumnState(1)).toBe('idle');
  });

  it('transitions expandable column to submenu then active', () => {
    const wall = useWallStore();
    wall.onMainButtonClick(2); // our-brands
    expect(wall.getColumnState(2)).toBe('submenu');

    wall.onSubButtonClick(2, 'tekiro');
    expect(wall.getColumnState(2)).toBe('active');
    expect(wall.getActiveSubItem(2)).toBe('tekiro');
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

  it('resets all columns to idle', () => {
    const wall = useWallStore();
    wall.onMainButtonClick(1);
    expect(wall.hasAnyActive).toBe(true);
    wall.resetAll();
    expect(wall.hasAnyActive).toBe(false);
  });
});
