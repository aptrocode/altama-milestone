import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, provisional } from './helpers';

const PHOTOS = [
  provisional('/photos/infrastructure/photo-1.mp4'),
  provisional('/photos/infrastructure/photo-7.webp'),
  provisional('/photos/infrastructure/photo-8.webp'),
  provisional('/photos/infrastructure/photo-9.webp'),
];

/** Column 3 — Infrastruktur: one page of facilities with a photo slider. */
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
  // One page with the photo slider (client's list; text size: Dashboard → Font).
  pages: [
    onlyPage(PHOTOS, {
      'id': [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Laboratorium Quality Control' },
        { lead: 'Toolsman', text: 'Tim promosi produk Altama ke konsumen di berbagai titik.' },
        { lead: 'Service Center TEKIRO & RYU' },
        { lead: 'ALTAMA Building' },
      ] }],
      'en': [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Quality Control Laboratory' },
        { lead: 'Toolsman', text: 'Altama’s product promotion team serving consumers at many locations.' },
        { lead: 'TEKIRO & RYU Service Center' },
        { lead: 'ALTAMA Building' },
      ] }],
      'zh-Hans': [{ bullets: [
        { lead: '仓库管理系统' },
        { lead: '质量控制实验室' },
        { lead: 'Toolsman：', text: '在各个地点向消费者推广 Altama 产品的团队。' },
        { lead: 'TEKIRO 和 RYU 服务中心：', text: '售后服务中心。' },
        { lead: 'ALTAMA 大楼' },
      ] }],
    }),
  ],
};
