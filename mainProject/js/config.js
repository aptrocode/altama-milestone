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
          headerDesc: 'ALTAMA premier brand portfolio trusted by millions across industrial and automotive sectors.',
          bottomTitle: 'OUR BRANDS',
          bottomDesc: 'Quality, precision, and relentless innovation in every product.',
        },
        'zh': {
          label: '我们的品牌',
          labelHtml: '我们的<br/>品牌',
          headerTitle: '我们的品牌',
          headerDesc: '深受工业和汽车领域数百万用户信赖的 ALTAMA 顶尖品牌组合。',
          bottomTitle: '我们的品牌',
          bottomDesc: '每件产品的卓越品质、精密制造与持续创新。',
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
          headerDesc: 'Modern automated warehousing, integrated distribution hubs, and intelligent supply chains across key Indonesian archipelagos.',
          bottomTitle: 'INFRASTRUCTURE',
          bottomDesc: 'Integrated logistics infrastructure delivering unprecedented speed nationwide.',
        },
        'zh': {
          label: '基础设施',
          labelHtml: '基础<br/>设施',
          headerTitle: '基础设施',
          headerDesc: '跨越关键战略岛屿的现代化仓储、集成配送中心与智能化供应链网络。',
          bottomTitle: '基础设施',
          bottomDesc: '一体化物流基础设施，保障全国各地的高效配送。',
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
          headerDesc: 'Seamless integration with leading tech platforms, marketplaces, and modern B2B systems for borderless digital transformation.',
          bottomTitle: 'DIGITAL PARTNERS',
          bottomDesc: 'Digital connectivity providing effortless accessibility and transactions.',
        },
        'zh': {
          label: '数字伙伴',
          labelHtml: '数字<br/>伙伴',
          headerTitle: '数字伙伴',
          headerDesc: '携手顶尖科技平台、电商市场与现代化 B2B 生态系统，推动无界数字化转型。',
          bottomTitle: '数字伙伴',
          bottomDesc: '数字化互联互通，赋能商业伙伴的便捷获取与顺畅交易。',
        },
      },
    },

    // ── KOLOM 5: DISTRIBUSI (JALUR DISTRIBUSI, AKTIVASI MEREK) ──
    {
      id: 5,
      key: 'distribution',
      type: 'expandable',
      defaultSub: 'our-way',
      slides: 3,
      subItems: [
        {
          key: 'our-way',
          i18n: {
            'id': {
              label: 'JALUR DISTRIBUSI',
              title: 'JALUR DISTRIBUSI',
              desc: 'Jaringan distribusi multi-tier terpadu yang menjangkau ribuan toko ritel, bengkel, dan industri di seluruh pelosok tanah air.',
              bottomDesc: 'Distribusi handal menjangkau seluruh pelosok negeri.',
            },
            'en': {
              label: 'DISTRIBUTION CHANNELS',
              title: 'DISTRIBUTION CHANNELS',
              desc: 'Multi-tier distribution network reaching thousands of retail stores, workshops, and industrial partners nationwide.',
              bottomDesc: 'Reliable distribution reaching every corner of the archipelago.',
            },
            'zh': {
              label: '分销渠道',
              title: '分销渠道',
              desc: '多层次的一体化分销网络，触达全国数千家零售店、维修中心与工业终端伙伴。',
              bottomDesc: '可靠分销体系，覆盖群岛每个角落。',
            },
          },
        },
        {
          key: 'brand-activation',
          i18n: {
            'id': {
              label: 'AKTIVASI MEREK',
              title: 'AKTIVASI MEREK',
              desc: 'Program edukasi mekanik, demo langsung di lapangan, roadshow pameran, serta kemitraan komunitas komunitas teknik berkesinambungan.',
              bottomDesc: 'Program aktivasi aktif mendekatkan produk dengan pengguna.',
            },
            'en': {
              label: 'BRAND ACTIVATION',
              title: 'BRAND ACTIVATION',
              desc: 'Hands-on mechanic training workshops, on-site demonstrations, national exhibition roadshows, and active engineering partnerships.',
              bottomDesc: 'Active engagement bringing exceptional products closer to end users.',
            },
            'zh': {
              label: '品牌激活',
              title: '品牌激活',
              desc: '针对机械师的专业培训工坊、现场实操演示、全国巡回展览及深度的行业社区合作。',
              bottomDesc: '多维品牌互动，拉近优质产品与终端用户的距离。',
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
          headerDesc: 'World-class multi-channel distribution and impactful brand activations generating tangible value for partners.',
          bottomTitle: 'DISTRIBUTION',
          bottomDesc: 'Unshakable partnerships spanning across Indonesia.',
        },
        'zh': {
          label: '分销与拓展',
          labelHtml: '分销<br/>拓展',
          headerTitle: '分销与拓展',
          headerDesc: '顶尖的多渠道分销体系与卓越的品牌激活活动，为合作伙伴持续创造深厚价值。',
          bottomTitle: '分销与拓展',
          bottomDesc: '从沙璜到马老奇的坚固合作伙伴关系。',
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
          headerDesc: 'Premier regional summit uniting partners and distributors across Southeast Asia to celebrate achievements and craft tomorrow.',
          bottomTitle: 'ALTAMA SUMMIT 2026',
          bottomDesc: 'Stronger Partnerships, Brighter Tomorrow.',
        },
        'zh': {
          label: '峰会 2026',
          labelHtml: '峰会<br/>2026',
          headerTitle: 'ALTAMA 峰会 2026',
          headerDesc: '汇聚东南亚各地合作伙伴与分销商的年度盛会，共庆辉煌成就，共谋未来宏图与可持续创新。',
          bottomTitle: 'ALTAMA 峰会 2026',
          bottomDesc: '更强伙伴关系，共筑璀璨未来。',
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
