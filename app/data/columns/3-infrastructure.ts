import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional } from './helpers';

const PHOTOS = [
  provisional('/photos/infrastructure/photo-1.mp4'),
  provisional('/photos/infrastructure/photo-2.webp'),
  provisional('/photos/infrastructure/photo-3.webp'),
  provisional('/photos/infrastructure/photo-4.webp'),
  provisional('/photos/infrastructure/photo-5.webp'),
  provisional('/photos/infrastructure/photo-6.webp'),
  provisional('/photos/infrastructure/photo-7.webp'),
  provisional('/photos/infrastructure/photo-8.webp'),
];

/** Column 3 — Infrastruktur: two pages of facilities sharing one photo slider. */
export const INFRASTRUCTURE: ColumnConfig = {
  id: 3,
  key: 'infrastructure',
  type: 'single',
  icon: 'warehouse',
  illustration: provisional('/illustrations/infrastructure.webm'),
  i18n: {
    'id': { label: 'INFRASTRUKTUR' },
    'en': { label: 'INFRASTRUCTURE' },
    'zh-Hans': { label: '基础设施' },
  },
  // Two pages with the same photo slider (text size: Dashboard → Font).
  pages: [
    page(PHOTOS, {
      'id': { tab: PAGE_TABS.first.id, blocks: [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Fasilitas Gudang & Armada Pengiriman', text: 'Didukung armada truk, forklift, dan reach truck.' },
        { lead: 'Laboratorium Quality Control' },
      ] }] },
      'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Warehouse Facilities & Delivery Fleet', text: 'Supported by trucks, forklifts, and reach trucks.' },
        { lead: 'Quality Control Laboratory' },
      ] }] },
      'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
        { lead: '仓库管理系统' },
        { lead: '仓储设施与配送车队', text: '配备卡车、叉车及前移式叉车。' },
        { lead: '质量控制实验室' },
      ] }] },
    }),
    page(PHOTOS, {
      'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
        { lead: 'Toolsman', text: 'Tim promosi produk Altama ke konsumen di berbagai titik.' },
        { lead: 'Service Center TEKIRO & RYU', text: 'Pusat layanan after sales service' },
        { lead: 'ALTAMA Building', text: 'Head Office ALTAMA' },
      ] }] },
      'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
        { lead: 'Toolsman', text: 'Altama’s product promotion team serving consumers at many locations.' },
        { lead: 'TEKIRO & RYU Service Center', text: 'After-sales service center' },
        { lead: 'ALTAMA Building', text: 'ALTAMA head office' },
      ] }] },
      'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
        { lead: 'Toolsman', text: 'Altama 产品推广团队，深入各地服务消费者。' },
        { lead: 'TEKIRO & RYU 服务中心', text: '售后服务中心' },
        { lead: 'ALTAMA 大楼', text: 'ALTAMA 总部' },
      ] }] },
    }),
  ],
};
