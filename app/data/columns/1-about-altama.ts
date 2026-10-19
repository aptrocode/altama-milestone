import type { ColumnConfig } from '~/types/wall-content';
import { page, pendingPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

/** Column 1 — Tentang Altama. Pages: 1960 / 1996, each with its own photo slider. */
export const ABOUT_ALTAMA: ColumnConfig = {
  id: 1,
  key: 'about-altama',
  type: 'single',
  icon: 'building',
  illustration: provisional('/illustrations/about-altama.webm'),
  i18n: {
    'id': { label: 'TENTANG ALTAMA' },
    'en': { label: 'ABOUT ALTAMA' },
    'zh-Hans': { label: '关于 ALTAMA' },
  },
  pages: [
    page([provisional('/photos/about-altama/photo-1.webp'), PHOTO_PLACEHOLDER], {
      'id': { tab: '1960', blocks: ['Berawal dari CV. Sumber Daya Group, bisnis keluarga yang telah menapaki industri sejak 1967 hampir enam dekade pengalaman menjadi fondasi ALTAMA hari ini'] },
      'en': { tab: '1960', blocks: ['It began with CV. Sumber Daya Group, a family business in the industry since 1967; nearly six decades of experience form the foundation of ALTAMA today'] },
      'zh-Hans': { tab: '1960', blocks: ['ALTAMA 起源于家族企业 CV. Sumber Daya Group，自 1967 年起深耕行业，近六十年的经验奠定了今日 ALTAMA 的基础'] },
    }),
    pendingPage([PHOTO_PLACEHOLDER, PHOTO_PLACEHOLDER], { 'id': '1996', 'en': '1996', 'zh-Hans': '1996' }),
  ],
};
