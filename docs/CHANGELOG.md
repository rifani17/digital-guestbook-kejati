# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.4.0] - Maret 2025

### Added
- Field foto KTP (opsional) di form pengunjung
- Bucket storage `ktp-photos` untuk foto KTP
- Kolom foto KTP di tabel admin dashboard
- Modal preview detail tamu dengan foto lengkap
- Tombol WhatsApp di modal preview tamu
- Kamera via modal (tidak langsung akses saat halaman load)
- Timezone otomatis sesuai lokasi user menggunakan `date-fns-tz`
- Edit & delete data tamu di admin dashboard

### Changed
- Optimasi upload foto: resize max 720px, konversi ke WebP 85% quality
- Error handling upload foto lebih graceful — data tetap tersimpan meski foto gagal

### Fixed
- HTTP 400 error saat upload foto (hapus pengecekan bucket dengan anon key)

---

## [1.2.0] - Maret 2025

### Added
- Navigasi mobile dengan hamburger menu di admin dashboard
- Grafik statistik kunjungan (Recharts) dengan filter hari ini / 7 hari / bulan ini
- Statistik "Pejabat di Tempat" menggantikan total pejabat

### Changed
- Layout dashboard: statistik → grafik → tabel pejabat + tabel tamu

---

## [1.1.0] - Maret 2025

### Added
- Route `/admin/tamu/new` untuk registrasi tamu manual oleh admin
- Tombol "Tambah Tamu" di header dashboard

---

## [1.0.0] - Maret 2025

### Added
- Form pengunjung publik (`/form`) dengan capture kamera
- Sistem autentikasi admin via Supabase Auth
- Dashboard admin dengan statistik real-time
- Kelola Pejabat: CRUD + manajemen status
- Kelola Jabatan: CRUD
- Integrasi WhatsApp untuk notifikasi ke pejabat
- Realtime update dashboard via Supabase subscription
- Branding Kejaksaan Tinggi Kalimantan Utara (logo + tema emerald)
- Full Indonesian language support
- Responsive design (mobile, tablet, desktop)
