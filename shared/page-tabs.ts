/**
 * Page tab geometry for an open card, derived from the wall-v7 layout so the wall drawing, wall
 * input validation, Sensor Service targets, and OSC show control agree without a layout bump:
 * - up to two pages: the layout's two 112 × 40 tabs under the photo frame;
 * - three pages: the same two tabs, with the third one centred under them (2 + 1 rows);
 * - a card without any photo (`tabsTop`) has no photo frame, so its tabs move up to the frame's
 *   place at the top of the card and the text starts right under them.
 */
interface Rect { x: number; y: number; width: number; height: number }
type Tab = Rect & { page: number };

export const MAX_PAGES = 3;

/** Card-relative top of the tabs when the card has no photo frame (where the frame would be). */
const TOP_TABS_Y = 35;
/** Space between the tabs and the text below them (the layout's tab bottom to text start). */
export const TEXT_GAP_UNDER_TABS = 19;
/** Space between the two tab rows when a card has three pages. */
const ROW_GAP = 8;

export function pageTabRects(active: { card: Rect; pages: Tab[] }, pageCount: number, tabsTop = false): Tab[] {
  const count = Math.min(MAX_PAGES, Math.max(0, pageCount));
  const base = active.pages;
  const y = tabsTop ? active.card.y + TOP_TABS_Y : base[0]!.y;
  const row = base.slice(0, Math.min(count, base.length)).map(tab => ({ ...tab, y }));
  if (count <= base.length)
    return row;
  // Third page: centred under the first row.
  const first = row[0]!;
  const last = row.at(-1)!;
  const centre = (first.x + last.x + last.width) / 2;
  return [...row, { page: 2, x: centre - first.width / 2, y: y + first.height + ROW_GAP, width: first.width, height: first.height }];
}

/** Extra height the tabs take below their first row (the second row of a three-page card). */
export function extraTabRows(pageCount: number, tabHeight: number): number {
  return pageCount > 2 ? tabHeight + ROW_GAP : 0;
}

/** Card-relative text start under top tabs (cards without a photo frame). */
export function textTopUnderTopTabs(tabHeight: number, pageCount = 2): number {
  return TOP_TABS_Y + tabHeight + extraTabRows(pageCount, tabHeight) + TEXT_GAP_UNDER_TABS;
}

/** Every rectangle page `page` can have in any tab arrangement (wall input validation). */
export function allPageTabRects(active: { card: Rect; pages: Tab[] }, page: number): Tab[] {
  return [2, 3].flatMap(count => [false, true].flatMap(top => pageTabRects(active, count, top).filter(tab => tab.page === page)));
}
