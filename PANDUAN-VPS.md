# Panduan VPS (Ubuntu Hostinger)

Wall ALTAMA Summit 2026 sudah berjalan di **https://altama-milestone.nmxavw.com**, dijalankan dengan **PM2 + Bun** di belakang Nginx, di VPS yang dipakai bersama project lain.

Panduan ini berisi: susunan yang sudah terpasang, cara update, cara cek kalau ada masalah, dan sinkronisasi pengaturan dengan **SQLite**.

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
      NUXT_DASHBOARD_PASSWORD: 'ISI_PASSWORD_DASHBOARD',
    },
    max_memory_restart: '400M',
    autorestart: true,
  }],
};
```

### Password dashboard

`/dashboard` meminta password (satu kolom, placeholder *Clue: password wifi Aptronim*). Password diambil dari `NUXT_DASHBOARD_PASSWORD` di blok `env` di atas. Setelah mengubahnya, jalankan `pm2 restart altama-milestone --update-env`; semua browser yang sudah login akan diminta password lagi. Kalau variabel ini dikosongkan, dashboard terbuka tanpa password.

Login bertahan **3 hari** dan diperpanjang otomatis setiap kali dashboard dibuka atau pengaturan disimpan. Jadi kalau dashboard dibuka minimal sekali tiap 3 hari, tidak perlu login ulang. Tombol **Keluar** ada di bawah **Reset ke default** di sidebar.

> Wall versi Vercel juga butuh variabel `NUXT_DASHBOARD_PASSWORD` di Vercel → Project → Settings → Environment Variables (lalu redeploy). Tanpa itu dashboard di Vercel terbuka tanpa password.

### Yang normal di VPS

- **Dashboard → Sensor** tidak terhubung. Sensor Service hanya berjalan di PC event yang tersambung ke LiDAR.
- Pengaturan dashboard tersinkron lewat SQLite di VPS: mengubahnya dari HP berlaku di semua wall dalam 5 detik. Lihat [bagian 4](#4-sinkronisasi-pengaturan-dengan-sqlite).

---

## 2. Update saat ada perubahan di GitHub

Skripnya sudah ada di repo: `scripts/update-vps.sh` (backup database pengaturan, pull, install, build, restart proses `altama-milestone`, lalu cek). **Pertama kali saja**, ambil skrip itu dengan `git pull` biasa:

```bash
cd /var/www/altama-milestone && git pull --ff-only
```

Setelah itu, setiap update cukup:

```bash
bash /var/www/altama-milestone/scripts/update-vps.sh
```

Supaya lebih pendek, buat alias sekali:

```bash
echo "alias update-altama='bash /var/www/altama-milestone/scripts/update-vps.sh'" >> ~/.bashrc && source ~/.bashrc
```

Lalu update cukup dengan `update-altama`.

Baris terakhir harus `HTTP/1.1 200 OK`. Selama build berjalan, versi lama tetap melayani; gangguan hanya beberapa detik saat restart. Hanya proses `altama-milestone` yang di-restart, project lain tidak tersentuh.

### Database pengaturan tidak ter-reset saat update

- File `.data/altama.sqlite` di-ignore Git, jadi `git pull`, `bun install`, dan `bun run build` tidak pernah menyentuh atau mengosongkannya. Pengaturan yang sudah disimpan tetap ada setelah update.
- Sebelum update, skrip menyalin database ke `~/backup-altama/altama-TANGGAL-JAM.sqlite` (30 salinan terbaru disimpan). Baris `==> settings database backed up to …` menandakan backup berhasil.
- **Default baru dari update tidak menimpa pengaturan yang sudah tersimpan.** Default hanya dipakai saat database masih kosong, atau saat operator menekan **Default** di halaman (lalu Simpan) atau **Reset ke default** di sidebar.

Mengembalikan backup (misalnya setelah salah Reset):

```bash
pm2 stop altama-milestone && cp ~/backup-altama/NAMA_BACKUP.sqlite /var/www/altama-milestone/.data/altama.sqlite && pm2 start altama-milestone
```

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

Kembali ke versi terbaru: `git checkout main`, lalu `update-altama`.

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

### Cara kerjanya

1. Pengaturan Wall, Hold, dan Font disimpan di file SQLite `/var/www/altama-milestone/.data/altama.sqlite`. Folder `.data/` di-ignore Git, jadi aman saat update.
2. **Dashboard** (setelah login password) mengirim setiap Simpan, Import, dan Reset ke server.
3. **Setiap wall** mengambil pengaturan dari server saat dibuka, lalu mengecek perubahan **tiap 5 detik**. Perubahan dari HP sampai ke wall tanpa reload.
4. Kalau server tidak terjangkau, wall dan dashboard tetap jalan dengan salinan terakhir di browser.

### Mengaktifkan di VPS

Tidak ada yang perlu dipasang. Cukup update:

```bash
update-altama
```

File database dibuat otomatis saat pertama dipakai. Dashboard pertama yang login mengisinya dengan pengaturan dari browsernya. Jadi **login pertama kali dari browser yang pengaturannya sudah benar** (misalnya browser yang biasa dipakai mengatur wall).

Cek:

```bash
curl -s http://127.0.0.1:3310/api/settings | head -c 120; echo
```

Sebelum ada yang menyimpan hasilnya `{"version":0,...}`; setelah dashboard login atau menyimpan, `version` naik.

### Backup

`update-altama` sudah membuat backup otomatis setiap update (lihat [bagian 2](#2-update-saat-ada-perubahan-di-github)). Backup manual kapan saja:

```bash
mkdir -p ~/backup-altama && cp /var/www/altama-milestone/.data/altama.sqlite ~/backup-altama/altama-$(date +%Y%m%d-%H%M%S).sqlite && ls ~/backup-altama
```

Tombol **Export pengaturan** di dashboard tetap bisa dipakai sebagai cadangan kedua (file JSON).

### Hubungan dengan PC event

PC event tetap menjalankan `start-wall.bat` (wall + Sensor Service lokal, cepat dan tetap jalan tanpa internet). Supaya wall event **mengikuti pengaturan dari VPS**, tambahkan ke `.env` di PC event:

```dotenv
NUXT_PUBLIC_SETTINGS_SYNC_URL=https://altama-milestone.nmxavw.com
```

Lalu jalankan ulang `start-wall.bat`. Setelah itu:

- Atur dari HP di `https://altama-milestone.nmxavw.com/dashboard`. Wall event berubah dalam 5 detik selama ada internet.
- Dashboard di PC event (Ctrl+Shift+D) menampilkan **Mengikuti altama-milestone.nmxavw.com**. Perubahan di sana hanya berlaku di PC itu sampai ada perubahan berikutnya dari VPS, jadi sebaiknya atur dari dashboard VPS.
- Kalau internet putus, wall event memakai pengaturan terakhir.

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
