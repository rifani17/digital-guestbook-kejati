# Digital Guest Book - Visitor Management System

Sistem manajemen pengunjung berbasis web yang profesional dan modern untuk kantor.

## 🚀 Fitur Utama

### Untuk Pengunjung (Public)
- ✅ Formulir registrasi pengunjung yang responsif
- 📷 Pengambilan foto langsung dari kamera
- 📱 Optimized untuk tablet di meja resepsionis
- ✨ Interface yang bersih dan mudah digunakan

### Untuk Admin
- 📊 Dashboard dengan statistik real-time
- 📅 Laporan pengunjung harian dan bulanan
- 👥 Manajemen data pejabat dan jabatan
- 🟢 Monitor status ketersediaan pejabat (Di Tempat/Rapat/Dinas Luar)
- 📱 Notifikasi WhatsApp otomatis ke pejabat
- 🔄 Real-time updates menggunakan Supabase Realtime

## 🛠️ Tech Stack

- **Frontend**: React 19 + React Router
- **Styling**: TailwindCSS + Shadcn UI
- **Backend**: Supabase (PostgreSQL + Authentication + Storage)
- **Deployment**: Vercel (atau platform lain)

## 📋 Prasyarat

1. Node.js (v16 atau lebih tinggi)
2. Yarn package manager
3. Akun Supabase (gratis)
4. Git

## 📦 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/rifani17/digital-guestbook-kejati.git
cd digital-guestbook-kejati
```

### 2. Install Dependencies

```bash
cd frontend
yarn install
```

### 3. Setup Supabase

#### A. Buat Project Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik "New Project"
3. Isi detail project:
   - Name: "digital-guestbook" (atau nama pilihan Anda)
   - Database Password: (buat password yang kuat)
   - Region: Pilih region terdekat
4. Tunggu hingga project selesai dibuat (~2 menit)

#### B. Dapatkan Credentials

1. Di dashboard project, buka **Settings → API**
2. Copy:
   - `Project URL`
   - `anon` `public` key (BUKAN service_role key)

#### C. Setup Database

1. Di dashboard, buka **SQL Editor**
2. Klik "New Query"
3. Copy isi file `database_schema.sql` dari root project
4. Paste ke SQL Editor
5. Klik "Run" untuk execute

#### D. Setup Storage Bucket

1. Di dashboard, buka **Storage**
2. Klik "Create bucket"
3. Nama bucket: `guest-photos`
4. Pilih "Public bucket"
5. Klik "Create bucket"

#### E. Buat Admin User

1. Di dashboard, buka **Authentication → Users**
2. Klik "Add user" → "Create new user"
3. Isi:
   - Email: `admin@guestbook.local`
   - Password: `admin123` (atau password pilihan Anda)
   - Auto Confirm User: ON
4. Klik "Create user"

### 4. Konfigurasi Environment Variables

Buat/update file `.env` di folder `frontend`:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

Ganti `your-project` dan `your-anon-key-here` dengan credentials dari Supabase Anda.

### 5. Jalankan Development Server

```bash
cd frontend
yarn start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 📝 Struktur Database

### Table: `jabatan`
| Column | Type | Description |
|--------|------|-------------|
| id_jabatan | UUID | Primary key |
| nama_jabatan | TEXT | Nama jabatan |
| created_at | TIMESTAMP | Waktu dibuat |

### Table: `pejabat`
| Column | Type | Description |
|--------|------|-------------|
| id_pejabat | UUID | Primary key |
| id_jabatan | UUID | Foreign key ke jabatan |
| nama | TEXT | Nama pejabat |
| no_hp | TEXT | Nomor HP (untuk WhatsApp) |
| status | TEXT | di_tempat, rapat, dinas_luar |
| created_at | TIMESTAMP | Waktu dibuat |

