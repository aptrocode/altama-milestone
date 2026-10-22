import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, provisional } from './helpers';

/** Column 1 — Tentang Altama. Single card page with a 4-photo slider. */
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
    onlyPage(
      [
        provisional('/photos/about-altama/photo-1.webp'),
        provisional('/photos/about-altama/photo-2.webp'),
        provisional('/photos/about-altama/photo-3.webp'),
        provisional('/photos/about-altama/photo-4.webp'),
      ],
      {
        'id': [
          'Berawal dari CV. Sumber Daya Group, berjalan hampir selama enam dekade dan menjadi titik awal ALTAMA seperti yang dikenal sekarang.',
        ],
        'en': [
          'Beginning with CV. Sumber Daya Group, a journey of almost six decades became the starting point of ALTAMA as it is known today.',
        ],
        'zh-Hans': [
          '始于 CV. Sumber Daya Group，历经近六十年，成为今日 ALTAMA 的起点。',
        ],
      },
    ),
  ],
};
