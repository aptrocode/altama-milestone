import type { ColumnId, ColumnSnapshot, WallAction } from '../../shared/wall';
import { defineStore } from 'pinia';
import { WALL_CONFIG } from '~/data/wall-config';
import { COLUMN_IDS, WALL_LOCALES } from '../../shared/wall';

function getConfig(columnId: ColumnId) {
  return WALL_CONFIG.columns.find(column => column.id === columnId)!;
}

function initialColumn(columnId: ColumnId): ColumnSnapshot {
  return { phase: 'idle', locale: 'id', subItem: getConfig(columnId).defaultSub || '', slide: 0 };
}

function columnCopy(columnId: ColumnId, snapshot: ColumnSnapshot) {
  const config = getConfig(columnId);
  const copy = config.i18n?.[snapshot.locale];
  const subCopy = config.type === 'expandable'
    ? WALL_CONFIG.subItemContent[snapshot.subItem]?.[snapshot.locale]
    : undefined;
  return {
    label: copy?.label || config.label,
    headerTitle: subCopy?.title || copy?.headerTitle || config.headerTitle,
    headerDesc: subCopy?.desc || copy?.headerDesc || config.headerDesc,
    bottomTitle: subCopy?.title || copy?.bottomTitle || config.bottomTitle,
    bottomDesc: subCopy?.desc || copy?.bottomDesc || config.bottomDesc,
    activeLabel: config.subItems?.find(sub => sub.key === snapshot.subItem)?.i18n?.[snapshot.locale]?.label
      || copy?.label || config.label,
  };
}

export const useWallStore = defineStore('wall', {
  state: () => ({
    columns: Object.fromEntries(COLUMN_IDS.map(id => [id, initialColumn(id)])) as Record<ColumnId, ColumnSnapshot>,
  }),
  getters: {
    hasAnyActive: state => COLUMN_IDS.some(id => state.columns[id].phase !== 'idle'),
    getColumnState: state => (id: ColumnId) => state.columns[id].phase,
    getColumnLocale: state => (id: ColumnId) => state.columns[id].locale,
    getCarouselIndex: state => (id: ColumnId) => state.columns[id].slide,
    getColumnCopy: state => (id: ColumnId) => columnCopy(id, state.columns[id]),
    getHeaderTitle: state => (id: ColumnId) => columnCopy(id, state.columns[id]).headerTitle,
    getHeaderDesc: state => (id: ColumnId) => columnCopy(id, state.columns[id]).headerDesc,
    getBottomTitle: state => (id: ColumnId) => columnCopy(id, state.columns[id]).bottomTitle,
    getBottomDesc: state => (id: ColumnId) => columnCopy(id, state.columns[id]).bottomDesc,
  },
  actions: {
    resetColumn(id: ColumnId, preserveLocale = false) {
      const locale = this.columns[id].locale;
      this.columns[id] = initialColumn(id);
      if (preserveLocale)
        this.columns[id].locale = locale;
    },
    resetAll() {
      COLUMN_IDS.forEach(id => this.resetColumn(id, true));
    },
    dispatch(action: WallAction): boolean {
      const config = WALL_CONFIG.columns.find(column => column.id === action.columnId);
      if (!config)
        return false;
      const column = this.columns[action.columnId];

      switch (action.type) {
        case 'language':
          if (column.phase !== 'idle' || !WALL_LOCALES.includes(action.locale))
            return false;
          column.locale = action.locale;
          break;
        case 'main':
          if (column.phase !== 'idle')
            return false;
          column.phase = config.type === 'expandable' ? 'submenu' : 'active';
          break;
        case 'subItem':
          if (column.phase !== 'submenu' || !config.subItems?.some(sub => sub.key === action.subItemId))
            return false;
          column.subItem = action.subItemId;
          column.phase = 'active';
          column.slide = 0;
          break;
        case 'back':
          if (column.phase === 'idle')
            return false;
          if (column.phase === 'active' && config.type === 'expandable') {
            column.phase = 'submenu';
            column.slide = 0;
          }
          else {
            this.resetColumn(action.columnId, true);
          }
          break;
        case 'previous':
        case 'next':
          if (column.phase !== 'active')
            return false;
          column.slide = (column.slide + (action.type === 'next' ? 1 : -1) + config.slides) % config.slides;
          break;
        default:
          return false;
      }
      return true;
    },
  },
});
