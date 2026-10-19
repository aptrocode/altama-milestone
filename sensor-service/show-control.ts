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

function targetRect(action: WallAction): Rect {
  const column = columns.find(col => col.id === action.columnId)!;
  switch (action.type) {
    case 'main': return column.main ?? column.card;
    case 'back': return column.active.back;
    case 'previous': return column.active.previous;
    case 'next': return column.active.next;
    case 'page': return column.active.pages.find(item => item.page === action.page) ?? column.active.card;
    case 'subItem': return column.subItems?.find(item => item.key === action.subItemId) ?? column.card;
    case 'language': return column.languages.find(item => item.locale === action.locale) ?? column.languageBar;
  }
}

/** /altama/* show-control messages as wall actions at the centre of their declared target. */
export function showControlInputs(messages: OscMessage[], snapshots: Record<ColumnId, ColumnSnapshot>): { action: WallAction; x: number; y: number }[] {
  return messages.flatMap(message => oscToWallActions(message, snapshots).map(toTargetAction).map((action) => {
    const rect = targetRect(action);
    return { action, x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  }));
}
