import type { ColumnId } from '../../shared/wall';
import type { ColumnConfig, ContentBlock, ContentPage } from '~/types/wall-content';
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

// The scroll-mode pages per page list, so merged copies keep their identity between lookups.
const scrolled = new WeakMap<ContentPage[], ContentPage[]>();

/**
 * Several pages as one: their photos (each once), every page's text in order, and `tabOf`'s tab
 * label (the page at the group's index, so groups read PAGE 1, PAGE 2, …). A heading that repeats at the start
 * of a later page is dropped, and back-to-back bullet lists join into one list.
 */
function mergePages(pages: ContentPage[], tabOf: ContentPage | undefined): ContentPage {
  const seen = new Set<string>();
  const photos = pages.flatMap(page => page.photos).filter((photo) => {
    if (!photo)
      return true;
    if (seen.has(photo.src))
      return false;
    seen.add(photo.src);
    return true;
  });
  const i18n = Object.fromEntries(WALL_LOCALES.map((locale) => {
    const blocks: ContentBlock[] = [];
    pages.forEach((page, pageIndex) => page.i18n[locale].blocks.forEach((block, blockIndex) => {
      if (pageIndex > 0 && blockIndex === 0 && typeof block === 'string' && blocks.includes(block))
        return;
      // Award logos of every page form one grid, so the merged page keeps logos above the list.
      if (typeof block !== 'string' && 'awards' in block) {
        const grid = blocks.findIndex(item => typeof item !== 'string' && 'awards' in item);
        const existing = blocks[grid];
        if (existing && typeof existing !== 'string' && 'awards' in existing) {
          blocks[grid] = { awards: [...existing.awards, ...block.awards] };
          return;
        }
      }
      const last = blocks.at(-1);
      if (last && typeof last !== 'string' && typeof block !== 'string' && 'bullets' in last && 'bullets' in block && !last.inline && !block.inline) {
        blocks[blocks.length - 1] = { ...last, bullets: [...last.bullets, ...block.bullets] };
        return;
      }
      blocks.push(block);
    }));
    return [locale, { tab: tabOf?.i18n[locale].tab, blocks }];
  })) as ContentPage['i18n'];
  return { photos, i18n };
}

/** Scroll mode: consecutive pages grouped by `scrollPages` (default: all pages as one). */
function scrollPagesOf(pages: ContentPage[], groups: number[] | undefined): ContentPage[] {
  let result = scrolled.get(pages);
  if (!result) {
    const sizes = groups?.length ? groups : [pages.length];
    let start = 0;
    result = sizes.map((size, index) => {
      const group = pages.slice(start, start + size);
      start += size;
      return group.length === 1 ? group[0]! : mergePages(group, sizes.length > 1 ? pages[index] : undefined);
    });
    scrolled.set(pages, result);
  }
  return result;
}

/**
 * Open-card pages for a column's current sub-item (expandable) or its own pages (single). With
 * Dashboard → Wall "Scroll teks" on, every card's text scrolls and its pages are grouped by its
 * `scrollPages` (default one page).
 */
export function getColumnPages(column: ColumnConfig, subItem: string, scrollText = false): ContentPage[] {
  const content = column.type === 'expandable' ? column.subItems?.find(sub => sub.key === subItem) : column;
  const pages = content?.pages || [];
  return scrollText && pages.length > 1 ? scrollPagesOf(pages, content?.scrollPages) : pages;
}
