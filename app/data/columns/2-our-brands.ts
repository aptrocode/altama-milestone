import type { ColumnConfig } from '~/types/wall-content';
import { page, PAGE_TABS, provisional } from './helpers';

const TEKIRO_PROFILE_PHOTOS = [
  provisional('/photos/our-brands/tekiro/page-1-photo-1.webp'),
  provisional('/photos/our-brands/tekiro/page-1-photo-2.webp'),
  provisional('/photos/our-brands/tekiro/page-1-photo-3.webp'),
];
const TEKIRO_AWARD_PHOTOS = [
  provisional('/photos/our-brands/tekiro/page-2-photo-2.webp'),
];

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
      // Scroll mode: two pages, profile + products and all awards.
      scrollPages: [2, 2],
      // Four pages with tabs (no rotating text): profile, products, then the awards (5 + 6, in their original order).
      pages: [
        page(TEKIRO_PROFILE_PHOTOS, {
          'id': { tab: PAGE_TABS.first.id, blocks: [{ bullets: [
            { lead: 'Lahir: 1999' },
            { lead: 'Standar kualitas', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
            { lead: 'Jumlah SKU: 2.183 SKU' },
          ] }] },
          'en': { tab: PAGE_TABS.first.en, blocks: [{ bullets: [
            { lead: 'Founded: 1999' },
            { lead: 'Quality standards', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
            { lead: 'SKU count: 2,183 SKUs' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.first['zh-Hans'], blocks: [{ bullets: [
            { lead: '创立年份：1999年' },
            { lead: '质量标准：JIS、ANSI 和 DIN', image: provisional('/photos/our-brands/tekiro/standards.webp'), logosBelow: true },
            { lead: 'SKU 数量：2,183 个' },
          ] }] },
        }),
        page(TEKIRO_PROFILE_PHOTOS, {
          'id': { tab: PAGE_TABS.second.id, blocks: [{ bullets: [
            { lead: 'Market segment:', text: 'Industri, Rumah Tangga/DIY, Oil & Gas, Otomotif, Bangunan, Mining, Perkebunan, Kelistrikan.' },
            { lead: 'Kategori Produk:', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, dan Cordless.' },
          ] }] },
          'en': { tab: PAGE_TABS.second.en, blocks: [{ bullets: [
            { lead: 'Market segments:', text: 'Industry, Household/DIY, Oil & Gas, Automotive, Construction, Mining, Plantation, Electrical.' },
            { lead: 'Product categories:', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, and Cordless.' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.second['zh-Hans'], blocks: [{ bullets: [
            { lead: '市场领域：', text: '工业、家用/DIY、石油天然气、汽车、建筑、采矿、种植园、电气。' },
            { lead: '产品类别：', text: '扳手、钳子、测量工具、汽车工具、内六角扳手、螺丝刀、通用工具、园艺工具、扭力工具、气动工具、收纳、托盘、绝缘工具、冲击套筒、焊接、专用工具及无绳工具。' },
          ] }] },
        }),
        page(TEKIRO_AWARD_PHOTOS, {
          'id': { tab: PAGE_TABS.third.id, blocks: ['Penghargaan:', { awards: [
            { label: 'Guinness World Records', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
            { label: 'MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
            { label: 'TOP Brand', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
            { label: 'TOP Digital PR', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
          ] }, { bullets: [
            { lead: 'Guinness World Records' },
            { lead: 'Museum Rekor Indonesia - MURI' },
            { lead: '12x TOP Brand Award' },
            { lead: '7x Indonesia Digital Popular Brand Award' },
            { lead: '5x TOP DIGITAL PUBLIC RELATION AWARD' },
          ] }] },
          'en': { tab: PAGE_TABS.third.en, blocks: ['Awards & Accolades:', { awards: [
            { label: 'Guinness World Records', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
            { label: 'MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
            { label: 'TOP Brand', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
            { label: 'TOP Digital PR', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
          ] }, { bullets: [
            { lead: 'Guinness World Records' },
            { lead: 'Museum Rekor Indonesia - MURI' },
            { lead: '12x TOP Brand Award' },
            { lead: '7x Indonesia Digital Popular Brand Award' },
            { lead: '5x TOP DIGITAL PUBLIC RELATION AWARD' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.third['zh-Hans'], blocks: ['所获奖项：', { awards: [
            { label: 'Guinness World Records', image: provisional('/photos/our-brands/tekiro/penghargaan/guinness-world-records.webp') },
            { label: 'MURI', image: provisional('/photos/our-brands/tekiro/penghargaan/muri.webp') },
            { label: 'TOP Brand', image: provisional('/photos/our-brands/tekiro/penghargaan/top-brand.webp') },
            { label: 'TOP Digital PR', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-top-digital-pr-award.webp') },
          ] }, { bullets: [
            { lead: '吉尼斯世界纪录（2026年）' },
            { lead: '印度尼西亚纪录博物馆MURI，（2026年）' },
            { lead: 'TOP顶级品牌奖12次（2014–2024年）' },
            { lead: '印度尼西亚数字热门品牌奖7次（2016–2023年）' },
            { lead: '顶级数字公关奖5次（2019–2023年）' },
          ] }] },
        }),
        page(TEKIRO_AWARD_PHOTOS, {
          'id': { tab: PAGE_TABS.fourth.id, blocks: ['Penghargaan:', { awards: [
            { label: 'Superbrands', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
            { label: 'Brand Champion', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
            { label: 'Brand Choice', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
            { label: 'CNN Awards', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
          ] }, { bullets: [
            { lead: '5x SUPERBRANDS' },
            { lead: '2x INDONESIA BRAND CHAMPION AWARD' },
            { lead: '2x INDONESIA BRAND CHOICE AWARD' },
            { lead: '2x CNN Awards' },
            { lead: 'Golden Brand Of The Year' },
            { lead: 'Indonesia Best Brand Awards' },
          ] }] },
          'en': { tab: PAGE_TABS.fourth.en, blocks: ['Awards & Accolades:', { awards: [
            { label: 'Superbrands', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
            { label: 'Brand Champion', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
            { label: 'Brand Choice', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
            { label: 'CNN Awards', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
          ] }, { bullets: [
            { lead: '5x SUPERBRANDS' },
            { lead: '2x INDONESIA BRAND CHAMPION AWARD' },
            { lead: '2x INDONESIA BRAND CHOICE AWARD' },
            { lead: '2x CNN Awards' },
            { lead: 'Golden Brand Of The Year' },
            { lead: 'Indonesia Best Brand Awards' },
          ] }] },
          'zh-Hans': { tab: PAGE_TABS.fourth['zh-Hans'], blocks: ['所获奖项：', { awards: [
            { label: 'Superbrands', image: provisional('/photos/our-brands/tekiro/penghargaan/superbrands.webp') },
            { label: 'Brand Champion', image: provisional('/photos/our-brands/tekiro/penghargaan/indonesia-brand-champion.webp') },
            { label: 'Brand Choice', image: provisional('/photos/our-brands/tekiro/penghargaan/brand-choice.webp') },
            { label: 'CNN Awards', image: provisional('/photos/our-brands/tekiro/penghargaan/cnn-awards.webp') },
          ] }, { bullets: [
            { lead: '超级品牌5次（2022–2026年）' },
            { lead: '印度尼西亚品牌冠军奖2次（2020–2024年）' },
            { lead: '印度尼西亚品牌选择奖2次（2020–2021年）' },
            { lead: 'CNN 奖 2次（2025–2026年）' },
            { lead: '年度金品牌奖（2025年）' },
            { lead: '印度尼西亚最佳品牌奖（2025年）' },
          ] }] },
        }),
      ],
    },
    {
      key: 'ryu',
      image: provisional('/brands/ryu-tile.webp'),
      wordmark: provisional('/brands/ryu-wordmark.webp'),
      i18n: { 'id': { label: 'RYU' }, 'en': { label: 'RYU' }, 'zh-Hans': { label: 'RYU' } },
      // Scroll mode: keeps its two pages.
      scrollPages: [1, 1],
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
                    { lead: '创立年份：2006年' },
                    { lead: '认证：K3L' },
                    { lead: 'SKU 数量：547 个' },
                    { lead: '市场领域', text: '工业、木工、建筑、家用/DIY、汽车。' },
                    { lead: '产品类别', text: '电动工具、引擎、焊接、无绳工具、配件、零配件。' },
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
              blocks: [
                'Penghargaan:',
                {
                  awards: [
                    { label: 'Superbrands', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Indonesia Digital Popular Brand Award 2022', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
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
                  awards: [
                    { label: 'Superbrands', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Indonesia Digital Popular Brand Award 2022', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
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
                '所获奖项：',
                {
                  awards: [
                    { label: 'Superbrands', image: provisional('/photos/our-brands/ryu/penghargaan/superbrands.webp') },
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/ryu/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Indonesia Digital Popular Brand Award 2022', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
                {
                  bullets: [
                    { lead: '超级品牌 4次（2023–2026年）' },
                    { lead: '印度尼西亚数字热门品牌奖3次（2021–2023年）' },
                    { lead: '印度尼西亚品牌冠军奖（2024年）' },
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
      // Scroll mode: keeps its two pages.
      scrollPages: [1, 1],
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
                    { lead: '创立年份：2013年' },
                    { lead: '认证：MSDS、TDS 和 RoHS' },
                    { lead: 'SKU 总数：18 个' },
                    { lead: '市场领域', text: '工业、汽车、家用/DIY、木工、采矿、电气。' },
                    { lead: '产品类别', text: '润滑、清洁以及个人护理与卫生' },
                  ],
                },
              ],
            },
          },
        ),
        page(
          [
            provisional('/photos/our-brands/rexco/page-2-photo-2.webp'),
            provisional('/photos/our-brands/rexco/page-2-photo-3.webp'),
          ],
          {
            'id': {
              tab: PAGE_TABS.second.id,
              blocks: [
                'Penghargaan:',
                {
                  awards: [
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Superbrands', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { label: 'TOP Digital PR', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { label: 'Brand Choice', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
                {
                  bullets: [
                    { lead: 'Indonesia Brand Champion Award' },
                    { lead: 'Superbrands' },
                    { lead: 'Indonesia TOP Digital PR Award Platinum' },
                    { lead: 'Brand Choice Award' },
                  ],
                },
              ],
            },
            'en': {
              tab: PAGE_TABS.second.en,
              blocks: [
                'Awards & Accolades:',
                {
                  awards: [
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Superbrands', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { label: 'TOP Digital PR', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { label: 'Brand Choice', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
                {
                  bullets: [
                    { lead: 'Indonesia Brand Champion Award' },
                    { lead: 'Superbrands' },
                    { lead: 'Indonesia TOP Digital PR Award Platinum' },
                    { lead: 'Brand Choice Award' },
                  ],
                },
              ],
            },
            'zh-Hans': {
              tab: PAGE_TABS.second['zh-Hans'],
              blocks: [
                '主要奖项：',
                {
                  awards: [
                    { label: 'Brand Champion', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-brand-champion.webp') },
                    { label: 'Superbrands', image: provisional('/photos/our-brands/rexco/penghargaan/superbrands.webp') },
                    { label: 'TOP Digital PR', image: provisional('/photos/our-brands/rexco/penghargaan/indonesia-top-digital-pr-award.webp') },
                    { label: 'Brand Choice', image: provisional('/photos/our-brands/rexco/penghargaan/brand-choice.webp') },
                  ],
                },
                {
                  bullets: [
                    { lead: '超级品牌 4次（2023–2026年）' },
                    { lead: '印度尼西亚品牌选择奖2次（2021–2023年）' },
                    { lead: '印度尼西亚品牌冠军奖（2024年）' },
                    { lead: '汽车选择奖（2024年）' },
                    { lead: '印度尼西亚最佳品牌奖（2025年）' },
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
