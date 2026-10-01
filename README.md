# Altama Interactive Wall & Milestone

![Static Badge](https://img.shields.io/badge/license-MIT-brightgreen?label=LICENSE)

Aplikasi kiosk interaktif fullscreen berbasis **Nuxt 4** untuk instalasi LED wall interaktif ALTAMA beresolusi **2304 × 1344** (rasio 12:7). Dilengkapi kontrol sensor LiDAR melalui WebSocket, interaksi *hold-to-activate*, navigasi komprehensif, dan arsitektur modular yang stabil.

---

## 🌟 Fitur Utama

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
  - `1` – `6`: Membuka atau mengaktifkan kolom 1 sampai 6.
  - `Escape` / `R`: Mereset seluruh kolom kembali ke status *idle*.
  - `D`: Menampilkan panel diagnostik status sensor & WebSocket (hanya mode dev).

---

## 🚀 Menjalankan Aplikasi

Pastikan Anda telah memasang **[Bun](https://bun.sh/)** (atau Node.js).

### 1. Instalasi Dependensi
```bash
bun install
```

### 2. Jalankan Server Pengembangan
```bash
bun run dev
```
Buka browser di `http://localhost:3000`.

### 3. Build & Pratinjau Produksi
```bash
# Build aplikasi untuk production
bun run build

# Menghasilkan static site (SSG)
bun run generate

# Preview hasil build
bun run preview
```

---

## 🧪 Validasi & Pengujian

Sebelum melakukan commit atau push, seluruh pemeriksaan kualitas dapat dijalankan dengan:

```bash
bun run lint          # Cek linting dan formatting ESLint
bun run typecheck     # Cek tipe data TypeScript Nuxt
bun run test          # Jalankan unit test Vitest
bun run assets:check  # Validasi kelengkapan aset & resolusi gambar
```

---

## 📁 Struktur Direktori

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
├── public/               # Aset statis publik (bendera, ikon, gambar)
├── shared/               # Definisi geometri sensor & layout JSON
├── test/                 # Pengujian otomatis berbasis Vitest
├── docs/                 # Dokumentasi arsitektur, alur push, & rilis
└── nuxt.config.ts        # Konfigurasi utama Nuxt
```

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi [MIT](LICENSE).
