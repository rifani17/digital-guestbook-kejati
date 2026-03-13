# 📋 Quick Reference - Digital Guest Book

## 🔗 URLs Aplikasi

### Development (Saat Ini)
- **Visitor Form**: https://visitor-hub-15.preview.emergentagent.com/form
- **Admin Login**: https://visitor-hub-15.preview.emergentagent.com/admin/login
- **Dashboard**: https://visitor-hub-15.preview.emergentagent.com/admin/dashboard
- **Kelola Pejabat**: https://visitor-hub-15.preview.emergentagent.com/admin/pejabat
- **Kelola Jabatan**: https://visitor-hub-15.preview.emergentagent.com/admin/jabatan

## 🔑 Admin Credentials

```
Email: admin@guestbook.local
Password: admin123
```

## 🗄️ Supabase Connection

```
Project URL: https://vlwjxhthbjueegbsdieu.supabase.co
Anon Key: sb_publishable_8oXiO9osbQqUbHY15DWgeQ_L9k5hs_I
Storage Bucket: guest-photos (must be PUBLIC)
```

## 📊 Database Tables

### 1. jabatan
- `id_jabatan` (UUID, PK)
- `nama_jabatan` (TEXT)
- `created_at` (TIMESTAMP)

### 2. pejabat
- `id_pejabat` (UUID, PK)
- `id_jabatan` (UUID, FK)
- `nama` (TEXT)
- `no_hp` (TEXT)
- `status` (TEXT: di_tempat, rapat, dinas_luar)
- `created_at` (TIMESTAMP)

### 3. tamu
- `id_tamu` (UUID, PK)
- `tanggal` (TIMESTAMP)
- `nama` (TEXT)
- `asal` (TEXT)
- `no_hp` (TEXT)
- `keperluan` (TEXT)
- `tujuan_pejabat` (UUID, FK)
- `foto_url` (TEXT)
- `jumlah_pengikut` (INTEGER, nullable)
- `created_at` (TIMESTAMP)

## 🎯 Workflow Normal

### Untuk Admin (First Time Setup)
1. ✅ Run SQL schema di Supabase
2. ✅ Buat storage bucket `guest-photos`
3. ✅ Buat admin user di Supabase Auth
4. ✅ Login ke admin dashboard
5. ✅ Tambah data Jabatan
6. ✅ Tambah data Pejabat (dengan nomor HP)
7. ✅ Test visitor form

### Untuk Pengunjung
1. Buka form: `/form`
2. Isi data pribadi
3. Pilih pejabat yang dituju
4. Ambil foto
5. Submit
6. Tunggu konfirmasi

### Untuk Admin (Daily Use)
1. Login ke dashboard
2. Monitor pengunjung real-time
3. Klik "Kirim WhatsApp" untuk notifikasi pejabat
4. Update status pejabat jika diperlukan
5. Kelola data master (pejabat/jabatan)

## 🔧 Common Commands

### Check Frontend Logs
```bash
tail -f /var/log/supervisor/frontend.out.log
```

### Restart Frontend
```bash
sudo supervisorctl restart frontend
```

### Check Service Status
```bash
sudo supervisorctl status
```

## 📱 Testing Checklist

- [ ] Visitor form dapat diakses tanpa login
- [ ] Kamera berfungsi dan bisa capture foto
- [ ] Upload foto ke storage berhasil
- [ ] Data tersimpan di database
- [ ] Admin bisa login
- [ ] Dashboard menampilkan statistik
- [ ] CRUD Jabatan berfungsi
- [ ] CRUD Pejabat berfungsi
- [ ] Ubah status pejabat berfungsi
- [ ] WhatsApp button berfungsi (generate link)
- [ ] Real-time update (data muncul otomatis)

## 🚨 Troubleshooting Quick Fix

### Form tidak bisa submit
```
→ Check browser console
→ Pastikan tabel sudah dibuat
→ Pastikan storage bucket sudah dibuat
→ Pastikan ada data pejabat
```

### Admin tidak bisa login
```
→ Pastikan user sudah dibuat di Supabase Auth
→ Check email/password benar
→ Pastikan Auto Confirm User = ON
```

### Foto tidak terupload
```
→ Pastikan bucket guest-photos ada
→ Pastikan bucket = PUBLIC
→ Check quota storage di Supabase
```

### Data tidak muncul di dashboard
```
→ Check Supabase connection di console
→ Pastikan RLS policies sudah benar
→ Hard refresh browser (Ctrl + Shift + R)
```

## 📞 File Locations

```
Frontend Source: /app/frontend/src/
Database Schema: /app/database_schema.sql
README: /app/README.md
Setup Guide: /app/SETUP_GUIDE.md
Environment: /app/frontend/.env
```

## 🎨 Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Background: Slate-50 (#F8FAFC)
- Text: Slate-900 (#0F172A)
- Success: Green (#10B981)
- Error: Red (#EF4444)

**Font:** Inter (Google Fonts)

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

---

**Last Updated**: $(date)
**Version**: 1.0.0
