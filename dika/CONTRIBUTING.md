# Panduan Kontribusi Workspace `dika/`

Dokumen ini menjadi rujukan alur kerja untuk Dika dan AI Agent pendamping.

## 1. Lingkup Pekerjaan
- Folder `dika/` disediakan sebagai tempat khusus untuk merancang prototipe, eksplorasi antarmuka, *slicing* HTML/CSS/JS, atau menampung aset referensi visual.
- Semua file kerja wajib disimpan di dalam folder `dika/`.

## 2. Batasan Penting (PENTING)
- **Jangan mengubah, memindahkan, atau menghapus file di luar folder `dika/`** (seperti folder `app/`, `docs/`, `shared/`, `package.json`, dan file konfigurasi root).
- **Jangan membuat folder prototipe baru di root** (seperti `mainProject/` atau sejenisnya).
- Pengelolaan arsitektur aplikasi Nuxt 4, integrasi komponen, sensor LiDAR, dan build sistem utama sepenuhnya ditangani oleh **Dewa (@adydetra)**.

## 3. Cara Integrasi ke Proyek Utama
Jika eksplorasi atau desain prototipe di dalam `dika/` sudah siap:
1. Simpan dan commit perubahan Anda di dalam folder `dika/`.
2. Beritahu **Dewa (@adydetra)** bahwa prototipe sudah siap direview.
3. Dewa yang akan melakukan *porting* dan adaptasi ke dalam arsitektur Vue 3 / Nuxt 4 & Tailwind CSS v4 resmi.
