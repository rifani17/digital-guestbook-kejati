-- ===================================================
-- SUPABASE STORAGE SETUP untuk Guest Photos
-- ===================================================

-- 1. CEK APAKAH BUCKET SUDAH ADA
SELECT * FROM storage.buckets WHERE id = 'guest-photos';

-- Jika belum ada, jalankan SQL berikut:
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES (
--   'guest-photos',
--   'guest-photos', 
--   true,  -- PENTING: HARUS TRUE untuk public access
--   5242880,  -- 5MB dalam bytes
--   ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
-- );

-- ATAU melalui UI:
-- 1. Buka Supabase Dashboard
-- 2. Storage → New Bucket
-- 3. Name: guest-photos
-- 4. Public: ON (CENTANG!)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/png

-- ===================================================
-- 2. PASTIKAN BUCKET BERSIFAT PUBLIC
-- ===================================================

UPDATE storage.buckets 
SET public = true 
WHERE id = 'guest-photos';

-- Verify:
SELECT id, name, public FROM storage.buckets WHERE id = 'guest-photos';
-- Harus menunjukkan: public = true

-- ===================================================
-- 3. HAPUS SEMUA POLICIES LAMA (jika ada konflik)
-- ===================================================

DROP POLICY IF EXISTS "public upload photos" ON storage.objects;
DROP POLICY IF EXISTS "public read photos" ON storage.objects;
DROP POLICY IF EXISTS "public update photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;

-- ===================================================
-- 4. BUAT POLICIES BARU YANG BENAR
-- ===================================================

-- Policy untuk INSERT (upload)
CREATE POLICY "Allow anon upload to guest-photos"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'guest-photos'
);

-- Policy untuk SELECT (read/view)
CREATE POLICY "Allow public read from guest-photos"
ON storage.objects
FOR SELECT
TO anon, authenticated, public
USING (
  bucket_id = 'guest-photos'
);

-- Policy untuk UPDATE (optional, jika butuh update file)
CREATE POLICY "Allow anon update in guest-photos"
ON storage.objects
FOR UPDATE
TO anon, authenticated
USING (
  bucket_id = 'guest-photos'
)
WITH CHECK (
  bucket_id = 'guest-photos'
);

-- Policy untuk DELETE (optional, untuk admin)
CREATE POLICY "Allow authenticated delete from guest-photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'guest-photos'
);

-- ===================================================
-- 5. VERIFIKASI POLICIES
-- ===================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage';

-- Harus ada minimal 2 policies:
-- 1. INSERT policy untuk bucket_id = 'guest-photos'
-- 2. SELECT policy untuk bucket_id = 'guest-photos'

-- ===================================================
-- 6. TEST BUCKET ACCESS (via SQL)
-- ===================================================

-- Test list files di bucket (harus tidak error)
SELECT * FROM storage.objects 
WHERE bucket_id = 'guest-photos' 
LIMIT 10;

-- ===================================================
-- 7. ALTERNATIVE: RECREATE BUCKET (jika masih error)
-- ===================================================

-- HATI-HATI: Ini akan menghapus semua foto yang sudah ada!

-- Step 1: Hapus semua files di bucket
-- DELETE FROM storage.objects WHERE bucket_id = 'guest-photos';

-- Step 2: Hapus bucket
-- DELETE FROM storage.buckets WHERE id = 'guest-photos';

-- Step 3: Buat ulang bucket melalui UI atau SQL
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('guest-photos', 'guest-photos', true);

-- Step 4: Jalankan ulang policies (nomor 4 di atas)

-- ===================================================
-- 8. TROUBLESHOOTING HTTP 400 ERROR
-- ===================================================

-- Error 400 biasanya disebabkan oleh:

-- A. Bucket tidak public
-- Fix:
UPDATE storage.buckets SET public = true WHERE id = 'guest-photos';

-- B. File size terlalu besar
-- Check limit:
SELECT id, name, file_size_limit 
FROM storage.buckets 
WHERE id = 'guest-photos';

-- Update limit jika perlu (5MB = 5242880 bytes):
UPDATE storage.buckets 
SET file_size_limit = 5242880 
WHERE id = 'guest-photos';

-- C. MIME type tidak diizinkan
-- Update allowed mime types:
UPDATE storage.buckets 
SET allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
WHERE id = 'guest-photos';

-- D. Bucket tidak ada
-- Buat bucket baru:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest-photos',
  'guest-photos',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET 
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- ===================================================
-- 9. VERIFY FINAL CONFIGURATION
-- ===================================================

-- Semua check ini harus return TRUE atau success:

-- 1. Bucket exists and is public
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'guest-photos';

-- Expected:
-- id: guest-photos
-- name: guest-photos
-- public: TRUE (PENTING!)
-- file_size_limit: 5242880 atau NULL
-- allowed_mime_types: {image/jpeg, image/jpg, image/png, image/webp} atau NULL

-- 2. Policies exist
SELECT COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%guest-photos%';

-- Expected: >= 2 (minimal INSERT dan SELECT policy)

-- 3. Test insert permission (sebagai anon)
-- Ini akan test apakah anon user bisa upload
-- (Jalankan di Supabase SQL Editor yang sudah login)

-- ===================================================
-- 10. QUICK FIX - RUN THIS IF STILL ERROR 400
-- ===================================================

-- Jalankan semua command ini berurutan:

-- 1. Pastikan bucket public
UPDATE storage.buckets SET public = true WHERE id = 'guest-photos';

-- 2. Hapus policies lama
DROP POLICY IF EXISTS "Allow anon upload to guest-photos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from guest-photos" ON storage.objects;

-- 3. Buat policies baru
CREATE POLICY "guest_photos_insert"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'guest-photos');

CREATE POLICY "guest_photos_select"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'guest-photos');

-- 4. Verify
SELECT id, public FROM storage.buckets WHERE id = 'guest-photos';
SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND policyname LIKE 'guest_photos%';

-- ===================================================
-- NOTES:
-- ===================================================
-- - 'anon' role = unauthenticated users (visitor form)
-- - 'authenticated' role = logged in users (admin)
-- - 'public' = both anon and authenticated
-- - Bucket HARUS public untuk anonymous upload
-- - Policies HARUS ada untuk INSERT dan SELECT
-- - File size default di Supabase: 50MB, tapi bisa dibatasi
-- ===================================================
