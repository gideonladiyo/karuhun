import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Lock,
  Video,
} from 'lucide-react';
import {
  AdminReferenceItem,
  fetchAdminReferences,
  toggleReferencePublish,
  softDeleteReference,
} from '@/data/static/reffsData';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  Input,
  Select,
  StatusBadge,
  ConfirmDialog,
  ToastMessage,
} from '@/components/admin/AdminPrimitives';
import { ReferenceForm } from './ReferenceForm';
import { ReferencePreviewModal } from './ReferencePreviewModal';

type ScopeFilter = 'all' | 'mine';

const SCOPE_OPTIONS: readonly SegmentedTabOption<ScopeFilter>[] = [
  { value: 'all', label: 'Semua' },
  { value: 'mine', label: 'Milik Saya' },
];

export interface ReferencesTabProps {
  currentUserId: string;
  isSuperadmin: boolean;
  onNotify: (tone: ToastMessage['tone'], text: string) => void;
  onTrashChanged?: () => void;
}

export const ReferencesTab: React.FC<ReferencesTabProps> = ({
  currentUserId,
  isSuperadmin,
  onNotify,
  onTrashChanged,
}) => {
  const [viewMode, setViewMode] = useState<'roster' | 'editor'>('roster');
  const [references, setReferences] = useState<AdminReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');

  const [editingRef, setEditingRef] = useState<AdminReferenceItem | null>(null);
  const [previewRef, setPreviewRef] = useState<AdminReferenceItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminReferenceItem | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const list = await fetchAdminReferences();
    setReferences(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManage = (item: AdminReferenceItem): boolean => {
    if (isSuperadmin) return true;
    return Boolean(item.ownerId && item.ownerId === currentUserId);
  };

  const handleOpenCreate = () => {
    setEditingRef(null);
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleOpenEdit = (item: AdminReferenceItem) => {
    if (!canManage(item)) {
      onNotify('error', 'Anda hanya dapat mengedit referensi yang Anda tambahkan sendiri.');
      return;
    }
    setEditingRef(item);
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleTogglePublish = async (item: AdminReferenceItem) => {
    if (!canManage(item)) {
      onNotify('error', 'Anda hanya dapat mengubah status referensi milik sendiri.');
      return;
    }
    const nextStatus = !(item.isPublished !== false);
    const res = await toggleReferencePublish(item.id, nextStatus);
    if (!res.success) {
      onNotify('error', res.error || 'Gagal mengubah status publikasi.');
      return;
    }
    onNotify(
      'success',
      nextStatus ? 'Referensi dipublikasikan.' : 'Referensi diubah ke Draft.'
    );
    await loadData();
  };

  const handleConfirmSoftDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await softDeleteReference(deleteTarget.id, currentUserId);
    setDeleting(false);

    if (!res.success) {
      onNotify('error', res.error || 'Gagal menghapus referensi.');
      return;
    }

    setDeleteTarget(null);
    onNotify('success', 'Referensi dipindahkan ke Trash.');
    onTrashChanged?.();
    await loadData();
  };

  if (viewMode === 'editor') {
    return (
      <ReferenceForm
        editingRef={editingRef}
        currentUserId={currentUserId}
        onCancel={() => {
          setViewMode('roster');
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }}
        onSaved={async (msg) => {
          setViewMode('roster');
          onNotify('success', msg);
          await loadData();
          window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        }}
      />
    );
  }

  const filteredReferences = references.filter((r) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      r.title.toLowerCase().includes(q) ||
      r.subcategory.toLowerCase().includes(q) ||
      (r.author || '').toLowerCase().includes(q);
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && r.isPublished !== false) ||
      (statusFilter === 'draft' && r.isPublished === false);
    const matchesScope =
      scopeFilter === 'all' || r.ownerId === currentUserId;
    return matchesSearch && matchesCategory && matchesStatus && matchesScope;
  });

  const formatCategory = (cat: AdminReferenceItem['category']) =>
    cat === 'guild_challenge' ? 'Guild Challenge' : cat === 'warzone' ? 'Warzone' : 'PPC';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="minimal-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                placeholder="Cari judul, subkategori, atau author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>

            <SegmentedTabs
              options={SCOPE_OPTIONS}
              value={scopeFilter}
              onChange={setScopeFilter}
              size="sm"
              ariaLabel="Filter kepemilikan"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-auto text-xs py-2"
            >
              <option value="all">Semua Kategori</option>
              <option value="guild_challenge">Guild Challenge</option>
              <option value="warzone">Warzone</option>
              <option value="ppc">PPC</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-auto text-xs py-2"
            >
              <option value="all">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </Select>

            <Button type="button" size="sm" onClick={handleOpenCreate}>
              <Plus className="w-4 h-4" />
              <span>Tambah Referensi</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="minimal-card p-4 sm:p-6">
        {loading ? (
          <div className="py-12 text-center text-xs text-zinc-400">
            Memuat daftar referensi...
          </div>
        ) : filteredReferences.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-[#18181b] text-zinc-300">
                <Video className="w-5 h-5" />
              </EmptyMedia>
              <EmptyTitle className="text-white text-base">
                Tidak ada referensi yang cocok
              </EmptyTitle>
              <EmptyDescription className="text-zinc-400 text-xs">
                Ubah filter pencarian di atas atau tambahkan referensi video baru.
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
                  <th className="pb-3 px-3 font-semibold">Kategori</th>
                  <th className="pb-3 px-3 font-semibold">Author Publik</th>
                  {isSuperadmin && (
                    <th className="pb-3 px-3 font-semibold">Pengunggah</th>
                  )}
                  <th className="pb-3 px-3 font-semibold text-center">Status</th>
                  <th className="pb-3 px-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredReferences.map((refItem) => {
                  const editable = canManage(refItem);
                  const isMine = refItem.ownerId === currentUserId;
                  return (
                    <tr
                      key={refItem.id}
                      className="hover:bg-[#18181b]/60 transition-colors"
                    >
                      <td className="py-3 px-3">
                        <div className="w-16 h-10 rounded-lg bg-black border border-[#27272a] overflow-hidden">
                          <SafeImage
                            src={refItem.thumbnailUrl}
                            alt={refItem.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-heading font-semibold text-white max-w-xs truncate">
                          {refItem.title}
                        </div>
                        <div className="text-xs text-zinc-500">
                          {refItem.subcategory}
                          {isMine && !isSuperadmin && (
                            <span className="ml-2 text-emerald-400">• Milik saya</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-zinc-300">
                        {formatCategory(refItem.category)}
                      </td>

                      <td className="py-3 px-3 text-zinc-300 font-medium">
                        {refItem.author || 'Karuhun Tactical'}
                      </td>

                      {isSuperadmin && (
                        <td className="py-3 px-3 text-zinc-400">
                          {refItem.ownerName ||
                            refItem.ownerEmail ||
                            (refItem.ownerId
                              ? `${refItem.ownerId.slice(0, 8)}…`
                              : '—')}
                        </td>
                      )}

                      <td className="py-3 px-3 text-center">
                        {editable ? (
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(refItem)}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            title="Klik untuk ubah status Published / Draft"
                          >
                            <StatusBadge isPublished={refItem.isPublished !== false} />
                          </button>
                        ) : (
                          <StatusBadge isPublished={refItem.isPublished !== false} />
                        )}
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setPreviewRef(refItem)}
                            title="Preview video dan strategi"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>

                          {editable ? (
                            <>
                              <Button
                                type="button"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleOpenEdit(refItem)}
                                title="Edit referensi"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setDeleteTarget(refItem)}
                                title="Pindahkan ke Trash"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-500 text-xs"
                              title="Ditambahkan oleh admin lain (hanya lihat)"
                            >
                              <Lock className="w-3 h-3" />
                              <span>Read-only</span>
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmSoftDelete}
        title="Pindahkan ke Trash?"
        description={
          deleteTarget ? (
            <span>
              Referensi <strong className="text-white">{deleteTarget.title}</strong> akan
              disembunyikan dari halaman publik dan dipindahkan ke Trash. Penghapusan
              permanen hanya dapat dilakukan oleh Superadmin.
            </span>
          ) : null
        }
        confirmLabel="Pindahkan ke Trash"
        tone="danger"
        loading={deleting}
      />
    </div>
  );
};
