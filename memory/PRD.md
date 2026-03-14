# Digital Guest Book - Product Requirements Document

## Original Problem Statement
Membangun aplikasi **Buku Tamu Digital** untuk sistem manajemen pengunjung kantor Kejaksaan Tinggi Kalimantan Utara.

## Technology Stack
- **Frontend**: React, Vite, TailwindCSS, Shadcn/UI, Recharts
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Architecture**: SPA dengan Backend-as-a-Service (BaaS)

## User Roles
1. **Admin** - Memerlukan autentikasi untuk mengelola data
2. **Guest** - Akses publik untuk mengisi form kunjungan

## Core Features

### Public Page (`/form`)
- Form pengunjung dengan field:
  - Nama lengkap (wajib)
  - Asal/Instansi (wajib)
  - Nomor HP (wajib)
  - Tujuan Pejabat - dropdown (wajib)
  - Keperluan (wajib)
  - Jumlah pengikut (opsional)
  - Foto pengunjung - capture kamera (opsional)
  - Foto KTP - upload file (opsional)

### Admin Pages
- `/admin/login` - Login admin
- `/admin/dashboard` - Dashboard dengan statistik, chart, tabel pengunjung
- `/admin/pejabat` - CRUD pejabat
- `/admin/jabatan` - CRUD jabatan
- `/admin/tamu/new` - Form pendaftaran tamu manual

## Database Schema
```sql
-- jabatan (department)
id_jabatan UUID PRIMARY KEY
nama_jabatan TEXT

-- pejabat (official)
id_pejabat UUID PRIMARY KEY
id_jabatan UUID REFERENCES jabatan
nama TEXT
no_hp TEXT
status TEXT (di_tempat/rapat/dinas_luar)

-- tamu (guest)
id_tamu UUID PRIMARY KEY
tanggal TIMESTAMP
nama TEXT
asal TEXT
no_hp TEXT
keperluan TEXT
tujuan_pejabat UUID REFERENCES pejabat
foto_url TEXT
foto_ktp_url TEXT
jumlah_pengikut INTEGER
```

## Credentials
- **Admin Email**: admin@guestbook.local
- **Admin Password**: admin123
- **Supabase URL**: https://vlwjxhthbjueegbsdieu.supabase.co

---

## Implementation Status

### Completed (March 2025)
- [x] Digital Guest Book MVP
- [x] GitHub Integration
- [x] Admin Manual Visitor Registration (`/admin/tamu/new`)
- [x] Branding (Logo Kejaksaan Tinggi Kalimantan Utara, tema emerald)
- [x] Dashboard UX Improvements (responsive nav, statistik, chart)
- [x] Photo Upload Optimization (resize, WebP conversion)
- [x] Error Handling untuk upload foto
- [x] Project Migration Preparation
- [x] Edit & Delete Guest Data di Admin Dashboard
- [x] **Field Foto KTP (Opsional) di Form Pengunjung**
- [x] **Kolom Foto KTP di Tabel Admin Dashboard**

### Backlog (P1)
- [ ] Storage bucket terpisah untuk foto KTP dengan policy keamanan
- [ ] Display foto KTP di modal edit tamu

### Future Tasks (P2)
- [ ] PWA Configuration
- [ ] Analytics dashboard untuk tren pengunjung
- [ ] QR code generator untuk akses form

## Key Files
- `/app/frontend/src/pages/VisitorForm.js` - Form pengunjung publik
- `/app/frontend/src/pages/AdminDashboard.js` - Dashboard admin
- `/app/frontend/src/lib/supabase.js` - Konfigurasi Supabase
- `/app/database_schema.sql` - SQL schema lengkap
