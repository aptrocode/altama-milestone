import type { ColumnId, WallLocale } from '../../shared/wall';

/** Local file plus client approval state; every current file is a provisional mockup crop. */
export interface MediaAsset {
  src: string;
  approved: boolean;
}

export interface BulletItem {
  lead: string;
  text?: string;
}

/**
 * A paragraph, a bullet list, or a numbered list. Bullets put their text under the bold lead
 * unless `inline` is set, which renders a compact `lead: text` list.
 */
export type ContentBlock = string | { bullets: BulletItem[]; inline?: boolean } | { numbered: string[] };

export interface PageCopy {
  /** Tab label such as a year or page; tabs render only when content has several pages. */
  tab?: string;
  blocks: ContentBlock[];
}

export interface ContentPage {
  i18n: Record<WallLocale, PageCopy>;
}

/** Open-card content: an image slider (arrows) and independent text pages (tab buttons). */
export interface ColumnContent {
  /** `null` renders a numbered photo placeholder until a real photo exists. */
  photos: (MediaAsset | null)[];
  pages: ContentPage[];
}

export interface SubItem {
  key: string;
  /** Idle tile artwork. */
  image: MediaAsset;
  /** Logo shown under the column title while the sub-item is open; text label otherwise. */
  wordmark?: MediaAsset;
  i18n: Record<WallLocale, { label: string }>;
  content: ColumnContent;
}

export type ColumnIcon = 'building' | 'gear' | 'warehouse' | 'person' | 'pin' | 'people';

export interface ColumnConfig {
  id: ColumnId;
  key: string;
  type: 'single' | 'expandable';
  icon: ColumnIcon;
  i18n: Record<WallLocale, { label: string }>;
  /** Idle artwork for single columns. */
  illustration?: MediaAsset;
  /** Content for single columns; expandable columns use their sub-item content. */
  content?: ColumnContent;
  /** Sub-items chosen directly from idle tiles. */
  subItems?: SubItem[];
  /** Show sub-item captions on their tiles (images without their own lettering). */
  captionTiles?: boolean;
  /** Sub-item opened by the operator/OSC `main` action. */
  defaultSub?: string;
}

function provisional(src: string): MediaAsset {
  return { src, approved: false };
}

const PAGE_TABS = { 'id': ['PAGE 1', 'PAGE 2'], 'en': ['PAGE 1', 'PAGE 2'], 'zh-Hans': ['第 1 页', '第 2 页'] } as const;

function pendingPage(tabs: Record<WallLocale, string>): ContentPage {
  return {
    i18n: {
      'id': { tab: tabs.id, blocks: ['Materi halaman ini menunggu konfirmasi klien.'] },
      'en': { tab: tabs.en, blocks: ['Content for this page is awaiting client confirmation.'] },
      'zh-Hans': { tab: tabs['zh-Hans'], blocks: ['本页内容正在等待客户确认。'] },
    },
  };
}

function singlePage(copy: Record<WallLocale, ContentBlock[]>): ContentPage[] {
  return [{ i18n: { 'id': { blocks: copy.id }, 'en': { blocks: copy.en }, 'zh-Hans': { blocks: copy['zh-Hans'] } } }];
}

