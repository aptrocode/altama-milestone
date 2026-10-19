import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, pendingPage, PHOTO_PLACEHOLDER, provisional } from './helpers';

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
      image: provisional('/brands/tekiro-wordmark.webp'),
      tileBackground: '#000000',
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
      image: provisional('/brands/ryu-tile.webp'),
      wordmark: provisional('/brands/ryu-wordmark.webp'),
      i18n: { 'id': { label: 'RYU' }, 'en': { label: 'RYU' }, 'zh-Hans': { label: 'RYU' } },
      pages: [
        page(
          [
            provisional('/photos/our-brands/ryu/page-1-photo-1.webp'),
            provisional('/photos/our-brands/ryu/page-1-photo-2.webp'),
            provisional('/photos/our-brands/ryu/page-1-photo-3.webp'),
          ],
          {
            'id': {
              tab: PAGE_TABS.first.id,
              blocks: [
                {
                  bullets: [
                    { lead: 'Lahir', text: '2006' },
                    { lead: 'Jumlah SKU', text: '547 SKU' },
                    { lead: 'Market Segment', text: 'Industri, Perkayuan, Bangunan, DIY/Rumahan, Otomotif.' },
                    { lead: 'Kategori Produk', text: 'Power Tool, Engine, Welding, Cordless, Accessories, Spare Parts.' },
                    { lead: 'Sertifikasi', text: 'K3L' },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.first.en,
              blocks: [
                {
                  bullets: [
                    { lead: 'Founded', text: '2006' },
                    { lead: 'SKU count', text: '547 SKUs' },
                    { lead: 'Market Segments', text: 'Industry, Woodworking, Construction, DIY/Home, Automotive.' },
                    { lead: 'Product Categories', text: 'Power Tool, Engine, Welding, Cordless, Accessories, Spare Parts.' },
                    { lead: 'Certifications', text: 'K3L' },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.first['zh-Hans'],
              blocks: [
                {
                  bullets: [
                    { lead: '创立', text: '2006 年' },
                    { lead: 'SKU 数量', text: '共 547 个 SKU' },
                    { lead: '市场领域', text: '工业、木工、建筑、家用/DIY、汽车。' },
                    { lead: '产品类别', text: '电动工具、引擎、焊接、无绳工具、配件、零配件。' },
                    { lead: '产品认证', text: 'K3L' },
                  ],
                },
              ],
            },
          },
        ),
        page(
          [
            provisional('/photos/our-brands/ryu/page-2-photo-1.webp'),
            provisional('/photos/our-brands/ryu/page-2-photo-2.webp'),
            provisional('/photos/our-brands/ryu/page-2-photo-3.webp'),
          ],
          {
            'id': {
              tab: PAGE_TABS.second.id,
              blocks: [
                'Penghargaan:',
                {
                  bullets: [
                    { lead: '4x Superbrands' },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award' },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.second.en,
              blocks: [
                'Awards & Accolades:',
                {
                  bullets: [
                    { lead: '4x Superbrands' },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award' },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.second['zh-Hans'],
              blocks: [
                '所获荣誉：',
                {
                  bullets: [
                    { lead: '4届 Superbrands 超级品牌大奖' },
                    { lead: '3届 印尼数字大众品牌大奖 (Indonesia Digital Popular Brand Award)' },
                    { lead: '印尼品牌冠军大奖 (Indonesia Brand Champion Award)' },
                  ],
                },
              ],
            },
          },
        ),
      ],
    },
    {
      key: 'rexco',
      image: provisional('/brands/rexco.webp'),
      tileBackground: '#1f1f9e',
      wordmark: provisional('/brands/rexco-wordmark.webp'),
      i18n: { 'id': { label: 'REXCO' }, 'en': { label: 'REXCO' }, 'zh-Hans': { label: 'REXCO' } },
      pages: [
        page(
          [
            provisional('/photos/our-brands/rexco/page-1-photo-1.webp'),
            provisional('/photos/our-brands/rexco/page-1-photo-2.webp'),
            provisional('/photos/our-brands/rexco/page-1-photo-3.webp'),
            provisional('/photos/our-brands/rexco/page-1-photo-4.webp'),
          ],
          {
            'id': {
              tab: PAGE_TABS.first.id,
              blocks: [
                {
                  bullets: [
                    { lead: 'Lahir', text: '2013' },
                    { lead: 'Jumlah SKU', text: '18 SKU total' },
                    { lead: 'Market Segment', text: 'Industri, Otomotif, Rumahan/DIY, Pertukangan, Mining, Kelistrikan.' },
                    { lead: 'Kategori', text: 'Pelumasan, Pembersih, dan Perawatan & Kebersihan Diri' },
                    { lead: 'Sertifikasi', text: 'MSDS, TDS, dan RoHS.' },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.first.en,
              blocks: [
                {
                  bullets: [
                    { lead: 'Founded', text: '2013' },
                    { lead: 'SKU count', text: '18 total SKUs' },
                    { lead: 'Market Segments', text: 'Industry, Automotive, Household/DIY, Carpentry, Mining, Electrical.' },
                    { lead: 'Categories', text: 'Lubrication, Cleaning, and Personal Care & Hygiene' },
                    { lead: 'Certifications', text: 'MSDS, TDS, and RoHS.' },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.first['zh-Hans'],
              blocks: [
                {
                  bullets: [
                    { lead: '创立', text: '2013 年' },
                    { lead: 'SKU 数量', text: '共 18 个 SKU' },
                    { lead: '市场领域', text: '工业、汽车、家用/DIY、木工、采矿、电气。' },
                    { lead: '产品类别', text: '润滑、清洁以及个人护理与卫生' },
                    { lead: '产品认证', text: 'MSDS、TDS 与 RoHS。' },
                  ],
                },
              ],
            },
          },
        ),
        page(
          [
            provisional('/photos/our-brands/rexco/page-2-photo-1.webp'),
            provisional('/photos/our-brands/rexco/page-2-photo-2.webp'),
            provisional('/photos/our-brands/rexco/page-2-photo-3.webp'),
          ],
          {
            'id': {
              tab: PAGE_TABS.second.id,
              blocks: [
                'Penghargaan:',
                {
                  bullets: [
                    { lead: '4x Superbrands' },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award' },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.second.en,
              blocks: [
                'Awards & Accolades:',
                {
                  bullets: [
                    { lead: '4x Superbrands' },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award' },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.second['zh-Hans'],
              blocks: [
                '所获荣誉：',
                {
                  bullets: [
                    { lead: '4届 Superbrands 超级品牌大奖' },
                    { lead: '3届 印尼数字大众品牌大奖 (Indonesia Digital Popular Brand Award)' },
                    { lead: '印尼品牌冠军大奖 (Indonesia Brand Champion Award)' },
                  ],
                },
              ],
            },
          },
        ),
      ],
    },
  ],
};
