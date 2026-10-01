export const COLUMN_IDS = [1, 2, 3, 4, 5, 6] as const;
export const WALL_LOCALES = ['id', 'en', 'zh-Hans'] as const;

export type ColumnId = typeof COLUMN_IDS[number];
export type WallLocale = typeof WALL_LOCALES[number];
export type ColumnState = 'idle' | 'submenu' | 'active';

export interface ColumnSnapshot {
  phase: ColumnState;
  locale: WallLocale;
  subItem: string;
  slide: number;
}

export type WallAction
  = | { type: 'main' | 'back' | 'previous' | 'next'; columnId: ColumnId }
    | { type: 'subItem'; columnId: ColumnId; subItemId: string }
    | { type: 'language'; columnId: ColumnId; locale: WallLocale };
