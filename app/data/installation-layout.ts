import type { ColumnId, WallAction, WallLocale } from '../../shared/wall';
import rawLayout from '../../shared/installation-layout.json';

export interface Rect { x: number; y: number; width: number; height: number }

interface ColumnLayout {
  id: ColumnId;
  section: Rect;
  card: Rect;
  languageBar: Rect;
  main: Rect;
  languages: (Rect & { locale: WallLocale })[];
  submenu?: { back: Rect; items: (Rect & { key: string })[] };
  active: { back: Rect; previous: Rect; next: Rect };
}

interface InstallationLayout {
  layoutVersion: string;
  protocolVersion: number;
  canvas: { width: number; height: number };
  frame: { inset: number; gap: number };
  zones: { header: number; interactive: number; footer: number };
  controls: Record<string, number>;
  columns: ColumnLayout[];
}

export const installationLayout = rawLayout as InstallationLayout;

export function isPointInsideCanvas(x: number, y: number): boolean {
  return x >= 0 && y >= 0 && x < installationLayout.canvas.width && y < installationLayout.canvas.height;
}

export function isPointInsideRect(x: number, y: number, rect: Rect): boolean {
  return x >= rect.x && y >= rect.y && x < rect.x + rect.width && y < rect.y + rect.height;
}

export function getActionRects(action: WallAction): Rect[] {
  const column = installationLayout.columns.find(item => item.id === action.columnId);
  if (!column)
    return [];
  switch (action.type) {
    case 'main': return [column.main];
    case 'language': return column.languages.filter(item => item.locale === action.locale);
    case 'subItem': return column.submenu?.items.filter(item => item.key === action.subItemId) || [];
    case 'back': return column.submenu ? [column.submenu.back, column.active.back] : [column.active.back];
    case 'previous': return [column.active.previous];
    case 'next': return [column.active.next];
  }
}
