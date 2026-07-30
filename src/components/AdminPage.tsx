import React, { useState, useEffect } from 'react';
import { ReferenceItem, fetchLiveReferences, saveStoredReference, deleteStoredReference, toggleStoredReferencePublish, extractYoutubeVideoId } from '../data/reffs_data';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Lock, Plus, Edit, Trash2, Eye, CheckCircle, Clock, Video, Shield, Key, Search, ExternalLink, RefreshCw, Check } from 'lucide-react';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'karuhun2026';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karuhun_admin_authenticated') === 'true';
  });

  const [inputPasscode, setInputPasscode] = useState<string>('');
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>('');

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingRef, setEditingRef] = useState<ReferenceItem | null>(null);
  const [previewModalRef, setPreviewModalRef] = useState<ReferenceItem | null>(null);

  // Form Field State
  const [formCategory, setCategory] = useState<'guild_challenge' | 'warzone' | 'ppc'>('guild_challenge');
  const [formSubcategory, setSubcategory] = useState<string>('Zone Boss');
  const [formTitle, setTitle] = useState<string>('');
  const [formYoutubeUrl, setYoutubeUrl] = useState<string>('');
  const [formDescription, setDescription] = useState<string>('');
  const [formAuthor, setAuthor] = useState<string>('Karuhun Corps');
  const [formIsPublished, setIsPublished] = useState<boolean>(true);
  const [formTips, setTips] = useState<string[]>(['', '', '']);

  // Description tab state: 'edit' | 'preview'
  const [descTab, setDescTab] = useState<'edit' | 'preview'>('edit');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLiveReferences();
    setReferences(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPasscode.trim() === ADMIN_PASSCODE.trim()) {
      sessionStorage.setItem('karuhun_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid Admin Passcode! Access Denied.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('karuhun_admin_authenticated');
    setIsAuthenticated(false);
    setInputPasscode('');
  };

  const openCreateModal = () => {
    setEditingRef(null);
    setCategory('guild_challenge');
    setSubcategory('Zone Boss');
    setTitle('');
    setYoutubeUrl('');
    setDescription('### Rotation & Strategy Guide\nWrite strategy details using **Markdown** formatting...');
    setAuthor('Karuhun Corps');
    setIsPublished(true);
    setTips(['', '', '']);
    setDescTab('edit');
    setIsModalOpen(true);
  };

  const openEditModal = (refItem: ReferenceItem) => {
    setEditingRef(refItem);
    setCategory(refItem.category);
    setSubcategory(refItem.subcategory);
    setTitle(refItem.title);
    setYoutubeUrl(refItem.youtubeUrl);
    setDescription(refItem.description);
    setAuthor(refItem.author || 'Karuhun Corps');
    setIsPublished(refItem.isPublished !== false);
    setTips(refItem.tips && refItem.tips.length > 0 ? [...refItem.tips] : ['', '', '']);
    setDescTab('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ytId = extractYoutubeVideoId(formYoutubeUrl) || 'cVxAQcUtZn0';
    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;

    const newRef: ReferenceItem = {
      id: editingRef ? editingRef.id : `ref-${Date.now()}`,
      category: formCategory,
      subcategory: formSubcategory,
      title: formTitle,
      youtubeUrl: formYoutubeUrl,
      videoId: ytId,
      thumbnailUrl: thumbUrl,
      description: formDescription,
      author: formAuthor,
      isPublished: formIsPublished,
      dateAdded: editingRef?.dateAdded || new Date().toISOString().split('T')[0],
      tips: formTips.filter((t) => t.trim().length > 0)
    };

    await saveStoredReference(newRef);
    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (refId: string) => {
    if (window.confirm('Are you sure you want to delete this reference video?')) {
      await deleteStoredReference(refId);
      await loadData();
    }
  };

  const handleTogglePublish = async (refItem: ReferenceItem) => {
    const newStatus = !(refItem.isPublished !== false);
    await toggleStoredReferencePublish(refItem.id, newStatus);
    await loadData();
  };

  // If not authenticated, render Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-[#09090b] justify-center px-4 animate-fadeIn">
        <div className="minimal-card p-6 sm:p-8 max-w-md w-full space-y-6 border border-[#27272a]">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-black border border-[#27272a] p-2 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-white">ADMIN PANEL LOGIN</h1>
            <p className="text-xs font-tech text-zinc-400">
              REFFS Content Management System for Karuhun Guild
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                ENTER ADMIN PASSCODE
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  placeholder="Enter passcode..."
                  value={inputPasscode}
                  onChange={(e) => setInputPasscode(e.target.value)}
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-16 py-2.5 focus:outline-none focus:border-white font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-tech text-zinc-400 hover:text-white"
                >
                  {showPasscode ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {authError && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-xl font-tech">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              ENTER ADMIN DASHBOARD
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[11px] font-tech text-zinc-500">
              Default Passcode: <code className="text-zinc-300">karuhun2026</code>
            </span>
          </div>

        </div>
      </div>
    );
  }

  // Filtered List
  const filteredReferences = references.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && r.isPublished !== false) || (statusFilter === 'draft' && r.isPublished === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Admin Top Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Admin Management Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              REFFS VIDEO <span className="text-zinc-500 font-normal">MANAGER &amp; CMS</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Full CRUD management for Guild Challenge, Warzone, and PPC reference videos
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={openCreateModal}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>ADD NEW REFERENCE</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] text-xs font-heading font-bold uppercase transition-all"
            >
              LOG OUT
            </button>
          </div>
        </div>
      </div>

      {/* Controls & Search Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Reference Title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="guild_challenge">Guild Challenge</option>
              <option value="warzone">Warzone</option>
              <option value="ppc">PPC</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <button
              onClick={loadData}
              className="p-2.5 bg-[#09090b] border border-[#27272a] rounded-xl text-zinc-400 hover:text-white transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Reference Management Table */}
      <div className="minimal-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-heading font-bold text-white uppercase tracking-wider">
            REFERENCE VIDEO ROSTER ({filteredReferences.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Loading References Roster...</p>
          </div>
        ) : filteredReferences.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 font-tech text-sm">
            No reference video matches filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#27272a] text-zinc-400 font-tech uppercase">
                  <th className="pb-3 px-3 font-bold">Thumbnail</th>
                  <th className="pb-3 px-3 font-bold">Title</th>
                  <th className="pb-3 px-3 font-bold">Category</th>
                  <th className="pb-3 px-3 font-bold">Subcategory</th>
                  <th className="pb-3 px-3 font-bold">Status</th>
                  <th className="pb-3 px-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredReferences.map((refItem) => (
                  <tr key={refItem.id} className="hover:bg-[#121215] transition-colors">
                    <td className="py-3 px-3">
                      <div className="w-16 h-10 rounded-lg bg-black border border-[#27272a] overflow-hidden">
                        <img
                          src={refItem.thumbnailUrl}
                          alt={refItem.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3 font-heading font-bold text-white max-w-xs truncate">
                      {refItem.title}
                    </td>
                    <td className="py-3 px-3 font-tech uppercase text-zinc-300">
                      {refItem.category === 'guild_challenge' ? 'Guild Challenge' : refItem.category === 'warzone' ? 'Warzone' : 'PPC'}
                    </td>
                    <td className="py-3 px-3 font-tech text-zinc-400 capitalize">
                      {refItem.subcategory}
                    </td>
                    <td className="py-3 px-3 font-tech font-bold">
                      <button
                        onClick={() => handleTogglePublish(refItem)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Click to Toggle Published / Draft Status"
                      >
                        {refItem.isPublished !== false ? (
                          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full uppercase">
                            Published
                          </span>
                        ) : (
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2 py-0.5 rounded-full uppercase">
                            Draft
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => setPreviewModalRef(refItem)}
                          className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a]"
                          title="Preview Theater View"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(refItem)}
                          className="p-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold"
                          title="Edit Reference"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(refItem.id)}
                          className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800"
                          title="Delete Reference"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORM MODAL (CREATE / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="minimal-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 border border-[#27272a]">
            
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <h3 className="font-heading font-bold text-lg text-white">
                {editingRef ? 'EDIT REFERENCE VIDEO' : 'ADD NEW REFERENCE VIDEO'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-xs font-tech text-zinc-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Category & Subcategory Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#09090b] text-xs font-tech text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none"
                  >
                    <option value="guild_challenge">Guild Challenge</option>
                    <option value="warzone">Warzone</option>
                    <option value="ppc">PPC</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Subcategory Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone Boss / Nihil / Ultimate"
                    value={formSubcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    required
                    className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                  />
                </div>
              </div>

              {/* Title & Youtube Link */}
              <div className="space-y-1">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Reference Title</label>
                <input
                  type="text"
                  placeholder="e.g. Warzone Nihil 12M+ Score Run"
                  value={formTitle}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">YouTube Video Link</label>
                <input
                  type="text"
                  placeholder="https://youtu.be/cVxAQcUtZn0 or https://www.youtube.com/watch?v=..."
                  value={formYoutubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none font-mono"
                />
              </div>

              {/* Markdown Description with Tabs */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Markdown Strategy Description
                  </label>
                  <div className="flex items-center bg-black p-0.5 rounded-lg border border-[#27272a]">
                    <button
                      type="button"
                      onClick={() => setDescTab('edit')}
                      className={`px-3 py-1 rounded text-[10px] font-heading font-bold ${
                        descTab === 'edit' ? 'bg-white text-black' : 'text-zinc-400'
                      }`}
                    >
                      Edit Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => setDescTab('preview')}
                      className={`px-3 py-1 rounded text-[10px] font-heading font-bold ${
                        descTab === 'preview' ? 'bg-white text-black' : 'text-zinc-400'
                      }`}
                    >
                      Live Preview
                    </button>
                  </div>
                </div>

                {descTab === 'edit' ? (
                  <textarea
                    rows={6}
                    value={formDescription}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl p-3 focus:outline-none font-mono leading-relaxed"
                  />
                ) : (
                  <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 min-h-[140px]">
                    <MarkdownRenderer content={formDescription} />
                  </div>
                )}
              </div>

              {/* Strategy Tips Builder */}
              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Key Strategy Tips</label>
                {formTips.map((tip, idx) => (
                  <input
                    key={idx}
                    type="text"
                    placeholder={`Tip #${idx + 1}...`}
                    value={tip}
                    onChange={(e) => {
                      const next = [...formTips];
                      next[idx] = e.target.value;
                      setTips(next);
                    }}
                    className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2 focus:outline-none font-sans"
                  />
                ))}
              </div>

              {/* Publish Checkbox */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="published-check"
                  checked={formIsPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 accent-white cursor-pointer"
                />
                <label htmlFor="published-check" className="text-xs font-tech text-zinc-200 cursor-pointer">
                  Publish Video Reference (Visible on public REFFS page)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#27272a]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181b] text-zinc-300 text-xs font-heading font-bold uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase shadow-md"
                >
                  Save Reference
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* LIVE PREVIEW MODAL */}
      {previewModalRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="minimal-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto space-y-4 border border-[#27272a]">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <span className="text-xs font-tech font-bold text-zinc-400 uppercase">LIVE PREVIEW THEATER</span>
              <button
                onClick={() => setPreviewModalRef(null)}
                className="text-xs font-tech text-zinc-400 hover:text-white"
              >
                ✕ Close Preview
              </button>
            </div>

            <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden border border-[#27272a]">
              <iframe
                src={`https://www.youtube.com/embed/${previewModalRef.videoId}?autoplay=1`}
                title={previewModalRef.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <h3 className="font-heading font-bold text-lg text-white">{previewModalRef.title}</h3>
            <div className="bg-[#09090b] p-4 rounded-xl border border-[#27272a]">
              <MarkdownRenderer content={previewModalRef.description} />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
