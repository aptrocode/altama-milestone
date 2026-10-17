import type { ColumnId } from '../../shared/wall';
import type { ColumnConfig, ContentPage } from '~/types/wall-content';
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

/** Open-card pages for a column's current sub-item (expandable) or its own pages (single). */
export function getColumnPages(column: ColumnConfig, subItem: string): ContentPage[] {
  return column.type === 'expandable'
    ? column.subItems?.find(sub => sub.key === subItem)?.pages || []
    : column.pages || [];
}
