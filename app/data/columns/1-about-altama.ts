import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, provisional } from './helpers';

/** Column 1 — Tentang Altama. Single card page with a 2-photo slider. */
export const ABOUT_ALTAMA: ColumnConfig = {
  id: 1,
  key: 'about-altama',
  type: 'single',
  // Trial: with Dashboard → Wall "Scroll teks" on, the text keeps its largest size and scrolls.
  scrollMerge: true,
  icon: 'building',
  illustration: provisional('/illustrations/about-altama.webm'),
  i18n: {
    'id': { label: 'TENTANG ALTAMA' },
    'en': { label: 'ABOUT ALTAMA' },
    'zh-Hans': { label: '关于 ALTAMA' },
  },
  pages: [
    onlyPage(
      [
        provisional('/photos/about-altama/photo-1.webp'),
        provisional('/photos/about-altama/photo-2.webp'),
      ],
      {
        'id': [
          'Berawal dari CV. Sumber Daya Group, bisnis keluarga yang telah menapaki industri sejak 1967 hampir enam dekade pengalaman menjadi fondasi ALTAMA hari ini',
          'Resmi berdiri sebagai badan usaha pada 1996, menjadi titik awal Altama seperti yang dikenal luas sekarang.',
        ],
        'en': [
          'Originating from CV. Sumber Daya Group, a family business in the industry since 1967, nearly six decades of experience form the foundation of ALTAMA today.',
          'Officially established as a business entity in 1996, marking the beginning of Altama as widely known today.',
        ],
        'zh-Hans': [
          'ALTAMA 起源于自 1967 年起深耕行业的家族企业 CV. Sumber Daya Group，近六十年的丰富经验奠定了今日 ALTAMA 的基石。',
          '1996 年正式成立为法人企业，成为如今广为人知的 ALTAMA 的起点。',
        ],
      },
    ),
  ],
};
