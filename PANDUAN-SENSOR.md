# Panduan Sensor (LiDAR) untuk Operator

Panduan praktis menyambungkan sensor ke wall, dari nol sampai bisa disentuh. Detail teknis (protokol, angka, simulator) ada di [docs/sensor.md](docs/sensor.md).

## 1. Dua cara menyambungkan sensor

| | **A. Lewat TouchDesigner (klik mouse)** | **B. Lewat Sensor Service (disarankan)** |
| --- | --- | --- |
| Alur | Hokuyo → OptiTUIO → TouchDesigner (`WebClickTUIO`) → klik mouse ke browser | Hokuyo → OptiTUIO → **TUIO UDP 3333** → Sensor Service → wall |
| Yang menentukan tombol | Posisi kursor saat klik | Sensor Service mencocokkan titik sentuh dengan tombol yang sedang terlihat |
| Banyak orang sekaligus | Tidak (hanya satu kursor mouse) | Ya (setiap tangan dilacak terpisah) |
| Tombol kecil (bendera, ✕, panah) | Sering gagal | Lebih stabil (lihat bagian 2) |
| Aturan hold dashboard | Ikut, tapi lewat kursor | Ikut, dihitung per tangan |
| Lihat titik sentuh secara live | Tidak | Ya, di **Dashboard → Sensor → Preview** |
| Scroll teks (uji coba, section 6) | Hanya jika TD mengirim **drag** (tekan → geser → lepas), bukan klik | Belum (hanya tap) |

**Rekomendasi:** pakai **B**. Kalibrasi tetap di **OptiTUIO**, karena sudah kalian setel dengan objek pembatas dan tidak perlu diulang. Yang diubah hanya tujuan kirimnya: OptiTUIO mengirim TUIO langsung ke Sensor Service, dan TouchDesigner tidak dipakai lagi untuk klik.

## 2. Kenapa bendera bahasa susah ditekan di cara A

1. **Bendera kecil.** Di mode Compact, bendera berukuran 64 × 48 px, sedangkan card 360 × 642 px. Kalau satu pixel di layar kira-kira 2–3 mm, bendera cuma sekitar 13–19 cm × 10–14 cm. Titik dari LiDAR adalah *tengah tangan*, bukan ujung jari, dan bisa meleset beberapa cm.
2. **Klik mouse butuh tekan dan lepas di tombol yang sama.** Bendera aktif dengan "tekan biasa" (Hold → Bahasa default **Tap**). Browser baru menganggap itu klik kalau mouse ditekan *dan* dilepas di atas elemen yang sama. Tangan di depan LiDAR selalu bergeser sedikit. Kalau saat dilepas posisinya sudah di luar bendera, kliknya hilang.
3. **Meleset sedikit, kena card di belakangnya.** Bar bendera ada di atas card. Kalau titiknya jatuh di luar bendera, yang tersentuh adalah card (yang punya hold 1 detik), bukan bahasa.
4. **Satu kursor untuk semua orang.** Kalau ada dua tangan, kursornya lompat-lompat.

Card mudah ditekan karena ukurannya besar, jadi meleset beberapa cm pun masih kena.

Di cara **B**, Sensor Service tidak memakai klik mouse. Tangan cukup berada di atas bendera selama 250 ms. Goyangan kecil di tepi tombol (kurang dari 120 ms) diabaikan. Tangan yang baru masuk tidak langsung menekan apa pun, dan setiap tangan dihitung terpisah.

## 3. Setup cara B (yang disarankan)

### Sekali saja

1. **Matikan TouchDesigner / `WebClickTUIO`.** Kalau tetap jalan, ia ikut mengklik (input dobel) dan bisa menduduki port 3333 yang dibutuhkan Sensor Service.
2. **Di OptiTUIO**, atur output TUIO ke:
   - Host `127.0.0.1` (atau IP PC wall kalau OptiTUIO jalan di PC lain)
   - Port **3333** (UDP)
   - Pesan **TUIO 1.1 cursor (`/tuio/2Dcur`)**. Sensor Service hanya membaca cursor, bukan blob atau object.
3. **Area OptiTUIO = seluruh layar LED** (2304 × 1344), dengan titik (0,0) di **kiri atas**, bukan hanya area card. Kalau gerakan atas–bawah terbalik, nyalakan **Invert Y** di dashboard (langkah 4).

