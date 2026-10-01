# Release Workflow & Guidelines

Panduan dan standar rilis resmi (*official release*) untuk repositori `altama-milestone`. Dokumen ini menjadi rujukan otomatis bagi AI assistant dan pengembang ketika proses rilis diminta.

---

## 1. Standar Metadata Repositori GitHub

Ketika melakukan rilis atau sinkronisasi repositori, metadata GitHub wajib mengikuti ketentuan berikut:

1. **Deskripsi Repositori**:
   - Dibuat ringkas, jelas, dan **wajib diawali dengan emoji**.
   - Contoh standar: `✨ Interactive six-column fullscreen wall for 2304x1344 LED installation`
2. **Topik / Tags Repositori**:
   - Dibatasi **hanya 3 tag** (tidak boleh lebih dan tidak boleh kurang).
   - Tag resmi: `nuxt`, `kiosk`, `interactive-installation`.

---

## 2. Tahapan Rilis (Step-by-Step)

Setiap permintaan rilis harus dijalankan secara berurutan:

### Langkah 1: Bump Versi
Perbarui field `"version"` pada `package.json` sesuai kaidah Semantic Versioning (SemVer: `Major.Minor.Patch`).

### Langkah 2: Verifikasi & Quality Gates
Pastikan seluruh validasi lokal lolos 100% tanpa error:
```bash
bun run lint
bun run typecheck
bun run test
bun run assets:check
bun run build
```

### Langkah 3: Git Commit & Push
Buat issue dan branch rilis, commit perubahan versi/dokumentasi, lalu buka PR sesuai `docs/push.md`. Jangan push langsung ke main. Pemeriksaan dan review harus selesai sebelum PR digabungkan; tag dibuat dari commit hasil merge pada main.

### Langkah 4: Git Tag
Buat tag dengan format `vX.Y.Z` lalu push ke remote origin:
```bash
git tag vX.Y.Z
git push origin vX.Y.Z
```

### Langkah 5: Sinkronisasi Metadata GitHub
Perbarui deskripsi dan 3 topik pada repositori via GitHub REST API:
- Endpoint: `PATCH /repos/{owner}/{repo}` (deskripsi)
- Endpoint: `PUT /repos/{owner}/{repo}/topics` (array 3 tags)

### Langkah 6: Pembuatan GitHub Release
Buat GitHub Release resmi untuk tag `vX.Y.Z` dengan format rilis yang merujuk pada standar `aptrocode/clothes-tv-transparent`.

---

## 3. Format Catatan Rilis (*Release Notes Style*)

Isian catatan rilis (*release body*) wajib menggunakan Bahasa Indonesia yang profesional, ramah, dan terstruktur rapi dengan format:

```markdown
> Altama Interactive Milestone versi **X.Y.Z** kini telah resmi dirilis sebagai [keterangan jenis rilis, misal: rilis perdana (*initial release*) / rilis stabilitas (*stability release*)]. [Ringkasan 2-3 kalimat mengenai poin utama rilis].

[Paragraf pengantar yang menjelaskan konteks, fokus pembaruan, serta dampak bagi instalasi LED kiosk].

---

## 👀 Sorotan Utama

### [Emoji 1] [Nama Sorotan Utama 1]
[Penjelasan singkat]
* **[Poin A]**: [Rincian teknis]
* **[Poin B]**: [Rincian teknis]

### [Emoji 2] [Nama Sorotan Utama 2]
[Penjelasan singkat]
* **[Poin A]**: [Rincian teknis]
* **[Poin B]**: [Rincian teknis]

---

## 📋 What's Changed

### 🚀 Fitur Baru & Antarmuka Publik
* [commit/item 1]
* [commit/item 2]

### 🛠️ Backend, Sensor & Pengoptimalan
* [commit/item 1]
* [commit/item 2]

### 📦 Konfigurasi & Rilis
* [commit/item 1]
* chore(release): bump version ke X.Y.Z

---

## 👥 Kontributor

Terima kasih sebesar-besarnya kepada seluruh kontributor yang mewujudkan rilis resmi ini:
* @adydetra

**Full Changelog**: https://github.com/aptrocode/altama-milestone/commits/vX.Y.Z
```