export const WALL_CONFIG: { columns: ColumnConfig[] } = {
  columns: [
    // ── KOLOM 1: TENTANG ALTAMA ──
    {
      id: 1,
      key: 'about-altama',
      type: 'single',
      icon: 'building',
      illustration: provisional('/illustrations/about-altama.webp'),
      i18n: {
        'id': { label: 'TENTANG ALTAMA' },
        'en': { label: 'ABOUT ALTAMA' },
        'zh-Hans': { label: '关于 ALTAMA' },
      },
      content: {
        photos: [provisional('/photos/about-altama/photo-1.webp'), null],
        pages: [
          {
            i18n: {
              'id': { tab: '1960', blocks: ['Berawal dari CV. Sumber Daya Group, bisnis keluarga yang telah menapaki industri sejak 1967 hampir enam dekade pengalaman menjadi fondasi ALTAMA hari ini'] },
              'en': { tab: '1960', blocks: ['It began with CV. Sumber Daya Group, a family business in the industry since 1967; nearly six decades of experience form the foundation of ALTAMA today'] },
              'zh-Hans': { tab: '1960', blocks: ['ALTAMA 起源于家族企业 CV. Sumber Daya Group，自 1967 年起深耕行业，近六十年的经验奠定了今日 ALTAMA 的基础'] },
            },
          },
          pendingPage({ 'id': '1996', 'en': '1996', 'zh-Hans': '1996' }),
        ],
      },
    },

    // ── KOLOM 2: OUR BRAND (TEKIRO, RYU, REXCO) ──
    {
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
          content: {
            photos: [provisional('/photos/our-brands/tekiro/photo-1.webp'), null],
            pages: [
              {
                i18n: {
                  'id': {
                    tab: PAGE_TABS.id[0],
                    blocks: [
                      { inline: true, bullets: [{ lead: 'Lahir', text: '1999' }, { lead: 'Standar kualitas', text: 'JIS, ANSI, dan DIN.' }, { lead: 'Jumlah SKU', text: '2.183 SKU' }] },
                      { bullets: [
                        { lead: 'Market segment', text: 'Industri, Rumah Tangga/DIY, Oil & Gas, Otomotif, Bangunan, Mining, Perkebunan, Kelistrikan.' },
                        { lead: 'Kategori Produk', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, dan Cordless.' },
                      ] },
                    ],
                  },
                  'en': {
                    tab: PAGE_TABS.en[0],
                    blocks: [
                      { inline: true, bullets: [{ lead: 'Founded', text: '1999' }, { lead: 'Quality standards', text: 'JIS, ANSI, and DIN.' }, { lead: 'SKU count', text: '2,183 SKUs' }] },
                      { bullets: [
                        { lead: 'Market segments', text: 'Industry, Household/DIY, Oil & Gas, Automotive, Construction, Mining, Plantation, Electrical.' },
                        { lead: 'Product categories', text: 'Wrench, Pliers, Measurement, Automotive, Hex Key, Screwdriver, General Tools, Gardening, Torque, Air Tools, Storage, Tray, Insulation, Impact Socket, Welding, Special Tools, and Cordless.' },
                      ] },
                    ],
                  },
                  'zh-Hans': {
                    tab: PAGE_TABS['zh-Hans'][0],
                    blocks: [
                      { inline: true, bullets: [{ lead: '创立', text: '1999 年' }, { lead: '质量标准', text: 'JIS、ANSI 与 DIN。' }, { lead: 'SKU 数量', text: '2,183 个' }] },
                      { bullets: [
                        { lead: '市场领域', text: '工业、家用/DIY、石油天然气、汽车、建筑、采矿、种植园、电气。' },
                        { lead: '产品类别', text: '扳手、钳子、测量工具、汽车工具、内六角扳手、螺丝刀、通用工具、园艺工具、扭力工具、气动工具、收纳、托盘、绝缘工具、冲击套筒、焊接、专用工具及无绳工具。' },
                      ] },
                    ],
                  },
                },
              },
              pendingPage({ 'id': PAGE_TABS.id[1], 'en': PAGE_TABS.en[1], 'zh-Hans': PAGE_TABS['zh-Hans'][1] }),
            ],
          },
        },
        {
          key: 'ryu',
          image: provisional('/brands/ryu.webp'),
          wordmark: provisional('/brands/ryu.webp'),
          i18n: { 'id': { label: 'RYU' }, 'en': { label: 'RYU' }, 'zh-Hans': { label: 'RYU' } },
          content: {
            photos: [null, null],
            pages: singlePage({
              'id': ['Power tools bertenaga dan tahan lama yang dirancang khusus untuk memenuhi kebutuhan proyek konstruksi dan perkayuan modern.'],
              'en': ['High-powered, durable power tools specifically designed to meet modern construction and woodworking demands.'],
              'zh-Hans': ['强劲耐用的电动工具，专为满足现代建筑和木工需求而设计。'],
            }),
          },
        },
        {
          key: 'rexco',
          image: provisional('/brands/rexco.webp'),
          wordmark: provisional('/brands/rexco.webp'),
          i18n: { 'id': { label: 'REXCO' }, 'en': { label: 'REXCO' }, 'zh-Hans': { label: 'REXCO' } },
          content: {
            photos: [null, null],
            pages: singlePage({
              'id': ['Solusi cairan kimia perawatan industri dan otomotif untuk pembersihan, pelumasan, dan perlindungan anti-karat tingkat tinggi.'],
              'en': ['Industrial and automotive chemical solutions delivering superior cleaning, lubrication, and rust protection.'],
              'zh-Hans': ['工业与汽车专业化学维护方案，提供卓越的清洁、润滑与强效防锈保护。'],
            }),
          },
        },
      ],
    },

    // ── KOLOM 3: INFRASTRUKTUR ──
    {
      id: 3,
      key: 'infrastructure',
      type: 'single',
      icon: 'warehouse',
      illustration: provisional('/illustrations/infrastructure.webp'),
      i18n: {
        'id': { label: 'INFRASTRUKTUR' },
        'en': { label: 'INFRASTRUCTURE' },
        'zh-Hans': { label: '基础设施' },
      },
      content: {
        photos: [provisional('/photos/infrastructure/photo-1.webp'), null],
        pages: singlePage({
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
      },
    },

    // ── KOLOM 4: DIGITAL TRUST ──
    {
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
      content: {
        photos: [provisional('/photos/digital-partners/photo-1.webp'), null],
        pages: singlePage({
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
      },
    },

    // ── KOLOM 5: DISTRIBUSI & PEMASARAN ──
    {
      id: 5,
      key: 'distribution',
      type: 'expandable',
      icon: 'pin',
      captionTiles: true,
      defaultSub: 'distribusi',
      i18n: {
        'id': { label: 'DISTRIBUSI & PEMASARAN' },
        'en': { label: 'DISTRIBUTION & MARKETING' },
        'zh-Hans': { label: '分销与营销' },
      },
      subItems: [
        {
          key: 'distribusi',
          image: provisional('/illustrations/distribution/distribusi.webp'),
          i18n: { 'id': { label: 'DISTRIBUSI' }, 'en': { label: 'DISTRIBUTION' }, 'zh-Hans': { label: '分销' } },
          content: {
            photos: [provisional('/photos/distribution/distribusi/photo-1.webp'), null],
            pages: singlePage({
              'id': [{ bullets: [
                { lead: 'Marketplace' },
                { lead: 'Modern Market' },
                { lead: 'Jangkauan Indonesia', text: 'Hadir di 38 provinsi lewat 800+ mitra distribusi langsung dan 100.000+ jaringan distribusi tidak langsung' },
                { lead: 'Jangkauan internasional', text: 'Pendistribusian hingga mancanegara.' },
              ] }],
              'en': [{ bullets: [
                { lead: 'Marketplace' },
                { lead: 'Modern Market' },
                { lead: 'Indonesian reach', text: 'Present in 38 provinces through 800+ direct distribution partners and 100,000+ indirect distribution outlets' },
                { lead: 'International reach', text: 'Distribution to overseas markets.' },
              ] }],
              'zh-Hans': [{ bullets: [
                { lead: '电商平台' },
                { lead: '现代零售渠道' },
                { lead: '印尼覆盖', text: '通过 800 多家直接分销伙伴和 100,000 多个间接分销网点覆盖 38 个省份' },
                { lead: '国际覆盖', text: '分销至海外市场。' },
              ] }],
            }),
          },
        },
        {
          key: 'pemasaran',
          image: provisional('/illustrations/distribution/pemasaran.webp'),
          i18n: { 'id': { label: 'PEMASARAN' }, 'en': { label: 'MARKETING' }, 'zh-Hans': { label: '营销' } },
          content: {
            photos: [null, null],
            pages: singlePage({
              'id': ['Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.'],
              'en': ['Integrated brand activations through national automotive expos, mechanic workshops, educational roadshows, and industrial communities.'],
              'zh-Hans': ['通过国家级汽车展会、机械维修工坊、教育巡展以及行业社群进行一体化品牌推广。'],
            }),
          },
        },
      ],
    },

    // ── KOLOM 6: ALTAMA SUMMIT 2026 ──
    {
      id: 6,
      key: 'summit-2026',
      type: 'single',
      icon: 'people',
      illustration: provisional('/illustrations/summit-2026.webp'),
      i18n: {
        'id': { label: 'ALTAMA SUMMIT 2026' },
        'en': { label: 'ALTAMA SUMMIT 2026' },
        'zh-Hans': { label: 'ALTAMA 2026 峰会' },
      },
      content: {
        photos: [],
        pages: singlePage({
          'id': [
            'Hari ini, Altama bertumbuh membentuk ekosistem dan pencapaian ini bukan milik Altama semata, melainkan atas kontribusi dari mitra customer dan mitra supplier sebagai bagian dari sejarah perjalanan ini, sejak CV. Sumber Daya Group hingga Altama berdiri sampai hari ini.',
            'Ke depan, kami berkomitmen untuk terus bekerjasama dengan para mitra, untuk menghadirkan:',
            { numbered: ['Produk berkualitas;', 'Inovatif;', 'Harga yang kompetitif;', 'Layanan purna-jual yang terpercaya.'] },
            'Sejalan dengan tema ALTAMA SUMMIT 2026 — “Powering Partnership: Building a Strong Ecosystem for a Sustainable Future”, hari ini, kita semua menjadi bagian dari sejarah. Mari lanjutkan perjalanan ini bersama',
          ],
          'en': [
            'Today, Altama has grown into an ecosystem, and this achievement does not belong to Altama alone. It is built on the contributions of our customer and supplier partners, who are part of this journey from CV. Sumber Daya Group to Altama today.',
            'Moving forward, we are committed to keep working with our partners to deliver:',
            { numbered: ['Quality products;', 'Innovation;', 'Competitive prices;', 'Reliable after-sales service.'] },
            'In line with the ALTAMA SUMMIT 2026 theme — “Powering Partnership: Building a Strong Ecosystem for a Sustainable Future”, today we all become part of history. Let’s continue this journey together',
          ],
          'zh-Hans': [
            '今天，Altama 已成长为一个生态系统。这份成就不只属于 Altama，更源自客户伙伴与供应商伙伴的贡献，他们共同见证了从 CV. Sumber Daya Group 到今日 Altama 的发展历程。',
            '展望未来，我们将继续与合作伙伴携手，致力于提供：',
            { numbered: ['优质产品；', '创新；', '具有竞争力的价格；', '值得信赖的售后服务。'] },
            '秉承 ALTAMA SUMMIT 2026 主题——“Powering Partnership: Building a Strong Ecosystem for a Sustainable Future”，今天我们都成为历史的一部分。让我们携手继续前行',
          ],
        }),
      },
    },
  ],
};

export function getColumnConfig(columnId: ColumnId): ColumnConfig {
  return WALL_CONFIG.columns.find(column => column.id === columnId)!;
}

const EMPTY_CONTENT: ColumnContent = { photos: [], pages: [] };

/** Open content for a column's current sub-item (expandable) or its own content (single). */
export function getColumnContent(column: ColumnConfig, subItem: string): ColumnContent {
  return column.type === 'expandable'
    ? column.subItems?.find(sub => sub.key === subItem)?.content || EMPTY_CONTENT
    : column.content || EMPTY_CONTENT;
}
