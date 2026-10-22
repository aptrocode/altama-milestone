import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, provisional } from './helpers';

// ODP, ALTAMA e-Care, ISO 9001:2015, customer care uniforms, IndoPaket warranty claim poster.
const PHOTOS = [
  provisional('/photos/digital-partners/photo-1.webp'),
  provisional('/photos/digital-partners/photo-2.webp'),
  provisional('/photos/digital-partners/photo-3.webp'),
  provisional('/photos/digital-partners/photo-4.webp'),
  provisional('/photos/digital-partners/photo-5.webp'),
];

/** Column 4 — Digital Trust: one page of services with a photo slider. */
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
  // One page with the photo slider (client's list; text size: Dashboard → Font).
  pages: [
    onlyPage(PHOTOS, {
      'id': [{ bullets: [
        { lead: 'ODP Apps' },
        { lead: 'ALVA (Customer Care) dan TAMI (ALTAMA Mitra Care)', text: 'Sebagai layanan customer care digital.' },
        { lead: 'ISO 9001:2015', text: 'Standar mutu kelas dunia.' },
        { lead: 'ALTAMA e-Care Apps', text: 'Aplikasi pelayanan after sales.' },
        { lead: 'Service Delivery IndoPaket by Indomaret', text: 'Program klaim garansi gratis ongkir di seluruh Indonesia.' },
      ] }],
      'en': [{ bullets: [
        { lead: 'ODP Apps' },
        { lead: 'ALVA (Customer Care) and TAMI (ALTAMA Mitra Care)', text: 'Digital customer care services.' },
        { lead: 'ISO 9001:2015', text: 'World-class quality standard.' },
        { lead: 'ALTAMA e-Care Apps', text: 'After-sales service app.' },
        { lead: 'IndoPaket Service Delivery by Indomaret', text: 'Free-shipping warranty claim program across Indonesia.' },
      ] }],
      'zh-Hans': [{ bullets: [
        { lead: 'ODP Apps' },
        { lead: 'ALVA（客户关怀）与 TAMI（ALTAMA 合作伙伴关怀）', text: '数字化客户服务。' },
        { lead: 'ISO 9001:2015', text: '世界级质量标准。' },
        { lead: 'ALTAMA e-Care Apps', text: '售后服务应用。' },
        { lead: 'Indomaret IndoPaket 配送服务', text: '全印尼免运费保修索赔计划。' },
      ] }],
    }),
  ],
};
