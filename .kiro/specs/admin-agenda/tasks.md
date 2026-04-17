# Implementation Plan: Admin Agenda

## Overview

Implementasi fitur manajemen agenda kantor untuk admin Kejaksaan Tinggi Kalimantan Utara. Terdiri dari: migrasi database, utility kalkulasi status (pure function), service layer Supabase, halaman CRUD `/admin/agenda`, widget agenda di `AdminDashboard`, dan routing baru di `App.js`.

## Tasks

- [x] 1. Buat migrasi database tabel `agenda`
  - Buat file `database/agenda_schema.sql` berisi DDL tabel `agenda` dengan kolom `id_agenda`, `nama_agenda`, `tanggal_mulai`, `tanggal_akhir`, `waktu`, `tempat`, `created_at`
  - Tambahkan index `idx_agenda_tanggal_mulai` pada kolom `tanggal_mulai ASC`
  - Tambahkan RLS policies: SELECT publik, INSERT/UPDATE/DELETE hanya `auth.role() = 'authenticated'`
  - _Requirements: 1.1, 1.2, 7.1, 7.2_

- [ ] 2. Implementasi `agendaUtils.js` — kalkulasi status
  - [x] 2.1 Buat `frontend/src/lib/agendaUtils.js` dengan fungsi `calculateStatus(tanggal_mulai, tanggal_akhir, today)`
    - Bandingkan string tanggal lokal `YYYY-MM-DD` menggunakan `today.toLocaleDateString('sv')`
    - Return `akan_datang` jika today < tanggal_mulai
    - Return `berjalan` jika tanggal_mulai <= today <= tanggal_akhir
    - Return `selesai` jika today > tanggal_akhir
    - Export sebagai named export
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 2.2 Tulis property test untuk `calculateStatus` — Property 1: status `akan_datang`
    - Buat `frontend/src/lib/__tests__/agendaUtils.property.test.js`
    - Gunakan `fc.assert` dengan `fc.property` dari fast-check, minimum 100 iterasi
    - Generate tanggal_mulai di masa depan, tanggal_akhir >= tanggal_mulai
    - Assert `calculateStatus` mengembalikan `'akan_datang'`
    - Tag: `// Feature: admin-agenda, Property 1: Status akan_datang untuk agenda masa depan`
    - **Property 1: Status `akan_datang` untuk agenda masa depan**
    - **Validates: Requirements 2.1**

  - [ ]* 2.3 Tulis property test — Property 2: status `berjalan`
    - Generate pasangan tanggal_mulai dan tanggal_akhir yang mengapit today
    - Assert `calculateStatus` mengembalikan `'berjalan'`
    - Tag: `// Feature: admin-agenda, Property 2: Status berjalan untuk agenda yang sedang berlangsung`
    - **Property 2: Status `berjalan` untuk agenda yang sedang berlangsung**
    - **Validates: Requirements 2.2**

  - [ ]* 2.4 Tulis property test — Property 3: status `selesai`
    - Generate tanggal_akhir di masa lalu, tanggal_mulai <= tanggal_akhir
    - Assert `calculateStatus` mengembalikan `'selesai'`
    - Tag: `// Feature: admin-agenda, Property 3: Status selesai untuk agenda masa lalu`
    - **Property 3: Status `selesai` untuk agenda masa lalu**
    - **Validates: Requirements 2.3**

  - [ ]* 2.5 Tulis property test — Property 4: exhaustiveness
    - Generate semua kombinasi tanggal valid (tanggal_akhir >= tanggal_mulai)
    - Assert output selalu salah satu dari `['akan_datang', 'berjalan', 'selesai']`
    - Assert tidak pernah `undefined`, `null`, atau nilai lain
    - Tag: `// Feature: admin-agenda, Property 4: Exhaustiveness — status selalu salah satu dari tiga nilai valid`
    - **Property 4: Exhaustiveness — output selalu salah satu dari tiga nilai valid**
    - **Validates: Requirements 2.6**

