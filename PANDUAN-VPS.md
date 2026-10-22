# Panduan VPS (Ubuntu Hostinger)

Wall ALTAMA Summit 2026 sudah berjalan di **https://altama-milestone.nmxavw.com**, dijalankan dengan **PM2 + Bun** di belakang Nginx, di VPS yang dipakai bersama project lain.

Panduan ini berisi: susunan yang sudah terpasang, cara update, cara cek kalau ada masalah, dan rencana sinkronisasi pengaturan dengan **SQLite**.

---

## 1. Yang sudah terpasang

| Hal | Nilai |
|---|---|
| Domain | `altama-milestone.nmxavw.com` → `187.77.120.179` (A record di hPanel) |
| Folder | `/var/www/altama-milestone` (clone dari `github.com/aptrocode/altama-milestone`, branch `main`) |
| Port internal | `3310`, hanya `127.0.0.1` (publik masuk lewat Nginx) |
| Proses PM2 | `altama-milestone` (`bun .output/server/index.mjs`, dari `ecosystem.config.cjs`) |
| Config Nginx | `/etc/nginx/sites-available/altama-milestone.nmxavw.com` (+ symlink di `sites-enabled`) |
| HTTPS | Let's Encrypt untuk domain ini saja, diperpanjang otomatis oleh certbot |
| File rahasia | `/var/www/altama-milestone/.env` (izin 600, tidak masuk Git) |

`ecosystem.config.cjs` hanya ada di VPS dan sudah dikecualikan lewat `.git/info/exclude`, jadi tidak bentrok saat `git pull`. Isinya:

```js
module.exports = {
  apps: [{
    name: 'altama-milestone',
    cwd: '/var/www/altama-milestone',
    script: '.output/server/index.mjs',
    interpreter: '/root/.bun/bin/bun', // hasil `which bun`
    env: {
      PORT: '3310',
      HOST: '127.0.0.1',
      NODE_ENV: 'production',
      NUXT_PUBLIC_SENSOR_ENABLED: 'false',
      NUXT_PUBLIC_SENSOR_WS_URL: '',
    },
    max_memory_restart: '400M',
    autorestart: true,
  }],
};
```

### Yang normal di VPS

