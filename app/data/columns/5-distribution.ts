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
  // Like Infrastruktur and Kepercayaan Digital: each page's text grows to fill its card.
  fillText: true,
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
              text: 'TikTok Shop, Tokped, Shopee, dan lainnya',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: 'Modern Market',
              text: 'MR DIY, Mitra10, dan lainnya',
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
              text: 'TikTok Shop, Tokopedia, Shopee, and others',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: 'Modern Market',
              text: 'MR. D.I.Y., Mitra10, and others',
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
              text: 'TikTok Shop、Tokopedia、Shopee 及其他电商平台',
              images: [
                provisional('/photos/distribution/distribusi/marketplace/tiktok-shop.webp'),
                provisional('/photos/distribution/distribusi/marketplace/tokopedia.webp'),
                provisional('/photos/distribution/distribusi/marketplace/shopee.webp'),
                provisional('/photos/distribution/distribusi/marketplace/lazada.webp'),
              ],
            },
            {
              lead: '现代零售渠道',
              text: 'MR. D.I.Y.、Mitra10 及其他零售卖场',
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
            {
              lead: 'Jangkauan Indonesia:',
              text: 'Hadir di 38 provinsi lewat 800+ mitra distribusi langsung dan 100.000+ jaringan distribusi tidak langsung',
            },
            {
              lead: 'Jangkauan internasional:',
              text: 'Pendistribusian hingga mancanegara.',
            },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            {
              lead: 'Indonesian Reach:',
              text: 'Present across 38 provinces through 800+ direct distribution partners and 100,000+ indirect distribution networks.',
            },
            {
              lead: 'International Reach:',
              text: 'Distribution reaching international markets.',
            },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            {
              lead: '印尼覆盖范围：',
              text: '覆盖 38 个省份，拥有 800 多家直接分销合作伙伴和 100,000 多个间接分销网络。',
            },
            {
              lead: '国际业务拓展：',
              text: '产品远销海外多个国家和地区。',
            },
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
            {
              lead: 'TEKIRO Mechanic Competition:',
              text: 'Program CSR pendidikan vokasi untuk SMK se-Indonesia.',
            },
            { lead: 'Pameran' },
            { lead: 'Sponsorship & Komunitas' },
          ] }] },
          'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
            { lead: 'Product Demonstrations' },
            {
              lead: 'TEKIRO Mechanic Competition:',
              text: 'Vocational education CSR program for vocational high schools across Indonesia.',
            },
            { lead: 'Exhibitions & Expos' },
            { lead: 'Sponsorship & Communities' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
            { lead: '产品演示' },
            {
              lead: 'TEKIRO 机械师技能大赛：',
              text: '面向全印尼职业高中的教育公益项目。',
            },
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
              text: 'Aktif dalam branding digital melalui berbagai platform media sosial lebih dari +350,000 followers dan rata-rata views tahunan +30,000,000 views.',
            },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Brand Building' },
            { lead: 'Influencers / Key Opinion Leaders (KOL)' },
            {
              lead: 'Social Media:',
              text: 'Active digital branding across social platforms with over +350,000 followers and an annual average of +30,000,000 views.',
            },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '品牌建设' },
            { lead: '关键意见领袖 (KOL) / 达人合作' },
            {
              lead: '社交媒体运营：',
              text: '活跃于各大社交平台进行数字化品牌推广，粉丝数超 350,000+，年均浏览量突破 30,000,000+ 次。',
            },
          ] }] },
        }),
      ],
    },
  ],
};
