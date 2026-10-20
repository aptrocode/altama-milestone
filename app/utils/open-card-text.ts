import type { Rect } from '~/data/installation-layout';
import type { ContentPage } from '~/types/wall-content';
import { installationLayout } from '~/data/installation-layout';
import { extraTabRows, textTopUnderTopTabs } from '../../shared/page-tabs';

/** Card-relative insets of the open-card text box (logical px). */
export const TEXT_INSET = { left: 26, right: 24, bottom: 20 } as const;

/**
 * Card-relative top of the open-card text: below whichever of the photo frame and page tabs the
 * card shows. Shared by WallOpenCard and the dashboard's fit check, so both use the same box.
 */
export function openCardTextTop(geometry: { pages: Rect[] }, pages: ContentPage[], showPages = true): number {
  const visual = installationLayout.visual;
  const hasPhotoFrame = pages.some(item => item.photos.length > 0);
  if (showPages && pages.length > 1) {
    const tabHeight = geometry.pages[0]!.height;
    return hasPhotoFrame ? visual.textTop.tabs + extraTabRows(pages.length, tabHeight) : textTopUnderTopTabs(tabHeight, pages.length);
  }
  return hasPhotoFrame ? visual.textTop.photo : visual.textTop.plain;
}
