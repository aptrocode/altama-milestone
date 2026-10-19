import type { OscMessage } from '../shared/osc';
import type { Rect } from '../shared/sensor-targets';
import type { ColumnId, ColumnSnapshot, WallAction } from '../shared/wall';
import rawLayout from '../shared/installation-layout.json';
import { oscToWallActions } from '../shared/osc';

interface ShowControlColumn {
  id: number;
  card: Rect;
  main?: Rect;
  languageBar: Rect;
  languages: (Rect & { locale: string })[];
  subItems?: (Rect & { key: string })[];
  active: { card: Rect; back: Rect; previous: Rect; next: Rect; pages: (Rect & { page: number })[] };
}

const columns = rawLayout.columns as ShowControlColumn[];

/** Brand/distribution columns have no main target; OSC "open" selects their first tile instead. */
function toTargetAction(action: WallAction): WallAction {
  const column = columns.find(col => col.id === action.columnId);
  if (action.type === 'main' && !column?.main && column?.subItems?.[0])
    return { type: 'subItem', columnId: action.columnId, subItemId: column.subItems[0].key };
  return action;
}

/** Declared target of an action, or null when wall-v5 has none (page 3, unknown sub-item), which the renderer would reject. */
function targetRect(action: WallAction): Rect | null {
  const column = columns.find(col => col.id === action.columnId);
  if (!column)
    return null;
  switch (action.type) {
    case 'main': return column.main ?? null;
    case 'back': return column.active.back;
    case 'previous': return column.active.previous;
    case 'next': return column.active.next;
    case 'page': return column.active.pages.find(item => item.page === action.page) ?? null;
    case 'subItem': return column.subItems?.find(item => item.key === action.subItemId) ?? null;
    case 'language': return column.languages.find(item => item.locale === action.locale) ?? null;
  }
}

/** /altama/* show-control messages as wall actions at the centre of their declared target; unmappable ones are dropped. */
export function showControlInputs(messages: OscMessage[], snapshots: Record<ColumnId, ColumnSnapshot>): { action: WallAction; x: number; y: number }[] {
  return messages.flatMap(message => oscToWallActions(message, snapshots).map(toTargetAction).flatMap((action) => {
    const rect = targetRect(action);
    return rect ? [{ action, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }] : [];
  }));
}
