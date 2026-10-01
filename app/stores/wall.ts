import type { ColumnConfig, WallLocale } from '~/data/wall-config';
import { defineStore } from 'pinia';
import { WALL_CONFIG } from '~/data/wall-config';

export type ColumnState = 'idle' | 'submenu' | 'active';

const AUTO_RESET_DELAY_MS = 15000;
const columnTimers: Record<number, any> = {};

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
    columnLocales: {
      1: 'id' as WallLocale,
      2: 'id' as WallLocale,
      3: 'id' as WallLocale,
      4: 'id' as WallLocale,
      5: 'id' as WallLocale,
      6: 'id' as WallLocale,
    } as Record<number, WallLocale>,
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

    getColumnLocale: state => (colId: number): WallLocale => {
      return state.columnLocales[colId] || 'id';
    },

    getActiveSubItem: state => (colId: number): string => {
      return state.activeSubItem[colId] || '';
    },

    getCarouselIndex: state => (colId: number): number => {
      return state.carouselIndex[colId] || 0;
    },

    getColumnConfig: () => (colId: number): ColumnConfig | undefined => {
      return WALL_CONFIG.columns.find(c => c.id === colId);
    },

    getColumnLabel: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';
      return col.i18n?.[locale]?.label || col.label;
    },

    getColumnLabelHtml: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';
      return col.i18n?.[locale]?.labelHtml || col.labelHtml;
    },

    getHeaderTitle: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';

      if (col.type === 'expandable') {
        const subKey = state.activeSubItem[colId] || col.defaultSub || '';
        const subContent = WALL_CONFIG.subItemContent[subKey]?.[locale];
        if (subContent?.title)
          return subContent.title;
      }
      return col.i18n?.[locale]?.headerTitle || col.headerTitle;
    },

    getHeaderDesc: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';

      if (col.type === 'expandable') {
        const subKey = state.activeSubItem[colId] || col.defaultSub || '';
        const subContent = WALL_CONFIG.subItemContent[subKey]?.[locale];
        if (subContent?.desc)
          return subContent.desc;
      }
      return col.i18n?.[locale]?.headerDesc || col.headerDesc;
    },

    getBottomTitle: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';

      if (col.type === 'expandable') {
        const subKey = state.activeSubItem[colId] || col.defaultSub || '';
        const subContent = WALL_CONFIG.subItemContent[subKey]?.[locale];
        if (subContent?.title)
          return subContent.title;
        const sub = col.subItems?.find(s => s.key === subKey);
        if (sub?.i18n?.[locale]?.title)
          return sub.i18n[locale].title;
      }
      return col.i18n?.[locale]?.bottomTitle || col.bottomTitle;
    },

    getBottomDesc: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';

      if (col.type === 'expandable') {
        const subKey = state.activeSubItem[colId] || col.defaultSub || '';
        const subContent = WALL_CONFIG.subItemContent[subKey]?.[locale];
        if (subContent?.desc)
          return subContent.desc;
        const sub = col.subItems?.find(s => s.key === subKey);
        if (sub?.i18n?.[locale]?.desc)
          return sub.i18n[locale].desc;
      }
      return col.i18n?.[locale]?.bottomDesc || col.bottomDesc;
    },

    getSubItemLabel: state => (colId: number, subKey: string): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col || !col.subItems)
        return '';
      const locale = state.columnLocales[colId] || 'id';
      const sub = col.subItems.find(s => s.key === subKey);
      return sub?.i18n?.[locale]?.label || sub?.label || '';
    },

    getSubItemLabelHtml: state => (colId: number, subKey: string): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col || !col.subItems)
        return '';
      const locale = state.columnLocales[colId] || 'id';
      const sub = col.subItems.find(s => s.key === subKey);
      return sub?.i18n?.[locale]?.labelHtml || sub?.labelHtml || sub?.label || '';
    },

    getActiveSubItemLabel: state => (colId: number): string => {
      const col = WALL_CONFIG.columns.find(c => c.id === colId);
      if (!col)
        return '';
      const locale = state.columnLocales[colId] || 'id';
      if (col.type === 'expandable') {
        const subKey = state.activeSubItem[colId] || col.defaultSub || '';
        const sub = col.subItems?.find(s => s.key === subKey);
        return sub?.i18n?.[locale]?.label || sub?.label || col.parentLabel || col.label;
      }
      return col.i18n?.[locale]?.label || col.label;
    },
  },

  actions: {
    startColumnTimer(colId: number) {
      this.clearColumnTimer(colId);
      if (this.columnStates[colId] === 'idle')
        return;

      columnTimers[colId] = setTimeout(() => {
        this.resetColumn(colId);
      }, AUTO_RESET_DELAY_MS);
    },

    resetColumnTimer(colId: number) {
      if (this.columnStates[colId] !== 'idle') {
        this.startColumnTimer(colId);
      }
    },

    clearColumnTimer(colId: number) {
      if (columnTimers[colId]) {
        clearTimeout(columnTimers[colId]);
        delete columnTimers[colId];
      }
    },

    clearAllColumnTimers() {
      Object.keys(columnTimers).forEach((id) => {
        clearTimeout(columnTimers[Number(id)]);
        delete columnTimers[Number(id)];
      });
    },

    resetColumn(colId: number) {
      this.clearColumnTimer(colId);
      this.columnStates[colId] = 'idle';
      this.carouselIndex[colId] = 0;
      const colConfig = WALL_CONFIG.columns.find(c => c.id === colId);
      if (colConfig?.defaultSub) {
        this.activeSubItem[colId] = colConfig.defaultSub;
      }
    },

    setColumnState(colId: number, state: ColumnState) {
      this.columnStates[colId] = state;
    },

    setColumnLocale(colId: number, locale: WallLocale) {
      this.columnLocales[colId] = locale;
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
      this.resetColumnTimer(colId);
    },

    resetAll() {
      this.clearAllColumnTimers();
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
          this.startColumnTimer(colId);
        }
        else if (current === 'submenu') {
          this.columnStates[colId] = 'idle';
          this.clearColumnTimer(colId);
        }
        else if (current === 'active') {
          this.columnStates[colId] = 'submenu';
          this.startColumnTimer(colId);
        }
      }
      else {
        if (current === 'idle') {
          this.columnStates[colId] = 'active';
          this.startColumnTimer(colId);
        }
        else {
          this.columnStates[colId] = 'idle';
          this.carouselIndex[colId] = 0;
          this.clearColumnTimer(colId);
        }
      }
    },

    onSubButtonClick(colId: number, subKey: string) {
      this.activeSubItem[colId] = subKey;
      this.columnStates[colId] = 'active';
      this.carouselIndex[colId] = 0;
      this.startColumnTimer(colId);
    },
  },
});
