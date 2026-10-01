# ALTAMA Interactive Digital Wall (Canvas 2304 × 1344)

Aplikasi antarmuka dinding interaktif (*Interactive Digital Wall*) berstandar pameran untuk **PT Altama Surya Anugerah**. Dirancang khusus untuk layar resolusi besar **2304 × 1344 piksel** (rasio 12:7) dengan dukungan **Input Raw TUIO 1.1 (UDP Port 3333)**, sensor sentuh interaktif (*infrared multi-touch frame*), maupun radar sensor (*LiDAR / Laser Tracker*).

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (Sangat Disarankan)
1. Buka folder `mainProject/`.
2. Klik ganda file **`start-server.bat`**.
3. Sistem akan otomatis menyalakan:
   - 🌐 **Web Server HTTP:** `http://localhost:8080/`
   - 📡 **TUIO UDP Receiver:** Port `3333` (Siap menerima sinyal raw TUIO dari sensor)
   - 🔌 **WebSocket Bridge:** Port `3334` (`ws://localhost:3334`)
4. Browser default akan otomatis membuka:
   ```
   http://localhost:8080/
   ```

### Cara 2: Menjalankan Server via Terminal
Buka terminal / PowerShell di folder `mainProject/` dan jalankan:
```powershell
python server.py 8080
```

---

## 📡 Integrasi Sensor Raw TUIO 1.1 (Port 3333)

Sistem ALTAMA Interactive Wall telah dilengkapi dengan **Server Raw TUIO 1.1 terintegrasi** tanpa memerlukan instalasi library pihak ketiga (*zero dependencies*).

### Spesifikasi Protokol TUIO:
- **Protokol Jaringan:** UDP (User Datagram Protocol)
- **Port Input:** `3333` (Standar Industri TUIO)
- **Tipe Pesan:** OSC (Open Sound Control) Profil `/tuio/2Dcur`
- **Pesan yang Didukung:**
  - `/tuio/2Dcur alive [id1, id2, ...]` (Status kursor aktif / multitouch)
  - `/tuio/2Dcur set s_id x y X Y m` (Koordinat ternormalisasi $0.0 - 1.0$)
  - `/tuio/2Dcur fseq [frame_id]` (Penanda akhir paket frame)
- **Kompatibilitas Perangkat:**
  - Multi-touch LiDAR Scanner (Hokuyo, Slamtec RPLIDAR, dll.)
  - Laser Touch Tracker / TuioPad / Touch2Tuio
  - Optical Frame & Multi-touch Infrared Overlays

### Cara Menguji Input TUIO (Diagnostic Simulator):
Untuk memastikan penerimaan TUIO pada port 3333 berfungsi dengan baik, jalankan simulator sentuhan sintetis yang disertakan:

```powershell
# Format: python send_tuio_test.py <posisi_x_0_ke_1> <posisi_y_0_ke_1> <durasi_hold_detik>

# Contoh 1: Tekan & tahan Kolom 1 (TENTANG ALTAMA) selama 1.2 detik (Hold to activate)
python send_tuio_test.py 0.1 0.5 1.2

# Contoh 2: Tekan & tahan Kolom 2 (MEREK KAMI)
python send_tuio_test.py 0.25 0.5 1.2
```

Saat paket TUIO masuk, Anda akan melihat:
1. Status badge di pojok kanan bawah browser: **`TUIO UDP:3333 Connected`** (hijau neon).
2. Lingkaran neon pulsing bersinar di posisi koordinat sentuhan di layar.
3. Tombol secara akurat merespons interaksi *Strict Hold*, membuka kartu, dan menggeser carousel foto.

---

## ✨ Fitur Utama Sistem

### 1. Tata Letak 6 Kolom Simetris Sempurna (*Balanced Grid*)
- **Resolusi Kanvas:** 2304 × 1344 piksel.
- **Dimensi Kolom:** Masing-masing kolom berukuran presisi **350px × 510px**.
- **Margin & Jarak:** Padding samping kiri-kanan **52px** dan jarak antar kolom (*gap*) **20px**.
- Perhitungan integer pixel-perfect:
  $$	ext{Total Lebar} = 2 	imes 52	ext{px} + 5 	imes 20	ext{px} + 6 	imes 350	ext{px} = 2304	ext{px}$$
- Tidak ada ruang kosong berlebih di pinggir kiri dan kanan (*full-bleed balanced distribution*).

### 2. Sistem Sentuh Ketat (*Strict Hold-to-Activate*)
- **Proteksi Salah Sentuh:** Klik cepat atau sentuhan sekilas (*tap*) **tidak akan membuka kartu**.
- **Durasi Hold Penuh:** Pengunjung wajib menahan tombol selama **1 detik (1000ms)** hingga animasi border melingkar selesai 100%.
- **Batal Jika Dilepas Dini:** Apabila jari/sensor diangkat di tengah jalan (misal baru 300ms–500ms), timer langsung dibatalkan, animasi di-reset, dan layar **tidak akan berpindah sama sekali**.
- **Kompatibel Penuh Sensor TUIO:** Pointer TUIO diterjemahkan menjadi PointerEvent native sehingga mekanisme strict hold berjalan 100% mulus dengan sensor LiDAR/TUIO.

### 3. Pemilihan Bahasa di Kartu Awal (*Sensor-Ready Translate*)
- **3 Bahasa Independen Per Kolom:**
  - 🇮🇩 Bahasa Indonesia (`id`)
  - 🇬🇧 English (`en`)
  - 🇨🇳 中文 Mandarin (`zh`)
