-- Storage Policies untuk Buku Tamu Digital
-- Jalankan script ini di Supabase SQL Editor

-- =====================================================
-- POLICY UNTUK BUCKET: guest-photos
-- =====================================================

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public upload guest-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read guest-photos" ON storage.objects;

-- Policy untuk mengizinkan upload publik ke bucket guest-photos
CREATE POLICY "Allow public upload guest-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'guest-photos');

-- Policy untuk mengizinkan read publik dari bucket guest-photos
CREATE POLICY "Allow public read guest-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'guest-photos');

-- =====================================================
-- POLICY UNTUK BUCKET: ktp-photos
-- =====================================================

-- Hapus policy lama jika ada
DROP POLICY IF EXISTS "Allow public upload ktp-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read ktp-photos" ON storage.objects;

-- Policy untuk mengizinkan upload publik ke bucket ktp-photos
CREATE POLICY "Allow public upload ktp-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ktp-photos');

-- Policy untuk mengizinkan read publik dari bucket ktp-photos  
CREATE POLICY "Allow public read ktp-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'ktp-photos');

-- =====================================================
-- CATATAN PENTING:
-- =====================================================
-- 1. Pastikan bucket 'guest-photos' dan 'ktp-photos' sudah dibuat
-- 2. Bucket harus di-set sebagai PUBLIC di Supabase Dashboard
--    Storage > Buckets > [nama bucket] > Make public
-- 3. Jalankan script ini SETELAH bucket dibuat
