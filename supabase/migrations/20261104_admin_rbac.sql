-- =============================================================================
-- Migration: Admin RBAC (Superadmin/Admin), Google OAuth Profile Trigger,
--            Reference Ownership, and Soft Delete
-- =============================================================================
-- PENTING: Sebelum menjalankan script ini di Supabase SQL Editor, ganti
-- 'GANTI_DENGAN_EMAIL_AKUN_LAMA' di bawah dengan email akun admin lama kamu.
-- =============================================================================

-- 1) PROFILES & ROLE ----------------------------------------------------------
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

-- Backfill akun yang sudah ada di auth.users
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

-- Fallback otomatis: jika hanya ada tepat 1 user di sistem saat migrasi dijalankan
-- dan belum ada superadmin, jadikan satu-satunya user tersebut sebagai superadmin.
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
-- Sengaja TIDAK ada policy INSERT/UPDATE/DELETE untuk klien agar user tidak bisa mengubah role sendiri.


-- 2) OWNER + SOFT DELETE PADA video_references --------------------------------
ALTER TABLE public.video_references
  ADD COLUMN IF NOT EXISTS owner_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Pastikan jika owner_id sudah terlanjur mengarah ke auth.users di skema sebelumnya,
-- kita juga mengizinkan join ke public.profiles(id) karena PK keduanya identik.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'video_references_owner_profile_fkey'
  ) THEN
    ALTER TABLE public.video_references
      ADD CONSTRAINT video_references_owner_profile_fkey
      FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Backfill owner_id baris lama ke akun superadmin
UPDATE public.video_references
SET owner_id = (SELECT id FROM public.profiles WHERE role = 'superadmin' ORDER BY created_at LIMIT 1)
WHERE owner_id IS NULL;

CREATE INDEX IF NOT EXISTS video_references_owner_idx   ON public.video_references(owner_id);
CREATE INDEX IF NOT EXISTS video_references_deleted_idx ON public.video_references(deleted_at);

-- Trigger: owner_id tidak boleh dipindah kecuali oleh superadmin
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


-- 3) RLS video_references -----------------------------------------------------
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

-- Publik hanya bisa membaca referensi yang published dan belum di-soft-delete
CREATE POLICY "vr public read" ON public.video_references
  FOR SELECT TO anon
  USING (is_published = true AND deleted_at IS NULL);

-- Admin bisa membaca semua referensi aktif; superadmin juga bisa membaca yang ada di Trash
CREATE POLICY "vr admin read" ON public.video_references
  FOR SELECT TO authenticated
  USING (deleted_at IS NULL OR public.is_superadmin());

-- Admin baru hanya boleh insert baris dengan owner_id = dirinya sendiri (atau superadmin)
CREATE POLICY "vr admin insert" ON public.video_references
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

-- Owner boleh update (termasuk soft delete = set deleted_at) selama baris belum di-trash.
-- Superadmin boleh update semua baris termasuk me-restore dari Trash.
CREATE POLICY "vr owner update" ON public.video_references
  FOR UPDATE TO authenticated
  USING      ((owner_id = auth.uid() AND deleted_at IS NULL) OR public.is_superadmin())
  WITH CHECK (owner_id = auth.uid() OR public.is_superadmin());

-- Hard delete (hapus permanen) hanya boleh dilakukan oleh superadmin
CREATE POLICY "vr superadmin delete" ON public.video_references
  FOR DELETE TO authenticated
  USING (public.is_superadmin());

-- Sembunyikan kolom internal (owner_id, deleted_at, deleted_by) dari role anon
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


-- 4) RLS reference_tips (mengikuti kepemilikan parent) ------------------------
DROP POLICY IF EXISTS "Public view reference tips"   ON public.reference_tips;
DROP POLICY IF EXISTS "Admins manage reference tips" ON public.reference_tips;
DROP POLICY IF EXISTS "Admins insert reference_tips" ON public.reference_tips;
DROP POLICY IF EXISTS "tips public read"             ON public.reference_tips;
DROP POLICY IF EXISTS "tips admin read"              ON public.reference_tips;
DROP POLICY IF EXISTS "tips owner write"             ON public.reference_tips;

CREATE POLICY "tips public read" ON public.reference_tips
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.video_references v
      WHERE v.id = reference_id
        AND v.is_published = true
        AND v.deleted_at IS NULL
    )
  );

CREATE POLICY "tips admin read" ON public.reference_tips
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "tips owner write" ON public.reference_tips
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.video_references v
      WHERE v.id = reference_id
        AND ((v.owner_id = auth.uid() AND v.deleted_at IS NULL) OR public.is_superadmin())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.video_references v
      WHERE v.id = reference_id
        AND ((v.owner_id = auth.uid() AND v.deleted_at IS NULL) OR public.is_superadmin())
    )
  );


-- 5) RLS subcategories (admin boleh tambah, hanya superadmin boleh ubah/hapus)
DROP POLICY IF EXISTS "Public view subcategories"   ON public.subcategories;
DROP POLICY IF EXISTS "Admins manage subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Admins insert subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "subcat public read"          ON public.subcategories;
DROP POLICY IF EXISTS "subcat admin insert"         ON public.subcategories;
DROP POLICY IF EXISTS "subcat super update"         ON public.subcategories;
DROP POLICY IF EXISTS "subcat super delete"         ON public.subcategories;

CREATE POLICY "subcat public read" ON public.subcategories
  FOR SELECT USING (true);

CREATE POLICY "subcat admin insert" ON public.subcategories
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "subcat super update" ON public.subcategories
  FOR UPDATE TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

CREATE POLICY "subcat super delete" ON public.subcategories
  FOR DELETE TO authenticated
  USING (public.is_superadmin());


-- 6) STORAGE reference-thumbnails (upload semua admin, hapus/ubah hanya owner/superadmin)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'reference-thumbnails',
  'reference-thumbnails',
  true,
  2097152,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
  SET public             = EXCLUDED.public,
      file_size_limit    = EXCLUDED.file_size_limit,
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
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reference-thumbnails');

CREATE POLICY "thumb owner update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'reference-thumbnails'
    AND (owner_id = auth.uid()::text OR public.is_superadmin())
  );

CREATE POLICY "thumb owner delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'reference-thumbnails'
    AND (owner_id = auth.uid()::text OR public.is_superadmin())
  );


-- 7) RLS guild_recap_snapshots (opsional jika tabel dipakai) -----------------
CREATE TABLE IF NOT EXISTS public.guild_recap_snapshots (
  id             TEXT PRIMARY KEY,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  total_members INT NOT NULL DEFAULT 0,
  members_json  JSONB NOT NULL DEFAULT '[]'::jsonb
);

ALTER TABLE public.guild_recap_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "recap admin read"  ON public.guild_recap_snapshots;
DROP POLICY IF EXISTS "recap super write" ON public.guild_recap_snapshots;

CREATE POLICY "recap admin read" ON public.guild_recap_snapshots
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "recap super write" ON public.guild_recap_snapshots
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());
