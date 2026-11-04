import React, { useEffect, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertTriangle } from 'lucide-react';
import {
  AdminReferenceItem,
  ReferenceItem,
  CATEGORIES_CONFIG,
  detectVideoPlatform,
  extractVideoId,
  isEmbeddable,
  getPlatformThumbnail,
  createReference,
  updateReference,
} from '@/data/static/reffsData';
import { isSupabaseConfigured } from '@/services/supabase/client';
import {
  validateThumbnail,
  uploadReferenceThumbnail,
  deleteReferenceThumbnail,
} from '@/services/supabase/storage';
import { Button } from '@/components/ui/button';
import { PlatformBadge } from '@/components/ui/platform-icon';
import { SafeImage } from '@/components/ui/safe-image';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import {
  Field,
  Input,
  Select,
  Textarea,
} from '@/components/admin/AdminPrimitives';

type CategoryKey = 'guild_challenge' | 'warzone' | 'ppc';
type DescTab = 'edit' | 'preview';

const DESC_TAB_OPTIONS: readonly SegmentedTabOption<DescTab>[] = [
  { value: 'edit', label: 'Tulis Markdown' },
  { value: 'preview', label: 'Preview' },
];

const PUBLISH_OPTIONS: readonly SegmentedTabOption<'published' | 'draft'>[] = [
  { value: 'published', label: 'Published (Publik)' },
  { value: 'draft', label: 'Draft (Disembunyikan)' },
];

export interface ReferenceFormProps {
  editingRef: AdminReferenceItem | null;
  currentUserId: string;
  onCancel: () => void;
  onSaved: (message: string) => void;
}

