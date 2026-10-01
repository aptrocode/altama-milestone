import type { ColumnId, WallLocale } from '../../shared/wall';

export interface LocalizedText {
  label: string;
  headerTitle: string;
  headerDesc: string;
  bottomTitle: string;
  bottomDesc: string;
}

export interface LocalizedSubItem {
  label: string;
  title: string;
  desc: string;
}

export interface SubItem {
  key: string;
  label: string;
  i18n?: Record<WallLocale, LocalizedSubItem>;
}

export interface ColumnConfig {
  id: ColumnId;
  key: string;
  label: string;
  type: 'single' | 'expandable';
  headerTitle: string;
  headerDesc: string;
  bottomTitle: string;
  bottomDesc: string;
  slides: number;
  parentLabel?: string;
  subItems?: SubItem[];
  defaultSub?: string;
  i18n?: Record<WallLocale, LocalizedText>;
}

export interface SubItemContent {
  title: string;
  desc: string;
}

export const WALL_CONFIG: {
  columns: ColumnConfig[];
  subItemContent: Record<string, Record<WallLocale, SubItemContent>>;
} = {
  columns: [
    // ── KOLOM 1: TENTANG ALTAMA ──
    {
      id: 1,
      key: 'about-altama',
      label: 'TENTANG ALTAMA',
      type: 'single',
      headerTitle: 'TENTANG ALTAMA',
      headerDesc: 'Membangun ekosistem kemitraan yang kuat, tangguh, dan berkelanjutan untuk memberdayakan industri dan profesional di seluruh Indonesia.',
      bottomTitle: 'TENTANG ALTAMA',
      bottomDesc: 'Fondasi keunggulan dan kemitraan terpercaya sejak 1967.',
      slides: 3,
      i18n: {
        'id': {
          label: 'TENTANG ALTAMA',
          headerTitle: 'TENTANG ALTAMA',
          headerDesc: 'Membangun ekosistem kemitraan yang kuat, tangguh, dan berkelanjutan untuk memberdayakan industri dan profesional di seluruh Indonesia.',
          bottomTitle: 'TENTANG ALTAMA',
          bottomDesc: 'Fondasi keunggulan dan kemitraan terpercaya sejak 1967.',
        },
        'en': {
          label: 'ABOUT ALTAMA',
          headerTitle: 'ABOUT ALTAMA',
          headerDesc: 'Building a strong, resilient, and sustainable ecosystem to empower industries and professionals across Indonesia.',
          bottomTitle: 'ABOUT ALTAMA',
          bottomDesc: 'The foundation of excellence and trusted partnership since 1967.',
        },
        'zh-Hans': {
          label: '关于 ALTAMA',
          headerTitle: '关于 ALTAMA',
          headerDesc: '构建强大、有韧性且可持续的合作生态系统，赋能印尼各地的产业与专业人士。',
          bottomTitle: '关于 ALTAMA',
          bottomDesc: '自1967年以来的卓越基石与值得信赖的合作伙伴。',
        },
      },
    },

    // ── KOLOM 2: MEREK KAMI (TEKIRO, RYU, REXCO) ──
    {
      id: 2,
      key: 'our-brands',
      label: 'MEREK KAMI',
      type: 'expandable',
      parentLabel: 'MEREK KAMI',
      defaultSub: 'tekiro',
      headerTitle: 'TEKIRO',
      headerDesc: 'Hand tools berkualitas tinggi dan presisi standar industri Jepang untuk para mekanik dan profesional otomotif terdepan.',
      bottomTitle: 'TEKIRO',
      bottomDesc: 'Perkakas tangan terpercaya pilihan utama industri Indonesia.',
      slides: 3,
      subItems: [
        {
          key: 'tekiro',
          label: 'TEKIRO',
          i18n: {
            'id': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: 'Hand tools berkualitas tinggi dan presisi standar industri Jepang untuk para mekanik dan profesional otomotif terdepan.',
            },
            'en': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: 'High-quality precision hand tools crafted to Japanese industrial standards for leading mechanics and automotive professionals.',
            },
            'zh-Hans': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: '符合日本工业标准的高品质精密手动工具，专为领先的机械师和汽车专业人士打造。',
            },
          },
        },
        {
          key: 'ryu',
          label: 'RYU',
          i18n: {
            'id': {
              label: 'RYU',
              title: 'RYU POWER TOOLS',
              desc: 'Power tools bertenaga dan tahan lama yang dirancang khusus untuk memenuhi kebutuhan proyek konstruksi dan perkayuan modern.',
            },
            'en': {
              label: 'RYU',
              title: 'RYU POWER TOOLS',
              desc: 'High-powered, durable power tools specifically designed to meet modern construction and woodworking demands.',
            },
            'zh-Hans': {
              label: 'RYU',
              title: 'RYU 电动工具',
              desc: '强劲耐用的电动工具，专为满足现代建筑和木工需求而设计。',
            },
          },
        },
        {
          key: 'rexco',
          label: 'REXCO',
          i18n: {
            'id': {
              label: 'REXCO',
              title: 'REXCO CHEMICALS',
              desc: 'Solusi cairan kimia perawatan industri dan otomotif untuk pembersihan, pelumasan, dan perlindungan anti-karat tingkat tinggi.',
            },
            'en': {
              label: 'REXCO',
              title: 'REXCO CHEMICALS',
              desc: 'Industrial and automotive chemical solutions delivering superior cleaning, lubrication, and rust protection.',
            },
            'zh-Hans': {
              label: 'REXCO',
              title: 'REXCO 化学养护',
              desc: '工业与汽车专业化学维护方案，提供卓越的清洁、润滑与强效防锈保护。',
            },
          },
        },
      ],
      i18n: {
        'id': {
          label: 'MEREK KAMI',
          headerTitle: 'MEREK KAMI',
          headerDesc: 'Portofolio merek unggulan ALTAMA yang dipercaya jutaan pengguna di seluruh sektor industri dan otomotif.',
          bottomTitle: 'MEREK KAMI',
          bottomDesc: 'Kualitas, presisi, dan inovasi pada setiap produk.',
        },
        'en': {
          label: 'OUR BRANDS',
          headerTitle: 'OUR BRANDS',
          headerDesc: 'ALTAMA’s premier brand portfolio trusted by millions across industrial and automotive sectors.',
          bottomTitle: 'OUR BRANDS',
          bottomDesc: 'Quality, precision, and relentless innovation in every product.',
        },
        'zh-Hans': {
          label: '旗下品牌',
          headerTitle: '旗下品牌',
          headerDesc: 'ALTAMA 旗下旗舰品牌矩阵，深受各工业与汽车制造领域数百万用户的信赖。',
          bottomTitle: '旗下品牌',
          bottomDesc: '每款产品均体现卓越品质、精密制造与持续创新。',
        },
      },
    },

    // ── KOLOM 3: INFRASTRUKTUR ──
    {
      id: 3,
      key: 'infrastructure',
      label: 'INFRASTRUKTUR',
      type: 'single',
      headerTitle: 'INFRASTRUKTUR',
      headerDesc: 'Fasilitas gudang modern, pusat distribusi terintegrasi, dan jaringan rantai pasok cerdas di berbagai pulau strategis.',
      bottomTitle: 'INFRASTRUKTUR',
      bottomDesc: 'Infrastruktur logistik terpadu untuk kecepatan pengiriman ke seluruh nusantara.',
      slides: 3,
      i18n: {
        'id': {
          label: 'INFRASTRUKTUR',
          headerTitle: 'INFRASTRUKTUR',
          headerDesc: 'Fasilitas gudang modern, pusat distribusi terintegrasi, dan jaringan rantai pasok cerdas di berbagai pulau strategis.',
          bottomTitle: 'INFRASTRUKTUR',
          bottomDesc: 'Infrastruktur logistik terpadu untuk kecepatan pengiriman ke seluruh nusantara.',
        },
        'en': {
          label: 'INFRASTRUCTURE',
          headerTitle: 'INFRASTRUCTURE',
          headerDesc: 'Modern warehousing facilities, integrated distribution centers, and intelligent supply chain networks across strategic islands.',
          bottomTitle: 'INFRASTRUCTURE',
          bottomDesc: 'Integrated logistics infrastructure ensuring swift nationwide delivery.',
        },
        'zh-Hans': {
          label: '基础设施',
          headerTitle: '基础设施',
          headerDesc: '现代化的仓储设施、一体化分销中心以及覆盖战略岛屿的智能供应链网络。',
          bottomTitle: '基础设施',
          bottomDesc: '一体化物流基础设施，确保全印尼快速高效交付。',
        },
      },
    },

    // ── KOLOM 4: MITRA DIGITAL ──
    {
      id: 4,
      key: 'digital-partners',
      label: 'MITRA DIGITAL',
      type: 'single',
      headerTitle: 'MITRA DIGITAL',
      headerDesc: 'Kolaborasi dengan platform teknologi terdepan, marketplace, dan ekosistem B2B modern untuk transformasi digital tanpa batas.',
      bottomTitle: 'MITRA DIGITAL',
      bottomDesc: 'Konektivitas digital untuk kemudahan akses dan transaksi mitra usaha.',
      slides: 3,
      i18n: {
        'id': {
          label: 'MITRA DIGITAL',
          headerTitle: 'MITRA DIGITAL',
          headerDesc: 'Kolaborasi dengan platform teknologi terdepan, marketplace, dan ekosistem B2B modern untuk transformasi digital tanpa batas.',
          bottomTitle: 'MITRA DIGITAL',
          bottomDesc: 'Konektivitas digital untuk kemudahan akses dan transaksi mitra usaha.',
        },
        'en': {
          label: 'DIGITAL PARTNERS',
          headerTitle: 'DIGITAL PARTNERS',
          headerDesc: 'Collaborating with cutting-edge tech platforms, leading marketplaces, and modern B2B ecosystems for seamless digital transformation.',
          bottomTitle: 'DIGITAL PARTNERS',
          bottomDesc: 'Digital connectivity for effortless accessibility and streamlined partner transactions.',
        },
        'zh-Hans': {
          label: '数字合作伙伴',
          headerTitle: '数字合作伙伴',
          headerDesc: '携手前沿技术平台、主流电商及现代B2B生态，实现无缝数字化转型。',
          bottomTitle: '数字合作伙伴',
          bottomDesc: '数字化连接，助力合作伙伴便捷获取产品与高效交易。',
        },
      },
    },

    // ── KOLOM 5: DISTRIBUSI ──
    {
      id: 5,
      key: 'distribution',
      label: 'DISTRIBUSI',
      type: 'expandable',
      parentLabel: 'DISTRIBUSI',
      defaultSub: 'brand-activation',
      headerTitle: 'AKTIVASI MEREK',
      headerDesc: 'Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.',
      bottomTitle: 'AKTIVASI MEREK',
      bottomDesc: 'Mendekatkan produk berkualitas langsung ke tangan pengguna akhir.',
      slides: 3,
      subItems: [
        {
          key: 'our-way',
          label: 'JALUR DISTRIBUSI',
          i18n: {
            'id': {
              label: 'JALUR DISTRIBUSI',
              title: 'JALUR DISTRIBUSI KAMI',
              desc: 'Jaringan distribusi menyeluruh ke lebih dari puluhan ribu mitra toko retail dan distributor resmi di seluruh Indonesia.',
            },
            'en': {
              label: 'OUR WAY FOR DISTRIBUTION',
              title: 'OUR WAY FOR DISTRIBUTION',
              desc: 'An extensive nationwide distribution network reaching tens of thousands of retail partners and authorized distributors.',
            },
            'zh-Hans': {
              label: '分销之道',
              title: '我们的分销之道',
              desc: '广泛覆盖印尼全国的分销网络，触达数万家零售合作伙伴与授权经销商。',
            },
          },
        },
        {
          key: 'brand-activation',
          label: 'AKTIVASI MEREK',
          i18n: {
            'id': {
              label: 'AKTIVASI MEREK',
              title: 'AKTIVASI MEREK',
              desc: 'Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.',
            },
            'en': {
              label: 'BRAND ACTIVATION',
              title: 'BRAND ACTIVATION',
              desc: 'Integrated brand activations through national automotive expos, mechanic workshops, educational roadshows, and industrial communities.',
            },
            'zh-Hans': {
              label: '品牌推广',
              title: '品牌推广活动',
              desc: '通过国家级汽车展会、机械维修工坊、教育巡展以及行业社群进行一体化品牌推广。',
            },
          },
        },
      ],
      i18n: {
        'id': {
          label: 'DISTRIBUSI',
          headerTitle: 'DISTRIBUSI',
          headerDesc: 'Jalur distribusi handal dan program aktivasi terdepan untuk menghadirkan nilai tambah bagi mitra dan pelanggan.',
          bottomTitle: 'DISTRIBUSI',
          bottomDesc: 'Kemitraan kokoh dari Sabang sampai Merauke.',
        },
        'en': {
          label: 'DISTRIBUTION',
          headerTitle: 'DISTRIBUTION',
          headerDesc: 'Reliable distribution channels and premier activation programs delivering real value to partners and consumers.',
          bottomTitle: 'DISTRIBUTION',
          bottomDesc: 'Steadfast partnerships connecting every corner of Indonesia.',
        },
        'zh-Hans': {
          label: '渠道分销',
          headerTitle: '渠道分销',
          headerDesc: '可靠的分销渠道与前沿的市场推广计划，为合作伙伴与客户创造持久价值。',
          bottomTitle: '渠道分销',
          bottomDesc: '跨越千岛的坚实合作纽带。',
        },
      },
    },

    // ── KOLOM 6: SUMMIT 2026 ──
    {
      id: 6,
      key: 'summit-2026',
      label: 'SUMMIT 2026',
      type: 'single',
      headerTitle: 'ALTAMA SUMMIT 2026',
      headerDesc: 'Pertemuan akbar mitra dan distributor se-Asia Tenggara untuk merayakan pencapaian, sinergi masa depan, dan inovasi berkelanjutan.',
      bottomTitle: 'ALTAMA SUMMIT 2026',
      bottomDesc: 'Kemitraan Lebih Kuat, Masa Depan Lebih Cerah.',
      slides: 3,
      i18n: {
        'id': {
          label: 'SUMMIT 2026',
          headerTitle: 'ALTAMA SUMMIT 2026',
          headerDesc: 'Pertemuan akbar mitra dan distributor se-Asia Tenggara untuk merayakan pencapaian, sinergi masa depan, dan inovasi berkelanjutan.',
          bottomTitle: 'ALTAMA SUMMIT 2026',
          bottomDesc: 'Kemitraan Lebih Kuat, Masa Depan Lebih Cerah.',
        },
        'en': {
          label: 'SUMMIT 2026',
          headerTitle: 'ALTAMA SUMMIT 2026',
          headerDesc: 'The premier grand gathering of partners and distributors across Southeast Asia celebrating synergy, future innovation, and sustainable growth.',
          bottomTitle: 'SUMMIT 2026',
          bottomDesc: 'Bigger Alliance, A Brighter Tomorrow.',
        },
        'zh-Hans': {
          label: '2026 峰会',
          headerTitle: 'ALTAMA 2026 峰会',
          headerDesc: '东南亚合作伙伴与经销商的年度盛会，共庆辉煌成就，共谋未来协同与可持续创新。',
          bottomTitle: '2026 峰会',
          bottomDesc: '更强联盟，共创辉煌明天。',
        },
      },
    },
  ],

  subItemContent: {
    'tekiro': {
      'id': {
        title: 'TEKIRO',
        desc: 'Hand tools berkualitas tinggi dan presisi standar industri Jepang untuk para mekanik dan profesional otomotif terdepan.',
      },
      'en': {
        title: 'TEKIRO',
        desc: 'High-quality precision hand tools crafted to Japanese industrial standards for leading mechanics and automotive professionals.',
      },
      'zh-Hans': {
        title: 'TEKIRO',
        desc: '符合日本工业标准的高品质精密手动工具，专为领先的机械师和汽车专业人士打造。',
      },
    },
    'ryu': {
      'id': {
        title: 'RYU POWER TOOLS',
        desc: 'Power tools bertenaga dan tahan lama yang dirancang khusus untuk memenuhi kebutuhan proyek konstruksi dan perkayuan modern.',
      },
      'en': {
        title: 'RYU POWER TOOLS',
        desc: 'High-powered, durable power tools specifically designed to meet modern construction and woodworking demands.',
      },
      'zh-Hans': {
        title: 'RYU 电动工具',
        desc: '强劲耐用的电动工具，专为满足现代建筑和木工需求而设计。',
      },
    },
    'rexco': {
      'id': {
        title: 'REXCO CHEMICALS',
        desc: 'Solusi cairan kimia perawatan industri dan otomotif untuk pembersihan, pelumasan, dan perlindungan anti-karat tingkat tinggi.',
      },
      'en': {
        title: 'REXCO CHEMICALS',
        desc: 'Industrial and automotive chemical solutions delivering superior cleaning, lubrication, and rust protection.',
      },
      'zh-Hans': {
        title: 'REXCO 化学养护',
        desc: '工业与汽车专业化学维护方案，提供卓越的清洁、润滑与强效防锈保护。',
      },
    },
    'our-way': {
      'id': {
        title: 'JALUR DISTRIBUSI KAMI',
        desc: 'Jaringan distribusi menyeluruh ke lebih dari puluhan ribu mitra toko retail dan distributor resmi di seluruh Indonesia.',
      },
      'en': {
        title: 'OUR WAY FOR DISTRIBUTION',
        desc: 'An extensive nationwide distribution network reaching tens of thousands of retail partners and authorized distributors.',
      },
      'zh-Hans': {
        title: '我们的分销之道',
        desc: '广泛覆盖印尼全国的分销网络，触达数万家零售合作伙伴与授权经销商。',
      },
    },
    'brand-activation': {
      'id': {
        title: 'AKTIVASI MEREK',
        desc: 'Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.',
      },
      'en': {
        title: 'BRAND ACTIVATION',
        desc: 'Integrated brand activations through national automotive expos, mechanic workshops, educational roadshows, and industrial communities.',
      },
      'zh-Hans': {
        title: '品牌推广活动',
        desc: '通过国家级汽车展会、机械维修工坊、教育巡展以及行业社群进行一体化品牌推广。',
      },
    },
  },
};
