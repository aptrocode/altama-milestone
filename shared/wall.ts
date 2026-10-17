export const COLUMN_IDS = [1, 2, 3, 4, 5, 6] as const;
export const WALL_LOCALES = ['id', 'en', 'zh-Hans'] as const;

export type ColumnId = typeof COLUMN_IDS[number];
export type WallLocale = typeof WALL_LOCALES[number];
export type ColumnState = 'idle' | 'active';

export interface ColumnSnapshot {
  phase: ColumnState;
  locale: WallLocale;
  /** Selected sub-item key for expandable columns; empty for single columns. */
  subItem: string;
  /** Index in the open content's photo slider (arrows). */
  photo: number;
  /** Index of the open content's text page (tab buttons). */
  page: number;
}

/** Snapshot plus content counts, published so Sensor Service knows which arrows/tabs are visible. */
export interface PublishedColumn extends ColumnSnapshot {
  photoCount: number;
  pageCount: number;
}

export type WallAction
  = | { type: 'main' | 'back' | 'previous' | 'next'; columnId: ColumnId }
    | { type: 'subItem'; columnId: ColumnId; subItemId: string }
    | { type: 'language'; columnId: ColumnId; locale: WallLocale }
    | { type: 'page'; columnId: ColumnId; page: number };
