/* ==========================================================================
   ALTAMA Interactive Wall — Master Configuration
   Supported Languages: 'id' (Indonesia), 'en' (English), 'zh' (Mandarin)
   ========================================================================== */

const WALL_CONFIG = {
  currentLocale: 'id',
  locales: ['id', 'en', 'zh'],

  settings: {
    holdDuration: 1000,       // 1 second hold-to-activate
    autoResetSeconds: 15,     // 15 seconds auto-return to idle button
  },

  columns: [
    // ── KOLOM 1: TENTANG ALTAMA ──
    {
      id: 1,
      key: 'about-altama',
      type: 'single',
      slides: 3,
      i18n: {
        'id': {
          label: 'TENTANG ALTAMA',
          labelHtml: 'TENTANG<br/>ALTAMA',
          headerTitle: 'TENTANG ALTAMA',
          headerDesc: 'Membangun ekosistem kemitraan yang kuat, tangguh, dan berkelanjutan untuk memberdayakan industri dan profesional di seluruh Indonesia.',
          bottomTitle: 'TENTANG ALTAMA',
          bottomDesc: 'Fondasi keunggulan dan kemitraan terpercaya sejak 1967.',
        },
        'en': {
          label: 'ABOUT ALTAMA',
          labelHtml: 'ABOUT<br/>ALTAMA',
          headerTitle: 'ABOUT ALTAMA',
          headerDesc: 'Building a strong, resilient, and sustainable ecosystem to empower industries and professionals across Indonesia.',
          bottomTitle: 'ABOUT ALTAMA',
          bottomDesc: 'The foundation of excellence and trusted partnership since 1967.',
        },
        'zh': {
          label: '关于 ALTAMA',
          labelHtml: '关于<br/>ALTAMA',
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
      type: 'expandable',
      defaultSub: 'ryu',
      slides: 3,
      subItems: [
        {
          key: 'tekiro',
          i18n: {
            'id': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: 'Hand tools berkualitas tinggi dan presisi standar industri Jepang untuk para mekanik dan profesional otomotif terdepan.',
              bottomDesc: 'Perkakas tangan terpercaya pilihan utama industri Indonesia.',
            },
            'en': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: 'High-quality precision hand tools crafted to Japanese industrial standards for leading mechanics and automotive professionals.',
              bottomDesc: 'Trusted hand tools, the premier choice of Indonesian industry.',
            },
            'zh': {
              label: 'TEKIRO',
              title: 'TEKIRO',
              desc: '符合日本工业标准的高品质精密手动工具，专为领先的机械师和汽车专业人士打造。',
              bottomDesc: '值得信赖的手动工具，印尼工业首选。',
            },
          },
        },
        {
          key: 'ryu',
          i18n: {
            'id': {
              label: 'RYU',
              title: 'RYU',
              desc: 'Power tools bertenaga dan tahan lama yang dirancang khusus untuk memenuhi kebutuhan proyek konstruksi dan perkayuan modern.',
              bottomDesc: 'Solusi alat perkakas mesin terbaik dan teruji.',
            },
            'en': {
              label: 'RYU',
              title: 'RYU POWER TOOLS',
              desc: 'High-powered, durable power tools specifically designed to meet modern construction and woodworking demands.',
              bottomDesc: 'The finest tested and proven power tool solutions.',
            },
            'zh': {
              label: 'RYU',
              title: 'RYU 电动工具',
              desc: '强劲耐用的电动工具，专为满足现代建筑和木工需求而设计。',
              bottomDesc: '经过验证的最佳电动工具解决方案。',
            },
          },
        },
        {
          key: 'rexco',
          i18n: {
            'id': {
              label: 'REXCO',
              title: 'REXCO',
              desc: 'Solusi cairan kimia perawatan industri dan otomotif untuk pembersihan, pelumasan, dan perlindungan anti-karat tingkat tinggi.',
              bottomDesc: 'Perlindungan maksimal dari karat dan keausan.',
            },
            'en': {
              label: 'REXCO',
              title: 'REXCO CHEMICALS',
              desc: 'Industrial and automotive chemical solutions delivering superior cleaning, lubrication, and rust protection.',
              bottomDesc: 'Maximum protection against rust and wear.',
            },
            'zh': {
              label: 'REXCO',
              title: 'REXCO 化学养护',
              desc: '工业与汽车专业化学维护方案，提供卓越的清洁、润滑与防锈保护。',
              bottomDesc: '防锈防磨损的极致保护。',
            },
          },
        },
      ],
      i18n: {
        'id': {
          label: 'MEREK KAMI',
          labelHtml: 'MEREK<br/>KAMI',
          headerTitle: 'MEREK KAMI',
          headerDesc: 'Portofolio merek unggulan ALTAMA yang dipercaya jutaan pengguna di seluruh sektor industri dan otomotif.',
          bottomTitle: 'MEREK KAMI',
          bottomDesc: 'Kualitas, presisi, dan inovasi pada setiap produk.',
        },
        'en': {
          label: 'OUR BRANDS',
          labelHtml: 'OUR<br/>BRANDS',
          headerTitle: 'OUR BRANDS',
          headerDesc: "ALTAMA's flagship brand portfolio trusted by millions of users across industrial and automotive sectors.",
          bottomTitle: 'OUR BRANDS',
          bottomDesc: 'Quality, precision, and innovation in every single product.',
        },
        'zh': {
          label: '我们的品牌',
          labelHtml: '我们的<br/>品牌',
          headerTitle: '我们的品牌',
          headerDesc: 'ALTAMA旗下旗舰品牌组合，深受工业与汽车领域数百万用户的信赖。',
          bottomTitle: '我们的品牌',
          bottomDesc: '每一件产品都凝聚品质、精密与创新。',
        },
      },
    },

    // ── KOLOM 3: INFRASTRUKTUR ──
    {
      id: 3,
      key: 'infrastructure',
      type: 'single',
      slides: 3,
      i18n: {
        'id': {
          label: 'INFRASTRUKTUR',
          labelHtml: 'INFRA-<br/>STRUKTUR',
          headerTitle: 'INFRASTRUKTUR',
          headerDesc: 'Fasilitas gudang modern, pusat distribusi terintegrasi, dan jaringan rantai pasok cerdas di berbagai pulau strategis.',
          bottomTitle: 'INFRASTRUKTUR',
          bottomDesc: 'Infrastruktur logistik terpadu untuk kecepatan pengiriman ke seluruh nusantara.',
        },
        'en': {
          label: 'INFRASTRUCTURE',
          labelHtml: 'INFRA-<br/>STRUCTURE',
          headerTitle: 'INFRASTRUCTURE',
          headerDesc: 'Modern warehouse facilities, integrated distribution centers, and smart supply chain networks across strategic islands.',
          bottomTitle: 'INFRASTRUCTURE',
          bottomDesc: 'Integrated logistics infrastructure delivering rapid nationwide shipping.',
        },
        'zh': {
          label: '基础设施',
          labelHtml: '基础<br/>设施',
          headerTitle: '基础设施',
          headerDesc: '现代仓储设施、一体化分销中心与遍布战略要地的智能供应链网络。',
          bottomTitle: '基础设施',
          bottomDesc: '一体化物流基础设施，保障印尼全境极速配送。',
        },
      },
    },

    // ── KOLOM 4: MITRA DIGITAL ──
    {
      id: 4,
      key: 'digital-partners',
      type: 'single',
      slides: 3,
      i18n: {
        'id': {
          label: 'MITRA DIGITAL',
          labelHtml: 'MITRA<br/>DIGITAL',
          headerTitle: 'MITRA DIGITAL',
          headerDesc: 'Kolaborasi dengan platform teknologi terdepan, marketplace, dan ekosistem B2B modern untuk transformasi digital tanpa batas.',
          bottomTitle: 'MITRA DIGITAL',
          bottomDesc: 'Konektivitas digital untuk kemudahan akses dan transaksi mitra usaha.',
        },
        'en': {
          label: 'DIGITAL PARTNERS',
          labelHtml: 'DIGITAL<br/>PARTNERS',
          headerTitle: 'DIGITAL PARTNERS',
          headerDesc: 'Collaboration with leading technology platforms, marketplaces, and modern B2B ecosystems for seamless digital transformation.',
          bottomTitle: 'DIGITAL PARTNERS',
          bottomDesc: 'Digital connectivity for effortless access and business partner transactions.',
        },
        'zh': {
          label: '数字合作伙伴',
          labelHtml: '数字<br/>伙伴',
          headerTitle: '数字合作伙伴',
          headerDesc: '与领先科技平台、电商市场和现代B2B生态深度合作，实现无缝数字化转型。',
          bottomTitle: '数字合作伙伴',
          bottomDesc: '数字化互联，助力商业伙伴便捷接入与高效交易。',
        },
      },
    },

    // ── KOLOM 5: DISTRIBUSI ──
    {
      id: 5,
      key: 'distribution',
      type: 'expandable',
      defaultSub: 'brand-activation',
      slides: 3,
      subItems: [
        {
          key: 'our-way',
          i18n: {
            'id': {
              label: 'JALUR DISTRIBUSI',
              title: 'JALUR DISTRIBUSI KAMI',
              desc: 'Jaringan distribusi menyeluruh ke lebih dari puluhan ribu mitra toko retail dan distributor resmi di seluruh Indonesia.',
              bottomDesc: 'Distribusi merata ke seluruh pelosok negeri.',
            },
            'en': {
              label: 'DISTRIBUTION NETWORK',
              title: 'OUR DISTRIBUTION NETWORK',
              desc: 'Comprehensive distribution network covering tens of thousands of retail partner stores and authorized distributors across Indonesia.',
              bottomDesc: 'Nationwide distribution coverage.',
            },
            'zh': {
              label: '分销渠道',
              title: '分销渠道',
              desc: '遍布印尼的全面分销网络，覆盖数万家零售合作门店和官方分销商。',
              bottomDesc: '全面覆盖的全国性分销网络。',
            },
          },
        },
        {
          key: 'brand-activation',
          i18n: {
            'id': {
              label: 'AKTIVASI MEREK',
              title: 'AKTIVASI MEREK',
              desc: 'Aktivasi merek terpadu melalui pameran otomotif nasional, workshop mekanik, roadshow edukasi, dan komunitas industri.',
              bottomDesc: 'Mendekatkan produk berkualitas langsung ke tangan pengguna akhir.',
            },
            'en': {
              label: 'BRAND ACTIVATION',
              title: 'BRAND ACTIVATION',
              desc: 'Integrated brand activations through national automotive expos, mechanic workshops, educational roadshows, and industrial communities.',
              bottomDesc: 'Connecting premium products directly with end users.',
            },
            'zh': {
              label: '品牌推广',
              title: '品牌推广',
              desc: '通过国家级汽配展会、技师工坊、巡回路演及行业社群进行一体化品牌推广。',
              bottomDesc: '将优质产品直达终端用户。',
            },
          },
        },
      ],
      i18n: {
        'id': {
          label: 'DISTRIBUSI',
          labelHtml: 'DISTRI-<br/>BUSI',
          headerTitle: 'DISTRIBUSI',
          headerDesc: 'Jalur distribusi handal dan program aktivasi terdepan untuk menghadirkan nilai tambah bagi mitra dan pelanggan.',
          bottomTitle: 'DISTRIBUSI',
          bottomDesc: 'Kemitraan kokoh dari Sabang sampai Merauke.',
        },
        'en': {
          label: 'DISTRIBUTION',
          labelHtml: 'DISTRI-<br/>BUTION',
          headerTitle: 'DISTRIBUTION',
          headerDesc: 'Reliable distribution channels and premier brand activation programs delivering superior value to partners and customers.',
          bottomTitle: 'DISTRIBUTION',
          bottomDesc: 'Solid partnerships spanning from Sabang to Merauke.',
        },
        'zh': {
          label: '分销网络',
          labelHtml: '分销<br/>网络',
          headerTitle: '分销网络',
          headerDesc: '稳健的分销网络与前沿的品牌活动，为合作伙伴及客户创造卓越价值。',
          bottomTitle: '分销网络',
          bottomDesc: '坚实的合作伙伴关系，覆盖从沙璜到马老奇的广大疆域。',
        },
      },
    },

    // ── KOLOM 6: ALTAMA SUMMIT 2026 ──
    {
      id: 6,
      key: 'summit-2026',
      type: 'single',
      slides: 3,
      i18n: {
        'id': {
          label: 'SUMMIT 2026',
          labelHtml: 'SUMMIT<br/>2026',
          headerTitle: 'ALTAMA SUMMIT 2026',
          headerDesc: 'Pertemuan akbar mitra dan distributor se-Asia Tenggara untuk merayakan pencapaian, sinergi masa depan, dan inovasi berkelanjutan.',
          bottomTitle: 'ALTAMA SUMMIT 2026',
          bottomDesc: 'Kemitraan Lebih Kuat, Masa Depan Lebih Cerah.',
        },
        'en': {
          label: 'SUMMIT 2026',
          labelHtml: 'SUMMIT<br/>2026',
          headerTitle: 'ALTAMA SUMMIT 2026',
          headerDesc: 'Grand gathering of partners and distributors across Southeast Asia to celebrate achievements, future synergy, and sustainable innovation.',
          bottomTitle: 'ALTAMA SUMMIT 2026',
          bottomDesc: 'Stronger Alliance, Brighter Future.',
        },
        'zh': {
          label: 'ALTAMA 2026 峰会',
          labelHtml: '2026<br/>峰会',
          headerTitle: 'ALTAMA 2026 峰会',
          headerDesc: '东南亚合作伙伴与分销商年度盛会，共庆卓越成就，共绘未来蓝图。',
          bottomTitle: 'ALTAMA 2026 峰会',
          bottomDesc: '携手聚力，共创辉煌。',
        },
      },
    },
  ],

  getColData(colId, locale = null) {
    const loc = locale || this.currentLocale || 'id';
    const col = this.columns.find(c => c.id === colId);
    if (!col) return null;
    const locData = (col.i18n && col.i18n[loc]) ? col.i18n[loc] : col.i18n['id'];
    return { ...col, ...locData };
  },

  getSubData(colId, subKey, locale = null) {
    const loc = locale || this.currentLocale || 'id';
    const col = this.columns.find(c => c.id === colId);
    if (!col || !col.subItems) return null;
    const sub = col.subItems.find(s => s.key === subKey);
    if (!sub) return null;
    const locData = (sub.i18n && sub.i18n[loc]) ? sub.i18n[loc] : sub.i18n['id'];
    return { ...sub, ...locData };
  },
};