- [ ] 3. Implementasi `agendaService.js` — data layer
  - [x] 3.1 Buat `frontend/src/lib/agendaService.js` dengan empat fungsi
    - `fetchAgenda()` — SELECT * FROM agenda ORDER BY tanggal_mulai ASC
    - `createAgenda({ nama_agenda, tanggal_mulai, tanggal_akhir, waktu, tempat })` — validasi tanggal_akhir >= tanggal_mulai sebelum insert
    - `updateAgenda(id_agenda, data)` — validasi tanggal_akhir >= tanggal_mulai sebelum update
    - `deleteAgenda(id_agenda)` — DELETE by id
    - Semua fungsi return `{ data, error }` atau `{ error }`
    - Import supabase dari `../lib/supabase`
    - Export sebagai named exports
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.2, 4.2, 5.2_

  - [ ]* 3.2 Tulis property test — Property 5: validasi tanggal ditolak
    - Buat `frontend/src/lib/__tests__/agendaValidation.property.test.js`
    - Generate pasangan tanggal di mana tanggal_akhir < tanggal_mulai
    - Assert `createAgenda` dan `updateAgenda` mengembalikan error tanpa memanggil Supabase
    - Assert pesan error adalah `'Tanggal akhir tidak boleh sebelum tanggal mulai'`
    - Tag: `// Feature: admin-agenda, Property 5: Validasi tanggal — tanggal_akhir sebelum tanggal_mulai selalu ditolak`
    - **Property 5: Validasi tanggal — tanggal_akhir sebelum tanggal_mulai selalu ditolak**
    - **Validates: Requirements 1.3, 4.5**

- [x] 4. Checkpoint — Pastikan semua tests utility dan service lulus
  - Pastikan semua tests lulus, tanyakan ke user jika ada pertanyaan.

- [ ] 5. Buat halaman `AdminAgenda.js`
  - [x] 5.1 Buat `frontend/src/pages/AdminAgenda.js` — struktur dasar dan state
    - Ikuti pola `AdminJabatan.js`: named export, Shadcn UI, Sonner toast, Tailwind only
    - State: `agendaList`, `isDialogOpen`, `editingId`, `formData`, `isDeleteDialogOpen`, `deletingId`
    - `initialFormData`: `{ nama_agenda: '', tanggal_mulai: '', tanggal_akhir: '', waktu: '', tempat: '' }`
    - Header dengan tombol "Kembali" ke `/admin/dashboard` (pola sama dengan AdminJabatan)
    - `useEffect` → `fetchAgenda()` saat mount
    - _Requirements: 3.1, 4.1, 5.1_

  - [x] 5.2 Implementasi tabel daftar agenda dengan badge status
    - Render tabel dengan kolom: nama agenda, tanggal mulai, tanggal akhir, waktu, tempat, status, aksi
    - Gunakan `calculateStatus` dari `agendaUtils.js` untuk setiap baris
    - Badge status: kuning (`bg-yellow-100 text-yellow-800`) untuk `akan_datang`, hijau (`bg-green-100 text-green-800`) untuk `berjalan`, abu-abu (`bg-slate-100 text-slate-600`) untuk `selesai`
    - Tampilkan pesan "Belum ada agenda" saat list kosong
    - _Requirements: 6.1, 6.2, 6.3, 6.5_

  - [x] 5.3 Implementasi `AgendaFormDialog` — tambah dan edit
    - Dialog Shadcn dengan form field: nama agenda (required), tanggal mulai (required), tanggal akhir (required), waktu (optional), tempat (optional)
    - Validasi inline: tampilkan pesan error jika tanggal_akhir < tanggal_mulai, disable tombol submit
    - Disable tombol submit jika `nama_agenda` kosong
    - `handleSubmit` memanggil `createAgenda` atau `updateAgenda` dari agendaService
    - Toast sukses/error sesuai hasil operasi
    - Dialog tidak ditutup saat operasi gagal
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 5.4 Implementasi `DeleteConfirmDialog` — konfirmasi hapus
    - Gunakan `AlertDialog` dari Shadcn UI
    - Tampilkan dialog konfirmasi saat tombol hapus diklik
    - `handleDeleteExecute` memanggil `deleteAgenda` dari agendaService
    - Toast sukses/error sesuai hasil operasi
    - Batalkan tanpa mengubah data jika user klik "Batal"
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 5.5 Tulis property test — Property 7: edit form pre-fill
    - Buat `frontend/src/pages/__tests__/AdminAgenda.property.test.js`
    - Gunakan React Testing Library + fast-check
    - Generate objek agenda acak, render komponen, klik tombol edit
    - Assert semua field form terisi dengan nilai yang identik dengan data agenda
    - Tag: `// Feature: admin-agenda, Property 7: Edit form pre-fill`
    - **Property 7: Edit form pre-fill**
    - **Validates: Requirements 4.1**

  - [ ]* 5.6 Tulis property test — Property 8: delete menghapus dari daftar
    - Generate list agenda acak, pilih satu untuk dihapus
    - Mock `deleteAgenda` agar sukses
    - Assert agenda yang dihapus tidak lagi muncul di daftar setelah konfirmasi
    - Tag: `// Feature: admin-agenda, Property 8: Delete menghapus dari daftar`
    - **Property 8: Delete menghapus dari daftar**
    - **Validates: Requirements 5.2**

  - [ ]* 5.7 Tulis property test — Property 9: badge status sesuai nilai status
    - Generate agenda dengan berbagai kombinasi tanggal
    - Assert badge yang dirender menggunakan kelas warna yang sesuai dengan status yang dihitung
    - Tag: `// Feature: admin-agenda, Property 9: Badge status sesuai nilai status`
    - **Property 9: Badge status sesuai nilai status**
    - **Validates: Requirements 6.2**

