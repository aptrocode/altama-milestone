import type { ColumnId } from '../../shared/wall';
import type { ColumnConfig, ContentPage } from '~/types/wall-content';
import { WALL_LOCALES } from '../../shared/wall';
import { ABOUT_ALTAMA } from './columns/1-about-altama';
import { OUR_BRANDS } from './columns/2-our-brands';
import { INFRASTRUCTURE } from './columns/3-infrastructure';
import { DIGITAL_TRUST } from './columns/4-digital-trust';
import { DISTRIBUTION } from './columns/5-distribution';
import { SUMMIT_2026 } from './columns/6-summit-2026';

/**
 * The six wall columns in display order. Each column's labels, artwork, tiles, pages, and photos
 * live in its own file under `app/data/columns/`; see docs/content.md.
 */
export const WALL_CONFIG: { columns: ColumnConfig[] } = {
  columns: [ABOUT_ALTAMA, OUR_BRANDS, INFRASTRUCTURE, DIGITAL_TRUST, DISTRIBUTION, SUMMIT_2026],
};

export function getColumnConfig(columnId: ColumnId): ColumnConfig {
  return WALL_CONFIG.columns.find(column => column.id === columnId)!;
}

// One merged page per page list, so the merged copy keeps its identity between lookups.
const merged = new WeakMap<ContentPage[], ContentPage[]>();

/** All pages as one: the first page's photos and every page's text in order, without a tab. */
function mergePages(pages: ContentPage[]): ContentPage[] {
  let result = merged.get(pages);
  if (!result) {
    const i18n = Object.fromEntries(WALL_LOCALES.map(locale => [locale, { blocks: pages.flatMap(page => page.i18n[locale].blocks) }])) as ContentPage['i18n'];
    result = [{ photos: pages[0]?.photos ?? [], i18n }];
    merged.set(pages, result);
  }
  return result;
}

/** The open card's text scrolls vertically: Dashboard → Wall "Scroll teks" on and a `scrollMerge` column. */
export function scrollsText(column: ColumnConfig, scrollText: boolean): boolean {
  return scrollText && !!column.scrollMerge;
}

/**
 * Open-card pages for a column's current sub-item (expandable) or its own pages (single). With
 * "Scroll teks" on, a `scrollMerge` column shows them merged into one scrolling page.
 */
export function getColumnPages(column: ColumnConfig, subItem: string, scrollText = false): ContentPage[] {
  const pages = column.type === 'expandable'
    ? column.subItems?.find(sub => sub.key === subItem)?.pages || []
    : column.pages || [];
  return scrollsText(column, scrollText) && pages.length > 1 ? mergePages(pages) : pages;
}
