/**
 * Page tab geometry for an open card, derived from the wall-v7 layout so the wall drawing, wall
 * input validation, Sensor Service targets, and OSC show control agree without a layout bump:
 * - up to two pages: the layout's two 112 × 40 tabs under the photo frame;
 * - three pages: three 96 × 40 tabs centred across the card at the same height;
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
const THREE = { width: 96, gap: 6 } as const;

export function pageTabRects(active: { card: Rect; pages: Tab[] }, pageCount: number, tabsTop = false): Tab[] {
  const count = Math.min(MAX_PAGES, Math.max(0, pageCount));
  const base = active.pages;
  const y = tabsTop ? active.card.y + TOP_TABS_Y : base[0]!.y;
  if (count <= base.length)
    return base.slice(0, count).map(tab => ({ ...tab, y }));
  const total = THREE.width * count + THREE.gap * (count - 1);
  const left = active.card.x + (active.card.width - total) / 2;
  return Array.from({ length: count }, (_, page) => ({ page, x: left + page * (THREE.width + THREE.gap), y, width: THREE.width, height: base[0]!.height }));
}

/** Card-relative text start under top tabs (cards without a photo frame). */
export function textTopUnderTopTabs(tabHeight: number): number {
  return TOP_TABS_Y + tabHeight + TEXT_GAP_UNDER_TABS;
}

/** Every rectangle page `page` can have in any tab arrangement (wall input validation). */
export function allPageTabRects(active: { card: Rect; pages: Tab[] }, page: number): Tab[] {
  return [2, 3].flatMap(count => [false, true].flatMap(top => pageTabRects(active, count, top).filter(tab => tab.page === page)));
}