- [x] 6. Tambahkan route `/admin/agenda` di `App.js`
  - Import `AdminAgenda` dari `./pages/AdminAgenda`
  - Tambahkan `<Route path="/admin/agenda">` di dalam `ProtectedRoute`, mengikuti pola route `/admin/jabatan`
  - _Requirements: 7.3_

- [ ] 7. Tambahkan widget agenda di `AdminDashboard.js`
  - [x] 7.1 Tambahkan `fetchAgenda` ke dalam `fetchData()` yang sudah ada (paralel dengan fetch lainnya)
    - Import `fetchAgenda` dari `agendaService`
    - Tambahkan state `agendaList` di `AdminDashboard`
    - _Requirements: 6.4_

  - [x] 7.2 Render section widget agenda di `AdminDashboard`
    - Tambahkan Card baru setelah section statistik yang sudah ada
    - Tampilkan tabel ringkas: nama agenda, tanggal mulai–akhir, status badge
    - Gunakan `calculateStatus` dari `agendaUtils.js`
    - Tampilkan pesan "Belum ada agenda" jika list kosong
    - Tombol "Kelola Agenda" → Link ke `/admin/agenda`
    - Tombol "Tambah Agenda", "Edit", "Hapus" inline di tabel (Edit dan Hapus mengarah ke `/admin/agenda` atau membuka dialog langsung)
    - Tambahkan link "Kelola Agenda" di navigasi header desktop dan mobile dropdown (mengikuti pola link "Kelola Jabatan")
    - _Requirements: 6.1, 6.2, 6.3, 6.5, 6.6_

- [x] 8. Final checkpoint — Pastikan semua tests lulus dan integrasi berjalan
  - Pastikan semua tests lulus, tanyakan ke user jika ada pertanyaan.

## Notes

- Tasks bertanda `*` bersifat opsional dan dapat dilewati untuk MVP yang lebih cepat
- Setiap task mereferensikan requirements spesifik untuk traceability
- `calculateStatus` adalah pure function — tidak ada side effect, mudah diuji
- Semua operasi Supabase melalui `agendaService.js`, bukan langsung dari komponen
- Migrasi database (`database/agenda_schema.sql`) harus dijalankan manual di Supabase SQL Editor sebelum testing integrasi
- Property tests menggunakan fast-check dengan minimum 100 iterasi per property
