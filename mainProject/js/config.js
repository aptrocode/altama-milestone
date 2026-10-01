/* ==========================================================================
   ALTAMA Interactive Wall — Master Configuration & Content Management
   ==========================================================================
   PANDUAN LENGKAP PENGEDITAN:

   1. CARA MENGGANTI FOTO CAROUSEL:
      - Simpan file foto Anda di folder: `assets/images/`
      - Masukkan nama filenya pada properti `image` di bawah.
        Contoh: image: "assets/images/about-01.jpg"
      - Jika nilai `image: ""` (dikosongkan), sistem otomatis menampilkan
        placeholder abu-abu SVG bawaan yang rapi.
      - Anda bisa mengubah teks keterangan di `caption`.

   2. CARA MENAMBAH / MENGURANGI FOTO (SLIDES):
      - Cukup tambahkan atau hapus baris `{ id: ..., image: "...", caption: "..." }`
        pada array `slides`.
      - Indikator nomor (misal 01 / 03 atau 01 / 04) akan otomatis menyesuaikan!

   3. CARA MENGUBAH JUDUL & DESKRIPSI:
      - `headerTitle`: Judul besar di Zona Atas saat tombol aktif.
      - `headerDesc`: Paragraf penjelasan di Zona Atas.
      - `bottomTitle`: Judul di Zona Bawah.
      - `bottomDesc`: Penjelasan singkat di Zona Bawah.

   4. PENGATURAN TIMER & INTERAKSI (APP_SETTINGS):
      - `holdDuration`: Waktu tekan-tahan tombol (default: 1000 = 1 detik).
      - `autoResetIdleTime`: Waktu kembali otomatis ke standby (0 = nonaktif).
      - `enableKeyboardShortcuts`: Aktifkan tombol angka 1-6 & Esc di keyboard.
   ========================================================================== */

const APP_SETTINGS = {
  // Durasi tekan-tahan tombol (dalam milidetik: 1000 ms = 1 detik)
  holdDuration: 1000,

  // Waktu standby auto-reset ke tampilan awal saat tidak ada interaksi
  // Isi dalam milidetik (contoh: 60000 = 1 menit). Isi 0 untuk menonaktifkan.
  autoResetIdleTime: 0,

  // Shortcut keyboard untuk simulasi/testing (1-6 kolom, Esc/R reset)
  enableKeyboardShortcuts: true,

  // Konten Zona Branding Atas saat keadaan standby (semua tombol belum dipilih)
  branding: {
    logoText: 'ALTAMA',
    tagline: 'SURPASSING HORIZONS, ELEVATING EXCELLENCE',
  },
};

