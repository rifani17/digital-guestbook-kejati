# Arsitektur Sistem

## Gambaran Umum

Digital Guest Book adalah SPA (Single Page Application) berbasis React dengan Supabase sebagai Backend-as-a-Service. Tidak ada backend server terpisah — semua logika data, autentikasi, dan storage ditangani langsung oleh Supabase dari sisi klien.

```
Browser (React SPA)
       │
       ├── Supabase Auth      → Login admin
       ├── Supabase Database  → PostgreSQL (jabatan, pejabat, tamu)
       ├── Supabase Storage   → Foto pengunjung & KTP
       └── Supabase Realtime  → Live update dashboard
```

---

## Struktur Direktori

```
digital-guestbook-kejati/
├── frontend/                    # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # Shadcn UI components
│   │   │   ├── CameraCapture.js
│   │   │   └── ProtectedRoute.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js   # Global auth state
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   └── supabase.js      # Supabase client
│   │   ├── pages/
│   │   │   ├── VisitorForm.js
│   │   │   ├── AdminLogin.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminPejabat.js
│   │   │   └── AdminJabatan.js
│   │   └── App.js               # Routing
│   ├── .env                     # Credentials (tidak di-commit)
│   └── package.json
├── database/
│   ├── database_schema.sql      # Schema utama
│   └── storage_policies.sql     # Storage bucket policies
├── docs/                        # Dokumentasi
├── memory/
│   └── PRD.md                   # Product requirements
└── design_guidelines.json       # Design system spec
```

---

## Routing

| Path | Akses | Komponen |
|---|---|---|
| `/` | Public | Redirect → `/form` |
| `/form` | Public | `VisitorForm` |
| `/admin/login` | Public | `AdminLogin` |
| `/admin/dashboard` | Protected | `AdminDashboard` |
| `/admin/pejabat` | Protected | `AdminPejabat` |
| `/admin/jabatan` | Protected | `AdminJabatan` |

Route protected menggunakan `ProtectedRoute` wrapper yang mengecek auth state dari `AuthContext`. Jika tidak terautentikasi, redirect ke `/admin/login`.

---

## Database Schema

Tiga tabel utama dengan relasi hierarkis:

```
jabatan (1) ──── (N) pejabat (1) ──── (N) tamu
```

### jabatan
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id_jabatan` | UUID PK | Auto-generated |
| `nama_jabatan` | TEXT | Nama posisi/jabatan |
| `created_at` | TIMESTAMPTZ | Auto |

### pejabat
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id_pejabat` | UUID PK | Auto-generated |
| `id_jabatan` | UUID FK | Referensi ke jabatan |
| `nama` | TEXT | Nama pejabat |
| `no_hp` | TEXT | Untuk WhatsApp |
| `status` | TEXT | `di_tempat` / `rapat` / `dinas_luar` |
| `created_at` | TIMESTAMPTZ | Auto |

### tamu
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id_tamu` | UUID PK | Auto-generated |
| `tanggal` | TIMESTAMPTZ | Waktu kunjungan |
| `nama` | TEXT | Nama pengunjung |
| `asal` | TEXT | Instansi/asal |
| `no_hp` | TEXT | Nomor HP |
| `keperluan` | TEXT | Tujuan kunjungan |
| `tujuan_pejabat` | UUID FK | Referensi ke pejabat |
| `foto_url` | TEXT | URL foto pengunjung (nullable) |
| `foto_ktp_url` | TEXT | URL foto KTP (nullable) |
| `jumlah_pengikut` | INTEGER | Jumlah rombongan (nullable) |
| `created_at` | TIMESTAMPTZ | Auto |

### Row Level Security (RLS)

| Tabel | Public | Authenticated |
|---|---|---|
| `jabatan` | SELECT | SELECT, INSERT, UPDATE, DELETE |
| `pejabat` | SELECT | SELECT, INSERT, UPDATE, DELETE |
| `tamu` | INSERT | SELECT, INSERT, UPDATE, DELETE |

---

## Autentikasi

Menggunakan Supabase Auth (email/password). Flow:

1. `AuthContext` mount → `supabase.auth.getSession()` untuk restore session
2. `onAuthStateChange` listener untuk update state saat login/logout
3. `ProtectedRoute` cek `user` dari context, redirect jika null
4. Admin login via `supabase.auth.signInWithPassword()`

---

## Storage

Dua bucket Supabase Storage:

| Bucket | Akses | Isi |
|---|---|---|
| `guest-photos` | Public | Foto wajah pengunjung |
| `ktp-photos` | Public | Foto KTP pengunjung |

### Alur Upload Foto

```
Input (base64) → Resize max 720px → Convert WebP 85% → Upload Supabase → Simpan public URL
```

Proses resize dan konversi dilakukan client-side menggunakan Canvas API sebelum upload, menghasilkan penghematan ukuran file ~80%.

---

## Realtime

Dashboard admin menggunakan Supabase Realtime subscription:

```javascript
supabase.channel('tamu_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'tamu' }, fetchData)
  .subscribe()
```

Setiap perubahan pada tabel `tamu` (insert/update/delete) akan trigger refresh data dashboard secara otomatis.

---

## Tech Stack

| Kategori | Library | Versi |
|---|---|---|
| Framework | React | 19 |
| Routing | React Router DOM | 7 |
| Styling | TailwindCSS | 3.4 |
| UI Components | Shadcn UI (Radix) | Latest |
| Backend | Supabase JS | 2.99 |
| Charts | Recharts | 3 |
| Icons | Lucide React | Latest |
| Notifications | Sonner | Latest |
| Camera | React Webcam | 7 |
| Date | date-fns + date-fns-tz | 4 |
| Build | CRA + Craco | - |