### Table: `tamu`
| Column | Type | Description |
|--------|------|-------------|
| id_tamu | UUID | Primary key |
| tanggal | TIMESTAMP | Waktu kunjungan |
| nama | TEXT | Nama pengunjung |
| asal | TEXT | Asal instansi |
| no_hp | TEXT | Nomor HP pengunjung |
| keperluan | TEXT | Keperluan kunjungan |
| tujuan_pejabat | UUID | Foreign key ke pejabat |
| foto_url | TEXT | URL foto di storage |
| jumlah_pengikut | INTEGER | Jumlah pengikut (optional) |
| created_at | TIMESTAMP | Waktu dibuat |

## 📋 Panduan Penggunaan

### Untuk Pengunjung

1. Buka `/form` (halaman default)
2. Isi formulir:
   - Nama lengkap
   - Asal/Instansi
   - Nomor HP
   - Pilih pejabat yang dituju
   - Keperluan kunjungan
   - Jumlah pengikut (opsional)
3. Ambil foto menggunakan kamera
4. Klik "Kirim Data"
5. Tunggu konfirmasi berhasil

### Untuk Admin

1. Login di `/admin/login`
   - Email: `admin@guestbook.local`
   - Password: `admin123`

2. **Dashboard** (`/admin/dashboard`)
   - Lihat statistik pengunjung
   - Monitor status pejabat
   - Lihat daftar pengunjung real-time
   - Kirim notifikasi WhatsApp ke pejabat

3. **Kelola Pejabat** (`/admin/pejabat`)
   - Tambah pejabat baru
   - Edit data pejabat
   - Ubah status ketersediaan
   - Hapus pejabat

4. **Kelola Jabatan** (`/admin/jabatan`)
   - Tambah jabatan baru
   - Edit nama jabatan
   - Hapus jabatan

## 🚀 Deployment ke Vercel

### Setup Git

```bash
git add .
git commit -m "Initial commit: Digital Guest Book"
git push origin main
```

### Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "Add New" → "Project"
3. Import repository GitHub Anda
4. Konfigurasi:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Environment Variables**: Tambahkan:
     - `REACT_APP_SUPABASE_URL`
     - `REACT_APP_SUPABASE_ANON_KEY`
5. Klik "Deploy"
6. Tunggu hingga deployment selesai

## 🔐 Security Notes

- ✅ Row Level Security (RLS) sudah diaktifkan
- ✅ Hanya anon key yang digunakan di frontend
- ✅ Admin authentication melalui Supabase Auth
- ✅ Storage bucket `guest-photos` sudah public (untuk akses foto)
- ⚠️ **JANGAN** commit file `.env` ke Git
- ⚠️ **JANGAN** gunakan service_role key di frontend

## 🐛 Troubleshooting

### Kamera tidak berfungsi
- Pastikan browser memiliki akses ke kamera
- Gunakan HTTPS (required untuk camera API)
- Coba browser lain (Chrome/Edge recommended)

### Upload foto gagal
- Cek apakah bucket `guest-photos` sudah dibuat
- Pastikan bucket bersifat public
- Cek storage quota di Supabase

### Data tidak muncul di dashboard
- Cek koneksi Supabase (buka browser console)
- Pastikan credentials di `.env` benar
- Cek RLS policies di Supabase

### WhatsApp button tidak berfungsi
- Pastikan format nomor HP benar (08xxx atau 62xxx)
- Cek apakah nomor HP pejabat sudah diisi

## 📝 TODO / Future Enhancements

- [ ] Export data pengunjung ke Excel/PDF
- [ ] Filter dan pencarian pengunjung
- [ ] QR Code untuk akses cepat form
- [ ] Email notification ke pejabat
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Analytics dashboard

## 👥 Support

Jika mengalami masalah atau butuh bantuan:
1. Cek dokumentasi Supabase: https://supabase.com/docs
2. Cek React Router docs: https://reactrouter.com

## 📝 License

MIT License - bebas digunakan untuk keperluan komersial dan non-komersial.

---

**Dibuat dengan ❤️ untuk sistem manajemen pengunjung yang lebih baik**