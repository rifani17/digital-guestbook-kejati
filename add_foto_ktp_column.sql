-- Add foto_ktp_url column to tamu table
-- Run this in Supabase SQL Editor

ALTER TABLE public.tamu 
ADD COLUMN IF NOT EXISTS foto_ktp_url TEXT;

COMMENT ON COLUMN public.tamu.foto_ktp_url IS 'URL foto KTP pengunjung (optional)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tamu' 
AND column_name = 'foto_ktp_url';
