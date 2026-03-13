# Troubleshooting Guide - Visitor Form Error

## Problem: "Terjadi kesalahan saat menyimpan data"

Jika Anda menerima error ini saat submit form visitor, ikuti langkah-langkah berikut untuk mengidentifikasi dan memperbaiki masalahnya.

## Step 1: Buka Browser Console

1. **Di Chrome/Edge**: Tekan `F12` atau `Ctrl+Shift+I`
2. **Di Firefox**: Tekan `F12`
3. **Di Safari**: Tekan `Cmd+Option+I`
4. Klik tab **Console**

## Step 2: Cek Error Message

Setelah membuka console, coba submit form lagi dan perhatikan error yang muncul. Error akan memberikan detail spesifik.

### Kemungkinan Error & Solusi:

---

### Error 1: "Tabel 'tamu' belum dibuat"

**Error Code**: `42P01`

**Penyebab**: Database schema belum dijalankan di Supabase

**Solusi**:
1. Login ke [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project Anda
3. Klik **SQL Editor** di sidebar
4. Klik **New Query**
5. Copy seluruh isi file `/app/database_schema.sql`
6. Paste ke SQL Editor
7. Klik **Run** atau tekan `Ctrl+Enter`
8. Pastikan muncul pesan sukses

**Verifikasi**:
- Klik **Table Editor** di sidebar
- Pastikan ada 3 tabel: `jabatan`, `pejabat`, `tamu`

---

### Error 2: "Gagal mengunggah foto"

**Penyebab**: Storage bucket belum dibuat atau tidak public

**Solusi**:

**A. Buat Storage Bucket**:
1. Di Supabase Dashboard, klik **Storage**
2. Klik **New bucket**
3. Nama: `guest-photos` (HARUS PERSIS ini)
4. **Public bucket**: ✅ Centang (PENTING!)
5. Klik **Create bucket**

**B. Verifikasi Bucket Public**:
1. Klik bucket `guest-photos`
2. Klik **Configuration** atau **Settings**
3. Pastikan **Public** = ON

**C. Cek Policies**:
1. Klik **Policies** tab
2. Pastikan ada policy untuk insert/upload (jika tidak ada, buat dengan SQL):

```sql
-- Allow public insert to guest-photos
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'guest-photos');

-- Allow public read from guest-photos
CREATE POLICY "Allow public read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'guest-photos');
```

---

### Error 3: "Permission denied" atau "violates row-level security"

**Penyebab**: RLS policies tidak mengizinkan insert dari public

**Solusi**:

Jalankan SQL berikut di SQL Editor:

```sql
-- Cek apakah RLS aktif
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'tamu';

-- Jika RLS aktif, pastikan policy sudah benar
-- Policy untuk allow public insert
DROP POLICY IF EXISTS "Allow public insert" ON public.tamu;

CREATE POLICY "Allow public insert" 
ON public.tamu 
FOR INSERT 
TO public
WITH CHECK (true);
```

**Verifikasi Policy**:
```sql
SELECT * FROM pg_policies WHERE tablename = 'tamu';
```

Harus ada policy untuk INSERT dengan permissive = true.

---

### Error 4: "Pejabat yang dipilih tidak valid"

**Error Code**: `23503`

**Penyebab**: Foreign key constraint - ID pejabat tidak ada di tabel pejabat

**Solusi**:
1. Pastikan ada data di tabel `pejabat`
2. Login ke admin dashboard
3. Buka **Kelola Pejabat**
4. Tambahkan minimal 1 pejabat
5. Refresh form visitor
6. Coba submit lagi

**Verifikasi di SQL**:
```sql
SELECT id_pejabat, nama FROM pejabat;
```

Jika kosong, tambah data pejabat dulu.

---

### Error 5: "Belum ada data pejabat"

**Penyebab**: Tabel pejabat kosong

**Solusi**:
1. Login ke admin: `/admin/login`
2. Email: `admin@guestbook.local`
3. Password: `admin123`
4. Klik **Kelola Jabatan**
5. Tambah jabatan (contoh: "Kepala Kejaksaan")
6. Klik **Kelola Pejabat**
7. Tambah pejabat dengan:
   - Nama
   - Jabatan (pilih dari dropdown)
   - No HP (untuk WhatsApp)
   - Status: Di Tempat
8. Kembali ke form visitor

---

### Error 6: "Failed to fetch" atau Network error

**Penyebab**: Koneksi ke Supabase gagal

**Solusi**:
1. Cek koneksi internet
2. Verifikasi Supabase credentials di `.env`:
   ```
   REACT_APP_SUPABASE_URL=https://vlwjxhthbjueegbsdieu.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=sb_publishable_8oXiO9osbQqUbHY15DWgeQ_L9k5hs_I
   ```
3. Restart frontend: `sudo supervisorctl restart frontend`
4. Cek Supabase Dashboard - pastikan project masih aktif

---

## Quick Checklist

Sebelum test visitor form, pastikan sudah:

- [ ] ✅ Database schema sudah dijalankan (3 tabel ada)
- [ ] ✅ Storage bucket `guest-photos` sudah dibuat
- [ ] ✅ Bucket `guest-photos` bersifat **PUBLIC**
- [ ] ✅ Admin user sudah dibuat di Supabase Auth
- [ ] ✅ Minimal 1 jabatan sudah ditambahkan
- [ ] ✅ Minimal 1 pejabat sudah ditambahkan
- [ ] ✅ Environment variables sudah benar
- [ ] ✅ Browser console terbuka untuk melihat log

---

## Testing Step by Step

### 1. Test Database Connection
```javascript
// Di browser console, test koneksi:
const { data, error } = await supabase.from('tamu').select('*').limit(1)
console.log('Test result:', { data, error })
```

Jika error → database belum siap
Jika success → database OK

### 2. Test Storage
```javascript
// Test storage bucket:
const { data, error } = await supabase.storage.getBucket('guest-photos')
console.log('Bucket:', { data, error })
```

Jika error → bucket belum dibuat
Jika success → bucket OK

### 3. Test Pejabat Data
```javascript
// Test pejabat:
const { data, error } = await supabase.from('pejabat').select('*')
console.log('Pejabat:', { data, error })
```

Jika empty array → belum ada pejabat
Jika ada data → pejabat OK

---

## Enhanced Error Messages

Versi terbaru form sudah memiliki error messages yang lebih spesifik:

### Error yang Ditampilkan:

1. **"Tabel 'tamu' belum dibuat"**
   → Jalankan database_schema.sql

2. **"Gagal mengunggah foto. Pastikan storage bucket 'guest-photos' sudah dibuat"**
   → Buat storage bucket

3. **"Pejabat yang dipilih tidak valid"**
   → Tambah data pejabat

4. **"Permission denied"**
   → Fix RLS policies

5. **"Database belum siap"**
   → Setup database schema

6. **"Belum ada data pejabat"**
   → Tambah pejabat via admin

---

## Debug Mode

File sudah ditambahkan console.log untuk debugging:

```javascript
// Log yang muncul saat submit:
✓ Starting photo upload...
✓ Photo uploaded successfully: [URL]
✓ Inserting visitor data...
✓ Data to insert: {...}
✓ Insert successful

// Atau jika error:
✗ Supabase error: {...}
✗ Error message: ...
✗ Error code: ...
```

---

## Common Setup Issues

### Issue: Form loads tapi dropdown pejabat kosong

**Root Cause**: Tabel pejabat kosong atau belum dibuat

**Fix**:
1. Buka `/admin/jabatan` → Tambah jabatan
2. Buka `/admin/pejabat` → Tambah pejabat
3. Refresh form visitor

### Issue: Photo tidak bisa di-upload

**Root Cause**: Storage bucket tidak public

**Fix**:
```sql
-- Di Supabase SQL Editor:
UPDATE storage.buckets 
SET public = true 
WHERE id = 'guest-photos';
```

### Issue: Insert berhasil tapi tidak muncul di dashboard

**Root Cause**: RLS policies block SELECT untuk authenticated user

**Fix**:
```sql
CREATE POLICY "Allow authenticated read" 
ON public.tamu 
FOR SELECT 
TO authenticated 
USING (true);
```

---

## Contact Support

Jika masih error setelah mengikuti semua langkah:

1. **Screenshot error** dari browser console
2. **Check network tab** di browser DevTools
3. **Export logs** dari Supabase Dashboard
4. Share informasi berikut:
   - Error message lengkap
   - Screenshot console
   - Apakah tabel sudah dibuat?
   - Apakah bucket sudah dibuat?
   - Apakah ada data pejabat?

---

## Prevention Checklist

Untuk mencegah error di future:

✅ Always check browser console saat development
✅ Test database schema setelah deployment
✅ Verify storage bucket permissions
✅ Add sample data untuk testing
✅ Test end-to-end flow sebelum go live
✅ Keep Supabase project active (free tier auto-pause setelah 1 minggu inactive)

---

**Last Updated**: March 13, 2024
**Version**: 1.3.0
**Status**: Enhanced error handling implemented
