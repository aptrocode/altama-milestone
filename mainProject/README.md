# ALTAMA Interactive Digital Wall (Canvas 2304 × 1344)

Aplikasi antarmuka dinding interaktif (*Interactive Digital Wall*) berstandar pameran untuk **PT Altama Surya Anugerah**. Dirancang khusus untuk layar resolusi besar **2304 × 1344 piksel** (rasio 12:7) dengan dukungan **Input Multi-Sensor Raw TUIO (Port 3333)**, **Augmenta Simulator & Hardware (Port 12000)**, maupun sensor sentuh inframerah (*infrared multi-touch frame* / LiDAR tracker).

---

## 🚀 Cara Menjalankan Aplikasi

### Cara 1: Menggunakan File Batch (Sangat Disarankan)
1. Buka folder `mainProject/`.
2. Klik ganda file **`start-server.bat`**.
3. Sistem akan otomatis menyalakan:
   - 🌐 **Web Server HTTP:** `http://localhost:8080/`
   - 📡 **TUIO UDP Receiver:** Port `3333` (Standar TUIO 1.1 & 2.0)
   - 🎯 **Augmenta OSC Receiver:** Port `12000` (Default Augmenta Simulator & LiDAR)
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

## 📡 Panduan Integrasi Augmenta Simulator & TUIO 3333

Aplikasi telah dilengkapi **Universal Sensor Receiver** yang secara otomatis mengenali paket sentuhan dari:
1. **Augmenta Simulator (Port 12000 & 3333):**
   - Protokol: OSC (`/object/update`, `/scene`, `/object/enter`, `/object/leave`)
   - Anda dapat membiarkan `Output Port` di Augmenta Simulator tetap pada default **`12000`** atau mengubahnya ke **`3333`**. Keduanya didukung secara bersamaan!
   - Saat objek/titik digerakkan di Augmenta Simulator, indikator di pojok kanan bawah website akan menyala hijau dan menampilkan koordinat `[Augmenta] ID:0 (X%, Y%)`.
2. **Sensor TUIO Standard (Port 3333):**
   - Protokol: OSC `/tuio/2Dcur` (`alive`, `set`, `fseq`)
   - Mendukung multi-touch LiDAR (Hokuyo, Slamtec, dll.) dan infrared touch frames.

### Tombol Shortcut Penting:
- **Tekan `I` di keyboard:** Membalik orientasi sumbu Y (*Invert Y-Axis*). Sangat berguna jika sensor LiDAR atau Augmenta memiliki titik nol (0,0) di sudut bawah alih-alih sudut atas.
- **Tekan `Esc` di keyboard:** Reset seluruh kolom kembali ke tampilan standby (idle).

### Cara Menguji Input Sensor (Diagnostic Simulator):
```powershell
# Format: python send_tuio_test.py [mode] [x] [y] [durasi_detik]

# Uji sentuhan TUIO pada Kolom 1 (TENTANG ALTAMA) selama 1.2 detik:
python send_tuio_test.py tuio 0.1 0.5 1.2

# Uji sentuhan Augmenta Simulator pada Kolom 2 (MEREK KAMI) selama 1.2 detik:
python send_tuio_test.py augmenta 0.25 0.5 1.2
```

---

## ✨ Fitur Utama Sistem

### 1. Tata Letak 6 Kolom Simetris Sempurna (*Balanced Grid*)
- **Resolusi Kanvas:** 2304 × 1344 piksel (Aspect Ratio 12:7).
- **Dimensi Kolom:** 350px × 510px per kolom.
- **Margin & Jarak:** Padding kiri-kanan 52px, gap antar kolom 20px.

### 2. Sistem Sentuh Ketat (*Strict Hold-to-Activate*)
- **Durasi Hold Penuh:** Pengunjung wajib menahan tombol selama **1 detik (1000ms)** untuk membuka kartu utama/sub-menu, dan **650ms** untuk panah foto slider.
- **Proteksi Salah Sentuh:** Klik cepat atau sentuhan sekilas (*tap*) tidak akan membuka kartu.
- **Batal Jika Dilepas:** Jika jari/sensor diangkat sebelum durasi selesai, status langsung di-reset.

### 3. Pemilihan Bahasa di Kartu Awal (*Sensor-Ready Translate*)
- **3 Bahasa Independen Per Kolom:** 🇮🇩 ID, 🇬🇧 EN, 🇨🇳 ZH.
- **Ukuran Bendera Besar (44 × 28px):** Nyaman dan akurat untuk sensor layar sentuh/radar.

---

## 📂 Struktur Berkas Proyek

```
mainProject/
├── index.html                   # Entry point aplikasi utama
├── altama-wallmessage.html      # Salinan kompatibilitas halaman utama
├── server.py                    # Universal Server (HTTP 8080 + TUIO 3333 + Augmenta 12000)
├── start-server.bat             # Script 1-klik untuk menjalankan server terpadu
├── send_tuio_test.py            # Diagnostic tool simulator (TUIO & Augmenta)
├── README.md                    # Dokumentasi panduan dalam Bahasa Indonesia
├── css/                         # File styling modular
├── js/
│   ├── config.js                # Konfigurasi konten & teks 3 bahasa
│   ├── state.js                 # State manager setiap kolom & bahasa
│   ├── carousel.js              # Mesin transisi slide foto
│   ├── interactions.js          # Controller buka-tutup kartu
│   ├── app.js                   # Bootstrap aplikasi & strict hold
│   └── tuio-client.js           # Universal sensor client bridge (TUIO + Augmenta)
└── mockup/                      # Screenshot tampilan terkini
```

---

*Hak Cipta © PT Altama Surya Anugerah. Seluruh hak cipta dilindungi undang-undang.*
