# Requirements Document

## Introduction

Fitur Agenda memungkinkan admin Kejaksaan Tinggi Kalimantan Utara untuk mengelola jadwal kegiatan/agenda kantor secara digital. Admin dapat membuat, mengedit, dan menghapus agenda. Setiap agenda memiliki status yang dihitung secara otomatis berdasarkan perbandingan tanggal mulai dan tanggal akhir dengan tanggal saat ini. Daftar agenda ditampilkan di halaman dashboard admin sebagai referensi kegiatan yang akan datang, sedang berjalan, maupun yang sudah selesai. Data agenda disimpan di Supabase (PostgreSQL).

## Glossary

- **Agenda**: Kegiatan atau acara resmi yang dijadwalkan oleh kantor Kejaksaan Tinggi Kalimantan Utara.
- **Admin**: Pengguna terautentikasi yang memiliki akses ke halaman admin.
- **AgendaManager**: Komponen/modul yang menangani operasi CRUD agenda di sisi frontend.
- **AgendaService**: Lapisan akses data yang melakukan semua operasi Supabase terkait tabel `agenda`.
- **StatusCalculator**: Logika yang menghitung status agenda berdasarkan tanggal.
- **Dashboard**: Halaman `/admin/dashboard` tempat ringkasan agenda ditampilkan.
- **tanggal_mulai**: Tanggal awal agenda (DATE, bukan TIMESTAMP).
- **tanggal_akhir**: Tanggal akhir agenda (DATE, bukan TIMESTAMP).
- **waktu**: Waktu pelaksanaan agenda dalam format HH:MM.
- **tempat**: Lokasi pelaksanaan agenda.
- **status**: Nilai kalkulasi otomatis: `akan_datang`, `berjalan`, atau `selesai`.

---

## Requirements

### Requirement 1: Penyimpanan Data Agenda

**User Story:** Sebagai admin, saya ingin data agenda tersimpan secara persisten di database, sehingga data tidak hilang saat halaman di-refresh.

#### Acceptance Criteria

1. THE AgendaService SHALL menyimpan setiap agenda dengan field: `nama_agenda` (TEXT NOT NULL), `tanggal_mulai` (DATE NOT NULL), `tanggal_akhir` (DATE NOT NULL), `waktu` (TIME), `tempat` (TEXT), dan `created_at` (TIMESTAMP WITH TIME ZONE).
2. THE AgendaService SHALL menggunakan tabel `agenda` di Supabase dengan primary key `id_agenda` bertipe UUID yang di-generate otomatis.
3. IF `tanggal_akhir` lebih awal dari `tanggal_mulai`, THEN THE AgendaService SHALL menolak penyimpanan dan mengembalikan pesan error "Tanggal akhir tidak boleh sebelum tanggal mulai".
4. THE AgendaService SHALL menggunakan singleton Supabase client dari `src/lib/supabase.js` untuk semua operasi database.

---

### Requirement 2: Kalkulasi Status Otomatis

**User Story:** Sebagai admin, saya ingin status agenda dihitung otomatis berdasarkan tanggal, sehingga saya tidak perlu mengubah status secara manual.

#### Acceptance Criteria

1. WHEN tanggal hari ini lebih awal dari `tanggal_mulai`, THE StatusCalculator SHALL menghasilkan status `akan_datang`.
2. WHEN tanggal hari ini berada di antara `tanggal_mulai` dan `tanggal_akhir` (inklusif kedua ujung), THE StatusCalculator SHALL menghasilkan status `berjalan`.
3. WHEN tanggal hari ini lebih akhir dari `tanggal_akhir`, THE StatusCalculator SHALL menghasilkan status `selesai`.
4. THE StatusCalculator SHALL menghitung status menggunakan tanggal lokal (bukan UTC) sesuai timezone browser pengguna.
5. THE StatusCalculator SHALL menghitung status secara client-side pada saat data ditampilkan, tanpa menyimpan nilai status ke database.
6. FOR ALL nilai `tanggal_mulai` dan `tanggal_akhir` yang valid, THE StatusCalculator SHALL menghasilkan tepat satu dari tiga nilai status: `akan_datang`, `berjalan`, atau `selesai`.

---

### Requirement 3: Membuat Agenda Baru

**User Story:** Sebagai admin, saya ingin membuat agenda baru, sehingga kegiatan yang akan datang dapat tercatat di sistem.

#### Acceptance Criteria