const COLUMNS_DATA = [
  // ── KOLOM 1: ABOUT ALTAMA ──
  {
    id: 1,
    key: 'about-altama',
    label: 'ABOUT ALTAMA',
    labelHtml: 'ABOUT<br/>ALTAMA',
    type: 'single', // Tipe single: langsung membuka panel foto
    headerTitle: 'ABOUT ALTAMA',
    headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    bottomTitle: 'ABOUT ALTAMA',
    bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    slides: [
      {
        id: 1,
        image: '', // Ganti path foto: contoh 'assets/images/about-01.jpg'
        caption: 'PLACEHOLDER FOTO 01',
      },
      {
        id: 2,
        image: '',
        caption: 'PLACEHOLDER FOTO 02',
      },
      {
        id: 3,
        image: '',
        caption: 'PLACEHOLDER FOTO 03',
      },
    ],
  },

  // ── KOLOM 2: OUR BRANDS (TEKIRO, RYU, REXCO) ──
  {
    id: 2,
    key: 'our-brands',
    label: 'OUR BRANDS',
    labelHtml: 'OUR<br/>BRANDS',
    type: 'expandable', // Tipe expandable: memiliki sub-menu
    parentLabel: 'OUR BRANDS',
    defaultSub: 'tekiro',
    subItems: [
      {
        key: 'tekiro',
        label: 'TEKIRO',
        labelHtml: 'TEKIRO',
        headerTitle: 'TEKIRO',
        headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bottomTitle: 'TEKIRO',
        bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        slides: [
          { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
          { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
          { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
        ],
      },
      {
        key: 'ryu',
        label: 'RYU',
        labelHtml: 'RYU',
        headerTitle: 'RYU',
        headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        bottomTitle: 'RYU',
        bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        slides: [
          { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
          { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
          { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
        ],
      },
      {
        key: 'rexco',
        label: 'REXCO',
        labelHtml: 'REXCO',
        headerTitle: 'REXCO',
        headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        bottomTitle: 'REXCO',
        bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        slides: [
          { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
          { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
          { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
        ],
      },
    ],
  },

  // ── KOLOM 3: INFRASTRUCTURE ──
  {
    id: 3,
    key: 'infrastructure',
    label: 'INFRASTRUCTURE',
    labelHtml: 'INFRA-<br/>STRUCTURE',
    type: 'single',
    headerTitle: 'INFRASTRUCTURE',
    headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    bottomTitle: 'INFRASTRUCTURE',
    bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    slides: [
      { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
      { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
      { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
    ],
  },

  // ── KOLOM 4: DIGITAL PARTNERS ──
  {
    id: 4,
    key: 'digital-partners',
    label: 'DIGITAL PARTNERS',
    labelHtml: 'DIGITAL<br/>PARTNERS',
    type: 'single',
    headerTitle: 'DIGITAL PARTNERS',
    headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    bottomTitle: 'DIGITAL PARTNERS',
    bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    slides: [
      { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
      { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
      { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
    ],
  },

  // ── KOLOM 5: DISTRIBUTION (OUR WAY, BRAND ACTIVATION) ──
  {
    id: 5,
    key: 'distribution',
    label: 'DISTRIBUTION',
    labelHtml: 'DISTRI-<br/>BUTION',
    type: 'expandable',
    parentLabel: 'DISTRIBUTION',
    defaultSub: 'brand-activation',
    subItems: [
      {
        key: 'our-way',
        label: 'OUR WAY FOR DISTRIBUTION',
        labelHtml: 'OUR WAY FOR<br/>DISTRIBUTION',
        headerTitle: 'OUR WAY FOR DISTRIBUTION',
        headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
        bottomTitle: 'OUR WAY FOR DISTRIBUTION',
        bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        slides: [
          { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
          { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
          { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
        ],
      },
      {
        key: 'brand-activation',
        label: 'BRAND ACTIVATION',
        labelHtml: 'BRAND<br/>ACTIVATION',
        headerTitle: 'BRAND ACTIVATION',
        headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        bottomTitle: 'BRAND ACTIVATION',
        bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        slides: [
          { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
          { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
          { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
        ],
      },
    ],
  },

  // ── KOLOM 6: SUMMIT 2026 ──
  {
    id: 6,
    key: 'summit-2026',
    label: 'SUMMIT 2026',
    labelHtml: 'SUMMIT<br/>2026',
    type: 'single',
    headerTitle: 'SUMMIT 2026',
    headerDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    bottomTitle: 'SUMMIT 2026',
    bottomDesc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    slides: [
      { id: 1, image: '', caption: 'PLACEHOLDER FOTO 01' },
      { id: 2, image: '', caption: 'PLACEHOLDER FOTO 02' },
      { id: 3, image: '', caption: 'PLACEHOLDER FOTO 03' },
    ],
  },
];

// Compatibility alias for legacy scripts
const WALL_CONFIG = {
  columns: COLUMNS_DATA,
  subItemContent: {},
};

// Build subItemContent lookup automatically
COLUMNS_DATA.forEach(col => {
  if (col.subItems) {
    col.subItems.forEach(sub => {
      WALL_CONFIG.subItemContent[sub.key] = {
        title: sub.headerTitle,
        desc: sub.headerDesc,
      };
    });
  }
});
