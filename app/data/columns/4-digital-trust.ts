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
        { lead: 'ALVA (Customer Care) dan TAMI (ALTAMA Mitra Care)', text: 'Sebagai layanan customer care digital end-user dan mitra bisnis.' },
        { lead: 'ISO 9001:2015', text: 'Standar mutu kelas dunia.' },
        { lead: 'ALTAMA e-Care Apps', text: 'Aplikasi pelayanan after sales.' },
        { lead: 'Service Delivery IndoPaket by Indomaret', text: 'Program klaim garansi gratis ongkir di seluruh Indonesia.' },
      ] }],
      'en': [{ bullets: [
        { lead: 'ODP Apps' },
        { lead: 'ALVA (Customer Care) and TAMI (ALTAMA Mitra Care)', text: 'Digital customer care services for end users and business partners.' },
        { lead: 'ISO 9001:2015', text: 'World-class quality standard.' },
        { lead: 'ALTAMA e-Care Apps', text: 'After-sales service app.' },
        { lead: 'IndoPaket Service Delivery by Indomaret', text: 'Free-shipping warranty claim program across Indonesia.' },
      ] }],
      'zh-Hans': [{ bullets: [
        { lead: 'ODP 应用程序' },
        { lead: 'ALVA（客户服务）和 TAMI（ALTAMA 伙伴服务）：', text: '为终端用户和商业合作伙伴提供数字客户服务。' },
        { lead: 'ISO 9001:2015：', text: '世界级质量管理标准。' },
        { lead: 'ALTAMA e-Care 应用程序：', text: '售后服务应用程序。' },
        { lead: 'Indomaret 的 IndoPaket 服务配送：', text: '在印度尼西亚全境提供免运费的保修申请服务。' },
      ] }],
    }),
  ],
};
