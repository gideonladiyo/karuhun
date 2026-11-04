import React, { useEffect, useState, useCallback } from 'react';
import { RotateCcw, Trash2, Eye } from 'lucide-react';
import {
  AdminReferenceItem,
  fetchTrashedReferences,
  restoreReference,
  purgeReference,
} from '@/data/static/reffsData';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import { ConfirmDialog, ToastMessage } from '@/components/admin/AdminPrimitives';
import { ReferencePreviewModal } from './ReferencePreviewModal';

export interface TrashTabProps {
  onNotify: (tone: ToastMessage['tone'], text: string) => void;
}

export const TrashTab: React.FC<TrashTabProps> = ({ onNotify }) => {
  const [items, setItems] = useState<AdminReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewRef, setPreviewRef] = useState<AdminReferenceItem | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<AdminReferenceItem | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadTrash = useCallback(async () => {
    setLoading(true);
    const list = await fetchTrashedReferences();
    setItems(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadTrash();
  }, [loadTrash]);

  const handleRestore = async (item: AdminReferenceItem) => {
    setBusyId(item.id);
    const res = await restoreReference(item.id);
    setBusyId(null);

    if (!res.success) {
      onNotify('error', res.error || 'Gagal memulihkan referensi.');
      return;
    }

    onNotify('success', `Referensi "${item.title}" berhasil dipulihkan.`);
    await loadTrash();
  };

  const handleConfirmPurge = async () => {
    if (!purgeTarget) return;
    setBusyId(purgeTarget.id);
    const res = await purgeReference(purgeTarget.id, purgeTarget.thumbnailUrl);
    setBusyId(null);

    if (!res.success) {
      onNotify('error', res.error || 'Gagal menghapus permanen.');
      return;
    }

    const removedTitle = purgeTarget.title;
    setPurgeTarget(null);
    onNotify('success', `Referensi "${removedTitle}" dihapus secara permanen.`);
    await loadTrash();
  };

  return (
    <div className="space-y-4">
      <div className="minimal-card p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272a] pb-4">
          <div>
            <h2 className="font-heading font-bold text-base sm:text-lg text-white">
              Trash Referensi (Khusus Superadmin)
            </h2>
            <p className="text-xs text-zinc-400">
              Item di bawah ini telah dihapus oleh admin. Kamu dapat memulihkannya atau
              menghapusnya secara permanen beserta file thumbnail di Supabase Storage.
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={loadTrash}>
            Muat Ulang
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Memuat daftar Trash...
          </div>
        ) : items.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-[#18181b] text-zinc-300">
                <Trash2 className="w-5 h-5" />
              </EmptyMedia>
              <EmptyTitle className="text-white text-base">Trash kosong</EmptyTitle>
              <EmptyDescription className="text-zinc-400 text-xs">
                Tidak ada referensi yang sedang berada di Trash.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#27272a] text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Thumbnail</th>
                  <th className="pb-3 px-3 font-semibold">Judul</th>
                  <th className="pb-3 px-3 font-semibold">Author Publik</th>
                  <th className="pb-3 px-3 font-semibold">Pengunggah</th>
                  <th className="pb-3 px-3 font-semibold">Waktu Dihapus</th>
                  <th className="pb-3 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {items.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[#18181b]/60 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="w-16 h-10 rounded-lg bg-black border border-[#27272a] overflow-hidden">
                        <SafeImage
                          src={item.thumbnailUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-heading font-semibold text-white max-w-xs truncate">
                        {item.title}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {item.category} • {item.subcategory}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-zinc-300">
                      {item.author || 'Karuhun Tactical'}
                    </td>

                    <td className="py-3 px-3 text-zinc-400">
                      {item.ownerName ||
                        item.ownerEmail ||
                        (item.ownerId ? `${item.ownerId.slice(0, 8)}…` : '—')}
                    </td>

                    <td className="py-3 px-3 text-zinc-400 font-mono">
                      {item.deletedAt
                        ? new Date(item.deletedAt).toLocaleString('id-ID')
                        : '—'}
                    </td>

                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewRef(item)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => handleRestore(item)}
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Pulihkan</span>
                        </Button>

                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={busyId === item.id}
                          onClick={() => setPurgeTarget(item)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Permanen</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ReferencePreviewModal
        reference={previewRef}
        onClose={() => setPreviewRef(null)}
      />

      <ConfirmDialog
        open={Boolean(purgeTarget)}
        onClose={() => setPurgeTarget(null)}
        onConfirm={handleConfirmPurge}
        title="Hapus Permanen dari Database?"
        description={
          purgeTarget ? (
            <span>
              Referensi <strong className="text-white">{purgeTarget.title}</strong> beserta
              tips dan file thumbnail di Supabase Storage akan dihapus permanen dan{' '}
              <strong className="text-red-300">tidak dapat dikembalikan</strong>.
            </span>
          ) : null
        }
        confirmLabel="Hapus Permanen"
        tone="danger"
        requireText="HAPUS"
        loading={ Boolean(purgeTarget && busyId === purgeTarget.id) }
      />
    </div>
  );
};
