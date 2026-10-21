import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, provisional } from './helpers';

/** Column 6 — Altama Summit 2026. Text-only open card (no photo slider), one page. */
export const SUMMIT_2026: ColumnConfig = {
  id: 6,
  key: 'summit-2026',
  type: 'single',
  icon: 'people',
  illustration: provisional('/illustrations/summit-2026.webm'),
  i18n: {
    // The event name stays in English in every language (client request).
    'id': { label: 'ALTAMA SUMMIT 2026' },
    'en': { label: 'ALTAMA SUMMIT 2026' },
    'zh-Hans': { label: 'ALTAMA SUMMIT 2026' },
  },
  // One text page (client's condensed copy): partners and commitments, then the closing line.
  pages: [
    onlyPage([], {
      'id': [
        'Sejak CV. Sumber Daya Group hingga hari ini, kepercayaan mitra adalah kekuatan kami. Kami akan terus berusaha untuk menghadirkan: Produk berkualitas, inovasi, harga kompetitif, dan layanan purna-jual.',
        'ALTAMA SUMMIT 2026: Powering Partnership, hari ini kita semua menjadi bagian sejarah. Mari lanjutkan bersama.',
      ],
      'en': [
        'From CV. Sumber Daya Group to this day, our partners’ trust is our strength. We will keep striving to deliver quality products, innovation, competitive prices, and after-sales service.',
        'ALTAMA SUMMIT 2026: Powering Partnership, today we all become part of history. Let’s continue together.',
      ],
      'zh-Hans': [
        '从 CV. Sumber Daya Group 到今天，合作伙伴的信任是我们的力量。我们将继续努力，为您提供优质产品、创新、具有竞争力的价格和售后服务。',
        'ALTAMA SUMMIT 2026：Powering Partnership，今天我们都成为历史的一部分。让我们携手前行。',
      ],
    }),
  ],
};