- **Ukuran Bendera Besar:** Berukuran **44 × 28px** yang sangat nyaman dan akurat untuk sensor layar sentuh.
- **Sistem Hold Bahasa:** Pemilihan bahasa juga menggunakan sistem hold (~800ms) dengan feedback visual glow dan ring.
- **Otomatis Hilang Saat Dibuka:** Tombol translate **hanya tampil saat kartu awal (idle)**. Ketika kartu dibuka ke menu atau foto, tombol translate otomatis menghilang agar layar tetap bersih.

### 4. Alur Konten & Sub-Menu Interaktif
- **Kolom 2 (Merek Kami):** Menampilkan pilihan merek **TEKIRO**, **RYU**, dan **REXCO**.
- **Kolom 5 (Distribusi):** Menampilkan pilihan **JALUR DISTRIBUSI KAMI** dan **AKTIVASI MEREK**.
- **Tanpa Penjelasan Prematur:** Sebelum salah satu sub-item dipilih, zona atas dan bawah tetap bersih tanpa teks penjelasan.
- **Buka Kartu Foto Carousel:** Saat salah satu sub-item ditekan, kartu foto langsung keluar sama seperti kolom lainnya, dan teks penjelasannya baru tampil di zona atas dan bawah.

### 5. Navigasi Slider Foto Bergaya *Glassmorphism* dengan Hold
- **Posisi Arrow:** Tombol navigasi panah kiri (`<`) dan kanan (`>`) berada tepat di **tengah sisi kiri dan kanan gambar** (*vertical center*).
- **Strict Hold 650ms:** Panah foto dilengkapi cincin neon melingkar yang mengisi saat ditahan selama 650ms sebelum berpindah gambar.
- **Efek Frosted Glass:** Desain tombol melingkar transparan dengan efek blur halus (`backdrop-filter: blur(14px)`), border berkilau, dan bayangan kedalaman.
- **Indikator Nomor Foto:** Indikator posisi slide (misal `01 / 03`) berada di tengah bawah gambar dalam bentuk pill *glassmorphism*.

### 6. Tipografi Skala Besar (*High-Visibility Typography*)
- Dioptimalkan khusus agar terbaca jelas dari jarak berdiri 1–3 meter pada display LED:
  - **Judul Zona Atas:** 36px (Black 900)
  - **Paragraf Zona Atas:** 21px (Medium 500)
  - **Label Kartu Awal:** 30px (Black 900)
  - **Judul Submenu:** 26px (Bold 900)
  - **Judul Header Kartu:** 22px (Bold 900)
  - **Label Foto:** 17px (Bold 800) dengan padding aman dari tombol panah
  - **Nomor Slide:** 20px (Bold 800)
  - **Judul Zona Bawah:** 24px (Bold 800)
  - **Deskripsi Zona Bawah:** 18px (Medium 500)

### 7. Reset Otomatis Inaktivitas (*Auto-Return to Idle*)
- Setiap kolom yang aktif akan otomatis kembali ke tampilan awal (*standby*) setelah **15 detik** tanpa interaksi sentuhan.
- Tombol **Escape (`Esc`)** pada keyboard dapat ditekan kapan saja untuk me-reset seluruh kolom ke status awal secara instan.

---

## 📂 Struktur Berkas Proyek

```
mainProject/
├── index.html                   # Entry point aplikasi utama
├── altama-wallmessage.html      # Salinan kompatibilitas halaman utama
├── server.py                    # Unified Server (HTTP 8080 + TUIO UDP 3333 + WS 3334)
├── start-server.bat             # Script 1-klik untuk menjalankan server terpadu
├── send_tuio_test.py            # Diagnostic tool simulator TUIO 1.1
├── README.md                    # Dokumentasi panduan dalam Bahasa Indonesia
├── css/
│   ├── variables.css            # Token desain, warna, rasio zona, dan kanvas 2304x1344
│   ├── layout.css               # Tata letak kontainer kanvas, zona top, middle, & bottom
│   ├── zones.css                # Gaya teks dan tata letak zona atas & zona bawah
│   ├── buttons.css              # Gaya kartu awal (idle), tombol hold, dan kapsul bendera
│   ├── submenu.css              # Gaya kartu daftar pilihan merek & distribusi
│   ├── carousel.css             # Gaya kartu aktif, frame foto, & arrow glassmorphism
│   └── animations.css           # Animasi kinetic, ripple, border sweep, & text entrance
└── js/
    ├── config.js                # Konfigurasi master konten, teks 3 bahasa, dan durasi hold
    ├── state.js                 # Pengelola state reaktif setiap kolom & bahasa
    ├── carousel.js              # Mesin transisi slide foto (prev, next, goTo)
    ├── interactions.js          # Pengontrol alur buka-tutup kartu dan zona teks
    ├── app.js                   # Bootstrap aplikasi, event hold sensor, & auto-reset
    └── tuio-client.js           # Client bridge penerima paket TUIO UDP 3333 via WS
```

---

## 🛠️ Konfigurasi Konten & Bahasa

Untuk menambah atau mengubah teks, silakan buka berkas **`js/config.js`**:
- **Durasi Hold:** Ubah nilai `WALL_CONFIG.settings.holdDuration` (default `1000` milidetik).
- **Auto Reset:** Ubah nilai `WALL_CONFIG.settings.autoResetSeconds` (default `15` detik).
- **Teks Multi-Bahasa:** Teks judul dan deskripsi setiap kolom didefinisikan dalam objek `i18n` untuk masing-masing kode bahasa (`id`, `en`, `zh`).

---

*Hak Cipta © PT Altama Surya Anugerah. Seluruh hak cipta dilindungi undang-undang.*
