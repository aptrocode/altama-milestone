# Altama Interactive Wall

Kiosk Nuxt 4 fullscreen untuk LED wall **ALTAMA Summit 2026** (2304 × 1344). Enam kolom berdiri sendiri: Tentang Altama, Our Brand, Infrastruktur, Digital Trust, Distribusi & Pemasaran, dan Altama Summit 2026, masing-masing dengan bahasa Indonesia, English, dan 中文. Input lewat sentuh/mouse (hold), keyboard, OSC, atau sensor LiDAR. HP dan tablet mendapat tampilan bertumpuk yang bisa di-scroll.

## Development

```bash
bun install --frozen-lockfile
bun run dev
```

Wall di `http://localhost:3000`, dashboard operator di `/dashboard`. Sensor Service + OSC (opsional): `bun run sensor:service`.

## PC event (Windows, sekali klik)

Semua berjalan lokal di PC event, tanpa VPS atau internet. Butuh Bun dan Chrome/Edge.

Klik dua kali **`start-wall.bat`**: build bila ada perubahan, jalankan wall + Sensor Service, lalu buka wall fullscreen. **Tutup jendela terminalnya** untuk mematikan semuanya. Dashboard dibuka dari wall dengan **Ctrl+Shift+D** (tekan lagi untuk kembali). Opsi port/sensor ada di `.env` (lihat `scripts/wall-launcher.ps1`).

## Dashboard (`/dashboard`)

- **Hold**: tombol mana yang harus ditahan dan berapa lama (bahasa & close default tidak perlu ditahan).
- **Wall**: detik reset otomatis semua section dan posisi Y card.
- **Sensor**: sumber sentuh (Hokuyo, Augmenta, TUIO), port, kalibrasi, status live.

Sidebar: export/import pengaturan, fullscreen, dan reset ke default. Di wall/kiosk buka dengan **Ctrl+Shift+D**. Detail: [docs/dashboard.md](docs/dashboard.md).

## Keyboard / remote

| Tombol | Fungsi |
| :--- | :--- |
| `1`–`6` | Buka/tutup kolom |
| `Esc` / `R` | Reset semua kolom |
| `←` `→` / `PageUp` `PageDown` | Foto sebelumnya/berikutnya di kolom terbuka paling kiri |
| `Enter` / `Space` | Aktifkan tombol yang fokus tanpa hold |
| `Ctrl+Shift+D` | Buka dashboard / kembali ke wall |

Perintah OSC (`/altama/*`, UDP 9000) dan simulator sensor: [docs/sensor.md](docs/sensor.md).

## Dokumentasi & cek

Mulai dari [AGENTS.md](AGENTS.md); detail per topik ada di `docs/`. Edit konten di `app/data/columns/` ([docs/content.md](docs/content.md)), aset di [docs/assets.md](docs/assets.md).

```bash
bun run lint && bun run typecheck && bun run test && bun run assets:check && bun run build
```

[MIT license](LICENSE).
