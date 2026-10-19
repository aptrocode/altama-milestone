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
  /** Hold group (dashboard rule) or null for language/Back, which only need a short deliberate contact. */
  group: HoldGroup | null;
  /** Area inside rect that never triggers this target (the language overlay over main). */
  exclude?: Rect;
}

export function isInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

function target(action: WallAction, key: string, rect: Rect, exclude?: Rect): SensorTarget {
  return { key, action, rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, group: HOLD_GROUP_BY_ACTION[action.type] ?? null, ...(exclude ? { exclude } : {}) };
}

/**
 * Targets visible for each column's published snapshot (docs/sensor.md). Overlays come first
 * (language, Back) so they win over the frame below them. Columns without a snapshot have none.
 */
export function visibleTargets(snapshots: Partial<Record<ColumnId, PublishedColumn>>): SensorTarget[] {
  const targets: SensorTarget[] = [];
  for (const columnId of COLUMN_IDS) {
    const snapshot = snapshots[columnId];
    const geometry = columns.find(column => column.id === columnId);
    if (!snapshot || !geometry)
      continue;

    if (snapshot.phase === 'idle') {
      for (const language of geometry.languages)
        targets.push(target({ type: 'language', columnId, locale: language.locale as WallLocale }, `${columnId}:language:${language.locale}`, language));
      for (const item of geometry.subItems ?? [])
        targets.push(target({ type: 'subItem', columnId, subItemId: item.key }, `${columnId}:subItem:${item.key}`, item));
      if (geometry.main)
        targets.push(target({ type: 'main', columnId }, `${columnId}:main`, geometry.main, geometry.languageBar));
      continue;
    }

    targets.push(target({ type: 'back', columnId }, `${columnId}:back`, geometry.active.back));
    if ((snapshot.photoCount ?? 0) > 1) {
      targets.push(target({ type: 'previous', columnId }, `${columnId}:previous`, geometry.active.previous));
      targets.push(target({ type: 'next', columnId }, `${columnId}:next`, geometry.active.next));
    }
    const pageCount = snapshot.pageCount ?? 0;
    if (pageCount > 1) {
      for (const page of geometry.active.pages.filter(item => item.page < pageCount))
        targets.push(target({ type: 'page', columnId, page: page.page }, `${columnId}:page:${page.page}`, page));
    }
  }
  return targets;
}

/** First visible target under a logical point, or null (gaps, padding, and the language overlay over main). */
export function hitTest(x: number, y: number, targets: SensorTarget[]): SensorTarget | null {
  return targets.find(item => isInsideRect(x, y, item.rect) && !(item.exclude && isInsideRect(x, y, item.exclude))) ?? null;
}
