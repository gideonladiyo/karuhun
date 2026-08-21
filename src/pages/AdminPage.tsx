import React, { useState, useEffect } from 'react';
import {
  ReferenceItem,
  CATEGORIES_CONFIG,
  fetchLiveReferences,
  saveStoredReference,
  deleteStoredReference,
  toggleStoredReferencePublish,
  detectVideoPlatform,
  extractVideoId,
  getPlatformThumbnail,
} from '@/data/static/reffsData';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { MultiPlatformVideoPlayer } from '@/components/reffs/MultiPlatformVideoPlayer';
import {
  fetchAllGuildMembersSnapshot,
  saveBaselineSnapshot,
  loadBaselineSnapshot,
  loadBaselineSnapshotAsync,
  compareGuildMembersData,
  generateDiscordRecapText,
  getWibDateInfo,
  BaselineDataset,
  RecapComparisonResult,
  MemberComparisonItem
} from '@/services/recapService';
import {
  fetchAndSavePpcBossesFromSpreadsheet,
  getLiveOrStoredPpcBossesDetails,
  resetPpcBossesToDefault,
  PpcBossDetail,
} from '@/data/static/ppcScores';
import {
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
  CheckCircle,
  Clock,
  FileText,
  Download,
  Copy,
  AlertTriangle,
  Skull,
  ExternalLink,
  RotateCcw,
  Database
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('karuhun_admin_authenticated') === 'true';
  });

  // Main Admin Tab: 'reffs' | 'recap' | 'ppc_bosses'
  const [adminTab, setAdminTab] = useState<'reffs' | 'recap' | 'ppc_bosses'>('recap');

  // Admin View Mode inside Reffs: 'roster' (table list) | 'editor' (full-page form)
  const [viewMode, setViewMode] = useState<'roster' | 'editor'>('roster');

  // Supabase Auth Login State
  const [adminEmail, setAdminEmail] = useState<string>('');
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form & Preview state for Reffs
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
  const [formThumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [formDescription, setDescription] = useState<string>('');
  const [formAuthor, setAuthor] = useState<string>('Karuhun');
  const [formIsPublished, setIsPublished] = useState<boolean>(true);
  const [formTips, setTips] = useState<string[]>(['', '', '']);

  // Description tab state: 'edit' | 'preview'
  const [, setDescTab] = useState<'edit' | 'preview'>('edit');

  const [, setSupabaseUserEmail] = useState<string | null>(null);

  // --- RECAP SYSTEM STATES ---
  const [baselineData, setBaselineData] = useState<BaselineDataset>(() => loadBaselineSnapshot());
  const [comparisonResult, setComparisonResult] = useState<RecapComparisonResult | null>(null);
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [recapSearchTerm, setRecapSearchTerm] = useState<string>('');
  const [recapStatusTab, setRecapStatusTab] = useState<'uncontributed' | 'contributed' | 'all'>('uncontributed');
  const [recapGuildFilter, setRecapGuildFilter] = useState<number>(0); // 0 = All Guilds
  const [copyNotification, setCopyNotification] = useState<string | null>(null);
  const [jsonInputModalOpen, setJsonInputModalOpen] = useState<boolean>(false);
  const [rawJsonInput, setRawJsonInput] = useState<string>('');
  
  // Realtime WIB Clock & Auto-Snapshot Status
  const [, setCurrentWibTime] = useState<string>(() => getWibDateInfo().timeString);

  // --- PPC BOSSES SPREADSHEET SYSTEM STATES ---
  const [ppcBossesDetails, setPpcBossesDetails] = useState<{ updatedAt?: string; bosses: PpcBossDetail[] }>(() =>
    getLiveOrStoredPpcBossesDetails()
  );
  const [loadingPpcBossRefresh, setLoadingPpcBossRefresh] = useState<boolean>(false);
  const [ppcBossSearchTerm, setPpcBossSearchTerm] = useState<string>('');
  const [ppcRefreshNotice, setPpcRefreshNotice] = useState<string | null>(null);

  const handleRefreshPpcBossesFromSpreadsheet = async () => {
    setLoadingPpcBossRefresh(true);
    setPpcRefreshNotice(null);
    const res = await fetchAndSavePpcBossesFromSpreadsheet();
    setLoadingPpcBossRefresh(false);
    if (res.success) {
      setPpcBossesDetails(getLiveOrStoredPpcBossesDetails());
      setPpcRefreshNotice(`✅ Berhasil menyinkronkan ${res.count} data Boss PPC dari Google Spreadsheet!`);
      setTimeout(() => setPpcRefreshNotice(null), 6000);
    } else {
      alert(`⚠️ Gagal mengambil data spreadsheet: ${res.error}`);
    }
  };

  const handleResetPpcBosses = () => {
    if (window.confirm('Reset data Boss PPC ke data bawaan (default)?')) {
      resetPpcBossesToDefault();
      setPpcBossesDetails(getLiveOrStoredPpcBossesDetails());
      setPpcRefreshNotice('ℹ️ Data Boss PPC telah di-reset ke versi bawaan.');
      setTimeout(() => setPpcRefreshNotice(null), 4000);
    }
  };

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLiveReferences();
    setReferences(data);
    setLoading(false);
  };

  // Async load baseline snapshot on mount (checks Supabase if configured)
  useEffect(() => {
    loadBaselineSnapshotAsync().then((bData) => {
      if (bData && bData.members?.length > 0) {
        setBaselineData(bData);
      }
    });
  }, []);

  // 11:58 WIB Background Clock Update (Auto-fetch disabled to preserve local static JSON baseline)
  useEffect(() => {
    const timer = setInterval(() => {
      const wib = getWibDateInfo();
      setCurrentWibTime(wib.timeString);

      // Auto-fetch disabled so static local JSON baseline (guild_members_comparison.json) is strictly preserved
      /*
      checkAndTriggerAutoSnapshot().then((autoRes) => {
        if (autoRes.triggered && autoRes.dataset) {
          setBaselineData(autoRes.dataset);
          setAutoSnapshotNotice(`⚡ Auto Snapshot 11:58 WIB Berhasil Diambil Otomatis! (${autoRes.dataset.totalMembers} Member)`);
          setTimeout(() => setAutoSnapshotNotice(null), 10000);
        }
      });
      */
    }, 15000);

    return () => clearInterval(timer);
  }, []);

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
    return undefined;
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
    setThumbnailUrl('');
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
    setYoutubeUrl(refItem.videoUrl || refItem.youtubeUrl || '');
    setThumbnailUrl(refItem.thumbnailUrl || '');
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

    const detectedPlat = detectVideoPlatform(formYoutubeUrl);
    const vId = extractVideoId(formYoutubeUrl, detectedPlat) || 'cVxAQcUtZn0';
    const thumbUrl = getPlatformThumbnail(detectedPlat, vId, formThumbnailUrl);
    const finalSubcategory = isCustomSubcategory ? customSubcategory.trim() : formSubcategory;

    const newRef: ReferenceItem = {
      id: editingRef ? editingRef.id : `ref-${Date.now()}`,
      category: formCategory,
      subcategory: finalSubcategory || 'General',
      title: formTitle,
      platform: detectedPlat,
      videoUrl: formYoutubeUrl,
      youtubeUrl: formYoutubeUrl,
      videoId: vId,
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

  // --- RECAP SYSTEM HANDLERS ---

  const handleTriggerComparison = async () => {
    setLoadingRecap(true);
    try {
      // 1. Fetch current live data (Data Baru)
      const currentLiveDataset = await fetchAllGuildMembersSnapshot();

      // 2. Load baseline data (Data Lama)
      const currentBaseline = baselineData.members.length > 0 ? baselineData : await loadBaselineSnapshotAsync();

      // 3. Compare current live vs baseline data
      const result = compareGuildMembersData(currentBaseline, currentLiveDataset);
      setComparisonResult(result);
    } catch (err) {
      alert('⚠️ Gagal melakukan komparasi data. Pastikan jaringan stabil.');
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleExportBaselineJson = () => {
    const dataToExport = baselineData.members.length > 0 ? baselineData : loadBaselineSnapshot();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `guild_members_gc_data_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(rawJsonInput);
      if (parsed && Array.isArray(parsed.members)) {
        setBaselineData(parsed);
        await saveBaselineSnapshot(parsed);
        setJsonInputModalOpen(false);
        setRawJsonInput('');
        alert(`✅ Custom Baseline JSON berhasil diimport!\nTotal: ${parsed.members.length} member.`);
      } else if (Array.isArray(parsed)) {
        const dataset: BaselineDataset = {
          fetchedAt: new Date().toISOString(),
          totalMembers: parsed.length,
          members: parsed
        };
        setBaselineData(dataset);
        await saveBaselineSnapshot(dataset);
        setJsonInputModalOpen(false);
        setRawJsonInput('');
        alert(`✅ Custom Baseline JSON Array berhasil diimport!\nTotal: ${parsed.length} member.`);
      } else {
        alert('⚠️ Format JSON tidak valid. Harus mengandung array "members" atau array member.');
      }
    } catch (err) {
      alert('⚠️ Gagal memproses format JSON. Pastikan syntax JSON benar.');
    }
  };

  const handleCopyDiscordReport = () => {
    if (!comparisonResult) return;
    const text = generateDiscordRecapText(comparisonResult, recapGuildFilter);
    navigator.clipboard.writeText(text);
    setCopyNotification('Rekap teks laporan berhasil disalin ke clipboard!');
    setTimeout(() => setCopyNotification(null), 3000);
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
              className="w-full py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{authLoading ? 'AUTHENTICATING...' : 'LOGIN WITH SUPABASE AUTH'}</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // Filtered List for Table View in Reffs
  const filteredReferences = references.filter((r) => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || r.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && r.isPublished !== false) || (statusFilter === 'draft' && r.isPublished === false);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Filtered List for Recap Table
  let filteredRecapItems: MemberComparisonItem[] = comparisonResult ? comparisonResult.items : [];
  if (comparisonResult) {
    if (recapStatusTab === 'uncontributed') {
      filteredRecapItems = comparisonResult.uncontributedList;
    } else if (recapStatusTab === 'contributed') {
      filteredRecapItems = comparisonResult.contributedList;
    }

    if (recapGuildFilter > 0) {
      filteredRecapItems = filteredRecapItems.filter((item) => item.guildId === recapGuildFilter);
    }

    if (recapSearchTerm.trim().length > 0) {
      const q = recapSearchTerm.toLowerCase();
      filteredRecapItems = filteredRecapItems.filter((item) =>
        item.name.toLowerCase().includes(q) || String(item.playerId).includes(q) || item.guildName.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Top Header & Sub-Navigation */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-white" />
              <span>Admin Management Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              KARUHUN <span className="text-zinc-500 font-normal">ADMIN PANEL</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Kelola Rekapitulasi Kontribusi Mingguan 4 Guild &amp; Video References
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleLogout}
              className="px-3 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] text-xs font-heading font-bold uppercase transition-all cursor-pointer"
            >
              LOG OUT
            </button>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="flex flex-wrap items-center gap-2 border-t border-[#27272a] pt-4">
          <button
            onClick={() => setAdminTab('recap')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'recap'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#09090b] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>REKAP KONTRIBUSI GUILD</span>
          </button>

          <button
            onClick={() => setAdminTab('ppc_bosses')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'ppc_bosses'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#09090b] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            <Skull className="w-4 h-4 text-purple-400" />
            <span>DATA BOSS PPC</span>
          </button>

          <button
            onClick={() => setAdminTab('reffs')}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
              adminTab === 'reffs'
                ? 'bg-white text-black shadow-md'
                : 'bg-[#09090b] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>REFERENCES VIDEO</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: REKAP KONTRIBUSI GUILD PANEL */}
      {/* ========================================================================= */}
      {adminTab === 'recap' && (
        <div className="space-y-6 animate-fadeIn">

          {/* Controls Banner */}
          <div className="minimal-card p-6 space-y-6 border border-[#27272a]">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#27272a] pb-6">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-amber-400 font-tech text-xl font-bold uppercase">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>MEMBER GUILD CHALLANGE DETECTION</span>
                  </div>
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-tech font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    Under Development
                  </span>
                </div>
                <p className="text-xs font-tech text-zinc-400">
                  last Updated Data <span className="text-zinc-200">{baselineData.fetchedAt ? new Date(baselineData.fetchedAt).toLocaleString('id-ID') : 'Belum Ada Snapshot'}</span> ({baselineData.totalMembers || baselineData.members?.length || 0} Member) {baselineData.isAutoSnapshot && <strong className="text-amber-400">(Auto-Captured 11:58 WIB)</strong>}
                </p>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleTriggerComparison}
                  disabled={loadingRecap}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase shadow-md transition-all cursor-pointer"
                  title="Get new data and compare with latest data"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingRecap ? 'animate-spin' : ''}`} />
                  <span>{loadingRecap ? 'COMPARING...' : 'COMPARE DATA'}</span>
                </button>
              </div>
            </div>

            {/* Extra Tools: Import/Export JSON */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs font-tech text-zinc-400">
              <div className="flex items-center space-x-3">
                <span>Total data: </span>
                <span className="bg-[#18181b] border border-[#27272a] text-zinc-200 px-2.5 py-1 rounded-lg font-mono">
                  {baselineData.members.length > 0 ? `${baselineData.members.length} Member Loaded` : 'Using Fallback JSON'}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportBaselineJson}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>EXPORT DATA BY JSON</span>
                </button>

                {comparisonResult && (
                  <button
                    onClick={handleCopyDiscordReport}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold transition-all cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>COPY DISCORD REPORT</span>
                  </button>
                )}
              </div>
            </div>

            {copyNotification && (
              <div className="p-3 bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-tech font-bold uppercase rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{copyNotification}</span>
              </div>
            )}
          </div>

          {/* Guild Summary Breakdown Cards */}
          {comparisonResult && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {comparisonResult.guildSummary.map((g) => (
                <div key={g.guildId} className="minimal-card p-4 space-y-2 border border-[#27272a]">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-sm text-white">{g.guildName}</span>
                    <span className="text-xs font-mono font-bold text-black uppercase bg-white px-2 py-0.5 rounded-md border border-amber-800/50">
                      SERVER: {(g.server || (g.guildId === 2013 ? 'NA' : 'AP')).toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-tech pt-2 border-t border-[#27272a]">
                    <div className="bg-red-950/50 border border-red-900/60 p-2 rounded-lg">
                      <span className="text-red-400 text-[10px] block"> NO CONTRIBUTION</span>
                      <strong className="text-red-200 text-base font-bold">{g.uncontributed}</strong>
                    </div>
                    <div className="bg-emerald-950/50 border border-emerald-900/60 p-2 rounded-lg">
                      <span className="text-emerald-400 text-[10px] block">CONTRIBUTED</span>
                      <strong className="text-emerald-200 text-base font-bold">{g.contributed}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Comparison Results Section */}
          {!comparisonResult ? (
            <div className="minimal-card p-12 text-center space-y-4 border border-[#27272a]">
              <div className="w-12 h-12 rounded-2xl bg-black border border-[#27272a] flex items-center justify-center mx-auto text-amber-400">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-heading font-bold text-white">NO RESULT</h3>
                <p className="text-xs font-tech text-zinc-400 max-w-md mx-auto">
                  Klik tombol <strong>"COMPARE DATA"</strong> untuk mengambil data weekly terbaru dari 4 guild dan membandingkannya dengan Data Lama.
                </p>
              </div>
              <button
                onClick={handleTriggerComparison}
                disabled={loadingRecap}
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase shadow-md transition-all cursor-pointer"
              >
                {loadingRecap ? 'MEMPROSES...' : 'JALANKAN KOMPARASI SEKARANG'}
              </button>
            </div>
          ) : (
            <div className="minimal-card p-4 sm:p-6 space-y-6 border border-[#27272a]">
              
              {/* Filter & Search Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
                
                {/* Status Tabs */}
                <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
                  <button
                    onClick={() => setRecapStatusTab('uncontributed')}
                    className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      recapStatusTab === 'uncontributed' ? 'bg-red-950 text-red-300 border border-red-800' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>NO CONTRIBUTION ({comparisonResult.uncontributedCount})</span>
                  </button>

                  <button
                    onClick={() => setRecapStatusTab('contributed')}
                    className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                      recapStatusTab === 'contributed' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>CONTRIBUTED ({comparisonResult.contributedCount})</span>
                  </button>

                  <button
                    onClick={() => setRecapStatusTab('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                      recapStatusTab === 'all' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ALL MEMBER ({comparisonResult.totalMembers})
                  </button>
                </div>

                {/* Guild Filter & Search Input */}
                <div className="flex items-center space-x-3">
                  <select
                    value={recapGuildFilter}
                    onChange={(e) => setRecapGuildFilter(Number(e.target.value))}
                    className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                  >
                    <option value={0}>Semua Guild</option>
                    <option value={3638}>Karuhun 夜 (AP)</option>
                    <option value={1164}>Izanami 夜 (AP)</option>
                    <option value={7641}>Astrelume 夜 (AP)</option>
                    <option value={2013}>Karuhun 夜’ (NA)</option>
                  </select>

                  <div className="relative min-w-[200px]">
                    <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search Name / UID"
                      value={recapSearchTerm}
                      onChange={(e) => setRecapSearchTerm(e.target.value)}
                      className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Comparison Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#27272a] text-zinc-400 font-tech uppercase">
                      <th className="pb-3 px-3 font-bold">Guild</th>
                      <th className="pb-3 px-3 font-bold">Member Name</th>
                      <th className="pb-3 px-3 font-bold">Player ID</th>
                      <th className="pb-3 px-3 font-bold text-right">Last Week Contribution</th>
                      <th className="pb-3 px-3 font-bold text-right">Current Week Contribution</th>
                      <th className="pb-3 px-3 font-bold text-right">Differences</th>
                      <th className="pb-3 px-3 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {filteredRecapItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-zinc-500 font-tech">
                          Tidak ada data member yang cocok dengan kriteria filter.
                        </td>
                      </tr>
                    ) : (
                      filteredRecapItems.map((item) => (
                        <tr key={`${item.guildId}_${item.playerId}`} className="hover:bg-[#121215] transition-colors">
                          <td className="py-3 px-3 font-tech text-white font-bold">
                            {item.guildName}
                            <span className="text-[10px] text-zinc-400 block font-normal uppercase">{item.server}</span>
                          </td>
                          <td className="py-3 px-3 font-heading font-bold text-white">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 font-mono text-zinc-400">
                            {item.playerId}
                          </td>
                          <td className="py-3 px-3 font-mono text-right text-zinc-300">
                            {item.oldContribution.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono text-right text-white font-bold">
                            {item.newContribution.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 font-mono text-right font-bold">
                            {item.difference > 0 ? (
                              <span className="text-emerald-400">+{item.difference.toLocaleString()}</span>
                            ) : item.difference < 0 ? (
                              <span className="text-red-400">{item.difference.toLocaleString()}</span>
                            ) : (
                              <span className="text-zinc-500">0</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            {item.statusReason === 'MEMBER_BARU' ? (
                              <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] px-2.5 py-1 rounded-full font-tech font-bold uppercase inline-block" title="Member baru bergabung (Belum Kontribusi)">
                                NEW MEMBER
                              </span>
                            ) : !item.hasContributed ? (
                              <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2.5 py-1 rounded-full font-tech font-bold uppercase inline-block">
                                no CONTRIBUTION
                              </span>
                            ) : (
                              <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2.5 py-1 rounded-full font-tech font-bold uppercase inline-block">
                                CONTRIBUTED
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: DATABASE BOSS PPC (SPREADSHEET) PANEL */}
      {/* ========================================================================= */}
      {adminTab === 'ppc_bosses' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Controls Banner */}
          <div className="minimal-card p-6 space-y-6 border border-[#27272a]">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#27272a] pb-6">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-purple-400 font-tech text-xs font-bold uppercase">
                  <Database className="w-4 h-4" />
                  <span>GOOGLE SPREADSHEET LIVE SYNC</span>
                </div>
                <h2 className="text-xl font-heading font-bold text-white uppercase">
                  DATABASE BOSS PPC (PHANTOM PAIN CAGE)
                </h2>
                <p className="text-xs font-tech text-zinc-400">
                  Data Boss PPC Terload: <strong className="text-white font-mono">{ppcBossesDetails.bosses.length} Boss</strong> | Terakhir Disinkronkan: <span className="text-zinc-200">{ppcBossesDetails.updatedAt ? new Date(ppcBossesDetails.updatedAt).toLocaleString('id-ID') : 'Versi Bawaan (Default)'}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRefreshPpcBossesFromSpreadsheet}
                  disabled={loadingPpcBossRefresh}
                  className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-heading font-bold text-xs uppercase shadow-md transition-all cursor-pointer"
                  title="Tarik data boss PPC terbaru dari Google Spreadsheet"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingPpcBossRefresh ? 'animate-spin' : ''}`} />
                  <span>{loadingPpcBossRefresh ? 'MENYINKRONKAN...' : 'REFRESH DATA DARI SPREADSHEET'}</span>
                </button>

                <button
                  onClick={handleResetPpcBosses}
                  disabled={loadingPpcBossRefresh}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] font-heading font-bold text-xs uppercase transition-all cursor-pointer"
                  title="Kembalikan ke data boss bawaan (default)"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>RESET DEFAULT</span>
                </button>

                <a
                  href="https://docs.google.com/spreadsheets/d/1z_L4MEGv5q89OFkuN2RNI1gjajddD3_NG169_f0RNrA/edit?gid=1378072876#gid=1378072876"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold uppercase transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>BUKA SPREADSHEET</span>
                </a>
              </div>
            </div>

            {ppcRefreshNotice && (
              <div className="p-3 bg-purple-950/90 border border-purple-800 text-purple-200 text-xs font-tech font-bold uppercase rounded-xl flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-purple-400" />
                <span>{ppcRefreshNotice}</span>
              </div>
            )}

            {/* Filter Search Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari Nama Boss / Weakness..."
                  value={ppcBossSearchTerm}
                  onChange={(e) => setPpcBossSearchTerm(e.target.value)}
                  className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
                />
              </div>

              <span className="text-xs font-tech text-zinc-400">
                Menampilkan: <strong className="text-white">{ppcBossesDetails.bosses.filter(b => b.boss.toLowerCase().includes(ppcBossSearchTerm.toLowerCase()) || b.weakness.toLowerCase().includes(ppcBossSearchTerm.toLowerCase())).length}</strong> dari {ppcBossesDetails.bosses.length} Boss
              </span>
            </div>

          </div>

          {/* PPC Bosses Table Preview */}
          <div className="minimal-card p-4 sm:p-6 space-y-4 border border-[#27272a]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#27272a] text-zinc-400 font-tech uppercase">
                    <th className="pb-3 px-3 font-bold">Thumbnail</th>
                    <th className="pb-3 px-3 font-bold">Nama Boss</th>
                    <th className="pb-3 px-3 font-bold text-right">HP Knight</th>
                    <th className="pb-3 px-3 font-bold text-right">HP Chaos</th>
                    <th className="pb-3 px-3 font-bold text-right">HP Hell</th>
                    <th className="pb-3 px-3 font-bold text-center">Delay Timer</th>
                    <th className="pb-3 px-3 font-bold">Elemental Weakness / Buff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {ppcBossesDetails.bosses
                    .filter(b => b.boss.toLowerCase().includes(ppcBossSearchTerm.toLowerCase()) || b.weakness.toLowerCase().includes(ppcBossSearchTerm.toLowerCase()))
                    .map((b, idx) => (
                      <tr key={`${b.slug}_${idx}`} className="hover:bg-[#121215] transition-colors">
                        <td className="py-3 px-3">
                          <div className="w-12 h-12 rounded-lg bg-black border border-[#27272a] overflow-hidden flex items-center justify-center">
                            <img src={b.img_url} alt={b.boss} className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="py-3 px-3 font-heading font-bold text-white">
                          {b.boss}
                          <span className="text-[10px] text-zinc-400 block font-mono font-normal">slug: {b.slug}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-right text-zinc-300">{b.knight || '-'}</td>
                        <td className="py-3 px-3 font-mono text-right text-zinc-300">{b.chaos || '-'}</td>
                        <td className="py-3 px-3 font-mono text-right text-white font-bold">{b.hell || '-'}</td>
                        <td className="py-3 px-3 font-tech text-center text-amber-300 font-bold">{b.start_time || '-'}</td>
                        <td className="py-3 px-3 font-tech text-zinc-300 max-w-xs">{b.weakness || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: REFFS VIDEO CMS PANEL */}
      {/* ========================================================================= */}
      {adminTab === 'reffs' && (
        <div className="space-y-6 animate-fadeIn">
          
          {viewMode === 'editor' ? (
            /* FULL-PAGE EDITOR VIEW FOR REFFS */
            <div className="minimal-card p-6 sm:p-8 space-y-6 border border-[#27272a]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
                <h2 className="font-heading font-bold text-xl text-white uppercase">
                  {editingRef ? 'EDIT REFERENCE VIDEO' : 'ADD NEW REFERENCE VIDEO'}
                </h2>
                <button
                  onClick={() => setViewMode('roster')}
                  className="px-4 py-2 rounded-xl bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-bold"
                >
                  KEMBALI KE LIST REFFS
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {saveError && (
                  <div className="p-4 bg-red-950 border border-red-800 text-red-200 rounded-xl text-xs font-mono">
                    {saveError}
                  </div>
                )}

                {saveSuccess && (
                  <div className="p-4 bg-emerald-950 border border-emerald-800 text-emerald-200 rounded-xl text-xs font-tech font-bold uppercase">
                    {saveSuccess}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Main Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => handleCategoryChange(e.target.value as any)}
                      className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3"
                    >
                      <option value="guild_challenge">Guild Challenge</option>
                      <option value="warzone">Warzone</option>
                      <option value="ppc">PPC</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Subcategory Name</label>
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
                      className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3"
                    >
                      {CATEGORIES_CONFIG[formCategory]?.subcategories.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                      <option value="__custom__">+ Custom Subcategory...</option>
                    </select>
                    {isCustomSubcategory && (
                      <input
                        type="text"
                        placeholder="Nama subcategory custom..."
                        value={customSubcategory}
                        onChange={(e) => setCustomSubcategory(e.target.value)}
                        required
                        className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 mt-2"
                      />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Title</label>
                  <input
                    type="text"
                    placeholder="Judul Video Reference..."
                    value={formTitle}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Video Reference URL</label>
                      {formYoutubeUrl.trim() && (
                        <span className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded-full border uppercase ${
                          detectVideoPlatform(formYoutubeUrl) === 'tiktok'
                            ? 'bg-black text-cyan-400 border-cyan-500/50'
                            : detectVideoPlatform(formYoutubeUrl) === 'bilibili'
                            ? 'bg-pink-950 text-pink-300 border-pink-500/50'
                            : 'bg-red-950 text-red-300 border-red-500/50'
                        }`}>
                          {detectVideoPlatform(formYoutubeUrl)}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="YouTube, TikTok, atau Bilibili URL..."
                      value={formYoutubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      required
                      className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 font-mono"
                    />
                    <p className="text-[10px] font-tech text-zinc-500">
                      Mendukung YouTube (watch/shorts/youtu.be), TikTok (video/shortlink), dan Bilibili (BV/b23.tv)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Author / Credit</label>
                    <input
                      type="text"
                      placeholder="Nama Author (misal: Karuhun Corps, Lark, Dalao)..."
                      value={formAuthor}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                    Custom Thumbnail URL <span className="text-zinc-500 font-normal">(Opsional - Otomatis terisi jika kosong)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="https://... (Biarkan kosong untuk auto-thumbnail YouTube / platform default)"
                    value={formThumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl px-4 py-3 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">Markdown Strategy Description</label>
                  <textarea
                    rows={8}
                    value={formDescription}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl p-4 font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-[#27272a]">
                  <button
                    type="button"
                    onClick={() => setViewMode('roster')}
                    className="px-6 py-3 rounded-xl bg-[#18181b] text-zinc-300 text-xs font-bold uppercase"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl bg-white text-black font-bold text-xs uppercase cursor-pointer"
                  >
                    SIMPAN REFERENCE
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ROSTER VIEW FOR REFFS */
            <div className="space-y-4">
              <div className="minimal-card p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
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

                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="published">Published (Visible)</option>
                      <option value="draft">Draft (Hidden)</option>
                    </select>

                    <button
                      onClick={openCreateForm}
                      className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white text-black font-heading font-bold text-xs uppercase cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      <span>TAMBAH REFERENCE BARU</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="minimal-card p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#27272a] text-zinc-400 font-tech uppercase">
                        <th className="pb-3 px-3 font-bold">Thumbnail</th>
                        <th className="pb-3 px-3 font-bold">Title</th>
                        <th className="pb-3 px-3 font-bold">Category</th>
                        <th className="pb-3 px-3 font-bold">Subcategory</th>
                        <th className="pb-3 px-3 font-bold text-center">Status</th>
                        <th className="pb-3 px-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#27272a]">
                      {filteredReferences.map((refItem) => (
                        <tr key={refItem.id} className="hover:bg-[#121215] transition-colors">
                          <td className="py-3 px-3">
                            <div className="w-16 h-10 rounded-lg bg-black border border-[#27272a] overflow-hidden">
                              <img src={refItem.thumbnailUrl} alt={refItem.title} className="w-full h-full object-cover" />
                            </div>
                          </td>
                          <td className="py-3 px-3 font-heading font-bold text-white max-w-xs truncate">{refItem.title}</td>
                          <td className="py-3 px-3 font-tech uppercase text-zinc-300">
                            {refItem.category === 'guild_challenge' ? 'Guild Challenge' : refItem.category === 'warzone' ? 'Warzone' : 'PPC'}
                          </td>
                          <td className="py-3 px-3 font-tech text-zinc-400 capitalize">{refItem.subcategory}</td>
                          <td className="py-3 px-3 font-tech font-bold text-center">
                            <button
                              onClick={() => handleTogglePublish(refItem)}
                              className="cursor-pointer hover:opacity-80 transition-opacity"
                              title="Click to Toggle Published / Draft Status"
                            >
                              {refItem.isPublished !== false ? (
                                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2.5 py-1 rounded-full uppercase">
                                  Published
                                </span>
                              ) : (
                                <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] px-2.5 py-1 rounded-full uppercase">
                                  Draft
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => setPreviewModalRef(refItem)}
                                className="p-1.5 rounded-lg bg-[#18181b] hover:bg-[#27272a] text-zinc-300 border border-[#27272a] cursor-pointer"
                                title="Preview Video & Strategy"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => openEditForm(refItem)}
                                className="p-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-bold cursor-pointer"
                                title="Edit Reference"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(refItem.id)}
                                className="p-1.5 rounded-lg bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 cursor-pointer"
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
              </div>
            </div>
          )}

        </div>
      )}

      {/* JSON Import Modal */}
      {jsonInputModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="minimal-card p-6 w-full max-w-lg space-y-4 border border-[#27272a]">
            <h3 className="font-heading font-bold text-lg text-white">IMPORT BASELINE JSON (DATA LAMA)</h3>
            <p className="text-xs font-tech text-zinc-400">
              Paste konten JSON baseline data lama di bawah ini (misalnya data rilis 11:58 WIB).
            </p>
            <form onSubmit={handleImportJsonSubmit} className="space-y-4">
              <textarea
                rows={10}
                value={rawJsonInput}
                onChange={(e) => setRawJsonInput(e.target.value)}
                placeholder='{"fetchedAt": "...", "members": [...] }'
                className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl p-3 font-mono"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setJsonInputModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#18181b] text-zinc-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-white text-black font-bold text-xs cursor-pointer"
                >
                  IMPORT &amp; SIMPAN BASELINE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Reference Preview Modal */}
      {previewModalRef && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="minimal-card p-6 sm:p-8 w-full max-w-3xl space-y-6 border border-[#27272a] my-8">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="bg-[#18181b] border border-[#27272a] text-zinc-300 text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-full">
                    {previewModalRef.category} • {previewModalRef.subcategory}
                  </span>
                  {previewModalRef.isPublished !== false ? (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-full">
                      Published
                    </span>
                  ) : (
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-tech font-bold uppercase px-2.5 py-1 rounded-full">
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-bold text-xl text-white">{previewModalRef.title}</h3>
              </div>
              <button
                onClick={() => setPreviewModalRef(null)}
                className="p-2 rounded-xl bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div className="w-full flex justify-center">
              <MultiPlatformVideoPlayer
                platform={previewModalRef.platform || detectVideoPlatform(previewModalRef.videoUrl || previewModalRef.youtubeUrl || '')}
                videoId={previewModalRef.videoId}
                videoUrl={previewModalRef.videoUrl || previewModalRef.youtubeUrl || ''}
                title={previewModalRef.title}
                thumbnailUrl={previewModalRef.thumbnailUrl}
              />
            </div>

            {/* Strategy Guide Render */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-sm text-white uppercase">Strategy &amp; Rotation Guide</h4>
              <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-5">
                <MarkdownRenderer content={previewModalRef.description} />
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#27272a]">
              <button
                onClick={() => setPreviewModalRef(null)}
                className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase cursor-pointer"
              >
                TUTUP PREVIEW
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
