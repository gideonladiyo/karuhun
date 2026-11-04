-- Migration: Weekly Featured References
-- Satu baris = satu video featured pada satu minggu.
-- Minggu featured berjalan Senin 12:00 WIB s/d Senin berikutnya 12:00 WIB;
-- week_start adalah tanggal Senin tersebut (kalender WIB).
-- Label slot (zona/elemen/boss) diambil dari subkategori referensi, jadi tidak disimpan di sini.
--
-- Sengaja dipisah dari video_references: policy "vr owner update" mengizinkan admin biasa
-- meng-update referensi miliknya, jadi flag featured di tabel itu bisa dinyalakan sendiri.

CREATE TABLE IF NOT EXISTS public.featured_references (
  week_start   DATE        NOT NULL,
  reference_id UUID        NOT NULL REFERENCES public.video_references(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_by   UUID        REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  PRIMARY KEY (week_start, reference_id),
  -- week_start harus hari Senin (ISO day of week 1)
  CONSTRAINT featured_week_start_is_monday CHECK (EXTRACT(ISODOW FROM week_start) = 1)
);

CREATE INDEX IF NOT EXISTS featured_references_reference_idx
  ON public.featured_references(reference_id);

ALTER TABLE public.featured_references ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "featured public read"      ON public.featured_references;
DROP POLICY IF EXISTS "featured superadmin write" ON public.featured_references;

-- Semua orang boleh membaca daftar featured. Referensi yang draft / di-trash tetap
-- tidak tampil karena halaman publik hanya mencocokkan ID dengan referensi yang published.
CREATE POLICY "featured public read" ON public.featured_references
  FOR SELECT TO anon, authenticated
  USING (true);

-- Hanya superadmin yang boleh menambah, mengganti, atau menghapus featured.
CREATE POLICY "featured superadmin write" ON public.featured_references
  FOR ALL TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

GRANT SELECT ON public.featured_references TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.featured_references TO authenticated;
