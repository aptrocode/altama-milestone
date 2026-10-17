import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

/** Column 4 — Digital Trust. */
export const DIGITAL_TRUST: ColumnConfig = {
  id: 4,
  key: 'digital-partners',
  type: 'single',
  icon: 'person',
  illustration: provisional('/illustrations/digital-partners.webp'),
  i18n: {
    'id': { label: 'DIGITAL TRUST' },
    'en': { label: 'DIGITAL TRUST' },
    'zh-Hans': { label: '数字信任' },
  },
  pages: [
    onlyPage([provisional('/photos/digital-partners/photo-1.webp'), PHOTO_PLACEHOLDER], {
      'id': [{ bullets: [
        { lead: 'ODP Apps', text: 'Aplikasi stok barang dan transaksi.' },
        { lead: 'ALVA (Customer Care) dan TAMI ALTAMA Mitra Care', text: 'Sebagai layanan customer care digital end-user dan mitra bisnis.' },
        { lead: 'ISO 9001:2015', text: 'Standar mutu kelas dunia.' },
        { lead: 'ALTAMA e-Care Apps', text: 'Aplikasi pelayanan after sales.' },
        { lead: 'Service Delivery IndoPaket by Indomaret', text: 'Program klaim garansi gratis ongkir di seluruh Indonesia.' },
      ] }],
      'en': [{ bullets: [
        { lead: 'ODP Apps', text: 'Stock and transaction app.' },
        { lead: 'ALVA (Customer Care) and TAMI ALTAMA Mitra Care', text: 'Digital customer care for end users and business partners.' },
        { lead: 'ISO 9001:2015', text: 'World-class quality standard.' },
        { lead: 'ALTAMA e-Care Apps', text: 'After-sales service app.' },
        { lead: 'IndoPaket Service Delivery by Indomaret', text: 'Free-shipping warranty claims across Indonesia.' },
      ] }],
      'zh-Hans': [{ bullets: [
        { lead: 'ODP Apps', text: '库存与交易应用。' },
        { lead: 'ALVA（客户关怀）与 TAMI ALTAMA Mitra Care', text: '面向终端用户与业务伙伴的数字化客户服务。' },
        { lead: 'ISO 9001:2015', text: '世界级质量标准。' },
        { lead: 'ALTAMA e-Care Apps', text: '售后服务应用。' },
        { lead: 'Indomaret IndoPaket 配送服务', text: '全印尼免运费保修索赔计划。' },
      ] }],
    }),
  ],
};
