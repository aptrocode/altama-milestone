import type { ColumnConfig } from '~/types/wall-content';
import { onlyPage, page, PAGE_TABS, pendingPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

/** Column 2 — Our Brand. Idle tiles open Tekiro, RYU, or Rexco directly. */
export const OUR_BRANDS: ColumnConfig = {
  id: 2,
  key: 'our-brands',
  type: 'expandable',
  icon: 'gear',
  defaultSub: 'tekiro',
  i18n: {
    'id': { label: 'OUR BRAND' },
    'en': { label: 'OUR BRANDS' },
    'zh-Hans': { label: '旗下品牌' },
  },
  subItems: [
    {
      key: 'tekiro',
      image: provisional('/brands/tekiro.webp'),
      wordmark: provisional('/brands/tekiro-wordmark.webp'),
      i18n: { 'id': { label: 'TEKIRO' }, 'en': { label: 'TEKIRO' }, 'zh-Hans': { label: 'TEKIRO' } },
      pages: [
        page([provisional('/photos/our-brands/tekiro/photo-1.webp'), PHOTO_PLACEHOLDER], {
          'id': {
            tab: PAGE_TABS.first.id,
            blocks: [
              { inline: true, bullets: [{ lead: 'Lahir', text: '1999' }, { lead: 'Standar kualitas', text: 'JIS, ANSI, dan DIN.' }, { lead: 'Jumlah SKU', text: '2.183 SKU' }] },
              { bullets: [
                { lead: 'Market segment', text: 'Industri, Rumah Tangga/DIY, Oil & Gas, Otomotif, Bangunan, Mining, Perkebunan, Kelistrikan.' },
                { lead: 'Kategori Produk', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, dan Cordless.' },
              ] },
            ],
          },
          'en': {
            tab: PAGE_TABS.first.en,
            blocks: [
              { inline: true, bullets: [{ lead: 'Founded', text: '1999' }, { lead: 'Quality standards', text: 'JIS, ANSI, and DIN.' }, { lead: 'SKU count', text: '2,183 SKUs' }] },
              { bullets: [
                { lead: 'Market segments', text: 'Industry, Household/DIY, Oil & Gas, Automotive, Construction, Mining, Plantation, Electrical.' },
                { lead: 'Product categories', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, and Cordless.' },
              ] },
            ],
          },
          'zh-Hans': {
            tab: PAGE_TABS.first['zh-Hans'],
            blocks: [
              { inline: true, bullets: [{ lead: '创立', text: '1999 年' }, { lead: '质量标准', text: 'JIS、ANSI 与 DIN。' }, { lead: 'SKU 数量', text: '2,183 个' }] },
              { bullets: [
                { lead: '市场领域', text: '工业、家用/DIY、石油天然气、汽车、建筑、采矿、种植园、电气。' },
                { lead: '产品类别', text: '扳手、钳子、测量工具、汽车工具、内六角扳手、螺丝刀、通用工具、园艺工具、扭力工具、气动工具、收纳、托盘、绝缘工具、冲击套筒、焊接、专用工具及无绳工具。' },
              ] },
            ],
          },
        }),
        pendingPage([PHOTO_PLACEHOLDER, PHOTO_PLACEHOLDER], PAGE_TABS.second),
      ],
    },
    {
      key: 'ryu',
      image: provisional('/brands/ryu.webp'),
      wordmark: provisional('/brands/ryu.webp'),
      i18n: { 'id': { label: 'RYU' }, 'en': { label: 'RYU' }, 'zh-Hans': { label: 'RYU' } },
      pages: [
        onlyPage([PHOTO_PLACEHOLDER, PHOTO_PLACEHOLDER], {
          'id': ['Power tools bertenaga dan tahan lama yang dirancang khusus untuk memenuhi kebutuhan proyek konstruksi dan perkayuan modern.'],
          'en': ['High-powered, durable power tools specifically designed to meet modern construction and woodworking demands.'],
          'zh-Hans': ['强劲耐用的电动工具，专为满足现代建筑和木工需求而设计。'],
        }),
      ],
    },
    {
      key: 'rexco',
      image: provisional('/brands/rexco.webp'),
      wordmark: provisional('/brands/rexco.webp'),
      i18n: { 'id': { label: 'REXCO' }, 'en': { label: 'REXCO' }, 'zh-Hans': { label: 'REXCO' } },
      pages: [
        onlyPage([PHOTO_PLACEHOLDER, PHOTO_PLACEHOLDER], {
          'id': ['Solusi cairan kimia perawatan industri dan otomotif untuk pembersihan, pelumasan, dan perlindungan anti-karat tingkat tinggi.'],
          'en': ['Industrial and automotive chemical solutions delivering superior cleaning, lubrication, and rust protection.'],
          'zh-Hans': ['工业与汽车专业化学维护方案，提供卓越的清洁、润滑与强效防锈保护。'],
        }),
      ],
    },
  ],
};
