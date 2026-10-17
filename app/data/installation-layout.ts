import type { ColumnId, WallAction, WallLocale } from '../../shared/wall';
import rawLayout from '../../shared/installation-layout.json';

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
  logo: { idle: { y: number; height: number }; compact: { y: number; height: number } };
  idlePill: Rect;
  activePill: Rect;
  subtitle: Rect;
  artwork: Rect;
  photo: Rect;
  textTop: { tabs: number; photo: number; plain: number };
  rail: { y: number; height: number };
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

export function getActionRects(action: WallAction): Rect[] {
  const column = installationLayout.columns.find(item => item.id === action.columnId);
  if (!column)
    return [];
  switch (action.type) {
    case 'main': return column.main ? [column.main] : [];
    case 'language': return column.languages.filter(item => item.locale === action.locale);
    case 'subItem': return column.subItems?.filter(item => item.key === action.subItemId) || [];
    case 'back': return [column.active.back];
    case 'previous': return [column.active.previous];
    case 'next': return [column.active.next];
    case 'page': return column.active.pages.filter(item => item.page === action.page);
  }
}
