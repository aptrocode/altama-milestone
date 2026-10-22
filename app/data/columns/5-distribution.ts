import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional } from './helpers';

const DISTRIBUSI_PHOTOS = [provisional('/photos/distribution/distribusi/photo-1.webp')];
const PEMASARAN_PHOTOS = [
  provisional('/photos/distribution/pemasaran/photo-1.webp'),
  provisional('/photos/distribution/pemasaran/photo-2.webp'),
  provisional('/photos/distribution/pemasaran/photo-3.webp'),
  provisional('/photos/distribution/pemasaran/photo-4.webp'),
  provisional('/photos/distribution/pemasaran/photo-5.webp'),
  provisional('/photos/distribution/pemasaran/photo-6.webp'),
  provisional('/photos/distribution/pemasaran/photo-7.webp'),
  provisional('/photos/distribution/pemasaran/photo-8.webp'),
  provisional('/photos/distribution/pemasaran/photo-9.webp'),
];

/** Column 5 — Distribusi & Pemasaran. Idle tiles open Distribusi or Pemasaran directly; each has two pages sharing its photos. */
export const DISTRIBUTION: ColumnConfig = {
  id: 5,
  key: 'distribution',
  type: 'expandable',
  icon: 'pin',
  illustration: provisional('/illustrations/distribution.webm'),
  captionTiles: true,
  defaultSub: 'distribusi',
  i18n: {
    'id': { label: 'DISTRIBUSI & PEMASARAN' },
    'en': { label: 'DISTRIBUTION & MARKETING' },
    'zh-Hans': { label: '分销与营销' },
  },
  subItems: [
    {
      key: 'distribusi',
      image: provisional('/illustrations/distribution/distribusi.webp'),
      i18n: { 'id': { label: 'DISTRIBUSI' }, 'en': { label: 'DISTRIBUTION' }, 'zh-Hans': { label: '分销' } },
      pages: [
        page(DISTRIBUSI_PHOTOS, {
          'id': { tab: PAGE_TABS.first.id, blocks: [{ bullets: [
            {
              lead: 'Marketplace',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: 'Modern Market',
              images: [
                provisional('/photos/distribution/distribusi/modern-market/mr-diy.webp'),
                provisional('/photos/distribution/distribusi/modern-market/mitra10.webp'),
                provisional('/photos/distribution/distribusi/modern-market/ace-hardware.webp'),
                provisional('/photos/distribution/distribusi/modern-market/depo-bangunan.webp'),
              ],
            },
          ] }] },
          'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
            {
              lead: 'Marketplace',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: 'Modern Market',
              images: [
                provisional('/photos/distribution/distribusi/modern-market/mr-diy.webp'),
                provisional('/photos/distribution/distribusi/modern-market/mitra10.webp'),
                provisional('/photos/distribution/distribusi/modern-market/ace-hardware.webp'),
                provisional('/photos/distribution/distribusi/modern-market/depo-bangunan.webp'),
              ],
            },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
            {
              lead: '电商平台',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: '现代零售渠道',
              images: [
                provisional('/photos/distribution/distribusi/modern-market/mr-diy.webp'),
                provisional('/photos/distribution/distribusi/modern-market/mitra10.webp'),
                provisional('/photos/distribution/distribusi/modern-market/ace-hardware.webp'),
                provisional('/photos/distribution/distribusi/modern-market/depo-bangunan.webp'),
              ],
            },
          ] }] },
        }),
        page(DISTRIBUSI_PHOTOS, {
          'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
            { lead: 'Jangkauan seluruh Indonesia' },
            { lead: 'Jangkauan Mancanegara' },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Reach Across Indonesia' },
            { lead: 'International Reach' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '覆盖印尼全国' },
            { lead: '覆盖海外市场' },
          ] }] },
        }),
      ],
    },
    {
      key: 'pemasaran',
      image: provisional('/illustrations/distribution/pemasaran.webp'),
      i18n: { 'id': { label: 'PEMASARAN' }, 'en': { label: 'MARKETING' }, 'zh-Hans': { label: '营销' } },
      pages: [
        page(PEMASARAN_PHOTOS, {
          'id': { tab: PAGE_TABS.first.id, blocks: [{ bullets: [
            { lead: 'Demonstrasi Produk' },
            { lead: 'TEKIRO Mechanic Competition' },
            { lead: 'Pameran' },
            { lead: 'Sponsorship & Komunitas' },
          ] }] },
          'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
            { lead: 'Product Demonstrations' },
            { lead: 'TEKIRO Mechanic Competition' },
            { lead: 'Exhibitions & Expos' },
            { lead: 'Sponsorship & Communities' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
            { lead: '产品演示' },
            { lead: 'TEKIRO 机械师技能大赛' },
            { lead: '展会活动' },
            { lead: '赞助与社群' },
          ] }] },
        }),
        page(PEMASARAN_PHOTOS, {
          'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
            { lead: 'Branding' },
            { lead: 'Influencer/Key Opinion Leader (KOL)' },
            {
              lead: 'Social Media:',
              text: '+340,000 followers dan viewers tahunan rata-rata +30,000,000 views',
            },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Brand Building' },
            { lead: 'Influencers / Key Opinion Leaders (KOL)' },
            {
              lead: 'Social Media:',
              text: '+340,000 followers and an annual average of +30,000,000 views',
            },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '品牌建设' },
            { lead: '关键意见领袖 (KOL) / 达人合作' },
            {
              lead: '社交媒体运营：',
              text: '340,000+ 粉丝，年均浏览量 30,000,000+ 次',
            },
          ] }] },
        }),
      ],
    },
  ],
};
