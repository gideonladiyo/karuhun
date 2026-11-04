-- Migration: urutan tampil featured references
-- position menentukan urutan slot di dalam satu mode (angka kecil tampil paling atas;
-- slot pertama jadi spotlight di halaman publik). Baris lama mendapat 0 dan diurutkan
-- berdasarkan created_at sampai superadmin mengatur ulang urutannya.

ALTER TABLE public.featured_references
  ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS featured_references_week_position_idx
  ON public.featured_references(week_start, position);