export const ReferenceForm: React.FC<ReferenceFormProps> = ({
  editingRef,
  currentUserId,
  onCancel,
  onSaved,
}) => {
  const initialCategory: CategoryKey = editingRef?.category ?? 'guild_challenge';
  const initialSubs = CATEGORIES_CONFIG[initialCategory]?.subcategories || [];
  const isInitialSubPreset = editingRef
    ? initialSubs.includes(editingRef.subcategory)
    : true;

  const [category, setCategory] = useState<CategoryKey>(initialCategory);
  const [subcategory, setSubcategory] = useState<string>(
    editingRef
      ? isInitialSubPreset
        ? editingRef.subcategory
        : '__custom__'
      : initialSubs[0] || 'Zone Boss'
  );
  const [isCustomSubcategory, setIsCustomSubcategory] = useState<boolean>(
    editingRef ? !isInitialSubPreset : false
  );
  const [customSubcategory, setCustomSubcategory] = useState<string>(
    editingRef && !isInitialSubPreset ? editingRef.subcategory : ''
  );

  const [title, setTitle] = useState<string>(editingRef?.title ?? '');
  const [videoUrl, setVideoUrl] = useState<string>(
    editingRef?.videoUrl || editingRef?.youtubeUrl || ''
  );
  const [author, setAuthor] = useState<string>(editingRef?.author ?? '');
  const [isPublished, setIsPublished] = useState<boolean>(
    editingRef ? editingRef.isPublished !== false : true
  );
  const [description, setDescription] = useState<string>(
    editingRef?.description ??
      '### Rotation & Strategy Guide\nTuliskan detail rotasi dan strategi menggunakan format **Markdown**...'
  );
  const [descTab, setDescTab] = useState<DescTab>('edit');

  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    editingRef?.thumbnailUrl ?? ''
  );
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [showThumbUrlInput, setShowThumbUrlInput] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    };
  }, [thumbPreview]);

  const handleCategoryChange = (nextCategory: CategoryKey) => {
    setCategory(nextCategory);
    const subs = CATEGORIES_CONFIG[nextCategory]?.subcategories || [];
    if (subs.length > 0) {
      setSubcategory(subs[0]);
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
    } else {
      setSubcategory('__custom__');
      setIsCustomSubcategory(true);
    }
  };

  const selectThumbnailFile = (file: File | null | undefined) => {
    setThumbError(null);
    if (!file) return;
    const check = validateThumbnail(file);
    if (!check.valid) {
      setThumbError(check.error || 'File thumbnail tidak valid.');
      return;
    }
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(file);
    setThumbPreview(URL.createObjectURL(file));
  };

  const clearThumbnailSelection = () => {
    if (thumbPreview) URL.revokeObjectURL(thumbPreview);
    setThumbFile(null);
    setThumbPreview(null);
    setThumbError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const cleanTitle = title.trim();
    const cleanAuthor = author.trim();
    const cleanUrl = videoUrl.trim();
    const finalSubcategory = isCustomSubcategory
      ? customSubcategory.trim()
      : subcategory.trim();

    if (!cleanTitle) {
      setSaveError('Judul referensi wajib diisi.');
      return;
    }

    if (!cleanAuthor) {
      setSaveError('Author / Credit wajib diisi (nama kreator video, bukan akun pengunggah).');
      return;
    }

    if (cleanAuthor.length > 60) {
      setSaveError('Nama Author maksimal 60 karakter.');
      return;
    }

    if (!finalSubcategory) {
      setSaveError('Subkategori wajib diisi.');
      return;
    }

    const detectedPlat = detectVideoPlatform(cleanUrl);
    const extractedId = extractVideoId(cleanUrl, detectedPlat);
    if (!extractedId) {
      setSaveError(
        'URL video tidak dikenali. Pastikan link YouTube, TikTok, atau Bilibili valid.'
      );
      return;
    }

    const targetRefId = editingRef
      ? editingRef.id
      : crypto.randomUUID();
    const previousThumbUrl = editingRef?.thumbnailUrl;

    setIsSaving(true);
    let resolvedCustomThumbUrl = thumbnailUrl.trim();

    if (thumbFile) {
      try {
        resolvedCustomThumbUrl = await uploadReferenceThumbnail(thumbFile, targetRefId);
      } catch (uploadErr: any) {
        setIsSaving(false);
        setSaveError(uploadErr?.message || 'Gagal mengunggah thumbnail custom.');
        return;
      }
    }

    const finalThumbUrl = getPlatformThumbnail(
      detectedPlat,
      extractedId,
      resolvedCustomThumbUrl
    );

    const payloadItem: ReferenceItem = {
      id: targetRefId,
      category,
      subcategory: finalSubcategory,
      title: cleanTitle,
      platform: detectedPlat,
      videoUrl: cleanUrl,
      youtubeUrl: cleanUrl,
      videoId: extractedId,
      thumbnailUrl: finalThumbUrl,
      description,
      author: cleanAuthor,
      isPublished,
      dateAdded: editingRef?.dateAdded || new Date().toISOString().split('T')[0],
      tips: editingRef?.tips ?? [],
    };

    const res = editingRef
      ? await updateReference(payloadItem)
      : await createReference(payloadItem, currentUserId);

    setIsSaving(false);

    if (!res.success) {
      if (thumbFile && resolvedCustomThumbUrl) {
        await deleteReferenceThumbnail(resolvedCustomThumbUrl);
      }
      setSaveError(res.error || 'Gagal menyimpan referensi.');
      return;
    }

    if (previousThumbUrl && previousThumbUrl !== finalThumbUrl) {
      await deleteReferenceThumbnail(previousThumbUrl);
    }

    onSaved(
      editingRef
        ? 'Referensi berhasil diperbarui.'
        : 'Referensi baru berhasil ditambahkan.'
    );
  };

  return (
    <div className="minimal-card p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
        <div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-white">
            {editingRef ? 'Edit Referensi Video' : 'Tambah Referensi Video'}
          </h2>
          <p className="text-xs text-zinc-400">
            Nama author di halaman publik berasal dari input Author di bawah, bukan dari akun login kamu.
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
          Kembali ke Daftar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {saveError && (
          <div className="p-3.5 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs">
            {saveError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Kategori Utama">
            <Select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as CategoryKey)}
            >
              <option value="guild_challenge">Guild Challenge</option>
              <option value="warzone">Warzone</option>
              <option value="ppc">PPC</option>
            </Select>
          </Field>

          <Field label="Subkategori">
            <Select
              value={isCustomSubcategory ? '__custom__' : subcategory}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setIsCustomSubcategory(true);
                } else {
                  setIsCustomSubcategory(false);
                  setSubcategory(e.target.value);
                }
              }}
            >
              {CATEGORIES_CONFIG[category]?.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="__custom__">+ Subkategori Baru...</option>
            </Select>
            {isCustomSubcategory && (
              <Input
                type="text"
                placeholder="Nama subkategori baru..."
                value={customSubcategory}
                onChange={(e) => setCustomSubcategory(e.target.value)}
                required
                className="mt-2"
              />
            )}
          </Field>
        </div>

        <Field label="Judul Video Referensi">
          <Input
            type="text"
            placeholder="Contoh: Warzone Nihil 12M+ Rotation Run"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field
            label="URL Video Referensi"
            hint="Mendukung YouTube (watch/shorts/youtu.be), TikTok, dan Bilibili (BV/b23.tv)."
            action={
              videoUrl.trim() ? (
                <PlatformBadge platform={detectVideoPlatform(videoUrl)} />
              ) : null
            }
          >
            <Input
              type="text"
              placeholder="https://youtu.be/... atau TikTok / Bilibili URL"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              required
              className="font-mono"
            />
            {(() => {
              const trimmed = videoUrl.trim();
              if (!trimmed) return null;
              const plat = detectVideoPlatform(trimmed);
              const vid = extractVideoId(trimmed, plat);
              if (plat === 'tiktok' && vid && !isEmbeddable(plat, vid)) {
                return (
                  <p className="text-xs text-amber-400 pt-1">
                    Tautan pendek TikTok tidak dapat diputar langsung di dalam preview. Gunakan
                    URL penuh (<code className="font-mono">tiktok.com/@user/video/...</code>) agar
                    video dapat diputar di halaman dan modal preview.
                  </p>
                );
              }
              return null;
            })()}
          </Field>

          <Field
            label="Author / Credit"
            hint="Ditampilkan ke publik sebagai kreator referensi (maks 60 karakter)."
          >
            <Input
              type="text"
              placeholder="Contoh: Karuhun Corps, larkshinnn, CN Dalao"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              maxLength={60}
              required
            />
          </Field>
        </div>

        <Field label="Status Publikasi">
          <div>
            <SegmentedTabs
              options={PUBLISH_OPTIONS}
              value={isPublished ? 'published' : 'draft'}
              onChange={(val) => setIsPublished(val === 'published')}
              size="sm"
            />
          </div>
        </Field>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-300">
              Custom Thumbnail <span className="text-zinc-500 font-normal">(Opsional — otomatis jika dikosongkan)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowThumbUrlInput(!showThumbUrlInput)}
              className="text-xs text-zinc-400 hover:text-white underline transition-colors cursor-pointer"
            >
              {showThumbUrlInput ? 'Sembunyikan input URL' : 'atau tempel URL gambar'}
            </button>
          </div>

          {!isSupabaseConfigured() && (
            <div className="text-xs text-amber-300 bg-amber-950/40 border border-amber-800/50 rounded-xl px-3.5 py-2.5">
              Supabase belum dikonfigurasi. Upload file dinonaktifkan; gunakan opsi URL gambar.
            </div>
          )}

          <label
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isSupabaseConfigured()) return;
              selectThumbnailFile(e.dataTransfer.files?.[0]);
            }}
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#09090b] border border-dashed rounded-xl p-4 transition-colors ${
              !isSupabaseConfigured()
                ? 'border-zinc-800 opacity-50 cursor-not-allowed'
                : thumbError
                ? 'border-red-500/60 hover:border-red-400 cursor-pointer'
                : 'border-[#27272a] hover:border-zinc-500 cursor-pointer'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-300 shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-white">
                  Klik untuk pilih gambar atau tarik file ke sini
                </div>
                <div className="text-xs text-zinc-500">
                  Rasio 16:9 disarankan (1280×720). JPG, JPEG, PNG, atau WebP, maks 2 MB.
                </div>
              </div>
            </div>

            <span className="px-3.5 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs font-medium text-zinc-200 shrink-0">
              Pilih File
            </span>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              disabled={!isSupabaseConfigured()}
              onChange={(e) => {
                selectThumbnailFile(e.target.files?.[0]);
                e.target.value = '';
              }}
              className="hidden"
            />
          </label>

          {thumbError && (
            <div className="text-xs text-red-300 bg-red-950/40 border border-red-800/50 rounded-xl px-3.5 py-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{thumbError}</span>
            </div>
          )}

          {(thumbPreview || thumbnailUrl) && (
            <div className="flex items-center justify-between gap-4 bg-[#09090b] border border-[#27272a] rounded-xl p-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-28 aspect-video rounded-lg bg-black overflow-hidden border border-[#27272a] shrink-0">
                  <SafeImage
                    src={thumbPreview || thumbnailUrl}
                    alt="Preview thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs font-medium text-white truncate flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">
                      {thumbFile ? thumbFile.name : 'Thumbnail aktif'}
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 truncate">
                    {thumbFile
                      ? `${(thumbFile.size / (1024 * 1024)).toFixed(2)} MB — diunggah saat disimpan`
                      : thumbnailUrl}
                  </div>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="icon"
                onClick={() => {
                  if (thumbFile) {
                    clearThumbnailSelection();
                  } else {
                    setThumbnailUrl('');
                  }
                }}
                title="Hapus thumbnail"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {showThumbUrlInput && (
            <div className="pt-1 space-y-1">
              <Input
                type="text"
                placeholder="https://... (Kosongkan untuk thumbnail otomatis)"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                className="font-mono"
              />
              {thumbFile && thumbnailUrl && (
                <p className="text-xs text-amber-400">
                  Catatan: File yang diunggah di atas akan diprioritaskan dibanding URL ini.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-xs font-medium text-zinc-300">
              Deskripsi Strategi (Markdown)
            </label>
            <SegmentedTabs
              options={DESC_TAB_OPTIONS}
              value={descTab}
              onChange={setDescTab}
              size="sm"
            />
          </div>

          {descTab === 'edit' ? (
            <Textarea
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="font-mono text-xs"
            />
          ) : (
            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 min-h-[180px]">
              <MarkdownRenderer content={description} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272a]">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSaving}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Menyimpan...' : 'Simpan Referensi'}
          </Button>
        </div>
      </form>
    </div>
  );
};