### Tiap kali dinyalakan

1. Jalankan `start-wall.bat` (di event). Input sensor ke wall sudah aktif secara default.
   - Kalau pakai `bun dev` untuk tes, isi `.env` dulu:
     ```dotenv
     NUXT_PUBLIC_SENSOR_ENABLED=true
     NUXT_PUBLIC_SENSOR_WS_URL=ws://127.0.0.1:8787
     ```
     lalu jalankan ulang `bun dev`.
2. Jalankan OptiTUIO seperti biasa.
3. Buka dashboard: di kiosk tekan **Ctrl+Shift+D** (atau buka `http://localhost:3000/dashboard` saat `bun dev`), lalu pilih **Sensor**.
4. Pilih sumber **TUIO**, port **3333**, nyalakan **Invert Y** hanya kalau perlu, lalu **Simpan**. Status kanan atas harus menunjukkan TUIO siap, bukan error port.
5. Tekan **Ctrl+Shift+D** lagi untuk kembali ke wall.

Pengaturan ini tersimpan di `sensor-config.json` di PC, jadi tidak perlu diulang setiap kali dinyalakan.

## 4. Cek apakah sentuhan tepat sasaran

Buka **Dashboard → Sensor → Preview**. Preview menggambar keenam card dan titik tangan secara live:

| Warna titik | Arti |
| --- | --- |
| Abu-abu | Tangan terdeteksi, tapi tidak di atas tombol |
| Ring biru | Sedang hold, dengan progress |
| Hijau | Input terkirim ke wall |

Uji tiap bendera di keenam kolom, juga ✕, panah, dan tab page.

- **Titik selalu bergeser ke satu arah** (misalnya selalu agak ke bawah): perbaiki kalibrasi di OptiTUIO. Kalau semua card hanya perlu naik atau turun, bisa juga pakai **Wall → Posisi Y card**. Area sentuh ikut bergeser otomatis.
- **Titik tepat tapi tetap sulit**: perbesar tombolnya (bagian 5).

### Titik sentuh langsung di wall (cara A dan B)

Untuk melihat di proyeksi atau LED **di mana** sentuhan benar-benar diterima halaman, nyalakan **Dashboard → Wall → Titik sentuh**, atau buka wall dengan `?dots=1` (misalnya `http://localhost:3000/?dots=1`). Ini halaman yang sama, hanya ditambah lapisan titik. Lama titik terlihat diatur di **Durasi titik** (default 5 detik):

| Tanda | Arti |
| --- | --- |
| Titik **biru** + koordinat | Posisi saat menekan (klik mouse/touch dari TouchDesigner atau tangan) |
| Titik **merah** + garis kuning putus-putus | Posisi saat melepas, kalau bergeser dari posisi tekan |
| Titik **hijau** | Input dari Sensor Service (cara B) |

Cara membaca:

| Yang terlihat | Artinya | Solusi |
| --- | --- | --- |
| Biru dan merah sama-sama di luar bendera, selalu bergeser ke arah yang sama | Kalibrasi OptiTUIO atau posisi proyektor meleset | Rapikan kalibrasi di OptiTUIO, atau geser card dengan **Posisi Y card** |
| Biru tepat di bendera, merah jauh | Saat tangan dilepas, posisinya bergeser | Set **Hold → Bahasa** ke Hold 0,3–0,5 detik (bagian 5) |
| Tidak muncul titik sama sekali | Klik tidak sampai ke halaman | Cek pengiriman klik di TouchDesigner, atau output OptiTUIO |

Matikan lagi (hapus `?dots=1`) sebelum acara.

> **Pengaturan dashboard tersimpan per browser.** Wall yang tampil di TouchDesigner (Web Render) punya penyimpanan sendiri, terpisah dari Chrome. Mengubah dashboard di Chrome tidak mengubah wall di TouchDesigner. Ubah pengaturannya di browser yang sama dengan yang menampilkan wall (buka `/dashboard` di Web Render, atau tekan **Ctrl+Shift+D** di sana), atau pakai **Export / Import pengaturan**. Titik sentuh bisa langsung lewat `?dots=1`.

## 5. Atur dashboard agar cocok untuk LiDAR

Di **Dashboard → Wall**:

