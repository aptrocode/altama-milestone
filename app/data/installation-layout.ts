import type { CloseButtonOptions } from '../../shared/close-button';
import type { LanguageBarMode } from '../../shared/language-bar';
import type { ColumnId, WallAction, WallLocale } from '../../shared/wall';
import { closeTargetRect } from '../../shared/close-button';
import rawLayout from '../../shared/installation-layout.json';
import { columnOffsetY, extendDown, languageGeometry } from '../../shared/language-bar';
import { allPageTabRects } from '../../shared/page-tabs';

export interface Rect { x: number; y: number; width: number; height: number }

interface ColumnLayout {
  id: ColumnId;
  section: Rect;
  /** Idle frame. */
  card: Rect;
  /** Idle hold target of single columns; expandable columns use their sub-item tiles instead. */
  main?: Rect;
  languageBar: Rect;
  languages: (Rect & { locale: WallLocale })[];
  /** Idle sub-item tiles of expandable columns. */
  subItems?: (Rect & { key: string })[];
  active: { card: Rect; back: Rect; previous: Rect; next: Rect; pages: (Rect & { page: number })[] };
}

interface VisualLayout {
  logo: { idle: { y: number; height: number } };
  idlePill: Rect;
  /** Open pill of expandable columns, leaving room for the sub-item name above the card. */
  activePill: Rect;
  /** Open pill of single columns, 20 px above the card (no sub-item name). */
  activePillSingle: Rect;
  subtitle: Rect;
  artwork: Rect;
  photo: Rect;
  textTop: { tabs: number; photo: number; plain: number };
  /** Lowest bottom edge of an open card; cards grow with their content from `active.card.height` up to it. */
  openCardMaxBottom: number;
  /** Window into one column for the stacked (mobile/tablet) layout, in logical units. */
  stacked: {
    padX: number;
    idle: { y: number; height: number };
    open: { y: number; height: number };
    openSingle: { y: number; height: number };
  };
}

interface InstallationLayout {
  layoutVersion: string;
  protocolVersion: number;
  canvas: { width: number; height: number };
  frame: { inset: number; gap: number; columnWidth: number };
  visual: VisualLayout;
  columns: ColumnLayout[];
}

export const installationLayout = rawLayout as InstallationLayout;

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
