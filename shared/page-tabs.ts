/**
 * Page tab geometry for an open card, derived from the wall-v7 layout so the wall drawing, wall
 * input validation, Sensor Service targets, and OSC show control agree without a layout bump:
 * - up to two pages: the layout's two 112 × 40 tabs under the photo frame;
 * - three or four pages: rows of two half-width tabs spanning the card's inner width (the text
 *   inset), 2 + 1 (the third centred) or 2 + 2, with the same gap across and down;
 * - a card without any photo (`tabsTop`) has no photo frame, so its tabs move up to the frame's
 *   place at the top of the card and the text starts right under them.
 */
interface Rect { x: number; y: number; width: number; height: number }
type Tab = Rect & { page: number };

export const MAX_PAGES = 4;

/** Card-relative top of the tabs when the card has no photo frame (where the frame would be). */
const TOP_TABS_Y = 35;
/** Space between the tabs and the text below them (the layout's tab bottom to text start). */
export const TEXT_GAP_UNDER_TABS = 19;
/** Three or four pages: side inset (the text's) and the gap between tabs, across and down alike. */
const GRID = { inset: 24, gap: 8 } as const;

export function pageTabRects(active: { card: Rect; pages: Tab[] }, pageCount: number, tabsTop = false): Tab[] {
  const count = Math.min(MAX_PAGES, Math.max(0, pageCount));
  const base = active.pages;
  const y = tabsTop ? active.card.y + TOP_TABS_Y : base[0]!.y;
  if (count <= base.length)
    return base.slice(0, count).map(tab => ({ ...tab, y }));
  const height = base[0]!.height;
  const width = (active.card.width - 2 * GRID.inset - GRID.gap) / 2;
  const left = active.card.x + GRID.inset;
  return Array.from({ length: count }, (_, page) => {
    const row = Math.floor(page / 2);
    // A last tab alone in its row is centred.
    const x = page === count - 1 && page % 2 === 0
      ? active.card.x + (active.card.width - width) / 2
      : left + (page % 2) * (width + GRID.gap);
    return { page, x, y: y + row * (height + GRID.gap), width, height };
  });
}

/** Extra height the tabs take below their first row (the second row of a three- or four-page card). */
export function extraTabRows(pageCount: number, tabHeight: number): number {
  return pageCount > 2 ? tabHeight + GRID.gap : 0;
}

/** Card-relative text start under top tabs (cards without a photo frame). */
export function textTopUnderTopTabs(tabHeight: number, pageCount = 2): number {
  return TOP_TABS_Y + tabHeight + extraTabRows(pageCount, tabHeight) + TEXT_GAP_UNDER_TABS;
}

/** Every rectangle page `page` can have in any tab arrangement (wall input validation). */
export function allPageTabRects(active: { card: Rect; pages: Tab[] }, page: number): Tab[] {
  return [2, 3, 4].flatMap(count => [false, true].flatMap(top => pageTabRects(active, count, top).filter(tab => tab.page === page)));
}
