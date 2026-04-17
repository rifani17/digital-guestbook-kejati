# Design Document: Admin Agenda

## Overview

Fitur Admin Agenda menambahkan kemampuan manajemen jadwal kegiatan kantor ke dalam sistem Buku Tamu Digital Kejaksaan Tinggi Kalimantan Utara. Admin dapat membuat, mengedit, dan menghapus agenda melalui halaman baru `/admin/agenda`. Daftar agenda juga ditampilkan di `AdminDashboard` sebagai widget ringkasan.

Status agenda (`akan_datang`, `berjalan`, `selesai`) dihitung sepenuhnya di sisi klien berdasarkan perbandingan tanggal lokal dengan `tanggal_mulai` dan `tanggal_akhir` — tidak ada kolom status di database.

Fitur ini mengikuti pola yang sudah ada di `AdminJabatan.js` dan `AdminPejabat.js`: satu file halaman per route, Supabase singleton, Shadcn UI components, Sonner toast, dan Tailwind-only styling.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                  │
│                                                             │
│  /admin/dashboard                                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AdminDashboard.js                                   │   │
│  │  └── AgendaWidget (inline section)                   │   │
│  │       ├── fetchAgenda() → Supabase                   │   │
│  │       ├── calculateStatus(tanggal_mulai,akhir)       │   │
│  │       └── renders table + action buttons             │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  /admin/agenda  (ProtectedRoute)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AdminAgenda.js (new page)                           │   │
│  │  ├── AgendaTable — daftar agenda + badge status      │   │
│  │  ├── AgendaFormDialog — tambah / edit                │   │
│  │  └── DeleteConfirmDialog — konfirmasi hapus          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  src/lib/agendaService.js (new)                             │
│  ├── fetchAgenda()                                          │
│  ├── createAgenda(data)                                     │
│  ├── updateAgenda(id, data)                                 │
│  └── deleteAgenda(id)                                       │
│                                                             │
│  src/lib/agendaUtils.js (new)                               │
│  └── calculateStatus(tanggal_mulai, tanggal_akhir, today)   │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  Supabase (PostgreSQL) │
              │  table: agenda         │
              │  RLS: SELECT public    │
              │       DML authenticated│
              └───────────────────────┘
```

### Keputusan Desain

1. **Halaman terpisah `/admin/agenda`** — Mengikuti pola `AdminJabatan` dan `AdminPejabat`. CRUD lengkap ada di satu halaman, bukan modal di dashboard. Dashboard hanya menampilkan widget ringkasan read-only dengan tombol aksi yang mengarah ke halaman agenda.

2. **`agendaService.js` sebagai lapisan data** — Memisahkan logika Supabase dari komponen UI agar mudah di-mock saat testing. Semua operasi database terpusat di sini.

3. **`agendaUtils.js` untuk kalkulasi status** — Fungsi murni (pure function) yang menerima tanggal dan mengembalikan status. Mudah diuji secara unit/property tanpa ketergantungan pada Supabase atau React.

4. **Status tidak disimpan di database** — Menghindari data stale dan kebutuhan background job untuk update status. Kalkulasi dilakukan saat render.

5. **Widget di Dashboard** — Menampilkan agenda yang relevan (semua atau hanya `akan_datang` + `berjalan`) dengan link ke halaman pengelolaan penuh.

---

## Components and Interfaces

### `src/lib/agendaUtils.js`

```js
/**
 * Menghitung status agenda berdasarkan tanggal lokal hari ini.
 * @param {string} tanggal_mulai - Format 'YYYY-MM-DD'
 * @param {string} tanggal_akhir - Format 'YYYY-MM-DD'
 * @param {Date} [today] - Opsional, default new Date(). Untuk testing.
 * @returns {'akan_datang' | 'berjalan' | 'selesai'}
 */
export function calculateStatus(tanggal_mulai, tanggal_akhir, today = new Date())
```

Logika:
- Bandingkan string tanggal lokal `YYYY-MM-DD` (dari `today.toLocaleDateString('sv')`) dengan `tanggal_mulai` dan `tanggal_akhir`.
- `today < tanggal_mulai` → `akan_datang`
- `today >= tanggal_mulai && today <= tanggal_akhir` → `berjalan`
- `today > tanggal_akhir` → `selesai`

### `src/lib/agendaService.js`

```js
// Menggunakan supabase singleton dari src/lib/supabase.js
import { supabase } from './supabase'

