import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional, rotatingList, rotatingParts } from './helpers';

/** Column 2 — Our Brand. Idle tiles open Tekiro, RYU, or Rexco directly. */
export const OUR_BRANDS: ColumnConfig = {
  id: 2,
  key: 'our-brands',
  type: 'expandable',
  icon: 'gear',
  defaultSub: 'tekiro',
  i18n: {
    'id': { label: 'MEREK KAMI' },
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
        page(
          [
            provisional('/photos/our-brands/tekiro/page-1-photo-1.webp'),
            provisional('/photos/our-brands/tekiro/page-1-photo-2.webp'),
            provisional('/photos/our-brands/tekiro/page-1-photo-3.webp'),
          ],
          {
            'id': rotatingParts(PAGE_TABS.first.id, [
              [{ bullets: [
                { lead: 'Lahir: 1999' },
                { lead: 'Standar kualitas', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
                { lead: 'Jumlah SKU: 2.183 SKU' },
              ] }],
              [{ bullets: [
                { lead: 'Market segment:', text: 'Industri, Rumah Tangga/DIY, Oil & Gas, Otomotif, Bangunan, Mining, Perkebunan, Kelistrikan.' },
                { lead: 'Kategori Produk:', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, dan Cordless.' },
              ] }],
            ], 10, false),
            'en': rotatingParts(PAGE_TABS.first.en, [
              [{ bullets: [
                { lead: 'Founded: 1999' },
                { lead: 'Quality standards', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
                { lead: 'SKU count: 2,183 SKUs' },
              ] }],
              [{ bullets: [
                { lead: 'Market segments:', text: 'Industry, Household/DIY, Oil & Gas, Automotive, Construction, Mining, Plantation, Electrical.' },
                { lead: 'Product categories:', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, and Cordless.' },
              ] }],
            ], 10, false),
            'zh-Hans': rotatingParts(PAGE_TABS.first['zh-Hans'], [
              [{ bullets: [
                { lead: '创立：1999 年' },
                { lead: '质量标准', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
                { lead: 'SKU 数量：2,183 个' },
              ] }],
              [{ bullets: [
                { lead: '市场领域：', text: '工业、家用/DIY、石油天然气、汽车、建筑、采矿、种植园、电气。' },
                { lead: '产品类别：', text: '扳手、钳子、测量工具、汽车工具、内六角扳手、螺丝刀、通用工具、园艺工具、扭力工具、气动工具、收纳、托盘、绝缘工具、冲击套筒、焊接、专用工具及无绳工具。' },
              ] }],
            ], 10, false),
          },
        ),
        page(
          [
            provisional('/photos/our-brands/tekiro/page-2-photo-1.webp'),
            provisional('/photos/our-brands/tekiro/page-2-photo-2.webp'),
          ],
          {
            'id': rotatingList(PAGE_TABS.second.id, 'Penghargaan:', [
              { lead: 'Guinness World Records', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
              { lead: 'Museum Rekor Indonesia - MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
              { lead: '12x TOP Brand Award', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
              { lead: '7x Indonesia Digital Popular Brand Award' },
              { lead: '5x TOP DIGITAL PUBLIC RELATION AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
              { lead: '5x SUPERBRANDS', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
              { lead: '2x INDONESIA BRAND CHAMPION AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
              { lead: '2x INDONESIA BRAND CHOICE AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
              { lead: '2x CNN Awards', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
              { lead: 'Golden Brand Of The Year' },
              { lead: 'Indonesia Best Brand Awards' },
            ], 6),
            'en': rotatingList(PAGE_TABS.second.en, 'Awards & Accolades:', [
              { lead: 'Guinness World Records', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
              { lead: 'Museum Rekor Indonesia - MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
              { lead: '12x TOP Brand Award', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
              { lead: '7x Indonesia Digital Popular Brand Award' },
              { lead: '5x TOP DIGITAL PUBLIC RELATION AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
              { lead: '5x SUPERBRANDS', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
              { lead: '2x INDONESIA BRAND CHAMPION AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
              { lead: '2x INDONESIA BRAND CHOICE AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
              { lead: '2x CNN Awards', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
              { lead: 'Golden Brand Of The Year' },
              { lead: 'Indonesia Best Brand Awards' },
            ], 6),
            'zh-Hans': rotatingList(PAGE_TABS.second['zh-Hans'], '所获荣誉：', [
              { lead: '吉尼斯世界纪录 (Guinness World Records)', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
              { lead: '印尼纪录博物馆纪录 - MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
              { lead: '12届 TOP Brand Award 顶级品牌奖', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
              { lead: '7届 印尼数字大众品牌大奖' },
              { lead: '5届 顶级数字公关大奖 TOP DIGITAL PUBLIC RELATION AWARD', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
              { lead: '5届 SUPERBRANDS 超级品牌大奖', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
              { lead: '2届 印尼品牌冠军大奖', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
              { lead: '2届 印尼品牌之选大奖', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
              { lead: '2届 CNN 印尼大奖', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
              { lead: '年度金牌品牌 Golden Brand Of The Year' },
              { lead: '印尼最佳品牌奖 Indonesia Best Brand Awards' },
            ], 6),
          },
        ),
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
          ],
          {
            'id': {
              tab: PAGE_TABS.second.id,
              // The awards grow to fill the tallest card.
              fill: true,
              blocks: [
                'Penghargaan:',
                {
                  bullets: [
                    { lead: '4x Superbrands', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.second.en,
              fill: true,
              blocks: [
                'Awards & Accolades:',
                {
                  bullets: [
                    { lead: '4x Superbrands', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { lead: '3x Indonesia Digital Popular Brand Award' },
                    { lead: 'Indonesia Brand Champion Award', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.second['zh-Hans'],
              fill: true,
              blocks: [
                '所获荣誉：',
                {
                  bullets: [
                    { lead: '4届 Superbrands 超级品牌大奖', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { lead: '3届 印尼数字大众品牌大奖 (Indonesia Digital Popular Brand Award)' },
                    { lead: '印尼品牌冠军大奖 (Indonesia Brand Champion Award)', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
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
                    { lead: 'Indonesia Brand Champion Award', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { lead: 'Superbrands', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { lead: 'Indonesia TOP Digital PR Award Platinum', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { lead: 'Brand Choice Award', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
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
                    { lead: 'Indonesia Brand Champion Award', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { lead: 'Superbrands', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { lead: 'Indonesia TOP Digital PR Award Platinum', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { lead: 'Brand Choice Award', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
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
                    { lead: '印尼品牌冠军大奖 (Indonesia Brand Champion Award)', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { lead: 'Superbrands 超级品牌大奖', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { lead: '印尼顶级数字公关白金大奖 (Indonesia TOP Digital PR Award Platinum)', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { lead: '品牌之选大奖 (Brand Choice Award)', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
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
