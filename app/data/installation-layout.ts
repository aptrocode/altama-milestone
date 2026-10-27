import type { CloseButtonOptions } from '../../shared/close-button';
import type { ColumnLayout, Rect } from '../../shared/installation-layout';
import type { LanguageBarMode } from '../../shared/language-bar';
import type { ColumnId, WallAction } from '../../shared/wall';
import { closeTargetRect } from '../../shared/close-button';
import { installationLayout } from '../../shared/installation-layout';
import { columnOffsetY, extendDown, languageGeometry } from '../../shared/language-bar';
import { allPageTabRects } from '../../shared/page-tabs';

// Keep component imports stable; the types/data now have one framework-independent owner.
export type { Rect } from '../../shared/installation-layout';
export { installationLayout } from '../../shared/installation-layout';

export function getColumnLayout(columnId: ColumnId): ColumnLayout {
  return installationLayout.columns.find(column => column.id === columnId)!;
}

export function isPointInsideCanvas(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < installationLayout.canvas.width && y < installationLayout.canvas.height;
}

export function isPointInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

/** Logical rect as absolute CSS lengths, optionally relative to an origin rect. */
export function rectStyle(rect: Rect, origin: { x: number; y: number } = { x: 0, y: 0 }) {
  return {
    left: `calc(${rect.x - origin.x} * var(--wall-x))`,
    top: `calc(${rect.y - origin.y} * var(--wall-y))`,
    width: `calc(${rect.width} * var(--wall-x))`,
    height: `calc(${rect.height} * var(--wall-y))`,
  };
}

/** A rect moved down by the dashboard card offset (negative moves it up). */
export function offsetRect<T extends Rect>(rect: T, offsetY: number): T {
  return offsetY ? { ...rect, y: rect.y + offsetY } : rect;
}

/** Target rects of an action on the LED wall, shifted by the dashboard card offset (plus the language bar mode's raise), with that mode's language geometry. */
export function getActionRects(action: WallAction, offsetY = 0, languageBar: LanguageBarMode = 'compact', close?: CloseButtonOptions): Rect[] {
  const column = installationLayout.columns.find(item => item.id === action.columnId);
  if (!column)
    return [];
  const rects = (() => {
    switch (action.type) {
      case 'main': return column.main ? [extendDown(column.main, languageGeometry(column, languageBar).extend)] : [];
      case 'language': return languageGeometry(column, languageBar).languages.filter(item => item.locale === action.locale);
      case 'subItem': return column.subItems?.filter(item => item.key === action.subItemId) || [];
      case 'back': return [closeTargetRect(column, close, languageGeometry(column, languageBar).extend)];
      case 'previous': return [column.active.previous];
      case 'next': return [column.active.next];
      // Two or three tabs, under the photo or at the top: any arrangement of that page's tab.
      case 'page': return allPageTabRects(column.active, action.page);
    }
  })();
  return rects.map(rect => offsetRect(rect, columnOffsetY(offsetY, languageBar)));
}
