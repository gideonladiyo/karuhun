import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Eye, Plus, Star, Trash2, AlertTriangle } from 'lucide-react';
import {
  AdminReferenceItem,
  CATEGORIES_CONFIG,
  ReferenceItem,
  fetchAdminReferences,
  getPlatformThumbnail,
} from '@/data/static/reffsData';
import {
  fetchFeaturedIdsForAdmin,
  formatTimeLeft,
  getFeaturedWeekRange,
  getFeaturedWeekStart,
  removeFeatured,
  setFeaturedSlot,
  shiftFeaturedWeek,
} from '@/services/featuredReferences';
import { CATEGORY_STYLES } from '@/components/reffs/YoutubeReferenceCard';
import { FEATURED_MODES } from '@/components/reffs/WeeklyFeatured';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { Badge, Select, ToastMessage } from '@/components/admin/AdminPrimitives';
import { ReferencePreviewModal } from './ReferencePreviewModal';
import { cn } from '@/lib/utils';

type Category = ReferenceItem['category'];

export interface FeaturedTabProps {
  onNotify: (tone: ToastMessage['tone'], text: string) => void;
}

const sameSub = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();

function orderedSubcategories(category: Category, refs: AdminReferenceItem[]): string[] {
  const config: string[] = CATEGORIES_CONFIG[category]?.subcategories ?? [];
  const present = Array.from(new Set(refs.filter((r) => r.category === category).map((r) => r.subcategory)));
  const rank = (s: string) => {
    const i = config.findIndex((c) => sameSub(c, s));
    return i === -1 ? config.length : i;
  };
  return present.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

function formatWib(date: Date): string {
  return date.toLocaleString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

const Thumb: React.FC<{ item: ReferenceItem }> = ({ item }) => {
  const src = getPlatformThumbnail(item.platform || 'youtube', item.videoId, item.thumbnailUrl);
  return (
    <div className="w-20 aspect-video flex-shrink-0 rounded-lg bg-black border border-[#27272a] overflow-hidden">
      {src && <SafeImage src={src} alt="" className="w-full h-full object-cover" />}
    </div>
  );
};

export const FeaturedTab: React.FC<FeaturedTabProps> = ({ onNotify }) => {
  const currentWeek = getFeaturedWeekStart();
  const [weekStart, setWeekStart] = useState<string>(currentWeek);
  const [allRefs, setAllRefs] = useState<AdminReferenceItem[]>([]);
  const [featuredIds, setFeaturedIds] = useState<string[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [previewRef, setPreviewRef] = useState<ReferenceItem | null>(null);
  const [draft, setDraft] = useState<Record<Category, { sub: string; refId: string }>>({
    warzone: { sub: '', refId: '' },
    ppc: { sub: '', refId: '' },
    guild_challenge: { sub: '', refId: '' },
  });

  const load = useCallback(async () => {
    setLoading(true);
    const [refs, featured] = await Promise.all([fetchAdminReferences(), fetchFeaturedIdsForAdmin(weekStart)]);
    setAllRefs(refs);
    setFeaturedIds(featured.ids);
    setLoadError(featured.error ?? null);
    setLoading(false);
  }, [weekStart]);

  useEffect(() => {
    load();
  }, [load]);

  const published = useMemo(() => allRefs.filter((r) => r.isPublished !== false), [allRefs]);
  const { start, end } = getFeaturedWeekRange(weekStart);
  const weekOffset = Math.round((start.getTime() - getFeaturedWeekRange(currentWeek).start.getTime()) / (7 * 864e5));
  const weekLabel =
    weekOffset === 0 ? 'Minggu ini' : weekOffset === 1 ? 'Minggu depan' : weekOffset === -1 ? 'Minggu lalu' : null;

  const slots = featuredIds.map((id) => ({ id, ref: allRefs.find((r) => r.id === id) }));
  const missing = slots.filter((s) => !s.ref);

  const runMutation = async (action: () => Promise<{ success: boolean; error?: string }>, okText: string) => {
    setBusy(true);
    const res = await action();
    setBusy(false);
    if (!res.success) {
      onNotify('error', res.error || 'Gagal menyimpan featured.');
      return;
    }
    onNotify('success', okText);
    await load();
  };

  const handleAdd = (mode: Category) => {
    const { refId } = draft[mode];
    if (!refId) return;
    setDraft((d) => ({ ...d, [mode]: { sub: '', refId: '' } }));
    runMutation(() => setFeaturedSlot(weekStart, refId), 'Slot featured ditambahkan.');
  };

  const handleReplace = (oldId: string, newId: string) =>
    runMutation(() => setFeaturedSlot(weekStart, newId, oldId), 'Video featured diganti.');

  const handleRemove = (id: string) => runMutation(() => removeFeatured(weekStart, id), 'Slot featured dihapus.');

  const isPast = weekOffset < 0;

  return (
    <div className="space-y-4">
      <div className="minimal-card p-4 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-base sm:text-lg text-white">
              Featured Mingguan (Khusus Superadmin)
            </h2>
            <p className="text-xs text-zinc-400 max-w-2xl">
              Pilih satu video untuk setiap zona, elemen, atau boss yang aktif minggu itu. Featured berlaku
              Senin 12:00 WIB sampai Senin berikutnya 12:00 WIB, lalu otomatis berganti. Label slot diambil dari
              subkategori video.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Minggu sebelumnya"
              onClick={() => setWeekStart((w) => shiftFeaturedWeek(w, -1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[220px] text-center px-3 py-1.5 rounded-xl bg-[#09090b] border border-[#27272a]">
              <div className="text-xs font-heading font-bold text-white">
                {weekLabel ?? `Minggu ${new Date(`${weekStart}T00:00:00Z`).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}`}
              </div>
              <div className="text-[11px] text-zinc-400">
                {formatWib(start)} – {formatWib(end)} WIB
              </div>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              aria-label="Minggu berikutnya"
              onClick={() => setWeekStart((w) => shiftFeaturedWeek(w, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {weekOffset === 0 && (
          <p className="text-xs text-zinc-400">
            Reset berikutnya dalam <strong className="text-white">{formatTimeLeft(end)}</strong>. Kamu bisa
            menyiapkan featured minggu depan lebih awal lewat tombol panah.
          </p>
        )}
        {isPast && (
          <p className="text-xs text-amber-300/90">
            Minggu ini sudah lewat dan tidak lagi tampil di halaman publik. Perubahan hanya untuk arsip.
          </p>
        )}

        {loadError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>
              Gagal memuat featured: {loadError}. Pastikan migration{' '}
              <code className="text-white">supabase/migrations/20261105_weekly_featured.sql</code> sudah dijalankan.
            </span>
          </div>
        )}

        {missing.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/50">
            <p className="text-xs text-amber-200">
              Video berikut sudah tidak tersedia (dihapus ke Trash) sehingga tidak tampil di publik:
            </p>
            {missing.map((s) => (
              <div key={s.id} className="flex items-center justify-between gap-3 text-xs text-zinc-300">
                <code className="truncate">{s.id}</code>
                <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => handleRemove(s.id)}>
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus
                </Button>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">Memuat featured...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {FEATURED_MODES.map((mode) => {
              const order = orderedSubcategories(mode, allRefs);
              const modeSlots = slots
                .filter((s): s is { id: string; ref: AdminReferenceItem } => !!s.ref && s.ref.category === mode)
                .sort((x, y) => order.indexOf(x.ref.subcategory) - order.indexOf(y.ref.subcategory));
              const usedSubs = modeSlots.map((s) => s.ref.subcategory);
              const availableSubs = orderedSubcategories(mode, published).filter(
                (sub) => !usedSubs.some((u) => sameSub(u, sub))
              );
              const draftSub = draft[mode].sub;
              const draftOptions = published.filter((r) => r.category === mode && draftSub && sameSub(r.subcategory, draftSub));

              return (
                <section key={mode} className="rounded-2xl bg-[#09090b] border border-[#27272a] p-4 space-y-4">
                  <header className="flex items-center justify-between">
                    <h3 className="inline-flex items-center gap-2 font-heading font-bold text-sm text-white uppercase tracking-wider">
                      <span className={cn('w-2 h-2 rounded-full', CATEGORY_STYLES[mode].dot)} />
                      {CATEGORY_STYLES[mode].label}
                    </h3>
                    <span className="text-xs text-zinc-500">{modeSlots.length} slot</span>
                  </header>

                  {modeSlots.length === 0 && (
                    <p className="text-xs text-zinc-500">
                      Belum ada featured. Halaman publik akan menampilkan video terbaru dengan label "Latest".
                    </p>
                  )}

                  <div className="space-y-3">
                    {modeSlots.map(({ id, ref }) => {
                      const alternatives = published.filter(
                        (r) => r.category === mode && sameSub(r.subcategory, ref.subcategory)
                      );
                      return (
                        <div key={id} className="space-y-2 pb-3 border-b border-[#27272a] last:border-0 last:pb-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1.5 text-xs font-tech font-bold text-zinc-200">
                              <Star className="w-3 h-3 text-amber-400" />
                              {ref.subcategory}
                            </span>
                            {ref.isPublished === false && <Badge tone="warning">Draft · tidak tampil</Badge>}
                          </div>
                          <div className="flex items-center gap-3">
                            <Thumb item={ref} />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-heading font-semibold text-white line-clamp-2">{ref.title}</p>
                              <p className="text-[11px] text-zinc-500 truncate">{ref.author || 'Karuhun Tactical'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              aria-label={`Ganti video ${ref.subcategory}`}
                              value={id}
                              disabled={busy || alternatives.length <= 1}
                              onChange={(e) => handleReplace(id, e.target.value)}
                              className="text-xs py-2"
                            >
                              {!alternatives.some((r) => r.id === id) && <option value={id}>{ref.title}</option>}
                              {alternatives.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.title}
                                </option>
                              ))}
                            </Select>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              aria-label="Preview"
                              onClick={() => setPreviewRef(ref)}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              size="icon"
                              aria-label={`Hapus slot ${ref.subcategory}`}
                              disabled={busy}
                              onClick={() => handleRemove(id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {availableSubs.length > 0 ? (
                    <div className="space-y-2 pt-3 border-t border-dashed border-[#27272a]">
                      <p className="text-[11px] font-tech font-bold text-zinc-500 uppercase tracking-wider">Tambah slot</p>
                      <Select
                        aria-label="Pilih subkategori"
                        value={draftSub}
                        disabled={busy}
                        onChange={(e) => {
                          const sub = e.target.value;
                          const only = published.filter((r) => r.category === mode && sameSub(r.subcategory, sub));
                          setDraft((d) => ({ ...d, [mode]: { sub, refId: only.length === 1 ? only[0].id : '' } }));
                        }}
                        className="text-xs py-2"
                      >
                        <option value="">Pilih zona / elemen / boss…</option>
                        {availableSubs.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </Select>
                      {draftSub && (
                        <Select
                          aria-label="Pilih video"
                          value={draft[mode].refId}
                          disabled={busy}
                          onChange={(e) => setDraft((d) => ({ ...d, [mode]: { ...d[mode], refId: e.target.value } }))}
                          className="text-xs py-2"
                        >
                          <option value="">Pilih video…</option>
                          {draftOptions.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.title}
                            </option>
                          ))}
                        </Select>
                      )}
                      <Button
                        type="button"
                        size="sm"
                        className="w-full"
                        disabled={busy || !draft[mode].refId || Boolean(loadError)}
                        onClick={() => handleAdd(mode)}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah ke featured
                      </Button>
                    </div>
                  ) : (
                    <p className="pt-3 border-t border-dashed border-[#27272a] text-[11px] text-zinc-500">
                      Semua subkategori yang punya video published sudah terisi.
                    </p>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>

      <ReferencePreviewModal reference={previewRef} onClose={() => setPreviewRef(null)} />
    </div>
  );
};
