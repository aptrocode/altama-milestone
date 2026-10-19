# Altama Interactive Wall

Fullscreen Nuxt 4 kiosk for ALTAMA's **2304 × 1344** LED installation.

Six independent columns cover Tentang Altama, Our Brand, Infrastruktur, Digital Trust, Distribusi & Pemasaran, and Altama Summit 2026, styled after the ALTAMA Summit 2026 "Powering Partnership" mockups. Each idle card has floating Indonesian (default), English, and Simplified Chinese flag controls. The chosen language stays with that column through its submenu/carousel. Artwork, photos, and company copy are provisional crops/drafts until the client approves final assets; see [docs/content.md](docs/content.md) to edit a column and [docs/assets.md](docs/assets.md) to replace media or add a background video. Phones and tablets get a stacked, scrollable version of the same columns.

## Run

```bash
bun install --frozen-lockfile
bun run dev
```

Open the URL printed by Nuxt. Build with `bun run build`, create static output with `bun run generate`, and preview with `bun run preview`.

## Operator Shortcuts & Interaction

### 1. Keyboard & Wireless Presenter Remote

Dapat dioperasikan langsung menggunakan keyboard fisik, wireless numpad, atau remote presenter (clicker USB):

| Shortcut | Perangkat | Fungsi |
| :--- | :--- | :--- |
| **`1` – `6`** / **Numpad `1` – `6`** | Keyboard / Numpad | Buka / tutup kolom 1 sampai 6 (kolom 2/5 membuka sub-item default) |
| **`Esc`** / **`R`** | Keyboard / Remote | Reset seluruh kolom ke tampilan awal (*standby*) |
| **`←`** / **`PageUp`** | Keyboard / Clicker | Geser ke foto sebelumnya (*Previous*) pada kolom aktif paling kiri |
| **`→`** / **`PageDown`** | Keyboard / Clicker | Geser ke foto berikutnya (*Next*) pada kolom aktif paling kiri |
| **`Enter`** / **`Space`** | Keyboard / Remote | Langsung mengaktifkan tombol yang sedang fokus (tanpa hold) |
| **`D`** | Keyboard | Menampilkan/menyembunyikan panel diagnostik sensor (mode dev) |
| **Mouse / Touch Hold** | Layar Sentuh / Mouse | Tahan (default 1 detik, bisa diatur/dimatikan di `/dashboard`) untuk membuka kolom, tile Tekiro/RYU/Rexco/Distribusi/Pemasaran, panah foto, dan tombol halaman |

*Inaktivitas*: Setiap kolom yang aktif akan otomatis kembali ke standby setelah **30 detik** tanpa interaksi. Membuka satu kolom tidak mengubah lima kolom lainnya.

### 2. OSC Show Control (Resolume Arena, TouchDesigner, QLab)

Jalankan Sensor Service di background (OSC show control selalu aktif di dalamnya):
```bash
bun run sensor:service
```
Default port: **UDP `9000`** (OSC Input) dan **WS `8787`** (Nuxt WebSocket). `bun run osc:service` tetap jalan sebagai alias.

| Alamat OSC | Argumen | Contoh Perintah | Aksi |
| :--- | :--- | :--- | :--- |
| `/altama/column` | `1..6` (int) | `/altama/column 1` | Buka / toggle kolom |
| `/altama/col/<id>` | *(none)* | `/altama/col/2` | Buka kolom dari path |
| `/altama/open` | `1..6` (int) | `/altama/open 3` | Buka kolom standby |
| `/altama/back` | `[1..6]` *(opsional)* | `/altama/back 2` | Kembali (atau reset semua jika kosong) |
| `/altama/next` | `1..6` (int) | `/altama/next 1` | Pindah ke foto berikutnya |
| `/altama/prev` | `1..6` (int) | `/altama/prev 1` | Pindah ke foto sebelumnya |
| `/altama/page` | `kolom`, `halaman` (mulai 1) | `/altama/page 2 2` | Tampilkan halaman teks |
| `/altama/subItem` | `kolom`, `key` | `/altama/subItem 2 tekiro` | Pilih sub-item merek/jalur |
| `/altama/lang` | `locale` / `kolom`, `locale` | `/altama/lang en` | Ganti bahasa (`id`, `en`, `zh-Hans`) |
| `/altama/reset` | *(none)* | `/altama/reset` | Reset seluruh kolom ke standby |

**Uji perintah OSC via CLI:**
```bash
bun run osc:send /altama/column 1
bun run osc:send /altama/subItem 2 tekiro
bun run osc:send /altama/next 2
bun run osc:send /altama/reset
```

### 3. Sensor (Hokuyo UST-10LX, Augmenta, TUIO)

Sensor Service yang sama membaca satu sumber sentuh: **Hokuyo UST-10LX** (Ethernet, default `192.168.0.10:10940`), **Augmenta** (UDP `12000`), atau **TUIO 1.1** (UDP `3333`). Pilih sumber, port, Invert Y, dan kalibrasi Hokuyo di `/dashboard`; setting disimpan service di `sensor-config.json`. Input wall memakai **protocol v2 / wall-v5** lewat WebSocket port 8787 dan default-nya mati (`NUXT_PUBLIC_SENSOR_ENABLED=true` untuk menyalakan). Tanpa hardware, pakai simulator:

```bash
bun run sensor:sim hokuyo --tap 212,700,1.5 --loop
bun run sensor:sim tuio --tap 588,620
```

Detail: [docs/sensor.md](docs/sensor.md). Kalibrasi fisik dan uji multi-user di hardware event tetap wajib.

### 4. Dashboard operator (`/dashboard`)

Buka `http://<alamat-wall>/dashboard` di browser yang sama dengan wall. **Hold**: atur hold per grup (**Card section**, **Button page**, **Button slider**), ON/OFF dan durasi 0,3–5 detik, tersimpan di browser dan bisa di-export/import. **Sensor**: sumber, port, Invert Y, kalibrasi Hokuyo, status live, dan preview kontak, tersimpan di Sensor Service. Detail: [docs/dashboard.md](docs/dashboard.md).

## Project guide

Start with [AGENTS.md](AGENTS.md). Architecture, design, languages, assets, sensor, testing, push, and release instructions are split under `docs/`. Production UI lives in `app/`; shared actions/geometry live in `shared/`. `dika/` is an isolated prototype sandbox.

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
bun run generate
```

See [docs/testing.md](docs/testing.md) for behavior and browser acceptance. [MIT license](LICENSE).
