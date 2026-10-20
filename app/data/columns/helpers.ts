import type { WallLocale } from '../../../shared/wall';
import type { ContentBlock, ContentPage, MediaAsset, PageCopy, PhotoSlot } from '~/types/wall-content';

/** Mockup crop or stand-in file that the client has not approved yet. */
export function provisional(src: string): MediaAsset {
  return { src, approved: false };
}

/** Empty photo slot shown as a numbered placeholder. */
export const PHOTO_PLACEHOLDER = null;

/** A page with a tab label and copy in every language. */
export function page(photos: PhotoSlot[], i18n: Record<WallLocale, PageCopy>): ContentPage {
  return { photos, i18n };
}

/** The only page of a card: no tab label is needed. */
export function onlyPage(photos: PhotoSlot[], blocks: Record<WallLocale, ContentBlock[]>): ContentPage {
  return { photos, i18n: { 'id': { blocks: blocks.id }, 'en': { blocks: blocks.en }, 'zh-Hans': { blocks: blocks['zh-Hans'] } } };
}

/** A page whose copy the client has not supplied yet. */
export function pendingPage(photos: PhotoSlot[], tabs: Record<WallLocale, string>): ContentPage {
  return page(photos, {
    'id': { tab: tabs.id, blocks: ['Materi halaman ini menunggu konfirmasi klien.'] },
    'en': { tab: tabs.en, blocks: ['Content for this page is awaiting client confirmation.'] },
    'zh-Hans': { tab: tabs['zh-Hans'], blocks: ['本页内容正在等待客户确认。'] },
  });
}

export const PAGE_TABS = {
  first: { 'id': 'PAGE 1', 'en': 'PAGE 1', 'zh-Hans': '第 1 页' },
  second: { 'id': 'PAGE 2', 'en': 'PAGE 2', 'zh-Hans': '第 2 页' },
  third: { 'id': 'PAGE 3', 'en': 'PAGE 3', 'zh-Hans': '第 3 页' },
} as const satisfies Record<string, Record<WallLocale, string>>;