export async function fetchAgenda()
// Returns: { data: Agenda[], error }
// Query: SELECT * FROM agenda ORDER BY tanggal_mulai ASC

export async function createAgenda({ nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat })
// Validasi: tanggal_akhir >= tanggal_mulai (client-side sebelum insert)
// Returns: { data, error }

export async function updateAgenda(id_agenda, { nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat })
// Validasi: tanggal_akhir >= tanggal_mulai (client-side sebelum update)
// Returns: { data, error }

export async function deleteAgenda(id_agenda)
// Returns: { error }
```

### `src/pages/AdminAgenda.js` (halaman baru)

Komponen utama halaman `/admin/agenda`. Mengikuti struktur `AdminJabatan.js`:

- State: `agendaList`, `isDialogOpen`, `editingId`, `formData`, `isDeleteDialogOpen`, `deletingId`
- `useEffect` → `fetchAgenda()` saat mount
- `handleSubmit` → create atau update via `agendaService`
- `handleEdit(agenda)` → isi form, buka dialog
- `handleDeleteConfirm(id)` → buka dialog konfirmasi
- `handleDeleteExecute()` → eksekusi delete via `agendaService`
- Render: header dengan tombol kembali, Card dengan tabel agenda, `AgendaFormDialog`, `AlertDialog` konfirmasi hapus

### Widget Agenda di `AdminDashboard.js`

Section baru di dalam `AdminDashboard.js` yang menampilkan daftar agenda ringkas. Ditambahkan setelah section statistik yang sudah ada:

- Fetch agenda saat `fetchData()` dipanggil (paralel dengan fetch lainnya)
- Tampilkan tabel/card dengan kolom: nama, tanggal, status badge
- Tombol "Kelola Agenda" → Link ke `/admin/agenda`
- Tombol "Tambah", "Edit", "Hapus" inline di tabel

---

## Data Models

### Tabel `agenda` (Supabase PostgreSQL)

```sql
CREATE TABLE IF NOT EXISTS public.agenda (
    id_agenda    UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_agenda  TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE NOT NULL,
    waktu        TIME,
    tempat       TEXT,
    created_at   TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

**Catatan**: Tidak ada kolom `status` — dihitung client-side.

### RLS Policies

```sql
ALTER TABLE public.agenda ENABLE ROW LEVEL SECURITY;

-- SELECT: publik (untuk kemungkinan tampilan publik di masa depan)
CREATE POLICY "Allow public read access" ON public.agenda
    FOR SELECT USING (true);

-- INSERT, UPDATE, DELETE: hanya authenticated
CREATE POLICY "Allow authenticated insert" ON public.agenda
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.agenda
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.agenda
    FOR DELETE USING (auth.role() = 'authenticated');
```

### Index

```sql
CREATE INDEX IF NOT EXISTS idx_agenda_tanggal_mulai ON public.agenda(tanggal_mulai ASC);
```

### Tipe Data Frontend

```js
/**
 * @typedef {Object} Agenda
 * @property {string} id_agenda       - UUID
 * @property {string} nama_agenda     - Nama kegiatan
 * @property {string} tanggal_mulai   - Format 'YYYY-MM-DD'
 * @property {string} tanggal_akhir   - Format 'YYYY-MM-DD'
 * @property {string|null} waktu      - Format 'HH:MM' atau null
 * @property {string|null} tempat     - Lokasi atau null
 * @property {string} created_at      - ISO timestamp
 */

/**
 * @typedef {'akan_datang' | 'berjalan' | 'selesai'} AgendaStatus
 */
```

### Form State

```js
const initialFormData = {
  nama_agenda: '',
  tanggal_mulai: '',
  tanggal_akhir: '',
  waktu: '',
  tempat: ''
}
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Fitur ini memiliki logika kalkulasi status (`calculateStatus`) yang merupakan pure function dengan input space yang besar (semua kombinasi tanggal valid). Property-based testing sangat tepat untuk memverifikasi kebenaran logika ini secara menyeluruh.

**Property Reflection:**

Dari prework, kriteria 2.1, 2.2, 2.3 masing-masing menguji satu cabang dari fungsi `calculateStatus`. Ketiganya bisa digabungkan menjadi satu property exhaustiveness (2.6) yang lebih komprehensif: untuk semua input valid, output selalu tepat satu dari tiga nilai. Namun karena setiap cabang memiliki logika berbeda dan bisa gagal secara independen, ketiganya dipertahankan sebagai property terpisah untuk lokalisasi kegagalan yang lebih baik.

Kriteria 1.3 dan 4.5 keduanya menguji validasi `tanggal_akhir < tanggal_mulai` — ini adalah property yang sama, digabungkan menjadi satu.

Kriteria 3.2 dan 4.2 (form submission menyimpan data) keduanya menguji round-trip penyimpanan — digabungkan menjadi satu property.

---

### Property 1: Status `akan_datang` untuk agenda masa depan

*For any* tanggal_mulai yang berada di masa depan relatif terhadap tanggal hari ini, dan tanggal_akhir yang valid (>= tanggal_mulai), fungsi `calculateStatus` SHALL mengembalikan `akan_datang`.

**Validates: Requirements 2.1**

---

### Property 2: Status `berjalan` untuk agenda yang sedang berlangsung

*For any* pasangan tanggal_mulai dan tanggal_akhir yang mengapit tanggal hari ini (tanggal_mulai <= today <= tanggal_akhir), fungsi `calculateStatus` SHALL mengembalikan `berjalan`.

**Validates: Requirements 2.2**

---

### Property 3: Status `selesai` untuk agenda masa lalu

*For any* tanggal_akhir yang berada di masa lalu relatif terhadap tanggal hari ini, dan tanggal_mulai yang valid (<= tanggal_akhir), fungsi `calculateStatus` SHALL mengembalikan `selesai`.

**Validates: Requirements 2.3**

---

### Property 4: Exhaustiveness — status selalu salah satu dari tiga nilai valid

*For any* pasangan tanggal_mulai dan tanggal_akhir yang valid (tanggal_akhir >= tanggal_mulai), fungsi `calculateStatus` SHALL mengembalikan tepat satu dari tiga nilai: `akan_datang`, `berjalan`, atau `selesai` — tidak pernah `undefined`, `null`, atau nilai lain.

**Validates: Requirements 2.6**

---

### Property 5: Validasi tanggal — tanggal_akhir sebelum tanggal_mulai selalu ditolak

*For any* pasangan tanggal di mana tanggal_akhir lebih awal dari tanggal_mulai, operasi create maupun update agenda SHALL ditolak dengan pesan error "Tanggal akhir tidak boleh sebelum tanggal mulai", dan data tidak tersimpan ke database.

**Validates: Requirements 1.3, 4.5**

---

### Property 6: Round-trip penyimpanan agenda

*For any* data agenda yang valid (nama_agenda non-kosong, tanggal_akhir >= tanggal_mulai), setelah operasi create atau update berhasil, membaca kembali data dari Supabase SHALL menghasilkan objek dengan nilai field yang identik dengan yang dikirimkan.

**Validates: Requirements 1.1, 3.2, 4.2**

---

### Property 7: Edit form pre-fill

*For any* agenda yang ada di daftar, ketika tombol edit diklik, semua field form (nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat) SHALL terisi dengan nilai yang identik dengan data agenda tersebut.

**Validates: Requirements 4.1**

---

### Property 8: Delete menghapus dari daftar

*For any* agenda yang ada di daftar, setelah operasi delete dikonfirmasi dan berhasil, agenda tersebut SHALL tidak lagi muncul dalam daftar yang ditampilkan.

**Validates: Requirements 5.2**

---

### Property 9: Badge status sesuai nilai status

*For any* agenda dengan status yang dihitung, badge yang ditampilkan SHALL menggunakan kelas warna yang sesuai: kuning untuk `akan_datang`, hijau untuk `berjalan`, abu-abu untuk `selesai`.

**Validates: Requirements 6.2**

---

## Error Handling

| Skenario | Penanganan |
|---|---|
| `fetchAgenda` gagal | `toast.error('Gagal memuat data agenda')`, list tetap kosong |
| `createAgenda` gagal | `toast.error('Gagal menambahkan agenda')`, dialog tetap terbuka |
| `updateAgenda` gagal | `toast.error('Gagal mengupdate agenda')`, dialog tetap terbuka |
| `deleteAgenda` gagal | `toast.error('Gagal menghapus agenda')` |
| `tanggal_akhir < tanggal_mulai` | Pesan validasi inline di form, tombol submit disabled, tidak ada request ke Supabase |
| `nama_agenda` kosong | Tombol submit disabled (HTML `required` + disabled state) |
| Supabase RLS rejection (unauthenticated) | Error dikembalikan dari service, ditangani sama seperti error umum |

**Prinsip:**
- Error dari Supabase selalu di-log ke `console.error` untuk debugging.
- Toast error ditampilkan untuk semua kegagalan operasi yang terlihat oleh user.
- Dialog form tidak ditutup saat operasi gagal — user bisa mencoba lagi atau membatalkan.
- Dialog konfirmasi hapus ditutup setelah operasi selesai (berhasil maupun gagal).

---

## Testing Strategy

### Unit Tests (Jest + React Testing Library)

Fokus pada logika murni dan komponen terisolasi:

**`agendaUtils.test.js`**
- Contoh spesifik untuk setiap cabang status (hari ini = tanggal_mulai, hari ini = tanggal_akhir, dll.)
- Edge case: tanggal_mulai == tanggal_akhir == today → `berjalan`
- Edge case: string tanggal dengan format tidak valid

**`agendaService.test.js`** (dengan Supabase mock)
- Verifikasi query yang dikirim ke Supabase (tabel, kolom, order)
- Verifikasi validasi client-side menolak tanggal_akhir < tanggal_mulai sebelum memanggil Supabase

**`AdminAgenda.test.js`** (React Testing Library)
- Empty state: render "Belum ada agenda" saat list kosong
- Tombol "Tambah Agenda", "Edit", "Hapus" tersedia
- Dialog konfirmasi muncul saat klik hapus
- Membatalkan dialog konfirmasi tidak mengubah data

### Property-Based Tests (fast-check)

Library: **[fast-check](https://fast-check.io/)** — tersedia di npm, cocok untuk JavaScript/React.

Konfigurasi: minimum **100 iterasi** per property test.

Tag format: `// Feature: admin-agenda, Property {N}: {property_text}`

**`agendaUtils.property.test.js`**

```js
// Feature: admin-agenda, Property 1: Status akan_datang untuk agenda masa depan
fc.assert(fc.property(
  fc.date({ min: new Date(today + 1 day) }),  // tanggal_mulai masa depan
  fc.integer({ min: 0, max: 365 }),           // offset untuk tanggal_akhir
  (startDate, offset) => {
    const tanggal_mulai = toDateString(startDate)
    const tanggal_akhir = toDateString(addDays(startDate, offset))
    expect(calculateStatus(tanggal_mulai, tanggal_akhir)).toBe('akan_datang')
  }
), { numRuns: 100 })

// Feature: admin-agenda, Property 2: Status berjalan untuk agenda yang sedang berlangsung
// Feature: admin-agenda, Property 3: Status selesai untuk agenda masa lalu
// Feature: admin-agenda, Property 4: Exhaustiveness — output selalu salah satu dari tiga nilai
```

**`agendaValidation.property.test.js`**

```js
// Feature: admin-agenda, Property 5: Validasi tanggal — tanggal_akhir sebelum tanggal_mulai selalu ditolak
fc.assert(fc.property(
  fc.date(),
  fc.integer({ min: 1, max: 365 }),  // offset negatif: akhir sebelum mulai
  (endDate, offset) => {
    const tanggal_akhir = toDateString(endDate)
    const tanggal_mulai = toDateString(addDays(endDate, offset))  // mulai SETELAH akhir
    const result = validateAgendaDates(tanggal_mulai, tanggal_akhir)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Tanggal akhir tidak boleh sebelum tanggal mulai')
  }
), { numRuns: 100 })
```

### Integration Tests

- RLS: unauthenticated INSERT/UPDATE/DELETE → ditolak Supabase (dijalankan terhadap Supabase test project)
- RLS: unauthenticated SELECT → berhasil
- End-to-end: create → read → update → delete satu agenda

### Routing

- Akses `/admin/agenda` tanpa autentikasi → redirect ke `/admin/login` (via `ProtectedRoute`)