- **Dashboard → Sensor** tidak terhubung. Sensor Service hanya berjalan di PC event yang tersambung ke LiDAR.
- Pengaturan dashboard saat ini **hanya tersimpan di browser yang dipakai** (localStorage). Mengubahnya dari HP belum memengaruhi wall di device lain. Lihat [bagian 4](#4-sinkronisasi-pengaturan-dengan-sqlite).

---

## 2. Update saat ada perubahan di GitHub

Buat skrip sekali saja:

```bash
nano ~/update-altama.sh
```

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/altama-milestone
git pull --ff-only
bun install --frozen-lockfile
bun run build
pm2 restart altama-milestone --update-env
sleep 2
curl -sI http://127.0.0.1:3310 | head -1
```

```bash
chmod +x ~/update-altama.sh
```

Setiap update cukup:

```bash
~/update-altama.sh
```

Baris terakhir harus `HTTP/1.1 200 OK`. Selama build berjalan, versi lama tetap melayani; gangguan hanya beberapa detik saat restart. Hanya proses `altama-milestone` yang di-restart, project lain tidak tersentuh.

> Jangan edit file repo langsung di VPS. Kalau `git pull` menolak karena *local changes*, cek `git status` lalu kembalikan file itu dengan `git checkout -- NAMA_FILE`.

---

## 3. Kalau ada masalah

### Cek cepat

```bash
pm2 list
```

```bash
pm2 logs altama-milestone --lines 100
```

```bash
curl -sI http://127.0.0.1:3310 | head -1
```

```bash
sudo nginx -t
```

### Masalah umum

| Gejala | Penyebab paling mungkin | Solusi |
|---|---|---|
| **502 Bad Gateway** | Proses wall mati, atau port beda | `pm2 list`; pastikan port `3310` sama di `ecosystem.config.cjs` dan Nginx; `pm2 restart altama-milestone`. |
| Domain membuka **project lain** | `server_name` salah atau symlink hilang | Cek `server_name altama-milestone.nmxavw.com;` dan `ls /etc/nginx/sites-enabled/`; lalu `sudo nginx -t && sudo systemctl reload nginx`. |
| Build berhenti dengan **`Killed`** | RAM habis | Tambah swap (di bawah), lalu jalankan update lagi. |
| `EADDRINUSE` | Port 3310 dipakai proses lain | `sudo ss -tlnp \| grep 3310`; pilih port lain dan ganti di `ecosystem.config.cjs` + Nginx. |
| Halaman **putih kosong** | File `/_nuxt/` gagal dimuat | DevTools → Network, pastikan `/_nuxt/*.js` berstatus 200; jalankan update ulang. |
| Wall tidak hidup setelah VPS restart | Daftar PM2 belum disimpan | `pm2 save` (dan `pm2 startup` sekali, kalau belum pernah). |

Selalu `sudo nginx -t` sebelum `reload`, dan pakai `reload` (bukan `restart`) supaya koneksi project lain tidak putus.

### Tambah swap 2 GB (kalau build `Killed`)

```bash
swapon --show
```

Kalau kosong:

```bash
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
```

```bash
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### Kembali ke versi sebelumnya

```bash
cd /var/www/altama-milestone && git log --oneline -10
```

```bash
git checkout HASH_COMMIT && bun install --frozen-lockfile && bun run build && pm2 restart altama-milestone
```

Kembali ke versi terbaru: `git checkout main`, lalu `~/update-altama.sh`.

---

## 4. Sinkronisasi pengaturan dengan SQLite

### Kenapa SQLite cukup

Yang disinkronkan hanya **satu dokumen kecil**: pengaturan Wall, Hold, dan Font (beberapa KB), ditulis sesekali saat operator menekan Simpan, dan dibaca oleh satu server wall. Untuk kebutuhan seperti ini SQLite sudah lebih dari cukup:

| | SQLite | MySQL / PostgreSQL |
|---|---|---|
| Install / user / password | Tidak perlu (sudah ada di Bun: `bun:sqlite`) | Perlu database, user, password, hak akses |
| Bentrok dengan project lain | Tidak mungkin: satu file milik wall | Berbagi server database |
| Backup | Salin satu file | `pg_dump` / `mysqldump` |
| Cocok untuk | Satu server, sedikit penulisan | Banyak server / banyak penulisan bersamaan |

MySQL dan PostgreSQL di VPS **tidak dipakai dan tidak disentuh**.

### Yang akan ditambahkan di kode (belum ada sekarang)

1. **API pengaturan** di server wall (`/api/settings`) yang membaca dan menyimpan pengaturan ke file SQLite di `/var/www/altama-milestone/.data/` (folder ini sudah di-ignore Git, jadi aman saat `git pull`).
2. **Dashboard menyimpan ke server.** Begitu disimpan dari HP, nilainya masuk SQLite.
3. **Wall mengikuti perubahan otomatis**, tanpa reload.
4. **Login dashboard** dengan password di `.env`, karena domain ini publik.
5. **Tetap jalan kalau internet putus.** Wall menyimpan salinan terakhir di browser.

### Yang perlu dilakukan di VPS setelah fitur itu masuk

1. Tambahkan password dashboard ke blok `env` di `ecosystem.config.cjs` (nama variabel final mengikuti catatan rilis fitur):

   ```js
   DASHBOARD_PASSWORD: 'PASSWORD_DASHBOARD_YANG_KUAT',
   ```

2. Jalankan `~/update-altama.sh` (sudah memakai `--update-env`).
3. Buka `/dashboard` dari HP, login, ubah satu pengaturan, lalu cek wall di device lain ikut berubah.

Backup cukup menyalin file database, misalnya:

```bash
mkdir -p ~/backup-altama && cp /var/www/altama-milestone/.data/*.sqlite ~/backup-altama/ 2>/dev/null; ls ~/backup-altama
```

Tombol **Export pengaturan** di dashboard tetap bisa dipakai sebagai cadangan kedua (file JSON).

### Hubungan dengan PC event

Disarankan: PC event tetap menjalankan `start-wall.bat` (wall + Sensor Service lokal, cepat dan tetap jalan tanpa internet), dan wall lokal itu **mengambil pengaturan dari VPS**. Perubahan dari HP sampai ke wall event selama ada internet; kalau internet putus, wall memakai pengaturan terakhir.

---

## 5. Melepas wall dari VPS

Kalau suatu saat wall perlu dicabut, tanpa mengganggu project lain:

```bash
pm2 delete altama-milestone && pm2 save
```

```bash
sudo rm /etc/nginx/sites-enabled/altama-milestone.nmxavw.com && sudo nginx -t && sudo systemctl reload nginx
```

```bash
sudo certbot delete --cert-name altama-milestone.nmxavw.com
```

Folder `/var/www/altama-milestone` bisa dihapus setelah yakin tidak dibutuhkan (backup `.data/` dulu kalau sinkronisasi sudah dipakai).
