# Buku Tamu Digital

Sistem manajemen pengunjung untuk Kejaksaan Tinggi Kalimantan Utara.

Menggantikan buku tamu manual dengan solusi digital yang efisien. Pengunjung bisa self-register via tablet di resepsionis dengan capture foto opsional, sementara admin bisa monitor dan kelola data secara real-time dari dashboard. Mengurangi waktu registrasi, meningkatkan akurasi data, dan memudahkan pelaporan statistik kunjungan.

---

## Quick Start

```bash
git clone https://github.com/rifani17/digital-guestbook-kejati.git
cd digital-guestbook-kejati/frontend
yarn install
cp .env.example .env   # isi dengan REACT_APP_SUPABASE_URL dan REACT_APP_SUPABASE_ANON_KEY
yarn start
```

Lihat [docs/SETUP.md](docs/SETUP.md) untuk panduan lengkap termasuk setup database dan storage.

---

## Routes

| Path | Akses | Keterangan |
|---|---|---|
| `/form` | Public | Form registrasi pengunjung |
| `/admin/login` | Public | Login admin |
| `/admin/dashboard` | Admin | Dashboard statistik & data tamu |
| `/admin/pejabat` | Admin | Kelola pejabat |
| `/admin/jabatan` | Admin | Kelola jabatan |

---

## Tech Stack

- **Frontend**: React 19, React Router 7, TailwindCSS, Shadcn UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Charts**: Recharts
- **Build**: Create React App + Craco

---

## Dokumentasi

| File | Isi |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Instalasi dan konfigurasi awal |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Arsitektur sistem, schema database, routing |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deploy ke Vercel / Netlify |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Palet warna, tipografi, komponen UI |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Solusi masalah umum |
| [docs/CHANGELOG.md](docs/CHANGELOG.md) | Riwayat perubahan |

---

## Database

Jalankan `database/database_schema.sql` di Supabase SQL Editor untuk membuat tabel `jabatan`, `pejabat`, dan `tamu`.

---

**Versi**: 1.4.0 | **Organisasi**: Kejaksaan Tinggi Kalimantan Utara
