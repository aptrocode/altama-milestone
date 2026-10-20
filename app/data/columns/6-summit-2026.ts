import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional } from './helpers';

/** Column 6 — Altama Summit 2026. Text-only open card (no photo slider) in three pages. */
export const SUMMIT_2026: ColumnConfig = {
  id: 6,
  key: 'summit-2026',
  type: 'single',
  icon: 'people',
  illustration: provisional('/illustrations/summit-2026.webm'),
  // Short pages: each page's text grows to fill the card.
  fillText: true,
  i18n: {
    'id': { label: 'KTT ALTAMA 2026' },
    'en': { label: 'ALTAMA SUMMIT 2026' },
    'zh-Hans': { label: 'ALTAMA 2026 峰会' },
  },
  // Three text pages (PAGE 1 / 2 / 3) with tabs at the top of the card (no photo frame).
  pages: [
    page([], {
      'id': { tab: PAGE_TABS.first.id, blocks: [
        'Hari ini, Altama bertumbuh membentuk ekosistem dan pencapaian ini bukan milik Altama semata, melainkan atas kontribusi dari mitra customer dan mitra supplier sebagai bagian dari sejarah perjalanan ini, sejak CV. Sumber Daya Group hingga Altama berdiri sampai hari ini.',
      ] },
      'en': { tab: PAGE_TABS.first.en, blocks: [
        'Today, Altama has grown into an ecosystem, and this achievement does not belong to Altama alone. It is built on the contributions of our customer and supplier partners, who are part of this journey from CV. Sumber Daya Group to Altama today.',
      ] },
      'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [
        '今天，Altama 已成长为一个生态系统。这份成就不只属于 Altama，更源自客户伙伴与供应商伙伴的贡献，他们共同见证了从 CV. Sumber Daya Group 到今日 Altama 的发展历程。',
      ] },
    }),
    page([], {
      'id': { tab: PAGE_TABS.second.id, blocks: [
        'Ke depan, kami berkomitmen untuk terus bekerjasama dengan para mitra, untuk menghadirkan:',
        { numbered: ['Produk berkualitas', 'Inovatif', 'Harga yang kompetitif', 'Layanan purna-jual yang terpercaya'] },
      ] },
      'en': { tab: PAGE_TABS.second.en, blocks: [
        'Moving forward, we are committed to keep working with our partners to deliver:',
        { numbered: ['Quality products', 'Innovation', 'Competitive prices', 'Reliable after-sales service'] },
      ] },
      'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [
        '展望未来，我们将继续与合作伙伴携手，致力于提供：',
        { numbered: ['优质产品', '创新', '具有竞争力的价格', '值得信赖的售后服务'] },
      ] },
    }),
    page([], {
      'id': { tab: PAGE_TABS.third.id, blocks: [
        'Sejalan dengan tema ALTAMA SUMMIT 2026 – "Powering Partnership: Building a Strong Ecosystem for a Sustainable Future", hari ini, kita semua menjadi bagian dari sejarah.',
        'Mari lanjutkan perjalanan ini bersama',
      ] },
      'en': { tab: PAGE_TABS.third.en, blocks: [
        'In line with the ALTAMA SUMMIT 2026 theme – "Powering Partnership: Building a Strong Ecosystem for a Sustainable Future", today we all become part of history.',
        'Let’s continue this journey together',
      ] },
      'zh-Hans': { tab: PAGE_TABS.third['zh-Hans'], blocks: [
        '秉承 ALTAMA SUMMIT 2026 主题——“Powering Partnership: Building a Strong Ecosystem for a Sustainable Future”，今天我们都成为历史的一部分。',
        '让我们携手继续前行',
      ] },
    }),
  ],
};
