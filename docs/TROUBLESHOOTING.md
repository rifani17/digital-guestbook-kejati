# Troubleshooting

## Form Pengunjung

### Dropdown pejabat kosong
Belum ada data pejabat di database.
→ Login admin → Kelola Jabatan → tambah jabatan → Kelola Pejabat → tambah pejabat.

### Error saat submit: "Tabel belum dibuat" (kode `42P01`)
Schema database belum dijalankan.
→ Jalankan `database/database_schema.sql` di Supabase SQL Editor.

### Error saat submit: "violates row-level security"
RLS policy untuk public insert belum ada atau salah.
→ Pastikan policy berikut ada di tabel `tamu`:
```sql
CREATE POLICY "Allow public insert" ON public.tamu
  FOR INSERT WITH CHECK (true);
```

### Foto gagal diupload
Bucket storage belum dibuat atau tidak public.
→ Buat bucket `guest-photos` di Supabase Storage, set Public: ON.
→ Data tetap tersimpan tanpa foto (foto bersifat opsional).

---

## Admin

### Login gagal
- Pastikan user sudah dibuat di Supabase Authentication
- Pastikan "Auto Confirm User" diaktifkan saat membuat user
- Cek email dan password

### Dashboard tidak menampilkan data
- Cek koneksi Supabase di browser console (F12)
- Pastikan RLS policy untuk SELECT sudah ada untuk role `authenticated`
- Hard refresh: `Ctrl + Shift + R`

### Statistik tidak akurat
Statistik dihitung berdasarkan timezone lokal browser. Pastikan data `tanggal` di database tersimpan dalam UTC (default Supabase).

---

## Kamera

### Kamera tidak muncul / tidak bisa diakses
- Camera API membutuhkan HTTPS. Pastikan aplikasi diakses via `https://`
- Izinkan akses kamera di browser saat diminta
- Coba browser Chrome atau Edge (dukungan terbaik)

---

## Storage

### Foto tidak tampil di dashboard
- Pastikan bucket bersifat Public
- Cek URL foto di kolom `foto_url` tabel `tamu` — harus berupa URL publik Supabase Storage

### Upload KTP gagal
- Pastikan bucket `ktp-photos` sudah dibuat dan Public: ON

---

## Development

### `npm start` error: module not found
```bash
cd frontend
rm -rf node_modules
yarn install
```

### Environment variables tidak terbaca
- Pastikan file `.env` ada di direktori `frontend/`
- Semua variabel harus diawali `REACT_APP_`
- Restart dev server setelah mengubah `.env`

### Build gagal di Vercel
- Pastikan Root Directory di Vercel diset ke `frontend`
- Pastikan environment variables sudah diset di Vercel dashboard
- Cek build log untuk error spesifik

---

## Debug

Buka browser console (F12) untuk melihat log detail. Semua operasi kritis (upload foto, insert data) sudah dilengkapi `console.log` dan `console.error`.

Untuk mengecek koneksi Supabase secara manual di console:
```javascript
const { data, error } = await supabase.from('tamu').select('*').limit(1)
console.log({ data, error })
```
