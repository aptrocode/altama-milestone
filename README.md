# Altama Interactive Wall & Milestone

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Aplikasi kiosk interaktif fullscreen berbasis **Nuxt 4** untuk instalasi LED wall interaktif ALTAMA beresolusi **2304 × 1344** (rasio 12:7). Dilengkapi kontrol sensor LiDAR melalui WebSocket, interaksi *hold-to-activate*, navigasi komprehensif, dan arsitektur modular yang stabil.

---

## 🚀 Fitur Utama

- **Layout 6 Kolom Interaktif**:
  1. **ABOUT ALTAMA** — Tombol utama dengan galeri foto carousel & deskripsi.
  2. **OUR BRANDS** — Kategori bertingkat dengan sub-menu (TEKIRO, RYU, REXCO) & galeri foto.
  3. **INFRASTRUCTURE** — Galeri foto infrastruktur & deskripsi operasional.
  4. **DIGITAL PARTNERS** — Tampilan mitra digital & kolaborasi.
  5. **DISTRIBUTION** — Kategori bertingkat (OUR WAY FOR DISTRIBUTION, BRAND ACTIVATION).
  6. **SUMMIT 2026** — Informasi agenda Summit 2026 & galeri foto.
- **Interaksi Hold-to-Activate (1 Detik)**: Mencegah sentuhan tidak sengaja pada layar sentuh / sensor LiDAR dengan animasi cincin laser (*laser spark tracer*) dan efek emerald neon glow.
- **Integrasi Sensor LiDAR**: Koneksi native WebSocket (`useSensorSocket`) untuk menangani event sentuhan sensor Hokuyo secara real-time.
- **Keyboard Shortcuts (Mode Operator / Testing)**:
  - `1` — `6`: Membuka atau mengaktifkan kolom 1 sampai 6.
  - `Escape` / `R`: Mereset seluruh kolom kembali ke status *idle*.
  - `D`: Menampilkan panel diagnostik status sensor & WebSocket (hanya mode dev).

---

## 💻 Menjalankan Aplikasi

### Opsi A: Standalone Preview Langsung (Tanpa Node / Bun)
Buka file berikut langsung di Google Chrome atau Microsoft Edge:
```text
mainProject/altama-wallmessage.html
```

### Opsi B: Aplikasi Nuxt 4 (Mode Dev / Kiosk)
Pastikan Anda telah memasang **[Bun](https://bun.sh/)** (atau Node.js).

```bash
# 1. Instalasi dependensi
bun install

# 2. Jalankan server pengembangan
bun run dev

# 3. Build untuk production
bun run build
bun run generate
bun run preview
```

---

## 📂 Struktur Direktori

```text
altama-milestone/
├── app/                  # Kode aplikasi Nuxt 4 (Vue 3 + TypeScript)
│   ├── assets/css/       # Desain sistem modular, variabel, & animasi
│   ├── components/kiosk/ # Komponen utama dinding interaktif & status
│   ├── composables/      # useSensorSocket & integrasi WebSocket
│   ├── data/             # Konfigurasi dinding (wall-config.ts) & layout
│   ├── plugins/          # Direktif kustom (v-hold)
│   ├── stores/           # State management Pinia (wall.ts, system.ts)
│   └── pages/index.vue   # Halaman utama kiosk
├── mainProject/          # Versi standalone HTML/CSS/JS (langsung di browser)
│   ├── altama-wallmessage.html # Halaman utama standalone
│   ├── css/              # Stylesheet modular
│   ├── js/               # Master config.js, renderer.js, state.js, dll.
│   └── assets/images/    # Folder foto / gambar carousel
├── public/               # Aset statis publik
├── shared/               # Definisi geometri sensor & layout JSON
├── test/                 # Pengujian otomatis berbasis Vitest
├── docs/                 # Dokumentasi arsitektur, alur push, & rilis
└── nuxt.config.ts        # Konfigurasi utama Nuxt
```

---

## 📜 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