| Pengaturan | Saran untuk LiDAR | Kenapa |
| --- | --- | --- |
| Tampilan bahasa | **Full width** atau **Grid 2 + 1** | Bendera jadi 102 × 60 atau 155 × 60 px, sekitar 2–3 kali lebih besar dari Compact |
| Tombol slider | **Off** (auto slide 5 s) | Panah kecil tidak perlu ditekan; video tetap diputar sampai selesai |
| Tombol page | **Off** (auto page 15 s) kalau tab sulit ditekan | Page berganti sendiri |
| Tombol close | **Off** kalau ✕ sulit ditekan | Card tetap tertutup sendiri setelah Reset otomatis |
| Reset otomatis | Biarkan 30 s | Saat auto slide/page aktif, card otomatis menunggu sampai slide terakhir selesai (mis. video 30 s + 5 gambar × 5 s = tutup di 55 s) |

Di **Dashboard → Hold**:

- **Cara A (klik dari TouchDesigner): set Bahasa ke Hold, 0,3–0,5 detik.** Dengan Tap, bendera baru aktif saat tangan *dilepas*, dan posisi lepas dari LiDAR sering bergeser keluar bendera. Dengan hold, bendera aktif selama tangan diam sebentar di atasnya, sama seperti card. Lakukan hal yang sama untuk Tombol close kalau ✕ dipakai.
- **Cara B (Sensor Service):** Bahasa boleh tetap Tap, karena Sensor Service sudah menunggu tangan diam 250 ms.
- Card section boleh tetap 1 detik, supaya orang yang lewat tidak membuka card tanpa sengaja.

## 6. Kalau ada masalah

| Gejala | Penyebab yang mungkin | Yang dilakukan |
| --- | --- | --- |
| Dashboard Sensor: **Service offline** | Sensor Service tidak jalan | Jalankan `start-wall.bat` atau `bun dev` |
| Status TUIO error / port dipakai | TouchDesigner atau aplikasi lain memakai UDP 3333 | Tutup aplikasinya, lalu Simpan lagi |
| Preview kosong saat tangan di depan layar | OptiTUIO tidak mengirim ke 127.0.0.1:3333, atau mengirim blob/object, bukan cursor | Cek output OptiTUIO |
| Titik di preview naik saat tangan turun | Sumbu Y terbalik | Nyalakan **Invert Y** |
| Preview benar, tapi wall tidak bereaksi | Input sensor wall mati (`NUXT_PUBLIC_SENSOR_ENABLED=false` saat `bun dev`) atau ada wall kedua yang terbuka | Isi `.env`, jalankan ulang; tutup tab wall lain dan HP (hanya wall pertama yang menerima sentuhan) |
| Semua input diam saat kalibrasi | **Mode kalibrasi** (Hokuyo) masih aktif | Klik **Selesai** |
| Tombol terpencet dua kali | TouchDesigner masih mengklik bersamaan | Matikan `WebClickTUIO` |

## 7. Alternatif: Hokuyo langsung tanpa OptiTUIO

Sensor Service bisa membaca Hokuyo UST-10LX sendiri (Ethernet, `192.168.0.10:10940`), lalu dikalibrasi lewat **Dashboard → Sensor → Hokuyo**:

1. Klik **Mode kalibrasi**.
2. Untuk tiap titik, taruh satu tangan di sana lalu klik **Ambil**. Minimal 4 titik; titik ke-5 dan seterusnya menampilkan error dalam px.
3. Klik **Simpan**, lalu **Selesai**.
4. Dengan area kosong di depan layar, klik **Ambil** di bagian Background.

Cara ini belum pernah diuji dengan hardware asli. Karena OptiTUIO sudah terkalibrasi dan jalan, **tetap pakai OptiTUIO + TUIO (cara B)**. Langkah lengkap: [docs/sensor.md](docs/sensor.md#hokuyo-ust-10lx).

## 8. Coba tanpa sensor

Kirim sentuhan TUIO palsu ke Sensor Service (angka = posisi pixel di layar, lama sentuh dalam detik):

```bash
bun run sensor:sim tuio --tap 212,700,1.5
```

Pilih sumber **TUIO** di Dashboard → Sensor dulu. Titik `212,700` ada di card kolom 1. Lihat hasilnya di Preview dan di wall (dengan input sensor aktif).
