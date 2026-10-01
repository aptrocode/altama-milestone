# ALTAMA Interactive Digital Wall (Canvas 2304 × 1344)

Aplikasi antarmuka dinding interaktif (*Interactive Digital Wall*) berstandar pameran untuk **PT Altama Surya Anugerah**. Dirancang khusus untuk layar resolusi besar **2304 × 1344 piksel** (rasio 12:7) dengan dukungan sensor sentuh interaktif (*touchscreen / infrared frame*).

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (Paling Praktis)
1. Buka folder `mainProject/`.
2. Klik ganda file **`start-server.bat`**.
3. Terminal server akan aktif di port `8080` dan browser default Anda akan otomatis membuka:
   ```
   http://localhost:8080/
   ```

### Cara 2: Menjalankan via Terminal / PowerShell
Buka terminal di dalam folder `mainProject/` dan jalankan salah satu perintah berikut:

- **Menggunakan Python:**
  ```powershell
  python -m http.server 8080
  ```
- **Menggunakan Node.js / npx:**
  ```powershell
  npx serve -p 8080 .
  ```
Buka browser di alamat: [http://localhost:8080/](http://localhost:8080/)

---

## ✨ Fitur Utama Sistem

### 1. Tata Letak 6 Kolom Simetris Sempurna (*Balanced Grid*)
- **Resolusi Kanvas:** 2304 × 1344 piksel.
- **Dimensi Kolom:** Masing-masing kolom berukuran presisi **350px × 510px**.
- **Margin & Jarak:** Padding samping kiri-kanan **52px** dan jarak antar kolom (*gap*) **20px**.
- Perhitungan integer pixel-perfect:
  $$\text{Total Lebar} = 2 \times 52\text{px} + 5 \times 20\text{px} + 6 \times 350\text{px} = 2304\text{px}$$
- Tidak ada ruang kosong berlebih di pinggir kiri dan kanan (*full-bleed balanced distribution*).

### 2. Sistem Sentuh Ketat (*Strict Hold-to-Activate*)
- **Proteksi Salah Sentuh:** Klik cepat atau sentuhan sekilas (*tap*) **tidak akan membuka kartu**.
- **Durasi Hold Penuh:** Pengunjung wajib menahan tombol selama **1 detik (1000ms)** hingga animasi border melingkar selesai 100%.
- **Batal Jika Dilepas Dini:** Apabila jari/sensor diangkat di tengah jalan (misal baru 300ms–500ms), timer langsung dibatalkan, animasi di-reset, dan layar **tidak akan berpindah sama sekali**.

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

### 5. Navigasi Slider Foto Bergaya *Glassmorphism*
- **Posisi Arrow:** Tombol navigasi panah kiri (`<`) dan kanan (`>`) berada tepat di **tengah sisi kiri dan kanan gambar** (*vertical center*).
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
├── start-server.bat             # Script 1-klik untuk menjalankan server port 8080
├── README.md                    # Dokumentasi panduan dalam Bahasa Indonesia
├── css/
│   ├── variables.css            # Token desain, warna, rasio zona, dan kanvas 2304x1344
│   ├── layout.css               # Tata letak kontainer kanvas, zona top, middle, & bottom
│   ├── zones.css                # Gaya teks dan tata letak zona atas & zona bawah
│   ├── buttons.css              # Gaya kartu awal (idle), tombol hold, dan kapsul bendera
│   ├── submenu.css              # Gaya kartu daftar pilihan merek & distribusi
│   └── carousel.css             # Gaya kartu aktif, frame foto, & arrow glassmorphism
└── js/
    ├── config.js                # Konfigurasi master konten, teks 3 bahasa, dan durasi hold
    ├── state.js                 # Pengelola state reaktif setiap kolom & bahasa
    ├── carousel.js              # Mesin transisi slide foto (prev, next, goTo)
    ├── interactions.js          # Pengontrol alur buka-tutup kartu dan zona teks
    └── app.js                   # Bootstrap aplikasi, event hold sensor, & auto-reset
```

---

## 🛠️ Konfigurasi Konten & Bahasa

Untuk menambah atau mengubah teks, silakan buka berkas **`js/config.js`**:
- **Durasi Hold:** Ubah nilai `WALL_CONFIG.settings.holdDuration` (default `1000` milidetik).
- **Auto Reset:** Ubah nilai `WALL_CONFIG.settings.autoResetSeconds` (default `15` detik).
- **Teks Multi-Bahasa:** Teks judul dan deskripsi setiap kolom didefinisikan dalam objek `i18n` untuk masing-masing kode bahasa (`id`, `en`, `zh`).

---

*Hak Cipta © PT Altama Surya Anugerah. Seluruh hak cipta dilindungi undang-undang.*
