import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional } from './helpers';

const PHOTOS = [
  provisional('/photos/digital-partners/photo-1.webp'),
  provisional('/photos/digital-partners/photo-2.webp'),
];

/** Column 4 — Digital Trust: two pages of services sharing one photo slider. */
export const DIGITAL_TRUST: ColumnConfig = {
  id: 4,
  key: 'digital-partners',
  type: 'single',
  icon: 'person',
  illustration: provisional('/illustrations/digital-partners.webm'),
  i18n: {
    'id': { label: 'KEPERCAYAAN DIGITAL' },
    'en': { label: 'DIGITAL TRUST' },
    'zh-Hans': { label: '数字信任' },
  },
  // Two pages with the same photo slider (text size: Dashboard → Font).
  pages: [
    page(PHOTOS, {
      'id': { tab: PAGE_TABS.first.id, blocks: [{ bullets: [
        { lead: 'ODP Apps', text: 'Aplikasi stok barang dan transaksi.' },
        { lead: 'ALVA (Customer Care) dan TAMI (ALTAMA Mitra Care)', text: 'Sebagai layanan customer care digital end-user dan mitra bisnis.' },
        { lead: 'ISO 9001:2015', text: 'Standar mutu kelas dunia.' },
      ] }] },
      'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
        { lead: 'ODP Apps', text: 'Stock and transaction app.' },
        { lead: 'ALVA (Customer Care) and TAMI (ALTAMA Mitra Care)', text: 'Digital customer care for end users and business partners.' },
        { lead: 'ISO 9001:2015', text: 'World-class quality standard.' },
      ] }] },
      'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
        { lead: 'ODP Apps', text: '库存与交易应用。' },
        { lead: 'ALVA（客户关怀）与 TAMI（ALTAMA 合作伙伴关怀）', text: '面向终端用户与业务伙伴的数字化客户服务。' },
        { lead: 'ISO 9001:2015', text: '世界级质量标准。' },
      ] }] },
    }),
    page(PHOTOS, {
      'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
        { lead: 'ALTAMA e-Care Apps', text: 'Aplikasi pelayanan after sales.' },
        { lead: 'Service Delivery IndoPaket by Indomaret', text: 'Program klaim garansi gratis ongkir di seluruh Indonesia.' },
      ] }] },
      'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
        { lead: 'ALTAMA e-Care Apps', text: 'After-sales service app.' },
        { lead: 'IndoPaket Service Delivery by Indomaret', text: 'Free-shipping warranty claims across Indonesia.' },
      ] }] },
      'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
        { lead: 'ALTAMA e-Care Apps', text: '售后服务应用。' },
        { lead: 'Indomaret IndoPaket 配送服务', text: '全印尼免运费保修索赔计划。' },
      ] }] },
    }),
  ],
};
