import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

/** Column 3 — Infrastruktur. */
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
  pages: [
    onlyPage([provisional('/photos/infrastructure/photo-1.webp'), PHOTO_PLACEHOLDER], {
      'id': [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Fasilitas Gudang & Armada Pengiriman', text: 'Didukung armada truk, forklift, dan reach truck.' },
        { lead: 'Laboratorium Quality Control' },
        { lead: 'Toolsman', text: 'Tim promosi produk Altama ke konsumen di berbagai titik.' },
        { lead: 'Service Center TEKIRO & RYU', text: 'Pusat layanan after sales service' },
        { lead: 'ALTAMA Building', text: 'Head Office ALTAMA' },
      ] }],
      'en': [{ bullets: [
        { lead: 'Warehouse Management System' },
        { lead: 'Warehouse Facilities & Delivery Fleet', text: 'Supported by trucks, forklifts, and reach trucks.' },
        { lead: 'Quality Control Laboratory' },
        { lead: 'Toolsman', text: 'Altama’s product promotion team serving consumers at many locations.' },
        { lead: 'TEKIRO & RYU Service Center', text: 'After-sales service center' },
        { lead: 'ALTAMA Building', text: 'ALTAMA head office' },
      ] }],
      'zh-Hans': [{ bullets: [
        { lead: '仓库管理系统' },
        { lead: '仓储设施与配送车队', text: '配备卡车、叉车及前移式叉车。' },
        { lead: '质量控制实验室' },
        { lead: 'Toolsman', text: 'Altama 产品推广团队，深入各地服务消费者。' },
        { lead: 'TEKIRO & RYU 服务中心', text: '售后服务中心' },
        { lead: 'ALTAMA 大楼', text: 'ALTAMA 总部' },
      ] }],
    }),
  ],
};
