import type { ColumnId, ColumnSnapshot, PublishedColumn, WallAction } from '../../shared/wall';
import { defineStore } from 'pinia';
import { getColumnConfig, getColumnPages, WALL_CONFIG } from '~/data/wall-config';
import { useSettingsStore } from '~/stores/settings';
import { COLUMN_IDS, WALL_LOCALES } from '../../shared/wall';

function initialColumn(columnId: ColumnId): ColumnSnapshot {
  return { phase: 'idle', locale: 'id', subItem: getColumnConfig(columnId).defaultSub || '', photo: 0, page: 0 };
}

/** The pages a column shows now (grouped by `scrollPages` while Dashboard → Wall "Scroll teks" is on). */
function pagesOf(columnId: ColumnId, subItem: string) {
  return getColumnPages(getColumnConfig(columnId), subItem, useSettingsStore().wall.scrollText);
}

/** Photo count of the page currently shown in a column (0 when the page has no slider). */
function photoCount(columnId: ColumnId, snapshot: ColumnSnapshot): number {
  return pagesOf(columnId, snapshot.subItem)[snapshot.page]?.photos.length || 0;
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
      const snapshot = state.columns[id];
      const pages = pagesOf(id, snapshot.subItem);
      const pageCount = pages.length;
      const tabsTop = !pages.some(page => page.photos.length > 0);
      // In scroll mode only cards that keep several pages (section 2) have them; their tabs always show.
      const tabsAlways = useSettingsStore().wall.scrollText && pageCount > 1;
      return [id, { ...snapshot, photoCount: photoCount(id, snapshot), pageCount, tabsTop, tabsAlways }];
    })) as Record<ColumnId, PublishedColumn>,
  },
  actions: {
    resetColumn(id: ColumnId, preserveLocale = false) {
      const locale = this.columns[id].locale;
      this.columns[id] = initialColumn(id);
      if (preserveLocale)
        this.columns[id].locale = locale;
    },
    /** A column whose page count shrank (Dashboard → Wall "Scroll teks" merging pages) shows its first page. */
    clampPage(id: ColumnId) {
      const column = this.columns[id];
      if (column.page > 0 && column.page >= pagesOf(id, column.subItem).length) {
        column.page = 0;
        column.photo = 0;
      }
    },
    resetAll() {
      COLUMN_IDS.forEach(id => this.resetColumn(id, true));
    },
    dispatch(action: WallAction): boolean {
      const config = WALL_CONFIG.columns.find(column => column.id === action.columnId);
      if (!config)
        return false;
      const column = this.columns[action.columnId];
      const pages = pagesOf(config.id, column.subItem);

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
          // Arrows exist only when the current page's slider has several photos.
          const count = photoCount(action.columnId, column);
          if (column.phase !== 'active' || count < 2)
            return false;
          column.photo = (column.photo + (action.type === 'next' ? 1 : -1) + count) % count;
          break;
        }
        case 'page':
          // The visible page's tab is inert: re-selecting it is not a page change.
          if (column.phase !== 'active' || pages.length < 2 || !Number.isSafeInteger(action.page)
            || action.page < 0 || action.page >= pages.length || action.page === column.page) {
            return false;
          }
          // Each page owns its photos, so switching pages restarts its slider.
          column.page = action.page;
          column.photo = 0;
          break;
        default:
          return false;
      }
      return true;
    },
  },
});
