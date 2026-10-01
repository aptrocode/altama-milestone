import { defineStore } from 'pinia';
import { WALL_CONFIG } from '~/data/wall-config';

export type ColumnState = 'idle' | 'submenu' | 'active';

export const useWallStore = defineStore('wall', {
  state: () => ({
    columnStates: {
      1: 'idle' as ColumnState,
      2: 'idle' as ColumnState,
      3: 'idle' as ColumnState,
      4: 'idle' as ColumnState,
      5: 'idle' as ColumnState,
      6: 'idle' as ColumnState,
    } as Record<number, ColumnState>,
    activeSubItem: {
      2: 'tekiro',
      5: 'brand-activation',
    } as Record<number, string>,
    carouselIndex: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    } as Record<number, number>,
  }),

  getters: {
    hasAnyActive: (state) => {
      return Object.values(state.columnStates).some(s => s !== 'idle');
    },

    getColumnState: state => (colId: number): ColumnState => {
      return state.columnStates[colId] || 'idle';
    },

    getActiveSubItem: state => (colId: number): string => {
      return state.activeSubItem[colId] || '';
    },

    getCarouselIndex: state => (colId: number): number => {
      return state.carouselIndex[colId] || 0;
    },
  },

  actions: {
    setColumnState(colId: number, state: ColumnState) {
      this.columnStates[colId] = state;
    },

    setActiveSubItem(colId: number, subKey: string) {
      this.activeSubItem[colId] = subKey;
    },

    setCarouselIndex(colId: number, index: number) {
      this.carouselIndex[colId] = index;
    },

    navigateCarousel(colId: number, direction: number, totalSlides = 3) {
      let current = this.carouselIndex[colId] || 0;
      current += direction;
      if (current >= totalSlides)
        current = 0;
      if (current < 0)
        current = totalSlides - 1;
      this.carouselIndex[colId] = current;
    },

    resetAll() {
      WALL_CONFIG.columns.forEach((col) => {
        this.columnStates[col.id] = 'idle';
        this.carouselIndex[col.id] = 0;
        if (col.defaultSub) {
          this.activeSubItem[col.id] = col.defaultSub;
        }
      });
    },

    onMainButtonClick(colId: number) {
      const colConfig = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!colConfig)
        return;

      const current = this.columnStates[colId];
      if (colConfig.type === 'expandable') {
        if (current === 'idle') {
          this.columnStates[colId] = 'submenu';
        }
        else if (current === 'submenu') {
          this.columnStates[colId] = 'idle';
        }
        else if (current === 'active') {
          this.columnStates[colId] = 'submenu';
        }
      }
      else {
        if (current === 'idle') {
          this.columnStates[colId] = 'active';
        }
        else {
          this.columnStates[colId] = 'idle';
          this.carouselIndex[colId] = 0;
        }
      }
    },

    onSubButtonClick(colId: number, subKey: string) {
      this.activeSubItem[colId] = subKey;
      this.columnStates[colId] = 'active';
      this.carouselIndex[colId] = 0;
    },
  },
});
