# Altama Interactive Wall

Kiosk Nuxt 4 fullscreen untuk LED wall **ALTAMA Summit 2026** (2304 × 1344). Enam kolom berdiri sendiri (Tentang Altama, Our Brand, Infrastruktur, Digital Trust, Distribusi & Pemasaran, Altama Summit 2026), masing-masing dalam bahasa Indonesia, English, dan 中文. Bisa dipakai lewat sentuh/mouse (hold), keyboard, OSC, atau sensor (Hokuyo, Augmenta, TUIO/TouchDesigner). HP dan tablet mendapat tampilan bertumpuk yang bisa di-scroll.

## Development

Butuh [Bun](https://bun.sh).

```bash
bun install --frozen-lockfile
bun dev
```

`bun dev` menjalankan **wall + dashboard** (Nuxt, `http://localhost:3000`) dan **Sensor Service** (WebSocket `8787`, OSC `9000`) sekaligus dalam satu terminal; log service diberi awalan `[sensor]`. Ringan: tanpa sensor aktif, service hanya menunggu koneksi. Jika Sensor Service sudah berjalan di terminal lain, `bun dev` memakainya. Hanya Nuxt: `bun run dev:web`.

| Alamat | Isi |
| :--- | :--- |
| `http://localhost:3000` | Wall |
| `http://localhost:3000/dashboard` | Dashboard operator (Wall, Hold, Font, Sensor) |

Input sensor ke wall default mati; nyalakan dengan `NUXT_PUBLIC_SENSOR_ENABLED=true` di `.env` (contoh: `.env.example`).

## PC event (Windows, sekali klik)

Di event **jangan** pakai `bun dev`. Klik dua kali **`start-wall.bat`**:

1. build produksi (hanya jika kode berubah),
2. jalankan server wall + Sensor Service,
3. buka wall fullscreen di Chrome/Edge (mode kiosk).

**Tutup jendela terminalnya** untuk mematikan semuanya. Dashboard dibuka dari wall dengan **Ctrl+Shift+D** (tekan lagi untuk kembali), di browser yang sama sehingga pengaturannya tersimpan di sana. Semua jalan lokal tanpa internet atau VPS. Opsi port/sensor lewat `.env` (lihat `scripts/wall-launcher.ps1`).

## Dashboard (`/dashboard`)

- **Wall**: bar bahasa (Compact / Full width / Grid 2 + 1), posisi Y card, tombol close (ukuran & posisi), tombol slider + auto slide, tombol page + auto page, Scroll teks (uji coba, section 1 & 6), reset otomatis, titik sentuh.
- **Hold**: cara menekan tiap jenis tombol, **Tap / Hold / Tap + delay**, dan durasinya (bahasa & close default Tap).
- **Font**: ukuran judul, nama sub-item, caption tile, tab, ketebalan judul, dan rentang **Min–Maks** isi card per section (default 24–26 px) dengan status muat.
- **Sensor**: sumber sentuh, port, kalibrasi Hokuyo, status live.

Sidebar: export/import pengaturan, fullscreen, reset ke default. Detail: [docs/dashboard.md](docs/dashboard.md).

## Kontrol

| Tombol | Fungsi |
| :--- | :--- |
| `1`–`6` | Buka/tutup kolom |
| `Esc` / `R` | Reset semua kolom |
| `←` `→` / `PageUp` `PageDown` | Foto sebelumnya/berikutnya di kolom terbuka paling kiri |
| `Enter` / `Space` | Aktifkan tombol yang fokus tanpa hold |
| `Ctrl+Shift+D` | Buka dashboard / kembali ke wall |

Sensor dan show control: Hokuyo UST-10LX (Ethernet), Augmenta (UDP `12000`), TUIO 1.1 dari OptiTUIO/TouchDesigner (UDP `3333`), semuanya multitouch; perintah OSC `/altama/*` di UDP `9000`. **Cara menyambungkan sensor, langkah demi langkah: [PANDUAN-SENSOR.md](PANDUAN-SENSOR.md).** Simulator dan detail protokol: [docs/sensor.md](docs/sensor.md).

## Struktur & dokumentasi

| Folder | Isi |
| :--- | :--- |
| `app/` | UI Nuxt: wall, dashboard, store, konten per kolom (`app/data/columns/`) |
| `shared/` | Aksi, geometri, dan pengaturan yang dipakai wall dan Sensor Service |
| `sensor-service/` | Sensor Service (Bun) |
| `public/` | Media yang di-deploy; `public/new-assets/` file master (tidak masuk git) |
| `scripts/` | Launcher event, `bun dev`, validasi aset, pengirim OSC |
| `test/` | Test Vitest |

Mulai dari [AGENTS.md](AGENTS.md). Ubah konten: [docs/content.md](docs/content.md). Ganti aset: [docs/assets.md](docs/assets.md). Alur issue/PR: [docs/push.md](docs/push.md).

## Cek sebelum push

```bash
bun run lint && bun run typecheck && bun run test && bun run assets:check && bun run build
```

[MIT license](LICENSE).
