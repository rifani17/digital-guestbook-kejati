# Setup & Instalasi

## Prasyarat

- Node.js 18+
- Yarn atau npm
- Akun Supabase (free tier cukup)

---

## 1. Clone & Install

```bash
git clone https://github.com/rifani17/digital-guestbook-kejati.git
cd digital-guestbook-kejati/frontend
yarn install
```

---

## 2. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
```

Dapatkan credentials dari: Supabase Dashboard → Settings → API.

---

## 3. Setup Database

Buka Supabase Dashboard → SQL Editor → New Query, lalu jalankan isi file `database/database_schema.sql`.

Verifikasi: Table Editor harus menampilkan tabel `jabatan`, `pejabat`, dan `tamu`.

---

## 4. Setup Storage

1. Supabase Dashboard → Storage → New bucket
2. Buat dua bucket:
   - `guest-photos` → Public: ON
   - `ktp-photos` → Public: ON
3. (Opsional) Jalankan `database/storage_policies.sql` untuk policies eksplisit

---

## 5. Buat Admin User

Supabase Dashboard → Authentication → Users → Add user:

- Email: `admin@guestbook.local` (atau sesuai kebutuhan)
- Password: pilih password yang kuat
- Auto Confirm User: ON

---

## 6. Tambah Data Awal

Login ke `/admin/login`, lalu:

1. Buka **Kelola Jabatan** → tambah minimal 1 jabatan
2. Buka **Kelola Pejabat** → tambah minimal 1 pejabat (isi nomor HP untuk WhatsApp)

---

## 7. Jalankan Development Server

```bash
cd frontend
yarn start
```

Aplikasi berjalan di `http://localhost:3000`.

---

## Checklist Setup

- [ ] Dependencies terinstall (`yarn install`)
- [ ] File `.env` sudah diisi dengan credentials Supabase
- [ ] `database_schema.sql` sudah dijalankan di Supabase
- [ ] Bucket `guest-photos` sudah dibuat (Public)
- [ ] Bucket `ktp-photos` sudah dibuat (Public)
- [ ] Admin user sudah dibuat di Supabase Auth
- [ ] Minimal 1 jabatan dan 1 pejabat sudah ditambahkan
- [ ] Form pengunjung bisa disubmit tanpa error
- [ ] Admin bisa login ke dashboard
