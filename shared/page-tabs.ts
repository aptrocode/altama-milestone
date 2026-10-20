/**
 * Page tab geometry for an open card, derived from the wall-v7 layout so the wall drawing, wall
 * input validation, Sensor Service targets, and OSC show control agree without a layout bump:
 * - up to two pages: the layout's two 112 × 40 tabs under the photo frame;
 * - three pages: 2 + 1 rows of half-width tabs spanning the card's inner width (the text inset),
 *   the third one centred under the first two, with the same gap across and down;
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
/** Three pages: side inset (the text's) and the gap between tabs, across and down alike. */
const THREE = { inset: 24, gap: 8 } as const;

export function pageTabRects(active: { card: Rect; pages: Tab[] }, pageCount: number, tabsTop = false): Tab[] {
  const count = Math.min(MAX_PAGES, Math.max(0, pageCount));
  const base = active.pages;
  const y = tabsTop ? active.card.y + TOP_TABS_Y : base[0]!.y;
  if (count <= base.length)
    return base.slice(0, count).map(tab => ({ ...tab, y }));
  const height = base[0]!.height;
  const width = (active.card.width - 2 * THREE.inset - THREE.gap) / 2;
  const left = active.card.x + THREE.inset;
  return [
    { page: 0, x: left, y, width, height },
    { page: 1, x: left + width + THREE.gap, y, width, height },
    { page: 2, x: active.card.x + (active.card.width - width) / 2, y: y + height + THREE.gap, width, height },
  ];
}

/** Extra height the tabs take below their first row (the second row of a three-page card). */
export function extraTabRows(pageCount: number, tabHeight: number): number {
  return pageCount > 2 ? tabHeight + THREE.gap : 0;
}

/** Card-relative text start under top tabs (cards without a photo frame). */
export function textTopUnderTopTabs(tabHeight: number, pageCount = 2): number {
  return TOP_TABS_Y + tabHeight + extraTabRows(pageCount, tabHeight) + TEXT_GAP_UNDER_TABS;
}

/** Every rectangle page `page` can have in any tab arrangement (wall input validation). */
export function allPageTabRects(active: { card: Rect; pages: Tab[] }, page: number): Tab[] {
  return [2, 3].flatMap(count => [false, true].flatMap(top => pageTabRects(active, count, top).filter(tab => tab.page === page)));
}
