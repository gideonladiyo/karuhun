-- Supabase Database Schema & RLS Setup Script for Karuhun REFFS System
-- Run this script in your Supabase SQL Editor if Row Level Security (RLS) is enabled.

-- 1. Create subcategories table (if not exists)
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create video_references table (if not exists)
CREATE TABLE IF NOT EXISTS public.video_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    youtube_url TEXT NOT NULL,
    youtube_video_id TEXT NOT NULL,
    thumbnail_url TEXT,
    description TEXT,
    author_name TEXT DEFAULT 'Karuhun Corps',
    is_published BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create reference_tips table (if not exists)
CREATE TABLE IF NOT EXISTS public.reference_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID REFERENCES public.video_references(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    tip_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.video_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_tips ENABLE ROW LEVEL SECURITY;

-- 5. Drop old policies to avoid duplicates
DROP POLICY IF EXISTS "Public view published references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full management" ON public.video_references;
DROP POLICY IF EXISTS "Admins full insert video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full select video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full update video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full delete video_references" ON public.video_references;

-- 6. Create Explicit RLS Policies for video_references
-- Public Read: Anyone can view published references
CREATE POLICY "Public view published references" ON public.video_references
    FOR SELECT USING (is_published = true);

-- Authenticated Users (Logged In Admins) full CRUD
CREATE POLICY "Admins full insert video_references" ON public.video_references
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Admins full select video_references" ON public.video_references
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins full update video_references" ON public.video_references
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Admins full delete video_references" ON public.video_references
    FOR DELETE TO authenticated USING (true);

-- 7. Policies for subcategories table
DROP POLICY IF EXISTS "Public view subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins insert subcategories" ON public.subcategories;

CREATE POLICY "Public view subcategories" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "Admins insert subcategories" ON public.subcategories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage subcategories" ON public.subcategories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Policies for reference_tips table
DROP POLICY IF EXISTS "Public view reference tips" ON public.reference_tips;
DROP POLICY IF EXISTS "Admins manage reference tips" ON public.reference_tips;
DROP POLICY IF EXISTS "Admins insert reference_tips" ON public.reference_tips;

CREATE POLICY "Public view reference tips" ON public.reference_tips FOR SELECT USING (true);
CREATE POLICY "Admins insert reference_tips" ON public.reference_tips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins manage reference tips" ON public.reference_tips FOR ALL TO authenticated USING (true) WITH CHECK (true);
