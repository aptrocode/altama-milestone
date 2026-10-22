# Panduan Deploy ke VPS (Ubuntu Hostinger)

Panduan ini memasang wall ALTAMA Summit 2026 di VPS Ubuntu Hostinger dengan domain **altama-milestone.nmxavw.com**, tanpa mengganggu project lain yang sudah berjalan di VPS yang sama. Panduan ini juga menyiapkan database **PostgreSQL** untuk sinkronisasi pengaturan dashboard antar-device.

> **Baca dulu bagian 0.** Ada satu hal penting soal sinkronisasi database yang harus dipahami sebelum mulai.

---

## Daftar isi

0. [Ringkasan: apa yang akan jalan](#0-ringkasan-apa-yang-akan-jalan)
1. [Yang perlu disiapkan](#1-yang-perlu-disiapkan)
2. [Cek kondisi VPS dulu (supaya tidak bentrok)](#2-cek-kondisi-vps-dulu-supaya-tidak-bentrok)
3. [Pilih port untuk wall](#3-pilih-port-untuk-wall)
4. [Pasang Bun (dan cek Node.js)](#4-pasang-bun-dan-cek-nodejs)
5. [Clone repo](#5-clone-repo)
6. [Buat file `.env`](#6-buat-file-env)
7. [Install dan build](#7-install-dan-build)
8. [Tes jalan di VPS](#8-tes-jalan-di-vps)
9. [Jalankan terus di background (PM2 atau systemd)](#9-jalankan-terus-di-background-pm2-atau-systemd)
10. [Hubungkan domain lewat Nginx](#10-hubungkan-domain-lewat-nginx)
11. [Pasang HTTPS (SSL)](#11-pasang-https-ssl)
12. [Cek hasil akhir](#12-cek-hasil-akhir)
13. [Cara update saat ada perubahan di GitHub](#13-cara-update-saat-ada-perubahan-di-github)
14. [Siapkan database PostgreSQL](#14-siapkan-database-postgresql)
15. [Sinkronisasi pengaturan: langkah berikutnya](#15-sinkronisasi-pengaturan-langkah-berikutnya)
16. [Kalau ada masalah](#16-kalau-ada-masalah)
17. [Cara melepas (rollback)](#17-cara-melepas-rollback)
18. [Ringkasan nama dan lokasi](#18-ringkasan-nama-dan-lokasi)

---

## 0. Ringkasan: apa yang akan jalan

Setelah bagian 1–13 selesai:

- `https://altama-milestone.nmxavw.com` membuka wall.
- `https://altama-milestone.nmxavw.com/dashboard` membuka dashboard operator, juga dari HP.
- Wall berjalan di port internal sendiri, di belakang Nginx, dan otomatis hidup lagi kalau VPS restart.
- Project lain tidak tersentuh: kita hanya **menambah** satu folder, satu proses, satu konfigurasi Nginx, dan satu sertifikat SSL untuk domain ini.

### ⚠ Penting: sinkronisasi database belum ada di kode

Saat ini pengaturan dashboard (Wall, Hold, Font) **disimpan di browser masing-masing** (localStorage), bukan di server. Artinya:

- Mengubah pengaturan dari HP hanya berlaku di browser HP itu.
- Wall di PC event **tidak** ikut berubah.

Supaya pengaturan bisa diatur dari HP atau device lain dan langsung berlaku di wall, kode wall perlu ditambah fitur sinkronisasi: API di server, penyimpanan ke database, dan login dashboard. Fitur ini **belum ada di repo**.

Karena itu panduan ini dibagi dua:

| Bagian | Isi | Bisa dikerjakan sekarang? |
|---|---|---|
| 1–13 | Deploy wall + domain + HTTPS | ✅ Ya |
| 14 | Membuat database dan user PostgreSQL khusus wall | ✅ Ya (disiapkan dulu) |
| 15 | Menyambungkan wall ke database | ⏳ Setelah fitur sinkronisasi masuk ke repo |

Database yang dipilih adalah **PostgreSQL** (penjelasannya di [bagian 14](#14-siapkan-database-postgresql)). MySQL tidak dipakai dan tidak disentuh.

### Gambaran sistem

```text
HP / laptop / PC event
        │  https://altama-milestone.nmxavw.com
        ▼
┌──────────────────────── VPS ────────────────────────┐
│ Nginx (port 80/443, sudah ada, dipakai bersama)     │
│   └─ altama-milestone.nmxavw.com ──► 127.0.0.1:3310 │
│                                      Wall (Nuxt)    │
│                                         │ (nanti)   │
│                                         ▼           │
│                              PostgreSQL: altama_wall │
│ Project lain: tetap di port & config masing-masing  │
└─────────────────────────────────────────────────────┘
```

---

## 1. Yang perlu disiapkan

- [ ] Akses SSH ke VPS sebagai user yang bisa `sudo`.
- [ ] DNS sudah mengarah ke VPS. Dari screenshot hPanel, record ini sudah ada:

  | Type | Name | Points to | TTL |
  |---|---|---|---|
  | A | `altama-milestone` | `187.77.120.179` | 14400 |

- [ ] Akses ke repo `https://github.com/aptrocode/altama-milestone`. Kalau repo **private**, siapkan salah satu: deploy key SSH, atau Personal Access Token GitHub (lihat [bagian 5](#5-clone-repo)).

Cek DNS sudah aktif. Jalankan dari komputer sendiri atau dari VPS:

```bash
dig +short altama-milestone.nmxavw.com
```

Hasilnya harus `187.77.120.179`. Kalau masih kosong, tunggu beberapa menit sampai beberapa jam (TTL 14400 = 4 jam), lalu cek lagi. Jangan lanjut ke bagian 11 (SSL) sebelum ini benar.

> Kalau `dig` belum terpasang, pakai `nslookup altama-milestone.nmxavw.com`.

Masuk ke VPS:

```bash
ssh USER@187.77.120.179
```

Ganti `USER` dengan user SSH kamu (misalnya `root` atau user lain yang biasa dipakai).

---

## 2. Cek kondisi VPS dulu (supaya tidak bentrok)

Bagian ini **hanya membaca**, tidak mengubah apa pun. Catat hasilnya; kita butuh untuk langkah berikutnya.

### 2a. Port yang sudah dipakai

```bash
sudo ss -tlnp
```

Lihat kolom `Local Address:Port`. Catat semua port yang sudah dipakai project lain (misalnya `:3000`, `:3001`, `:8080`). Wall nanti memakai port yang **belum** ada di daftar ini.

### 2b. Web server apa yang memegang port 80 dan 443

```bash
sudo ss -tlnp | grep -E ':80 |:443 '
```

Lihat nama proses di ujung baris:

| Yang terlihat | Artinya | Ikuti |
|---|---|---|
| `nginx` | Nginx sudah dipakai | [Bagian 10](#10-hubungkan-domain-lewat-nginx) apa adanya |
| `apache2` / `httpd` | Apache | Lihat catatan Apache di bagian 10 |
| `caddy` | Caddy | Lihat catatan Caddy di bagian 10 |
| `docker-proxy` | Ada reverse proxy di Docker (Traefik / Nginx Proxy Manager) | Lihat catatan Docker di bagian 10 |

Panduan utama di bawah memakai **Nginx**, karena paling umum di VPS Hostinger.

### 2c. Bagaimana project lain dijalankan

```bash
pm2 list 2>/dev/null || echo "PM2 tidak terpasang"
```

```bash
systemctl list-units --type=service --state=running | grep -viE 'systemd|dbus|ssh|cron|snap|getty|network|udev|polkit|rsyslog|unattended'
```

```bash
docker ps 2>/dev/null || echo "Docker tidak terpasang"
```

- Kalau project lain jalan di **PM2**, wall juga pakai PM2 (bagian 9a).
- Kalau project lain jalan sebagai **service systemd**, wall pakai systemd (bagian 9b).
- Kalau tidak ada keduanya, pilih **PM2** (lebih mudah dipantau).

### 2d. Versi Node.js dan Bun

```bash
node -v 2>/dev/null || echo "Node tidak ada"
```

```bash
bun -v 2>/dev/null || echo "Bun tidak ada"
```

Wall butuh **Bun** untuk install dan build (repo memakai `bun.lock`). Untuk menjalankan server, Node.js **20 atau lebih baru** juga bisa. **Jangan** mengganti versi Node global, karena project lain mungkin bergantung padanya.

### 2e. RAM, swap, dan disk

```bash
free -h
```

```bash
df -h /
```

- Build Nuxt butuh sekitar **1,5–2 GB RAM kosong**. Kalau RAM `available` di bawah 2 GB dan swap 0, lihat solusinya di [bagian 16](#16-kalau-ada-masalah) ("Build berhenti / Killed").
- Disk: siapkan minimal **2 GB** kosong (repo ±100 MB, `node_modules` ±500 MB, hasil build ±50 MB).

### 2f. Pastikan nama yang akan dipakai belum ada

```bash
ls /var/www/
```

```bash
ls /etc/nginx/sites-enabled/ 2>/dev/null
```

```bash
pm2 list 2>/dev/null | grep -i altama
```

Kalau **sudah ada** folder `/var/www/altama-milestone`, config Nginx untuk `altama-milestone.nmxavw.com`, atau proses PM2 bernama `altama-milestone`, **berhenti dulu** dan cek isinya. Jangan menimpa milik project lain.

---

## 3. Pilih port untuk wall

Panduan ini memakai port **3310**. Cek port ini benar-benar kosong:

```bash
sudo ss -tlnp | grep ':3310 ' || echo "3310 kosong, aman dipakai"
```

- Kalau keluar `3310 kosong, aman dipakai`, lanjut.
- Kalau ada proses yang memakai 3310, pilih port lain yang kosong (misalnya 3311, 3320), lalu **ganti semua `3310` di panduan ini** dengan port tersebut.

Port ini hanya dipakai di dalam VPS (`127.0.0.1`), tidak dibuka ke internet. Jadi **tidak perlu** menambah aturan firewall untuk port ini.

---

## 4. Pasang Bun (dan cek Node.js)

Lewati bagian ini kalau `bun -v` di langkah 2d sudah menampilkan versi 1.x.

Bun dipasang **per user** di `~/.bun`, jadi tidak mengubah Node atau tool project lain.

```bash
curl -fsSL https://bun.sh/install | bash
```

Muat ulang shell supaya perintah `bun` dikenali:

```bash
source ~/.bashrc
```

```bash
bun -v
```

Catat lokasi Bun, karena nanti dipakai PM2/systemd:

```bash
which bun
```

Biasanya hasilnya `/home/USER/.bun/bin/bun` atau `/root/.bun/bin/bun`.

> Kalau perintah `unzip` belum ada dan install Bun gagal: `sudo apt install -y unzip`, lalu ulangi.

---

## 5. Clone repo

Folder wall: **`/var/www/altama-milestone`**.

```bash
sudo mkdir -p /var/www/altama-milestone
```

```bash
sudo chown "$USER":"$USER" /var/www/altama-milestone
```

```bash
git clone https://github.com/aptrocode/altama-milestone.git /var/www/altama-milestone
```

```bash
cd /var/www/altama-milestone
```

```bash
git log --oneline -1
```

Perintah terakhir menampilkan commit terbaru `main`, tanda clone berhasil.

### Kalau repo private

`git clone` akan meminta username dan password. GitHub **tidak** menerima password akun di sini. Pakai salah satu:

- **Personal Access Token (paling cepat).** Buat token di GitHub → Settings → Developer settings → Personal access tokens → Fine-grained. Beri akses **read-only** ke repo `aptrocode/altama-milestone` (Contents: Read). Saat diminta password, tempel token itu.
- **Deploy key (lebih aman untuk jangka panjang).**

  ```bash
  ssh-keygen -t ed25519 -f ~/.ssh/altama_deploy -N "" -C "altama-vps"
  ```

  ```bash
  cat ~/.ssh/altama_deploy.pub
  ```

  Salin isinya ke GitHub → repo → Settings → Deploy keys → Add deploy key (jangan centang write access). Lalu clone dengan:

  ```bash
  GIT_SSH_COMMAND="ssh -i ~/.ssh/altama_deploy" git clone git@github.com:aptrocode/altama-milestone.git /var/www/altama-milestone
  ```

  ```bash
  cd /var/www/altama-milestone && git config core.sshCommand "ssh -i ~/.ssh/altama_deploy"
  ```

> Folder `public/new-assets/` (file master foto/video) **tidak ikut** ter-clone karena di-ignore Git. Itu normal: wall hanya butuh file di `public/` yang sudah di-encode.

---

## 6. Buat file `.env`

File `.env` berisi pengaturan server. File ini **tidak** masuk Git.

```bash
cd /var/www/altama-milestone
```

```bash
nano .env
```

Isi dengan:

```dotenv
# Port internal wall (harus sama dengan bagian 3 dan Nginx)
PORT=3310
# Hanya bisa diakses dari dalam VPS; publik masuk lewat Nginx
HOST=127.0.0.1
NODE_ENV=production

# Sensor LiDAR hanya ada di PC event, bukan di VPS
NUXT_PUBLIC_SENSOR_ENABLED=false
NUXT_PUBLIC_SENSOR_WS_URL=
```

Simpan: `Ctrl+O`, `Enter`, lalu keluar: `Ctrl+X`.

Kunci izin file supaya hanya user kamu yang bisa membaca:

```bash
chmod 600 .env
```

> `DATABASE_URL` belum ditambahkan di sini. Itu baru dipakai di [bagian 15](#15-sinkronisasi-pengaturan-langkah-berikutnya).

---

## 7. Install dan build

```bash
cd /var/www/altama-milestone
```

```bash
bun install --frozen-lockfile
```

```bash
bun run build
```

Build memakan waktu sekitar 1–3 menit. Kalau berhasil, di akhir muncul pesan seperti `✔ You can preview this build using node .output/server/index.mjs`, dan folder `.output/` terbentuk.

Cek:

```bash
ls .output/server/index.mjs
```

Kalau build berhenti dengan tulisan `Killed`, RAM habis. Lihat [bagian 16](#16-kalau-ada-masalah).

---

## 8. Tes jalan di VPS

Jalankan sementara di foreground untuk memastikan server hidup:

```bash
cd /var/www/altama-milestone && set -a && . ./.env && set +a && bun .output/server/index.mjs
```

Harus muncul kira-kira `Listening on http://127.0.0.1:3310`.

Buka **terminal SSH kedua**, lalu:

```bash
curl -sI http://127.0.0.1:3310 | head -1
```

Hasil yang benar: `HTTP/1.1 200 OK`.

Kembali ke terminal pertama dan hentikan server dengan `Ctrl+C`. Langkah berikutnya menjalankannya secara permanen.

---

## 9. Jalankan terus di background (PM2 atau systemd)

Pilih **salah satu**, sesuai hasil langkah 2c.

### 9a. Dengan PM2 (disarankan)

Kalau PM2 belum ada dan Node.js tersedia:

```bash
sudo npm install -g pm2
```

Buat file konfigurasi PM2 khusus wall:

```bash
nano /var/www/altama-milestone/ecosystem.config.cjs
```

Isi (ganti `BUN_PATH` dengan hasil `which bun` dari bagian 4):

```js
module.exports = {
  apps: [
    {
      name: 'altama-milestone',
      cwd: '/var/www/altama-milestone',
      script: '.output/server/index.mjs',
      interpreter: 'BUN_PATH',
      env: {
        PORT: '3310',
        HOST: '127.0.0.1',
        NODE_ENV: 'production',
        NUXT_PUBLIC_SENSOR_ENABLED: 'false',
        NUXT_PUBLIC_SENSOR_WS_URL: '',
      },
      max_memory_restart: '400M',
      autorestart: true,
    },
  ],
};
```

> File `ecosystem.config.cjs` ini hanya ada di VPS. Supaya `git pull` nanti tidak bentrok, tandai sebagai file lokal:
>
> ```bash
> echo "ecosystem.config.cjs" >> /var/www/altama-milestone/.git/info/exclude
> ```

Jalankan:

```bash
cd /var/www/altama-milestone && pm2 start ecosystem.config.cjs
```

```bash
pm2 list
```

Proses `altama-milestone` harus berstatus **online**. Proses project lain tetap seperti semula.

Simpan daftar proses supaya hidup lagi setelah VPS restart:

```bash
pm2 save
```

Kalau PM2 **baru** dipasang (belum pernah dipakai project lain), aktifkan auto-start:

```bash
pm2 startup
```

Perintah itu mencetak satu baris `sudo env PATH=...`. Salin dan jalankan baris tersebut, lalu `pm2 save` lagi. Kalau PM2 sudah dipakai project lain, langkah `pm2 startup` biasanya sudah pernah dilakukan; cukup `pm2 save`.

### 9b. Dengan systemd

Buat service:

```bash
sudo nano /etc/systemd/system/altama-milestone.service
```

Isi (ganti `USER` dan `BUN_PATH`):

```ini
[Unit]
Description=ALTAMA Summit 2026 wall (Nuxt)
After=network.target

[Service]
Type=simple
User=USER
WorkingDirectory=/var/www/altama-milestone
EnvironmentFile=/var/www/altama-milestone/.env
ExecStart=BUN_PATH .output/server/index.mjs
Restart=always
RestartSec=3

[Install]
WantedBy=multi-user.target
```

Aktifkan:

```bash
sudo systemctl daemon-reload
```

```bash
sudo systemctl enable --now altama-milestone
```

```bash
systemctl status altama-milestone --no-pager
```

Status harus `active (running)`.

### Cek lagi dari VPS

```bash
curl -sI http://127.0.0.1:3310 | head -1
```

Harus `HTTP/1.1 200 OK`.

---

## 10. Hubungkan domain lewat Nginx

Kita **menambah satu file** config baru. File config project lain tidak diubah.

```bash
sudo nano /etc/nginx/sites-available/altama-milestone.nmxavw.com
```

Isi:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name altama-milestone.nmxavw.com;

    # Foto/video card dan backup pengaturan
    client_max_body_size 20m;

    # File build Nuxt punya nama unik per versi, jadi aman di-cache lama
    location /_nuxt/ {
        proxy_pass http://127.0.0.1:3310;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:3310;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disiapkan untuk sinkronisasi realtime (WebSocket) nanti
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 3600s;
    }
}
```

Aktifkan dengan symlink:

```bash
sudo ln -s /etc/nginx/sites-available/altama-milestone.nmxavw.com /etc/nginx/sites-enabled/
```

**Selalu tes config sebelum reload.** Kalau ada kesalahan, Nginx menolak config dan project lain tetap aman:

```bash
sudo nginx -t
```

Harus muncul `syntax is ok` dan `test is successful`. Kalau gagal, baca pesan errornya, perbaiki file di atas, lalu tes lagi. **Jangan reload sebelum tes lulus.**

Terapkan dengan `reload` (bukan `restart`), supaya koneksi project lain tidak putus:

```bash
sudo systemctl reload nginx
```

Tes dari komputer sendiri:

```bash
curl -sI http://altama-milestone.nmxavw.com | head -1
```

Harus `HTTP/1.1 200 OK`.

> **Kalau VPS tidak memakai folder `sites-available`** (misalnya hanya ada `/etc/nginx/conf.d/`): simpan file yang sama sebagai `/etc/nginx/conf.d/altama-milestone.nmxavw.com.conf`, lewati langkah symlink, lalu `nginx -t` dan reload.

### Catatan kalau bukan Nginx

- **Apache:** aktifkan `sudo a2enmod proxy proxy_http proxy_wstunnel headers`, buat `/etc/apache2/sites-available/altama-milestone.nmxavw.com.conf` berisi `<VirtualHost *:80>` dengan `ServerName altama-milestone.nmxavw.com`, `ProxyPreserveHost On`, `ProxyPass / http://127.0.0.1:3310/`, `ProxyPassReverse / http://127.0.0.1:3310/`, lalu `sudo a2ensite altama-milestone.nmxavw.com`, `sudo apachectl configtest`, `sudo systemctl reload apache2`. SSL: `sudo certbot --apache -d altama-milestone.nmxavw.com`.
- **Caddy:** tambahkan blok `altama-milestone.nmxavw.com { reverse_proxy 127.0.0.1:3310 }` ke Caddyfile, lalu `caddy validate` dan `sudo systemctl reload caddy`. Caddy mengurus HTTPS sendiri, jadi lewati bagian 11.
- **Docker (Traefik / Nginx Proxy Manager):** di Nginx Proxy Manager, tambah Proxy Host baru: domain `altama-milestone.nmxavw.com`, forward ke IP host VPS (biasanya `172.17.0.1`) port 3310, centang WebSockets Support, lalu minta SSL di tab SSL. Karena container tidak bisa menjangkau `127.0.0.1` milik host, ubah `HOST` di `.env`/PM2 menjadi `0.0.0.0`, dan **pastikan port 3310 tidak dibuka** di firewall publik.

---

## 11. Pasang HTTPS (SSL)

Pastikan langkah 1 (DNS) sudah benar dan `http://altama-milestone.nmxavw.com` sudah terbuka.

Cek certbot:

```bash
certbot --version 2>/dev/null || echo "certbot belum ada"
```

Kalau belum ada:

```bash
sudo apt update && sudo apt install -y certbot python3-certbot-nginx
```

Minta sertifikat **hanya untuk domain ini** (`-d` satu domain, supaya sertifikat project lain tidak tersentuh):

```bash
sudo certbot --nginx -d altama-milestone.nmxavw.com
```

- Masukkan email kalau diminta.
- Kalau ditanya redirect HTTP ke HTTPS, pilih **Redirect**.

Certbot otomatis menambah bagian `listen 443 ssl` ke file config kita, lalu me-reload Nginx.

Cek perpanjangan otomatis berjalan:

```bash
sudo certbot renew --dry-run
```

> **Kalau domain lewat Cloudflare (ikon awan oranye):** set dulu ke **DNS only** (awan abu-abu) saat menjalankan certbot. Setelah sertifikat terbit, boleh diaktifkan lagi dengan SSL mode **Full (strict)**.

---

## 12. Cek hasil akhir

Dari browser laptop dan HP:

| Buka | Yang harus terlihat |
|---|---|
| `https://altama-milestone.nmxavw.com` | Wall enam kolom, gembok HTTPS aktif. Di layar sempit (HP) tampil versi bertumpuk yang bisa di-scroll. |
| `https://altama-milestone.nmxavw.com/dashboard` | Dashboard dengan menu Wall, Hold, Font, Sensor. |
| `http://altama-milestone.nmxavw.com` | Otomatis pindah ke `https://`. |

Hal yang **normal** di VPS:

- Halaman **Dashboard → Sensor** menampilkan status tidak terhubung. Sensor Service hanya berjalan di PC event yang tersambung ke LiDAR, bukan di VPS.
- Pengaturan yang disimpan di dashboard hanya berlaku di browser itu, sampai fitur sinkronisasi ([bagian 15](#15-sinkronisasi-pengaturan-langkah-berikutnya)) selesai.

Cek juga project lain masih jalan: buka domain-domain lain di browser, lalu:

```bash
pm2 list
```

Semua proses lama harus tetap **online**.

---

## 13. Cara update saat ada perubahan di GitHub

Setiap kali ada perubahan baru di branch `main`:

```bash
cd /var/www/altama-milestone
```

```bash
git pull --ff-only
```

```bash
bun install --frozen-lockfile
```

```bash
bun run build
```

Lalu restart **hanya** proses wall:

- PM2:

  ```bash
  pm2 restart altama-milestone
  ```

- systemd:

  ```bash
  sudo systemctl restart altama-milestone
  ```

Cek:

```bash
curl -sI http://127.0.0.1:3310 | head -1
```

> Selama `bun run build` berjalan, wall versi lama tetap melayani pengunjung. Gangguan hanya terjadi beberapa detik saat restart.

### Opsional: skrip update satu perintah

```bash
nano ~/update-altama.sh
```

Isi (untuk PM2):

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/altama-milestone
git pull --ff-only
bun install --frozen-lockfile
bun run build
pm2 restart altama-milestone
sleep 2
curl -sI http://127.0.0.1:3310 | head -1
```

```bash
chmod +x ~/update-altama.sh
```

Setelah itu, update cukup dengan:

```bash
~/update-altama.sh
```

---

## 14. Siapkan database PostgreSQL

### Kenapa PostgreSQL, bukan MySQL

Pengaturan wall disimpan sebagai satu dokumen JSON (Wall, Hold, Font). PostgreSQL punya tipe `jsonb` yang bisa divalidasi dan di-query langsung, serta fitur `LISTEN/NOTIFY` untuk memberi tahu wall saat pengaturan berubah. Keduanya cocok untuk sinkronisasi realtime. MySQL tetap dibiarkan untuk project lain.

### Prinsip aman

Kita membuat **database dan user baru khusus wall**. User ini hanya punya hak atas database `altama_wall`, tidak bisa melihat atau mengubah database project lain. Tidak ada setting PostgreSQL global yang diubah.

### 14a. Cek PostgreSQL berjalan

```bash
sudo systemctl status postgresql --no-pager | head -5
```

```bash
sudo -u postgres psql -c "SELECT version();"
```

Pastikan nama database dan user belum dipakai:

```bash
sudo -u postgres psql -c "\l" | grep -i altama || echo "Belum ada database altama, aman"
```

```bash
sudo -u postgres psql -c "\du" | grep -i altama || echo "Belum ada user altama, aman"
```

### 14b. Buat password

Buat password acak yang kuat, lalu **simpan di password manager**. Jangan ditulis di file ini atau di chat.

```bash
openssl rand -base64 24 | tr -d '/+=' | head -c 32; echo
```

### 14c. Buat user dan database

```bash
sudo -u postgres psql
```

Di dalam `psql`, jalankan satu per satu. Ganti `PASSWORD_DARI_14B` dengan password dari langkah sebelumnya, dan tetap pakai tanda kutip tunggal:

```sql
CREATE ROLE altama_wall WITH LOGIN PASSWORD 'PASSWORD_DARI_14B';
CREATE DATABASE altama_wall OWNER altama_wall;
REVOKE ALL ON DATABASE altama_wall FROM PUBLIC;
\q
```

### 14d. Tes login

```bash
psql "postgresql://altama_wall:PASSWORD_DARI_14B@127.0.0.1:5432/altama_wall" -c "SELECT current_user, current_database();"
```

Harus muncul `altama_wall | altama_wall`.

Kalau muncul `password authentication failed` atau `no pg_hba.conf entry`, cek `pg_hba.conf` (lihat [bagian 16](#16-kalau-ada-masalah)). Jangan mengubah baris milik project lain.

> Kalau PostgreSQL tidak di port 5432, cek port sebenarnya dengan `sudo -u postgres psql -c "SHOW port;"` dan ganti di URL.

### 14e. Pastikan database tidak terbuka ke internet

```bash
sudo ss -tlnp | grep postgres
```

Yang aman: `127.0.0.1:5432` (dan/atau `[::1]:5432`). Kalau terlihat `0.0.0.0:5432`, database bisa dijangkau dari luar. Pastikan firewall menutup port 5432 (cek di **hPanel → VPS → Firewall**, atau `sudo ufw status`). Jangan mengubah `listen_addresses` kalau project lain memang membutuhkannya.

### 14f. Simpan alamat database (belum dipakai)

Format yang nanti dimasukkan ke `.env` di [bagian 15](#15-sinkronisasi-pengaturan-langkah-berikutnya):

```dotenv
DATABASE_URL=postgresql://altama_wall:PASSWORD_DARI_14B@127.0.0.1:5432/altama_wall
```

Untuk sekarang, cukup simpan baris ini di password manager. **Belum** perlu ditambahkan ke `.env`.

### 14g. Backup

Setelah database dipakai, backup dengan:

```bash
mkdir -p ~/backup-altama && pg_dump "postgresql://altama_wall:PASSWORD_DARI_14B@127.0.0.1:5432/altama_wall" > ~/backup-altama/altama_wall-$(date +%F).sql
```

Selain itu, dashboard juga punya tombol **Export pengaturan** ke file JSON. Itu bisa dipakai sebagai cadangan kedua.

---

## 15. Sinkronisasi pengaturan: langkah berikutnya

Bagian ini menjelaskan apa yang akan ditambahkan ke kode dan apa yang perlu kamu lakukan di VPS setelah fitur itu masuk ke repo.

### Yang akan ditambahkan di kode (belum ada sekarang)

1. **API pengaturan** di server wall, misalnya `GET /api/settings` dan `PUT /api/settings`, yang membaca dan menyimpan pengaturan Wall/Hold/Font di tabel PostgreSQL `altama_wall`.
2. **Dashboard menyimpan ke server**, bukan hanya ke browser. Begitu disimpan dari HP, nilainya masuk database.
3. **Wall mengikuti perubahan otomatis** (realtime lewat WebSocket, atau cek berkala). Wall di PC event langsung memakai pengaturan baru tanpa reload.
4. **Login dashboard.** Domain ini publik, jadi tanpa password siapa pun yang tahu alamatnya bisa mengubah wall. Dashboard akan meminta PIN/password yang disimpan di `.env` VPS (misalnya `DASHBOARD_PASSWORD`).
5. **Tetap aman kalau internet putus.** Wall di PC event menyimpan salinan terakhir di browser, jadi tetap jalan normal saat koneksi ke VPS terputus.

### Yang kamu lakukan di VPS setelah fitur itu masuk

1. Update kode seperti [bagian 13](#13-cara-update-saat-ada-perubahan-di-github).
2. Tambahkan ke `/var/www/altama-milestone/.env` (dan ke blok `env` di `ecosystem.config.cjs` kalau memakai PM2):

   ```dotenv
   DATABASE_URL=postgresql://altama_wall:PASSWORD_DARI_14B@127.0.0.1:5432/altama_wall
   DASHBOARD_PASSWORD=PASSWORD_DASHBOARD_YANG_KUAT
   ```

3. Restart wall (`pm2 restart altama-milestone --update-env` atau `sudo systemctl restart altama-milestone`).
4. Buka `/dashboard` dari HP, login, ubah satu pengaturan kecil, lalu cek wall di device lain ikut berubah.

> Nama variabel di atas adalah rencana. Kalau berbeda saat fitur selesai, ikuti catatan rilisnya.

### Hubungan dengan PC event

Ada dua pilihan saat event nanti:

| Pilihan | Cara | Kelebihan | Risiko |
|---|---|---|---|
| **A. Wall lokal + sinkron ke VPS** (disarankan) | PC event tetap menjalankan `start-wall.bat` (wall + Sensor Service lokal). Pengaturan diambil dari VPS. | Sensor LiDAR tetap lokal dan cepat; wall tetap jalan kalau internet putus. | Perlu internet untuk menerima perubahan dari HP. |
| B. Wall langsung dari VPS | Browser kiosk PC event membuka `https://altama-milestone.nmxavw.com`. | Satu sumber saja. | Kalau internet putus, wall tidak bisa dibuka ulang. Sensor Service tetap harus jalan di PC event. |

---

## 16. Kalau ada masalah

### Log wall

PM2:

```bash
pm2 logs altama-milestone --lines 100
```

systemd:

```bash
journalctl -u altama-milestone -n 100 --no-pager
```

Log Nginx (hanya baris domain ini):

```bash
sudo grep altama-milestone /var/log/nginx/error.log | tail -20
```

### Tabel masalah umum

| Gejala | Penyebab paling mungkin | Solusi |
|---|---|---|
| Browser: **502 Bad Gateway** | Proses wall mati atau port di Nginx beda dengan `.env` | `pm2 list` / `systemctl status altama-milestone`; pastikan port 3310 sama di `.env`, PM2/systemd, dan Nginx. |
| Browser membuka **website project lain** | `server_name` salah, atau config belum aktif | Cek `server_name altama-milestone.nmxavw.com;`, cek symlink di `sites-enabled`, lalu `nginx -t` dan reload. |
| `EADDRINUSE` / port sudah dipakai | Port 3310 dipakai proses lain | Pilih port lain (bagian 3) dan ganti di semua tempat. |
| Build berhenti dengan **`Killed`** | RAM habis | Tambah swap 2 GB (di bawah), lalu build ulang. |
| `bun: command not found` di PM2/systemd | PATH berbeda | Pakai path lengkap dari `which bun`. |
| Certbot gagal: **DNS problem / NXDOMAIN** | DNS belum aktif | Tunggu, cek `dig +short altama-milestone.nmxavw.com`, lalu ulangi certbot. |
| Certbot gagal: **unauthorized / 404** | Domain lewat Cloudflare proxy, atau port 80 ke tempat lain | Set Cloudflare ke DNS only; pastikan `http://` domain sudah membuka wall. |
| Halaman terbuka tapi **putih kosong** | File `/_nuxt/` gagal dimuat | Buka DevTools → Network; pastikan `/_nuxt/*.js` berstatus 200. Build ulang dan restart. |
| `git pull` menolak: **local changes** | Ada file yang terubah di VPS | `git status`; kembalikan dengan `git checkout -- NAMA_FILE`. Jangan edit file repo langsung di VPS. |
| `psql`: **no pg_hba.conf entry** / **password authentication failed** | Aturan login lokal PostgreSQL | Lihat lokasi file: `sudo -u postgres psql -c "SHOW hba_file;"`. Pastikan ada baris `host all all 127.0.0.1/32 scram-sha-256` (atau `md5`). Tambahkan **hanya** kalau belum ada, lalu `sudo systemctl reload postgresql`. |

### Menambah swap 2 GB (kalau build `Killed`)

Cek dulu belum ada swap:

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

Kalau swap sudah ada tapi build tetap `Killed`, build di komputer sendiri lalu kirim folder `.output` ke VPS:

```bash
rsync -az --delete .output/ USER@187.77.120.179:/var/www/altama-milestone/.output/
```

Jalankan perintah ini dari folder repo di komputer sendiri. Setelah itu restart wall di VPS.

---

## 17. Cara melepas (rollback)

Untuk mencabut wall sepenuhnya tanpa mengganggu project lain:

```bash
pm2 delete altama-milestone && pm2 save
```

(systemd: `sudo systemctl disable --now altama-milestone && sudo rm /etc/systemd/system/altama-milestone.service && sudo systemctl daemon-reload`)

```bash
sudo rm /etc/nginx/sites-enabled/altama-milestone.nmxavw.com
```

```bash
sudo nginx -t && sudo systemctl reload nginx
```

```bash
sudo certbot delete --cert-name altama-milestone.nmxavw.com
```

Folder `/var/www/altama-milestone` dan database `altama_wall` bisa dihapus belakangan, setelah yakin tidak dibutuhkan. Backup database dulu (bagian 14g).

Untuk kembali ke versi sebelumnya (tanpa mencabut):

```bash
cd /var/www/altama-milestone && git log --oneline -10
```

```bash
git checkout HASH_COMMIT_SEBELUMNYA && bun install --frozen-lockfile && bun run build && pm2 restart altama-milestone
```

Kembali ke versi terbaru: `git checkout main && git pull --ff-only`, lalu build dan restart lagi.

---

## 18. Ringkasan nama dan lokasi

| Hal | Nilai |
|---|---|
| Domain | `altama-milestone.nmxavw.com` → `187.77.120.179` |
| Folder | `/var/www/altama-milestone` |
| Port internal | `3310` (hanya `127.0.0.1`) |
| Proses PM2 / service systemd | `altama-milestone` |
| Config Nginx | `/etc/nginx/sites-available/altama-milestone.nmxavw.com` |
| Sertifikat SSL | `altama-milestone.nmxavw.com` (Let's Encrypt, otomatis diperpanjang) |
| Database | PostgreSQL `altama_wall`, user `altama_wall` (hanya localhost) |
| File rahasia | `/var/www/altama-milestone/.env` (izin 600, tidak masuk Git) |
| Update | `~/update-altama.sh` atau langkah bagian 13 |
