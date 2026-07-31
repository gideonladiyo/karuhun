import React, { useState, useEffect } from 'react';
import {
  ReferenceItem,
  CATEGORIES_CONFIG,
  fetchLiveReferences,
  saveStoredReference,
  deleteStoredReference,
  toggleStoredReferencePublish,
  extractYoutubeVideoId
} from '../data/reffs_data';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Lock,
  Plus,
  Edit,
  Trash2,
  Eye,
  Shield,
  Key,
  Search,
  RefreshCw,
  Mail,
  LogIn,
  ArrowLeft,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  Lightbulb
} from 'lucide-react';

const ADMIN_PASSCODE = import.meta.env.VITE_ADMIN_PASSCODE || 'karuhun2026';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karuhun_admin_authenticated') === 'true';
  });

  // Admin View Mode: 'roster' (table list) | 'editor' (full-page form)
  const [viewMode, setViewMode] = useState<'roster' | 'editor'>('roster');

  // Supabase Auth Login State
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form & Preview state
  const [editingRef, setEditingRef] = useState<ReferenceItem | null>(null);
  const [previewModalRef, setPreviewModalRef] = useState<ReferenceItem | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form Field State
  const [formCategory, setCategory] = useState<'guild_challenge' | 'warzone' | 'ppc'>('guild_challenge');
  const [formSubcategory, setSubcategory] = useState<string>('Zone Boss');
  const [isCustomSubcategory, setIsCustomSubcategory] = useState<boolean>(false);
  const [customSubcategory, setCustomSubcategory] = useState<string>('');

  const [formTitle, setTitle] = useState<string>('');
  const [formYoutubeUrl, setYoutubeUrl] = useState<string>('');
  const [formDescription, setDescription] = useState<string>('');
  const [formAuthor, setAuthor] = useState<string>('Karuhun Corps');
  const [formIsPublished, setIsPublished] = useState<boolean>(true);
  const [formTips, setTips] = useState<string[]>(['', '', '']);

  // Description tab state: 'edit' | 'preview'
  const [descTab, setDescTab] = useState<'edit' | 'preview'>('edit');

  const [supabaseUserEmail, setSupabaseUserEmail] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLiveReferences();
    setReferences(data);
    setLoading(false);
  };

  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          sessionStorage.setItem('karuhun_admin_authenticated', 'true');
          setIsAuthenticated(true);
          setSupabaseUserEmail(data.session.user?.email || 'Authenticated Admin');
        }
      });

      const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
          sessionStorage.setItem('karuhun_admin_authenticated', 'true');
          setIsAuthenticated(true);
          setSupabaseUserEmail(session.user?.email || 'Authenticated Admin');
        } else {
          setSupabaseUserEmail(null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthError('Supabase environment variables are missing! Check .env file.');
      return;
    }
    setAuthLoading(true);
    setAuthError('');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword
    });
    setAuthLoading(false);
    if (error) {
      setAuthError(error.message);
    } else if (data.session) {
      sessionStorage.setItem('karuhun_admin_authenticated', 'true');
      setIsAuthenticated(true);
      setSupabaseUserEmail(data.session.user?.email || 'Authenticated Admin');
    }
  };

  const handleLogout = async () => {
    sessionStorage.removeItem('karuhun_admin_authenticated');
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
    setAdminEmail('');
    setAdminPassword('');
    setViewMode('roster');
  };

  // Subcategory handler when Category changes
  const handleCategoryChange = (newCategory: 'guild_challenge' | 'warzone' | 'ppc') => {
    setCategory(newCategory);
    const subs = CATEGORIES_CONFIG[newCategory]?.subcategories || [];
    if (subs.length > 0) {
      setSubcategory(subs[0]);
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
    } else {
      setSubcategory('__custom__');
      setIsCustomSubcategory(true);
    }
  };

  const openCreateForm = () => {
    setEditingRef(null);
    setSaveError(null);
    setSaveSuccess(null);
    setCategory('guild_challenge');
    setSubcategory(CATEGORIES_CONFIG.guild_challenge.subcategories[0]);
    setIsCustomSubcategory(false);
    setCustomSubcategory('');
    setTitle('');
    setYoutubeUrl('');
    setDescription('### Rotation & Strategy Guide\nWrite strategy details using **Markdown** formatting...');
    setAuthor('');
    setIsPublished(true);
    setTips(['', '', '']);
    setDescTab('edit');
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const openEditForm = (refItem: ReferenceItem) => {
    setEditingRef(refItem);
    setSaveError(null);
    setSaveSuccess(null);
    setCategory(refItem.category);

    const subs = CATEGORIES_CONFIG[refItem.category]?.subcategories || [];
    if (subs.includes(refItem.subcategory)) {
      setSubcategory(refItem.subcategory);
      setIsCustomSubcategory(false);
      setCustomSubcategory('');
    } else {
      setSubcategory('__custom__');
      setIsCustomSubcategory(true);
      setCustomSubcategory(refItem.subcategory);
    }

    setTitle(refItem.title);
    setYoutubeUrl(refItem.youtubeUrl);
    setDescription(refItem.description);
    setAuthor(refItem.author || 'Karuhun Corps');
    setIsPublished(refItem.isPublished !== false);
    setTips(refItem.tips && refItem.tips.length > 0 ? [...refItem.tips] : ['', '', '']);
    setDescTab('edit');
    setViewMode('editor');
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    const ytId = extractYoutubeVideoId(formYoutubeUrl) || 'cVxAQcUtZn0';
    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    const finalSubcategory = isCustomSubcategory ? customSubcategory.trim() : formSubcategory;

    const newRef: ReferenceItem = {
      id: editingRef ? editingRef.id : `ref-${Date.now()}`,
      category: formCategory,
      subcategory: finalSubcategory || 'General',
      title: formTitle,
      youtubeUrl: formYoutubeUrl,
      videoId: ytId,
      thumbnailUrl: thumbUrl,
      description: formDescription,
      author: formAuthor.trim() || 'Karuhun Corps',
      isPublished: formIsPublished,
      dateAdded: editingRef?.dateAdded || new Date().toISOString().split('T')[0],
      tips: formTips.filter((t) => t.trim().length > 0)
    };

    const res = await saveStoredReference(newRef);
    setReferences(res.list);

    if (!res.success && res.error) {
      setSaveError(res.error);
    } else {
      setSaveSuccess('SUCCESS: Reference video directly saved to Supabase DB!');
      setTimeout(async () => {
        setViewMode('roster');
        await loadData();
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      }, 1500);
    }
  };

  const handleDelete = async (refId: string) => {
    if (window.confirm('Are you sure you want to delete this reference video?')) {
      const updatedList = await deleteStoredReference(refId);
      setReferences(updatedList);
      await loadData();
    }
  };

  const handleTogglePublish = async (refItem: ReferenceItem) => {
    const newStatus = !(refItem.isPublished !== false);
    await toggleStoredReferencePublish(refItem.id, newStatus);
    await loadData();
  };

  // Render Login Screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fadeIn">
        <div className="minimal-card p-8 sm:p-10 w-full max-w-md space-y-6 border border-[#27272a]">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-black border border-[#27272a] p-2 flex items-center justify-center mx-auto shadow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-white uppercase tracking-tight">ADMIN SUPABASE LOGIN</h1>
            <p className="text-xs font-tech text-zinc-400">
              Authenticate via Supabase Auth for RLS Direct DB Access
            </p>
          </div>

          <form onSubmit={handleSupabaseLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                ADMIN EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="admin@karuhun.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                PASSWORD
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
                />
              </div>
            </div>

            {authError && (
              <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-xl font-tech">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{authLoading ? 'AUTHENTICATING...' : 'LOGIN WITH SUPABASE AUTH'}</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // Filtered List for Table View
  const filteredReferences = references.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && r.isPublished !== false) || (statusFilter === 'draft' && r.isPublished === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // FULL-PAGE EDITOR VIEW (When creating or editing a reference)
  if (viewMode === 'editor') {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        
        {/* Navigation & Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setViewMode('roster')}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm uppercase tracking-wider self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO REFERENCE ROSTER</span>
          </button>

          <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider">
            ADMIN CMS: <strong className="text-white">{editingRef ? 'EDIT MODE' : 'CREATE MODE'}</strong>
          </span>
        </div>

        {/* Dedicated Full-Page Form Card */}
        <div className="minimal-card p-6 sm:p-8 space-y-6 border border-[#27272a]">
          
          <div className="border-b border-[#27272a] pb-4 space-y-1">
            <h1 className="font-heading font-bold text-2xl text-white uppercase tracking-tight">
              {editingRef ? 'EDIT REFERENCE VIDEO' : 'ADD NEW REFERENCE VIDEO'}
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Configure category, strategy details, video link, and key tips for Karuhun REFFS library.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {saveError && (
              <div className="p-4 bg-red-950/90 border border-red-800 text-red-200 rounded-xl text-xs font-mono space-y-1">
                <div className="font-bold text-red-400 font-tech uppercase">⚠️ Supabase Save Diagnostic Error:</div>
                <div className="break-all">{saveError}</div>
              </div>
            )}

            {saveSuccess && (
              <div className="p-4 bg-emerald-950/90 border border-emerald-800 text-emerald-200 rounded-xl text-xs font-tech font-bold uppercase flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{saveSuccess}</span>
              </div>
            )}
            
            {/* Category & Subcategory Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  1. Main Category
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => handleCategoryChange(e.target.value as any)}
                  className="w-full bg-[#09090b] text-sm font-tech text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white cursor-pointer"
                >
                  <option value="guild_challenge">Guild Challenge</option>
                  <option value="warzone">Warzone</option>
                  <option value="ppc">PPC (Phantom Pain Cage)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  2. Subcategory Name (Filtered by Main Category)
                </label>
                <select
                  value={isCustomSubcategory ? '__custom__' : formSubcategory}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setIsCustomSubcategory(true);
                    } else {
                      setIsCustomSubcategory(false);
                      setSubcategory(e.target.value);
                    }
                  }}
                  className="w-full bg-[#09090b] text-sm font-tech text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white cursor-pointer"
                >
                  {CATEGORIES_CONFIG[formCategory]?.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="__custom__">+ Custom Subcategory...</option>
                </select>

                {isCustomSubcategory && (
                  <input
                    type="text"
                    placeholder="Enter custom subcategory name..."
                    value={customSubcategory}
                    onChange={(e) => setCustomSubcategory(e.target.value)}
                    required
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white font-sans mt-2"
                  />
                )}
              </div>
            </div>

            {/* Reference Title */}
            <div className="space-y-2">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                3. Reference Title
              </label>
              <input
                type="text"
                placeholder="e.g. Warzone Nihil 12M+ Score Run"
                value={formTitle}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white font-sans"
              />
            </div>

            {/* YouTube Video Link & Author Credit Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  4. YouTube Video Link
                </label>
                <input
                  type="text"
                  placeholder="https://youtu.be/cVxAQcUtZn0 or https://www.youtube.com/watch?v=..."
                  value={formYoutubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  required
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  5. Author / Credit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Karuhun Corps, Player Name, etc."
                  value={formAuthor}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 focus:outline-none focus:border-white font-sans"
                />
              </div>
            </div>

            {/* Markdown Strategy Description with Tabs */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>5. Markdown Strategy Description</span>
                </label>

                <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a] self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setDescTab('edit')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                      descTab === 'edit' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Edit Markdown
                  </button>
                  <button
                    type="button"
                    onClick={() => setDescTab('preview')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold transition-all ${
                      descTab === 'preview' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Live Preview
                  </button>
                </div>
              </div>

              {descTab === 'edit' ? (
                <textarea
                  rows={10}
                  value={formDescription}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write strategy details using Markdown formatting..."
                  className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl p-4 focus:outline-none focus:border-white font-mono leading-relaxed"
                />
              ) : (
                <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-6 min-h-[220px]">
                  <MarkdownRenderer content={formDescription} />
                </div>
              )}
            </div>

            {/* Strategy Tips Builder */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-tech text-zinc-300 font-bold uppercase block flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-white" />
                <span>6. Key Strategy Tips (Optional)</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formTips.map((tip, idx) => (
                  <div key={idx} className="space-y-1">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold">
                      Tip #{idx + 1}
                    </span>
                    <input
                      type="text"
                      placeholder={`Enter tip #${idx + 1}...`}
                      value={tip}
                      onChange={(e) => {
                        const next = [...formTips];
                        next[idx] = e.target.value;
                        setTips(next);
                      }}
                      className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none focus:border-white font-sans"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Publication Status Checkbox */}
            <div className="flex items-center space-x-3 pt-4 border-t border-[#27272a]">
              <input
                type="checkbox"
                id="published-check"
                checked={formIsPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-5 h-5 accent-white cursor-pointer rounded"
              />
              <label htmlFor="published-check" className="text-xs font-tech text-zinc-200 cursor-pointer font-bold select-none">
                Publish Video Reference <span className="text-zinc-400 font-normal">(Checked = Visible on public REFFS page | Unchecked = Saved as Draft)</span>
              </label>
            </div>

            {/* Full-Page Bottom Action Controls */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-[#27272a]">
              <button
                type="button"
                onClick={() => setViewMode('roster')}
                className="px-6 py-3 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 text-xs font-heading font-bold uppercase transition-all border border-[#27272a]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-2 px-8 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase shadow-lg transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>SAVE REFERENCE VIDEO</span>
              </button>
            </div>

          </form>

        </div>

      </div>
    );
  }

  // MAIN ADMIN ROSTER LIST VIEW
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Admin Top Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Admin Management Panel</span>
              {supabaseUserEmail && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono normal-case">
                  {supabaseUserEmail}
                </span>
              )}
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
              onClick={openCreateForm}
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
                          onClick={() => openEditForm(refItem)}
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

      {/* LIVE PREVIEW MODAL */}
      {previewModalRef && (
        <div className="fixed inset-0 z-[100] flex justify-center items-start pt-20 sm:pt-24 pb-6 px-3 sm:px-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-hidden">
          <div className="relative flex flex-col w-full max-w-3xl max-h-[calc(100vh-110px)] sm:max-h-[calc(100vh-130px)] bg-[#09090b] border border-[#27272a] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
            
            {/* Fixed Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-5 border-b border-[#27272a] bg-[#121215]">
              <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-wider">LIVE PREVIEW THEATER</span>
              <button
                onClick={() => setPreviewModalRef(null)}
                className="px-3 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-xs font-tech text-zinc-300 hover:text-white transition-colors"
              >
                ✕ Close Preview
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
        </div>
      )}

    </div>
  );
};
