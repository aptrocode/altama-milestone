import type { ColumnId, WallLocale } from '../../shared/wall';

/** A local file under `public/` plus its client approval state. */
export interface MediaAsset {
  src: string;
  approved: boolean;
}

/** One photo slider slot; `null` renders a numbered placeholder until the real photo exists. */
export type PhotoSlot = MediaAsset | null;

export interface BulletItem {
  lead: string;
  text?: string;
  /** One logo; shown at the right edge of the row unless `logosBelow` is set. */
  image?: MediaAsset;
  /** Several logos; always shown in a row under the text. */
  images?: MediaAsset[];
  /** Put a single logo under the text too (wide logos such as JIS · ANSI · DIN). */
  logosBelow?: boolean;
}

/**
 * A paragraph, a bullet list, or a numbered list. Bullets put their text under the bold lead
 * unless `inline` is set, which renders a compact `lead: text` list.
 */
export type ContentBlock = string | { bullets: BulletItem[]; inline?: boolean } | { numbered: string[] };

export interface PageCopy {
  /** Tab label such as a year or page; tabs render only when content has several pages. */
  tab?: string;
  /** All of the page's text (validation, and what shows when there are no `parts`). */
  blocks: ContentBlock[];
  /**
   * The page shows these block groups one after another, without buttons, every `partSeconds`
   * (default 10), starting again from the first whenever the page becomes visible.
   */
  parts?: ContentBlock[][];
  partSeconds?: number;
}

/**
 * One page of an open card: its own photo slider (arrows) and its text. Page tabs switch the
 * whole page, so photos and text change together.
 */
export interface ContentPage {
  photos: PhotoSlot[];
  i18n: Record<WallLocale, PageCopy>;
}

export interface SubItem {
  key: string;
  /** Idle tile artwork: a full-bleed tile design, or a transparent logo when `tileBackground` is set. */
  image: MediaAsset;
  /** Brand colour behind a transparent logo; the logo is then centred with the same padding on every tile. */
  tileBackground?: string;
  /** Logo shown under the column title while the sub-item is open; text label otherwise. */
  wordmark?: MediaAsset;
  i18n: Record<WallLocale, { label: string }>;
  pages: ContentPage[];
}

export type ColumnIcon = 'building' | 'gear' | 'warehouse' | 'person' | 'pin' | 'people';

export interface ColumnConfig {
  id: ColumnId;
  key: string;
  type: 'single' | 'expandable';
  icon: ColumnIcon;
  i18n: Record<WallLocale, { label: string }>;
  /** Idle card artwork (usually a transparent video with the frame baked in); expandable columns draw their tiles over it. */
  illustration?: MediaAsset;
  /** Open-card pages for single columns; expandable columns use their sub-item pages. */
  pages?: ContentPage[];
  /** Sub-items chosen directly from idle tiles (expandable columns). */
  subItems?: SubItem[];
  /** Show sub-item captions on their tiles (images without their own lettering). */
  captionTiles?: boolean;
  /** Sub-item opened by the operator/OSC `main` action. */
  defaultSub?: string;
  /** With Dashboard → Wall "Scroll teks" on, the open card's text scrolls vertically (several pages merge into one). */
  scrollMerge?: boolean;
}
