import React, { useState, useEffect } from 'react';
import {
  getStoredReferences,
  saveStoredReference,
  deleteStoredReference,
  toggleStoredReferencePublish,
  extractYoutubeVideoId,
  CATEGORIES_CONFIG,
  ReferenceItem
} from '../data/reffs_data';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Lock,
  Key,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  X,
  Search,
  Video,
  Shield,
  Swords,
  Skull,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  ExternalLink,
  Save,
  Globe
} from 'lucide-react';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'karuhun2026';

export const AdminPage: React.FC = () => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karuhun_admin_authenticated') === 'true';
  });

  const [passcode, setPasscode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // Data State
  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'draft'>('all');

  // Form Modal State
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null);

  // Form Data State
  const [formCategory, setFormCategory] = useState<'guild_challenge' | 'warzone' | 'ppc'>('guild_challenge');
  const [formSubcategory, setFormSubcategory] = useState<string>('Zone Boss');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formAuthor, setFormAuthor] = useState<string>('Karuhun Corps');
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);
  const [formTips, setFormTips] = useState<string[]>(['']);
  const [formTab, setFormTab] = useState<'edit' | 'preview'>('edit');

  // Live Preview Modal State
  const [previewItem, setPreviewItem] = useState<ReferenceItem | null>(null);

  useEffect(() => {
    setReferences(getStoredReferences());
  }, []);

  // Update subcategory default when category changes in form
  useEffect(() => {
    const subcats = CATEGORIES_CONFIG[formCategory].subcategories;
    if (!subcats.includes(formSubcategory)) {
      setFormSubcategory(subcats[0]);
    }
  }, [formCategory]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === ADMIN_PASSCODE) {
      sessionStorage.setItem('karuhun_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      setPasscode('');
    } else {
      setLoginError('Passcode Kunci Admin Salah! Akses Ditolak.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('karuhun_admin_authenticated');
    setIsAuthenticated(false);
  };

  const handleOpenCreateForm = () => {
    setEditingItem(null);
    setFormCategory('guild_challenge');
    setFormSubcategory('Zone Boss');
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormDescription('### Rotasi & Strategi Run\nTuliskan deskripsi strategi menggunakan **Markdown** di sini.');
    setFormAuthor('Karuhun Corps');
    setFormIsPublished(true);
    setFormTips(['Poin tips strategi pertama']);
    setFormTab('edit');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: ReferenceItem) => {
    setEditingItem(item);
    setFormCategory(item.category);
    setFormSubcategory(item.subcategory);
    setFormTitle(item.title);
    setFormYoutubeUrl(item.youtubeUrl);
    setFormDescription(item.description);
    setFormAuthor(item.author || 'Karuhun Corps');
    setFormIsPublished(item.isPublished !== false);
    setFormTips(item.tips && item.tips.length > 0 ? [...item.tips] : ['']);
    setFormTab('edit');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      alert('Judul Referensi tidak boleh kosong!');
      return;
    }
    if (!formYoutubeUrl.trim()) {
      alert('Link YouTube tidak boleh kosong!');
      return;
    }

    const videoId = extractYoutubeVideoId(formYoutubeUrl);
    if (!videoId) {
      alert('Link YouTube tidak valid! Pastikan link berupa URL YouTube.');
      return;
    }

    const cleanedTips = formTips.filter((t) => t.trim() !== '');

    const newItem: ReferenceItem = {
      id: editingItem ? editingItem.id : `ref-${Date.now()}`,
      category: formCategory,
      subcategory: formSubcategory,
      title: formTitle,
      youtubeUrl: formYoutubeUrl,
      videoId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      description: formDescription,
      tips: cleanedTips,
      author: formAuthor || 'Karuhun Corps',
      dateAdded: editingItem ? editingItem.dateAdded : new Date().toISOString().split('T')[0],
      isPublished: formIsPublished
    };

    const updated = saveStoredReference(newItem);
    setReferences(updated);
    setIsFormOpen(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus referensi "${title}"?`)) {
      const updated = deleteStoredReference(id);
      setReferences(updated);
    }
  };

  const handleTogglePublish = (id: string) => {
    const updated = toggleStoredReferencePublish(id);
    setReferences(updated);
  };

  const handleAddTipField = () => {
    setFormTips([...formTips, '']);
  };

  const handleUpdateTipField = (index: number, value: string) => {
    const next = [...formTips];
    next[index] = value;
    setFormTips(next);
  };

  const handleRemoveTipField = (index: number) => {
    setFormTips(formTips.filter((_, idx) => idx !== index));
  };

  // Filtered List for Table
  const filteredReferences = references.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus =
      selectedStatus === 'all' ||
      (selectedStatus === 'published' && item.isPublished !== false) ||
      (selectedStatus === 'draft' && item.isPublished === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // ====================================================================
  // SCREEN 1: LOGIN FORM UNTUK UNAUTHENTICATED ADMIN
  // ====================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
        <div className="minimal-card w-full max-w-md p-6 sm:p-8 space-y-6 border border-[#27272a]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center mx-auto shadow-lg">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
              ADMIN PANEL LOGIN
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Sistem Manajemen Konten REFFS Karuhun Guild
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase tracking-wider block">
                MASUKKAN PASSCODE ADMIN
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Passcode Kunci..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-10 py-3 focus:outline-none focus:border-white font-sans"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-tech text-zinc-500 hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs font-sans">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-all shadow-md uppercase tracking-wider"
            >
              MASUK KE DASHBOARD ADMIN
            </button>
          </form>

          <p className="text-[11px] font-tech text-zinc-500 text-center">
            Default Passcode: <code className="text-zinc-300 font-bold">karuhun2026</code>
          </p>
        </div>
      </div>
    );
  }

  // ====================================================================
  // SCREEN 2: ADMIN DASHBOARD PANEL (AUTHENTICATED)
  // ====================================================================
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Admin Top Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white text-black text-xs font-tech font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>ADMIN PANEL • REFFS MANAGEMENT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              MANAJEMEN KONTEN <span className="text-zinc-500 font-normal">REFFS</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Tambah, edit, publikasikan, atau simpan draft video referensi gameplay kompetitif
            </p>
          </div>

          {/* Action Header Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleOpenCreateForm}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>TAMBAH REFERENSI BARU</span>
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-[#121215] hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-[#27272a] hover:border-red-800 font-heading font-bold text-xs transition-all shadow-sm"
              title="Logout Admin"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline-block">LOGOUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="minimal-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Referensi / Subkategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Kategori Utama</option>
              <option value="guild_challenge">Guild Challenge</option>
              <option value="warzone">Warzone</option>
              <option value="ppc">PPC (Phantom Pain Cage)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Status (Published &amp; Draft)</option>
              <option value="published">Status: Published Sahaja</option>
              <option value="draft">Status: Draft (Disembunyikan)</option>
            </select>
          </div>

        </div>
      </div>

      {/* References Table List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-tech text-zinc-400">
          <span className="font-bold uppercase tracking-wider">
            TOTAL DATA REFERENSI ({filteredReferences.length})
          </span>
          <span>Daftar item aktif &amp; draft</span>
        </div>

        {filteredReferences.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm">
            Tidak ada referensi yang sesuai filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReferences.map((item) => {
              const isPub = item.isPublished !== false;
              return (
                <div
                  key={item.id}
                  className="minimal-card p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#27272a] hover:border-zinc-500 transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Thumbnail Preview */}
                    <div className="relative w-24 h-14 rounded-lg bg-black border border-[#27272a] overflow-hidden flex-shrink-0">
                      <img
                        src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Title & Metadata */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-[10px] font-tech font-bold px-2 py-0.5 rounded uppercase">
                          {CATEGORIES_CONFIG[item.category].label}
                        </span>
                        <span className="bg-white text-black text-[10px] font-tech font-bold px-2 py-0.5 rounded uppercase">
                          {item.subcategory}
                        </span>
                        <span className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded uppercase ${
                          isPub ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {isPub ? 'PUBLISHED' : 'DRAFT'}
                        </span>
                      </div>

                      <h3 className="font-heading font-bold text-sm sm:text-base text-white">
                        {item.title}
                      </h3>

                      <p className="text-xs font-sans text-zinc-400 line-clamp-1">
                        Author: {item.author || 'Karuhun Corps'} • Added: {item.dateAdded || 'Latest'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {/* Live Preview Button */}
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] text-xs font-tech font-bold transition-all flex items-center space-x-1"
                      title="Live Preview Tampilan User"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </button>

                    {/* Toggle Status Button */}
                    <button
                      onClick={() => handleTogglePublish(item.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all border ${
                        isPub
                          ? 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-800'
                          : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border-emerald-800'
                      }`}
                      title={isPub ? 'Ubah ke Draft' : 'Publikasikan'}
                    >
                      {isPub ? 'Draft-kan' : 'Publish'}
                    </button>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditForm(item)}
                      className="p-2 rounded-xl bg-[#121215] hover:bg-white text-zinc-300 hover:text-black border border-[#27272a] transition-all"
                      title="Edit Referensi"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(item.id, item.title)}
                      className="p-2 rounded-xl bg-[#121215] hover:bg-red-950 text-zinc-400 hover:text-red-300 border border-[#27272a] hover:border-red-800 transition-all"
                      title="Hapus Referensi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT REFERENCE MODAL FORM */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div
            className="minimal-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 relative border border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Form Button */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-[#121215] hover:bg-white text-zinc-400 hover:text-black border border-[#27272a] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1 pr-10">
              <span className="text-xs font-tech text-zinc-400 font-bold uppercase tracking-wider block">
                {editingItem ? 'EDIT REFERENSI' : 'TAMBAH REFERENSI BARU'}
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white">
                {editingItem ? editingItem.title : 'Form Input Referensi Gameplay'}
              </h2>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-5">
              
              {/* Category & Subcategory Select Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Kategori Utama
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value="guild_challenge">Guild Challenge</option>
                    <option value="warzone">Warzone</option>
                    <option value="ppc">PPC (Phantom Pain Cage)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Subkategori
                  </label>
                  <select
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    {CATEGORIES_CONFIG[formCategory].subcategories.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  Judul Referensi
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Zone Boss 1.2M Run / Warzone Nihil High Score"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-white font-sans"
                  required
                />
              </div>

              {/* YouTube URL Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  Link YouTube (URL)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=XXXXX atau https://youtu.be/XXXXX"
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-white font-sans"
                  required
                />
              </div>

              {/* Author & Published Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div className="space-y-1.5">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Author / Contributor Name
                  </label>
                  <input
                    type="text"
                    placeholder="Karuhun Corps"
                    value={formAuthor}
                    onChange={(e) => setFormAuthor(e.target.value)}
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-2.5 focus:outline-none focus:border-white font-sans"
                  />
                </div>

                <div className="pt-5 flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="formIsPublished"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-white rounded cursor-pointer"
                  />
                  <label htmlFor="formIsPublished" className="text-xs font-tech text-white font-bold cursor-pointer uppercase">
                    Publikasikan Langsung (Published)
                  </label>
                </div>
              </div>

              {/* Markdown Description Field with Live Preview Tab */}
              <div className="space-y-2 border-t border-[#27272a] pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Deskripsi Referensi (Mendukung Format Markdown)
                  </label>
                  <div className="flex items-center space-x-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setFormTab('edit')}
                      className={`px-3 py-1 rounded-lg text-xs font-tech font-bold transition-all ${
                        formTab === 'edit' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Edit Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormTab('preview')}
                      className={`px-3 py-1 rounded-lg text-xs font-tech font-bold transition-all ${
                        formTab === 'preview' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Preview Teks
                    </button>
                  </div>
                </div>

                {formTab === 'edit' ? (
                  <textarea
                    rows={5}
                    placeholder="Tulis deskripsi dengan Markdown... Contoh: # Judul Header, **teks tebal**, - Poin list, > Quote"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full bg-[#09090b] text-xs font-mono text-white border border-[#27272a] rounded-xl p-3 focus:outline-none focus:border-white leading-relaxed"
                  />
                ) : (
                  <div className="bg-black p-4 rounded-xl border border-[#27272a] min-h-[120px]">
                    <MarkdownRenderer content={formDescription || '*Belum ada teks deskripsi.*'} />
                  </div>
                )}
              </div>

              {/* Tips & Strategy List Field */}
              <div className="space-y-3 border-t border-[#27272a] pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Tips &amp; Catatan Strategi (Poin-poin)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddTipField}
                    className="text-xs font-tech font-bold text-white hover:underline flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Poin Tips</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {formTips.map((tip, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-xs font-tech text-zinc-500 w-5">{idx + 1}.</span>
                      <input
                        type="text"
                        placeholder={`Tips poin ke-${idx + 1}...`}
                        value={tip}
                        onChange={(e) => handleUpdateTipField(idx, e.target.value)}
                        className="flex-1 bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2 focus:outline-none focus:border-white font-sans"
                      />
                      {formTips.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTipField(idx)}
                          className="p-2 text-zinc-500 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Save & Submit Button */}
              <div className="pt-4 border-t border-[#27272a] flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] text-zinc-300 border border-[#27272a] font-heading font-bold text-xs"
                >
                  BATAL
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs shadow-md uppercase tracking-wider"
                >
                  <Save className="w-4 h-4" />
                  <span>SIMPAN REFERENSI</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* LIVE PREVIEW THEATER MODAL */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fadeIn">
          <div
            className="minimal-card w-full max-w-4xl max-h-[90vh] overflow-y-auto p-5 sm:p-8 space-y-6 relative border border-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 p-2.5 rounded-full bg-[#121215] hover:bg-white text-zinc-400 hover:text-black border border-[#27272a] transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-tech font-bold uppercase">
              <Eye className="w-3.5 h-3.5" />
              <span>LIVE PREVIEW TAMPILAN USER</span>
            </div>

            <div className="space-y-2 pr-10">
              <div className="flex items-center space-x-2">
                <span className="bg-white text-black font-tech font-bold text-xs px-2.5 py-0.5 rounded uppercase">
                  {CATEGORIES_CONFIG[previewItem.category].label}
                </span>
                <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                  {previewItem.subcategory}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-white leading-tight">
                {previewItem.title}
              </h2>
            </div>

            <div className="relative aspect-video w-full rounded-2xl bg-black border border-[#27272a] overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${previewItem.videoId}?autoplay=1`}
                title={previewItem.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="bg-black p-5 rounded-2xl border border-[#27272a] space-y-2">
              <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                DESKRIPSI REFERENSI (MARKDOWN RENDERED)
              </h4>
              <MarkdownRenderer content={previewItem.description} />
            </div>

            {previewItem.tips && previewItem.tips.length > 0 && (
              <div className="bg-[#121215] p-5 rounded-2xl border border-[#27272a] space-y-3">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-white" />
                  <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                    TIPS &amp; CATATAN STRATEGI
                  </h4>
                </div>
                <div className="space-y-2">
                  {previewItem.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-start space-x-2.5 text-xs font-sans text-zinc-200">
                      <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
