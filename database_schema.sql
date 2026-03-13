-- Digital Guest Book Database Schema
-- Run this script in Supabase SQL Editor

-- Create jabatan table
CREATE TABLE IF NOT EXISTS public.jabatan (
    id_jabatan UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nama_jabatan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create pejabat table
CREATE TABLE IF NOT EXISTS public.pejabat (
    id_pejabat UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    id_jabatan UUID REFERENCES public.jabatan(id_jabatan) ON DELETE SET NULL,
    nama TEXT NOT NULL,
    no_hp TEXT NOT NULL,
    status TEXT DEFAULT 'di_tempat' CHECK (status IN ('di_tempat', 'rapat', 'dinas_luar')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create tamu table
CREATE TABLE IF NOT EXISTS public.tamu (
    id_tamu UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tanggal TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    nama TEXT NOT NULL,
    asal TEXT NOT NULL,
    no_hp TEXT NOT NULL,
    keperluan TEXT NOT NULL,
    tujuan_pejabat UUID REFERENCES public.pejabat(id_pejabat) ON DELETE SET NULL,
    foto_url TEXT,
    jumlah_pengikut INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pejabat_jabatan ON public.pejabat(id_jabatan);
CREATE INDEX IF NOT EXISTS idx_pejabat_status ON public.pejabat(status);
CREATE INDEX IF NOT EXISTS idx_tamu_tanggal ON public.tamu(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_tamu_pejabat ON public.tamu(tujuan_pejabat);

-- Enable Row Level Security (RLS)
ALTER TABLE public.jabatan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pejabat ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tamu ENABLE ROW LEVEL SECURITY;

-- Create policies for jabatan (authenticated users only)
CREATE POLICY "Allow authenticated read access" ON public.jabatan
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert" ON public.jabatan
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.jabatan
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.jabatan
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create policies for pejabat
CREATE POLICY "Allow read access to all" ON public.pejabat
    FOR SELECT
    USING (true);

CREATE POLICY "Allow authenticated insert" ON public.pejabat
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.pejabat
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.pejabat
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create policies for tamu (visitors can insert, admin can read)
CREATE POLICY "Allow public insert" ON public.tamu
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow authenticated read access" ON public.tamu
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update" ON public.tamu
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete" ON public.tamu
    FOR DELETE
    USING (auth.role() = 'authenticated');