1. WHEN admin mengklik tombol "Tambah Agenda", THE AgendaManager SHALL menampilkan dialog form dengan field: nama agenda, tanggal mulai, tanggal akhir, waktu, dan tempat.
2. WHEN admin mengisi semua field wajib (nama agenda, tanggal mulai, tanggal akhir) dan mengklik "Simpan", THE AgendaManager SHALL menyimpan data agenda baru ke Supabase dan menutup dialog.
3. WHEN penyimpanan agenda baru berhasil, THE AgendaManager SHALL menampilkan toast notifikasi sukses "Agenda berhasil ditambahkan".
4. IF penyimpanan agenda baru gagal, THEN THE AgendaManager SHALL menampilkan toast notifikasi error "Gagal menambahkan agenda".
5. WHILE dialog form terbuka, THE AgendaManager SHALL menonaktifkan tombol "Simpan" jika field `nama_agenda` kosong.

---

### Requirement 4: Mengedit Agenda

**User Story:** Sebagai admin, saya ingin mengedit agenda yang sudah ada, sehingga perubahan jadwal atau informasi dapat diperbarui.

#### Acceptance Criteria

1. WHEN admin mengklik tombol edit pada baris agenda, THE AgendaManager SHALL menampilkan dialog form yang sudah terisi dengan data agenda yang dipilih.
2. WHEN admin mengubah data dan mengklik "Update", THE AgendaManager SHALL menyimpan perubahan ke Supabase dan menutup dialog.
3. WHEN pembaruan agenda berhasil, THE AgendaManager SHALL menampilkan toast notifikasi sukses "Agenda berhasil diupdate".
4. IF pembaruan agenda gagal, THEN THE AgendaManager SHALL menampilkan toast notifikasi error "Gagal mengupdate agenda".
5. IF `tanggal_akhir` yang diubah lebih awal dari `tanggal_mulai`, THEN THE AgendaManager SHALL menampilkan pesan validasi dan mencegah pengiriman form.

---

### Requirement 5: Menghapus Agenda

**User Story:** Sebagai admin, saya ingin menghapus agenda yang sudah tidak relevan, sehingga daftar agenda tetap bersih dan akurat.

#### Acceptance Criteria

1. WHEN admin mengklik tombol hapus pada baris agenda, THE AgendaManager SHALL menampilkan dialog konfirmasi sebelum menghapus.
2. WHEN admin mengkonfirmasi penghapusan, THE AgendaManager SHALL menghapus agenda dari Supabase dan memperbarui daftar.
3. WHEN penghapusan berhasil, THE AgendaManager SHALL menampilkan toast notifikasi sukses "Agenda berhasil dihapus".
4. IF penghapusan gagal, THEN THE AgendaManager SHALL menampilkan toast notifikasi error "Gagal menghapus agenda".
5. WHEN admin membatalkan dialog konfirmasi, THE AgendaManager SHALL membatalkan operasi hapus tanpa mengubah data.

---

### Requirement 6: Menampilkan Daftar Agenda di Dashboard

**User Story:** Sebagai admin, saya ingin melihat daftar agenda di halaman dashboard, sehingga saya dapat memantau kegiatan kantor dengan cepat.

#### Acceptance Criteria

1. THE Dashboard SHALL menampilkan daftar agenda dalam bentuk tabel atau card yang memuat kolom: nama agenda, tanggal mulai, tanggal akhir, waktu, tempat, dan status.
2. THE Dashboard SHALL menampilkan badge status dengan warna berbeda: kuning untuk `akan_datang`, hijau untuk `berjalan`, dan abu-abu untuk `selesai`.
3. THE Dashboard SHALL mengurutkan daftar agenda berdasarkan `tanggal_mulai` secara ascending (agenda terdekat di atas).
4. WHEN halaman dashboard dimuat, THE Dashboard SHALL mengambil semua data agenda dari Supabase dan menampilkannya.
5. IF tidak ada agenda yang tersimpan, THEN THE Dashboard SHALL menampilkan pesan "Belum ada agenda" di area daftar agenda.
6. THE Dashboard SHALL menyediakan tombol "Tambah Agenda", "Edit", dan "Hapus" yang dapat diakses dari tampilan daftar agenda.

---

### Requirement 7: Keamanan Akses Agenda

**User Story:** Sebagai admin, saya ingin operasi agenda hanya bisa dilakukan oleh pengguna terautentikasi, sehingga data agenda tidak dapat dimanipulasi oleh pihak yang tidak berwenang.

#### Acceptance Criteria

1. THE AgendaService SHALL menerapkan Row Level Security (RLS) di Supabase sehingga operasi INSERT, UPDATE, dan DELETE pada tabel `agenda` hanya diizinkan untuk `auth.role() = 'authenticated'`.
2. THE AgendaService SHALL mengizinkan operasi SELECT pada tabel `agenda` untuk semua role (publik dapat membaca agenda jika diperlukan di masa depan).
3. THE Dashboard SHALL hanya dapat diakses melalui `ProtectedRoute` yang memverifikasi sesi autentikasi admin.
