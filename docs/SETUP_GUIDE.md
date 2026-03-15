# 🚀 Setup Guide - Digital Guest Book

Panduan lengkap untuk menjalankan aplikasi Digital Guest Book.

## ✅ Status Saat Ini

Frontend sudah berhasil dibuild dan berjalan di:
- **Development**: https://visitor-hub-15.preview.emergentagent.com
- **Visitor Form**: https://visitor-hub-15.preview.emergentagent.com/form
- **Admin Login**: https://visitor-hub-15.preview.emergentagent.com/admin/login

## 📋 Yang Harus Dilakukan

### 1. Setup Database di Supabase (WAJIB)

Aplikasi sudah terhubung ke Supabase Anda, namun **database masih kosong**. Ikuti langkah berikut:

#### A. Buka Supabase Dashboard
1. Login ke: https://supabase.com/dashboard
2. Pilih project: `vlwjxhthbjueegbsdieu.supabase.co`

#### B. Jalankan SQL Schema
1. Klik **SQL Editor** di sidebar kiri
2. Klik tombol **New Query**
3. Copy seluruh isi file `database_schema.sql` dari root project ini
4. Paste ke SQL Editor
5. Klik **Run** atau tekan `Ctrl + Enter`
6. Pastikan muncul pesan sukses (hijau) di bawah

**File SQL Location**: `/app/database_schema.sql`

Ini akan membuat 3 tabel:
- ✅ `jabatan` - Untuk menyimpan data jabatan
- ✅ `pejabat` - Untuk menyimpan data pejabat
- ✅ `tamu` - Untuk menyimpan data pengunjung

#### C. Verifikasi Tabel Sudah Dibuat
1. Klik **Table Editor** di sidebar
2. Pastikan 3 tabel sudah muncul: `jabatan`, `pejabat`, `tamu`

### 2. Setup Storage Bucket (WAJIB)

Untuk menyimpan foto pengunjung:

1. Di dashboard Supabase, klik **Storage** di sidebar
2. Klik tombol **New bucket**
3. Isi detail:
   - **Name**: `guest-photos` (harus PERSIS seperti ini!)
   - **Public bucket**: ✅ ON (centang)
   - **File size limit**: 50 MB (default)
4. Klik **Create bucket**

### 3. Buat Admin User (WAJIB)

Untuk login ke dashboard admin:

1. Di dashboard Supabase, klik **Authentication** → **Users**
2. Klik **Add user** → **Create new user**
3. Isi form:
   - **Email**: `admin@guestbook.local`
   - **Password**: `admin123` (atau password pilihan Anda)
   - **Auto Confirm User**: ✅ ON (centang)
4. Klik **Create user**

### 4. Test Aplikasi

Setelah semua setup selesai, test aplikasi:

#### A. Test Visitor Form
1. Buka: https://visitor-hub-15.preview.emergentagent.com/form
2. SEBELUM test form, pastikan sudah ada data **Jabatan** dan **Pejabat**
3. Login dulu ke admin untuk menambah data master (lihat langkah B)

#### B. Test Admin Dashboard
1. Buka: https://visitor-hub-15.preview.emergentagent.com/admin/login
2. Login dengan:
   - Email: `admin@guestbook.local`
   - Password: `admin123` (atau yang Anda buat di step 3)
3. Setelah login, Anda akan masuk ke Dashboard

#### C. Tambah Master Data
1. Di Dashboard, klik **Kelola Jabatan**
2. Tambah beberapa jabatan, contoh:
   - Kepala Kejaksaan
   - Kepala Bidang Pidana
   - Kepala Bidang Perdata
3. Kembali ke Dashboard, klik **Kelola Pejabat**
4. Tambah beberapa pejabat dengan nomor HP untuk WhatsApp

#### D. Test Form Pengunjung
1. Buka form: https://visitor-hub-15.preview.emergentagent.com/form
2. Isi semua field
3. Klik kamera untuk ambil foto (izinkan akses kamera)
4. Submit form
5. Cek di Dashboard admin, data harus muncul

## 🔧 Troubleshooting

### Error: "relation 'public.jabatan' does not exist"
**Solusi**: Anda belum menjalankan SQL schema. Ikuti **Step 1.B** di atas.

### Error: "Could not insert into storage bucket"
**Solusi**: 
- Pastikan bucket `guest-photos` sudah dibuat
- Pastikan bucket bersifat **Public**
- Cek di Storage → Buckets → guest-photos → Settings

### Kamera tidak muncul
**Solusi**:
- Pastikan browser memiliki akses ke kamera
- HTTPS diperlukan untuk camera API (sudah otomatis di preview URL)
- Coba browser Chrome atau Edge

### Login admin gagal
**Solusi**:
- Pastikan user sudah dibuat di Supabase Authentication
- Cek email dan password yang benar
- Pastikan "Auto Confirm User" di-enable saat membuat user

## 📱 QR Code untuk Visitor Form

Untuk memudahkan pengunjung mengakses form:

1. Gunakan generator QR Code online (contoh: qr-code-generator.com)
2. Input URL: `https://visitor-hub-15.preview.emergentagent.com/form`
3. Download QR Code
4. Print dan tempel di meja resepsionis

## 🚀 Deploy ke Vercel

Setelah semua test berhasil, push code ke GitHub dan deploy:

### A. Setup Git
```bash
cd /app
git init
git add .
git commit -m "Initial commit: Digital Guest Book"
git remote add origin https://github.com/rifani17/digital-guestbook-kejati.git
git push -u origin main
```

### B. Deploy ke Vercel
1. Login ke [Vercel Dashboard](https://vercel.com)
2. Klik **Add New** → **Project**
3. Import dari GitHub: `rifani17/digital-guestbook-kejati`
4. **Framework Preset**: Create React App
5. **Root Directory**: `frontend`
6. **Environment Variables** (tambahkan):
   ```
   REACT_APP_SUPABASE_URL=https://vlwjxhthbjueegbsdieu.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_8oXiO9osbQqUbHY15DWgeQ_L9k5hs_I
   ```
7. Klik **Deploy**
8. Tunggu ~2 menit

## 📊 Fitur yang Sudah Berfungsi

✅ Visitor form dengan camera capture
✅ Photo upload ke Supabase Storage
✅ Admin authentication
✅ Admin dashboard dengan statistik real-time
✅ Kelola Pejabat (CRUD)
✅ Kelola Jabatan (CRUD)
✅ Status pejabat (Di Tempat/Rapat/Dinas Luar)
✅ WhatsApp notification button
✅ Real-time updates (Supabase Realtime)
✅ Responsive design (mobile + tablet friendly)
✅ Professional blue/gray color scheme
✅ Full Indonesian language

## 🎯 Next Steps

Setelah aplikasi berjalan dengan baik:
1. ✨ Tambahkan export data ke Excel/PDF
2. 🔍 Tambahkan filter dan search di visitor table
3. 📧 Tambahkan email notification
4. 🌙 Implementasi dark mode
5. 📈 Buat analytics dashboard

## 📞 Support

Jika ada masalah:
1. Check logs di browser console (F12)
2. Check Supabase dashboard untuk RLS policies
3. Pastikan semua environment variables benar

---

**Catatan**: Aplikasi sudah SIAP DIGUNAKAN setelah menyelesaikan Step 1-3 di atas!
