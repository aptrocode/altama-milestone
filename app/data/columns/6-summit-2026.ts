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
  // One text page: client-supplied Indonesian/Mandarin copy, with English translated from Indonesian.
  pages: [
    onlyPage([], {
      'id': [
        'ALTAMA bertumbuh karena Anda. Dari CV. Sumber Daya Group hingga ALTAMA di hari ini, setiap pencapaian lahir dari kepercayaan mitra customer dan supplier.',
        'Bersama Anda, kami terus menghadirkan:',
        { bullets: [
          { lead: 'Produk berkualitas' },
          { lead: 'Inovasi berkelanjutan' },
          { lead: 'Harga kompetitif' },
          { lead: 'Layanan purna-jual yang mudah dijangkau' },
        ] },
        'ALTAMA SUMMIT: Powering Partnership, hari ini kita semua menjadi bagian dari sejarah. Mari lanjutkan bersama.',
      ],
      'en': [
        'ALTAMA grows because of you. From CV. Sumber Daya Group to ALTAMA today, every achievement is made possible by the trust of our customers and suppliers.',
        'Together with you, we continue to deliver:',
        { bullets: [
          { lead: 'Quality products' },
          { lead: 'Continuous innovation' },
          { lead: 'Competitive prices' },
          { lead: 'Easily accessible after-sales service' },
        ] },
        'ALTAMA SUMMIT: Powering Partnership, today we all become part of history. Let’s move forward together.',
      ],
      'zh-Hans': [
        'ALTAMA 因您而不断成长。从 CV. Sumber Daya Group 到今天的 ALTAMA，每一项成就都源于客户与供应商合作伙伴的信赖。',
        '与您携手，我们将持续提供：',
        { bullets: [
          { lead: '优质产品' },
          { lead: '持续创新' },
          { lead: '具有竞争力的价格' },
          { lead: '更便捷的售后服务' },
        ] },
        'ALTAMA 峰会：赋能合作伙伴关系。今天，我们每个人都成为了历史的一部分。让我们继续并肩前行。',
      ],
    }),
  ],
};
