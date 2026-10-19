import type { HoldGroup } from './hold-settings';
import type { ColumnId, PublishedColumn, WallAction, WallLocale } from './wall';
import { HOLD_GROUP_BY_ACTION } from './hold-settings';
import rawLayout from './installation-layout.json';
import { COLUMN_IDS } from './wall';

export interface Rect { x: number; y: number; width: number; height: number }

interface ColumnGeometry {
  id: number;
  card: Rect;
  main?: Rect;
  languageBar: Rect;
  languages: (Rect & { locale: string })[];
  subItems?: (Rect & { key: string })[];
  active: { card: Rect; back: Rect; previous: Rect; next: Rect; pages: (Rect & { page: number })[] };
}

const columns = rawLayout.columns as ColumnGeometry[];

export const SENSOR_LAYOUT_VERSION: string = rawLayout.layoutVersion;

/** A target a contact can trigger, with the logical rectangle the renderer validates. */
export interface SensorTarget {
  /** Stable key, e.g. `1:main`, `2:subItem:tekiro`, `4:language:en`, `1:page:1`. */
  key: string;
  action: WallAction;
  rect: Rect;
  /** Hold group (dashboard rule); null only for an action without one. */
  group: HoldGroup | null;
  /** Area inside rect that never triggers this target (the language overlay over main). */
  exclude?: Rect;
}

/** Dashboard wall settings that change which targets exist and where. */
export interface TargetOptions { offsetY?: number; showClose?: boolean; showArrows?: boolean }

export function isInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

function target(action: WallAction, key: string, rect: Rect, offsetY: number, exclude?: Rect): SensorTarget {
  const shift = (box: Rect): Rect => ({ x: box.x, y: box.y + offsetY, width: box.width, height: box.height });
  return { key, action, rect: shift(rect), group: HOLD_GROUP_BY_ACTION[action.type] ?? null, ...(exclude ? { exclude: shift(exclude) } : {}) };
}

/**
 * Targets visible for each column's published snapshot (docs/sensor.md). Overlays come first
 * (language, Back) so they win over the frame below them. Columns without a snapshot have none.
 * `offsetY` is the wall's dashboard card offset: every column, and so every target, moves by it.
 * `showClose: false` hides the open card's close button, so it has no Back target either;
 * `showArrows: false` hides the photo arrows (photos auto-slide), so previous/next go too.
 */
export function visibleTargets(snapshots: Partial<Record<ColumnId, PublishedColumn>>, options: TargetOptions = {}): SensorTarget[] {
  const { offsetY = 0, showClose = true, showArrows = true } = options;
  const targets: SensorTarget[] = [];
  for (const columnId of COLUMN_IDS) {
    const snapshot = snapshots[columnId];
    const geometry = columns.find(column => column.id === columnId);
    if (!snapshot || !geometry)
      continue;

    if (snapshot.phase === 'idle') {
      for (const language of geometry.languages)
        targets.push(target({ type: 'language', columnId, locale: language.locale as WallLocale }, `${columnId}:language:${language.locale}`, language, offsetY));
      for (const item of geometry.subItems ?? [])
        targets.push(target({ type: 'subItem', columnId, subItemId: item.key }, `${columnId}:subItem:${item.key}`, item, offsetY));
      if (geometry.main)
        targets.push(target({ type: 'main', columnId }, `${columnId}:main`, geometry.main, offsetY, geometry.languageBar));
      continue;
    }

    if (showClose)
      targets.push(target({ type: 'back', columnId }, `${columnId}:back`, geometry.active.back, offsetY));
    if (showArrows && (snapshot.photoCount ?? 0) > 1) {
      targets.push(target({ type: 'previous', columnId }, `${columnId}:previous`, geometry.active.previous, offsetY));
      targets.push(target({ type: 'next', columnId }, `${columnId}:next`, geometry.active.next, offsetY));
    }
    const pageCount = snapshot.pageCount ?? 0;
    if (pageCount > 1) {
      // The visible page's tab is inert, so only the other tab is a target.
      for (const page of geometry.active.pages.filter(item => item.page < pageCount && item.page !== snapshot.page))
        targets.push(target({ type: 'page', columnId, page: page.page }, `${columnId}:page:${page.page}`, page, offsetY));
    }
  }
  return targets;
}

/** First visible target under a logical point, or null (gaps, padding, and the language overlay over main). */
export function hitTest(x: number, y: number, targets: SensorTarget[]): SensorTarget | null {
  return targets.find(item => isInsideRect(x, y, item.rect) && !(item.exclude && isInsideRect(x, y, item.exclude))) ?? null;
}
