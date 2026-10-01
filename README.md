# Altama Interactive Wall

Fullscreen Nuxt 4 kiosk for ALTAMA's **2304 × 1344** LED installation.

Six independent columns cover About Altama, Our Brands, Infrastructure, Digital Partners, Distribution, and Summit 2026. Each idle card has floating Indonesian (default), English, and Simplified Chinese flag controls. The chosen language stays with that column through its submenu/carousel. Carousel photos and company copy remain provisional.

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
| **`1` – `6`** / **Numpad `1` – `6`** | Keyboard / Numpad | Buka / toggle kolom 1 sampai 6 (atau kembali jika sedang aktif) |
| **`Esc`** / **`R`** | Keyboard / Remote | Reset seluruh kolom ke tampilan awal (*standby*) |
| **`←`** / **`PageUp`** | Keyboard / Clicker | Geser ke slide foto sebelumnya (*Previous*) pada kolom aktif |
| **`→`** / **`PageDown`** | Keyboard / Clicker | Geser ke slide foto berikutnya (*Next*) pada kolom aktif |
| **`Enter`** / **`Space`** | Keyboard / Remote | Langsung mengaktifkan tombol yang sedang fokus (tanpa hold) |
| **`D`** | Keyboard | Menampilkan/menyembunyikan panel diagnostik sensor (mode dev) |
| **Mouse / Touch Hold (1s)** | Layar Sentuh / Mouse | Tahan 1 detik untuk membuka kartu utama atau sub-item |

*Inaktivitas*: Setiap kolom yang aktif akan otomatis kembali ke standby setelah **15 detik** tanpa interaksi.

### 2. OSC Show Control (Resolume Arena, TouchDesigner, QLab)

Jalankan service penerima OSC di background:
```bash
bun run osc:service
```
Default port: **UDP `9000`** (OSC Input) dan **WS `8787`** (Nuxt WebSocket).

| Alamat OSC | Argumen | Contoh Perintah | Aksi |
| :--- | :--- | :--- | :--- |
| `/altama/column` | `1..6` (int) | `/altama/column 1` | Buka / toggle kolom |
| `/altama/col/<id>` | *(none)* | `/altama/col/2` | Buka kolom dari path |
| `/altama/open` | `1..6` (int) | `/altama/open 3` | Buka kolom standby |
| `/altama/back` | `[1..6]` *(opsional)* | `/altama/back 2` | Kembali (atau reset semua jika kosong) |
| `/altama/next` | `1..6` (int) | `/altama/next 1` | Pindah ke slide berikutnya |
| `/altama/prev` | `1..6` (int) | `/altama/prev 1` | Pindah ke slide sebelumnya |
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

Sensor LiDAR integration uses **protocol v2 / wall-v2** via WebSocket at port 8787; see [docs/sensor.md](docs/sensor.md). Sensor input is disabled by default (`NUXT_PUBLIC_SENSOR_ENABLED=true` to enable).

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
