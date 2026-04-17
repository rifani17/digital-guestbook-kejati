-- Agenda Table Schema
-- Run this script in Supabase SQL Editor

-- Create agenda table
CREATE TABLE IF NOT EXISTS public.agenda (
    id_agenda     UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_agenda   TEXT NOT NULL,
    tanggal_mulai DATE NOT NULL,
    tanggal_akhir DATE NOT NULL,
    waktu         TIME,
    tempat        TEXT,
    created_at    TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
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

-- Index untuk performa query berdasarkan tanggal mulai
CREATE INDEX IF NOT EXISTS idx_agenda_tanggal_mulai ON public.agenda(tanggal_mulai ASC);
