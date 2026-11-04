-- Supabase Database Schema & RLS Setup Script for Karuhun REFFS System
-- Run this script in your Supabase SQL Editor if Row Level Security (RLS) is enabled.
-- PENTING: Ganti 'GANTI_DENGAN_EMAIL_AKUN_LAMA' dengan email akun admin lama kamu.

-- 1. Create subcategories table (if not exists)
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create profiles table & role helpers (superadmin / admin)
CREATE TABLE IF NOT EXISTS public.profiles (
    id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email        TEXT NOT NULL,
    display_name TEXT,
    role         TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'superadmin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(COALESCE(NEW.email, 'admin'), '@', 1)
    )
  )
  ON CONFLICT (id) DO NOTHING; -- role selalu default 'admin'
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, display_name)
SELECT
  id,
  COALESCE(email, ''),
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(COALESCE(email, 'admin'), '@', 1)
  )
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- Set akun utama admin@karuhun.com sebagai superadmin
UPDATE public.profiles
SET role = 'superadmin'
WHERE email = 'admin@karuhun.com';

-- Fallback otomatis: jika hanya ada tepat 1 user di sistem, jadikan superadmin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'superadmin')
     AND (SELECT count(*) FROM public.profiles) = 1 THEN
    UPDATE public.profiles SET role = 'superadmin';
  END IF;
END $$;

DROP POLICY IF EXISTS "profiles read own or superadmin" ON public.profiles;
CREATE POLICY "profiles read own or superadmin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_superadmin());

-- 3. Create video_references table (if not exists) + ownership & soft delete columns
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
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.video_references
  ADD COLUMN IF NOT EXISTS owner_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

UPDATE public.video_references
SET owner_id = (SELECT id FROM public.profiles WHERE role = 'superadmin' ORDER BY created_at LIMIT 1)
WHERE owner_id IS NULL;

CREATE INDEX IF NOT EXISTS video_references_owner_idx   ON public.video_references(owner_id);
CREATE INDEX IF NOT EXISTS video_references_deleted_idx ON public.video_references(deleted_at);

CREATE OR REPLACE FUNCTION public.guard_owner_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id AND NOT public.is_superadmin() THEN
    RAISE EXCEPTION 'owner_id tidak boleh diubah';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_owner ON public.video_references;
CREATE TRIGGER trg_guard_owner
  BEFORE UPDATE ON public.video_references
  FOR EACH ROW EXECUTE FUNCTION public.guard_owner_change();

-- 4. Create reference_tips table (if not exists)
CREATE TABLE IF NOT EXISTS public.reference_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_id UUID REFERENCES public.video_references(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    tip_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.video_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reference_tips ENABLE ROW LEVEL SECURITY;

-- 6. Policies for video_references
DROP POLICY IF EXISTS "Public view published references"    ON public.video_references;
DROP POLICY IF EXISTS "Admins full management"              ON public.video_references;
DROP POLICY IF EXISTS "Admins full insert video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full select video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full update video_references" ON public.video_references;
DROP POLICY IF EXISTS "Admins full delete video_references" ON public.video_references;
DROP POLICY IF EXISTS "vr public read"                      ON public.video_references;
DROP POLICY IF EXISTS "vr admin read"                       ON public.video_references;
DROP POLICY IF EXISTS "vr admin insert"                     ON public.video_references;
DROP POLICY IF EXISTS "vr owner update"                     ON public.video_references;
DROP POLICY IF EXISTS "vr superadmin delete"                ON public.video_references;

CREATE POLICY "vr public read" ON public.video_references
  FOR SELECT TO anon
  USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "vr admin read" ON public.video_references
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_superadmin());

CREATE POLICY "vr admin insert" ON public.video_references
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

CREATE POLICY "vr owner update" ON public.video_references
  FOR UPDATE TO authenticated
  USING      ((owner_id = auth.uid() AND deleted_at IS NULL) OR public.is_superadmin())
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

CREATE POLICY "vr superadmin delete" ON public.video_references
  FOR DELETE TO authenticated
  USING (public.is_superadmin());

REVOKE SELECT ON public.video_references FROM anon;
GRANT SELECT (
  id,
  subcategory_id,
  title,
  youtube_url,
  youtube_video_id,
  thumbnail_url,
  description,
  author_name,
  is_published,
  created_at
) ON public.video_references TO anon;

-- 7. Policies for subcategories table
DROP POLICY IF EXISTS "Public view subcategories"   ON public.subcategories;
DROP POLICY IF EXISTS "Admins manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins insert subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "subcat public read"          ON public.subcategories;
DROP POLICY IF EXISTS "subcat admin insert"         ON public.subcategories;
DROP POLICY IF EXISTS "subcat super update"         ON public.subcategories;
DROP POLICY IF EXISTS "subcat super delete"         ON public.subcategories;

CREATE POLICY "subcat public read" ON public.subcategories FOR SELECT USING (true);
CREATE POLICY "subcat admin insert" ON public.subcategories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "subcat super update" ON public.subcategories FOR UPDATE TO authenticated
  USING (public.is_superadmin()) WITH CHECK (public.is_superadmin());
CREATE POLICY "subcat super delete" ON public.subcategories FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- 8. Policies for reference_tips table
DROP POLICY IF EXISTS "Public view reference tips"   ON public.reference_tips;
DROP POLICY IF EXISTS "Admins manage reference tips" ON public.reference_tips;
DROP POLICY IF EXISTS "Admins insert reference_tips" ON public.reference_tips;
DROP POLICY IF EXISTS "tips public read"             ON public.reference_tips;
DROP POLICY IF EXISTS "tips admin read"              ON public.reference_tips;
DROP POLICY IF EXISTS "tips owner write"             ON public.reference_tips;

CREATE POLICY "tips public read" ON public.reference_tips FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.video_references v
                 WHERE v.id = reference_id AND v.is_published = true AND v.deleted_at IS NULL));
CREATE POLICY "tips admin read" ON public.reference_tips FOR SELECT TO authenticated USING (true);
CREATE POLICY "tips owner write" ON public.reference_tips FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.video_references v
                 WHERE v.id = reference_id AND ((v.owner_id = auth.uid() AND v.deleted_at IS NULL) OR public.is_superadmin())))
  WITH CHECK (EXISTS (SELECT 1 FROM public.video_references v
                 WHERE v.id = reference_id AND ((v.owner_id = auth.uid() AND v.deleted_at IS NULL) OR public.is_superadmin())));

-- 9. Storage Bucket & Policies for Custom Reference Thumbnails (max 2MB, JPG/JPEG/PNG/WEBP)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('reference-thumbnails', 'reference-thumbnails', true, 2097152,
        ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Public read reference thumbnails"   ON storage.objects;
DROP POLICY IF EXISTS "Admins upload reference thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins update reference thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete reference thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "thumb owner update"                 ON storage.objects;
DROP POLICY IF EXISTS "thumb owner delete"                 ON storage.objects;

CREATE POLICY "Public read reference thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'reference-thumbnails');
CREATE POLICY "Admins upload reference thumbnails" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reference-thumbnails');
CREATE POLICY "thumb owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'reference-thumbnails' AND (owner_id = auth.uid()::text OR public.is_superadmin()));
CREATE POLICY "thumb owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'reference-thumbnails' AND (owner_id = auth.uid()::text OR public.is_superadmin()));
