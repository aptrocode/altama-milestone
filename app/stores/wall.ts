import type { ColumnId, ColumnSnapshot, PublishedColumn, WallAction } from '../../shared/wall';
import { defineStore } from 'pinia';
import { getColumnConfig, getColumnContent, WALL_CONFIG } from '~/data/wall-config';
import { COLUMN_IDS, WALL_LOCALES } from '../../shared/wall';

function initialColumn(columnId: ColumnId): ColumnSnapshot {
  return { phase: 'idle', locale: 'id', subItem: getColumnConfig(columnId).defaultSub || '', photo: 0, page: 0 };
}

function columnCopy(columnId: ColumnId, snapshot: ColumnSnapshot) {
  const config = getColumnConfig(columnId);
  const label = config.i18n[snapshot.locale].label;
  const subLabel = config.subItems?.find(sub => sub.key === snapshot.subItem)?.i18n[snapshot.locale].label;
  return {
    label,
    activeLabel: config.type === 'expandable' && subLabel ? subLabel : label,
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
    getPhotoIndex: state => (id: ColumnId) => state.columns[id].photo,
    getPageIndex: state => (id: ColumnId) => state.columns[id].page,
    getColumnCopy: state => (id: ColumnId) => columnCopy(id, state.columns[id]),
    /** Snapshots plus visible arrow/tab counts for Sensor Service target selection. */
    publishedColumns: state => Object.fromEntries(COLUMN_IDS.map((id) => {
      const content = getColumnContent(getColumnConfig(id), state.columns[id].subItem);
      return [id, { ...state.columns[id], photoCount: content.photos.length, pageCount: content.pages.length }];
    })) as Record<ColumnId, PublishedColumn>,
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
      const content = getColumnContent(config, column.subItem);

      switch (action.type) {
        case 'language':
          if (column.phase !== 'idle' || !WALL_LOCALES.includes(action.locale))
            return false;
          column.locale = action.locale;
          break;
        case 'main':
          // Expandable columns open their current (default) sub-item; visitors pick tiles directly.
          if (column.phase !== 'idle')
            return false;
          column.phase = 'active';
          column.photo = 0;
          column.page = 0;
          break;
        case 'subItem':
          if (column.phase !== 'idle' || !config.subItems?.some(sub => sub.key === action.subItemId))
            return false;
          column.subItem = action.subItemId;
          column.phase = 'active';
          column.photo = 0;
          column.page = 0;
          break;
        case 'back':
          if (column.phase === 'idle')
            return false;
          this.resetColumn(action.columnId, true);
          break;
        case 'previous':
        case 'next': {
          // Arrows exist only for sliders with several photos.
          const count = content.photos.length;
          if (column.phase !== 'active' || count < 2)
            return false;
          column.photo = (column.photo + (action.type === 'next' ? 1 : -1) + count) % count;
          break;
        }
        case 'page':
          if (column.phase !== 'active' || content.pages.length < 2 || !Number.isSafeInteger(action.page)
            || action.page < 0 || action.page >= content.pages.length) {
            return false;
          }
          column.page = action.page;
          break;
        default:
          return false;
      }
      return true;
    },
  },
});
