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
            { lead: 'Jangkauan Indonesia:', text: 'Hadir di 38 provinsi lewat 800+ mitra distribusi langsung dan 100.000+ jaringan distribusi tidak langsung.' },
            { lead: 'Jangkauan internasional:', text: 'Pendistribusian hingga mancanegara.' },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Reach across Indonesia:', text: 'Present in 38 provinces through 800+ direct distribution partners and 100,000+ indirect distribution outlets.' },
            { lead: 'International reach:', text: 'Distribution to overseas markets.' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '印度尼西亚覆盖范围：', text: '遍及38个省，拥有800多家直接分销合作伙伴及超过100,000个间接分销网络。' },
            { lead: '国际覆盖范围：', text: '产品销往海外市场。' },
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
            { lead: 'TEKIRO Mechanic Competition:', text: 'Program CSR pendidikan vokasi untuk SMK se-Indonesia.' },
            { lead: 'Pameran' },
            { lead: 'Sponsorship & Komunitas' },
          ] }] },
          'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
            { lead: 'Product Demonstrations' },
            { lead: 'TEKIRO Mechanic Competition:', text: 'A vocational education CSR program for vocational high schools (SMK) across Indonesia.' },
            { lead: 'Exhibitions & Expos' },
            { lead: 'Sponsorship & Communities' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
            { lead: '产品演示' },
            { lead: 'TEKIRO技师竞赛：', text: '面向印度尼西亚各地职业高中（SMK）的职业教育企业社会责任（CSR）项目。' },
            { lead: '展览' },
            { lead: '赞助与社群' },
          ] }] },
        }),
        page(PEMASARAN_PHOTOS, {
          'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
            { lead: 'Branding' },
            { lead: 'Influencer/Key Opinion Leader (KOL)' },
            {
              lead: 'Social Media:',
              text: 'Aktif dalam branding digital melalui berbagai platform media sosial lebih dari +340,000 followers dan viewers +1,000,000,000',
            },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Brand Building' },
            { lead: 'Influencers / Key Opinion Leaders (KOL)' },
            {
              lead: 'Social Media:',
              text: 'Active in digital branding across many social media platforms, with more than +340,000 followers and +1,000,000,000 views',
            },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '品牌推广' },
            { lead: '网红／关键意见领袖（KOL）' },
            {
              lead: '社交媒体：',
              text: '通过多个社交媒体平台积极开展数字品牌推广，拥有超过340,000名粉丝及超过1,000,000,000次观看量。',
            },
          ] }] },
        }),
      ],
    },
  ],
};
