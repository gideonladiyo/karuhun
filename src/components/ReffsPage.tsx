import React, { useState, useEffect } from 'react';
import {
  getStoredReferences,
  CATEGORIES_CONFIG,
  ReferenceItem
} from '../data/reffs_data';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Video, Search, Play, ArrowLeft, ExternalLink, Lightbulb, Shield, Swords, Skull, CheckCircle2, Sparkles } from 'lucide-react';

interface ReffsPageProps {
  initialRefId?: string;
  onNavigateRefDetail?: (refId?: string) => void;
}

export const ReffsPage: React.FC<ReffsPageProps> = ({ initialRefId, onNavigateRefDetail }) => {
  const [selectedCategory, setSelectedCategory] = useState<'guild_challenge' | 'warzone' | 'ppc'>('guild_challenge');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeDetailItem, setActiveDetailItem] = useState<ReferenceItem | null>(null);

  const allStoredReferences = getStoredReferences();
  
  // Normal users only see published items (isPublished !== false)
  const publishedReferences = allStoredReferences.filter((r) => r.isPublished !== false);

  // Sync active detail item if initialRefId changes or is set via URL (/reffs/:refId)
  useEffect(() => {
    if (initialRefId) {
      const found = allStoredReferences.find((r) => r.id === initialRefId);
      if (found) setActiveDetailItem(found);
    } else {
      setActiveDetailItem(null);
    }
  }, [initialRefId, allStoredReferences.length]);

  const currentCategoryConfig = CATEGORIES_CONFIG[selectedCategory];

  const filteredReferences = publishedReferences.filter((item) => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const getCategoryIcon = (cat: 'guild_challenge' | 'warzone' | 'ppc') => {
    if (cat === 'guild_challenge') return Shield;
    if (cat === 'warzone') return Swords;
    return Skull;
  };

  const handleOpenDetail = (item: ReferenceItem) => {
    setActiveDetailItem(item);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (onNavigateRefDetail) {
      onNavigateRefDetail(item.id);
    }
  };

  const handleBackToList = () => {
    setActiveDetailItem(null);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    if (onNavigateRefDetail) {
      onNavigateRefDetail(undefined);
    }
  };

  // VIEW MODE 2: DEDICATED FULL-PAGE REFERENCE INSPECTOR PAGE
  if (activeDetailItem) {
    const CatIcon = getCategoryIcon(activeDetailItem.category);
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        
        {/* Top Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>KEMBALI KE DAFTAR REFERENSI</span>
          </button>

          <div className="flex items-center space-x-2 text-xs font-tech text-zinc-400">
            <span className="bg-white text-black font-bold px-2.5 py-0.5 rounded uppercase">
              {CATEGORIES_CONFIG[activeDetailItem.category].label}
            </span>
            <span>•</span>
            <span className="text-white font-bold">{activeDetailItem.subcategory}</span>
          </div>
        </div>

        {/* Main Full-Page Content Card */}
        <div className="minimal-card p-5 sm:p-8 space-y-8">
          
          {/* Reference Title Header */}
          <div className="space-y-3 border-b border-[#27272a] pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase">
                <CatIcon className="w-3.5 h-3.5 text-white" />
                <span>{CATEGORIES_CONFIG[activeDetailItem.category].label}</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white text-black text-xs font-tech font-bold uppercase">
                {activeDetailItem.subcategory}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-heading font-bold text-white tracking-tight leading-snug">
              {activeDetailItem.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs font-tech text-zinc-400 pt-1">
              <span>Author: <strong className="text-white">{activeDetailItem.author || 'Karuhun Corps'}</strong></span>
              <span>•</span>
              <span>Date: <strong className="text-white">{activeDetailItem.dateAdded || 'Latest'}</strong></span>
            </div>
          </div>

          {/* Large Theater Mode Responsive YouTube Video Player */}
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-2xl sm:rounded-3xl bg-black border border-[#27272a] overflow-hidden shadow-2xl">
              <iframe
                src={`https://www.youtube.com/embed/${activeDetailItem.videoId}?autoplay=1`}
                title={activeDetailItem.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between px-1 text-xs font-tech text-zinc-500">
              <span>Theater Mode YouTube Embed Player</span>
              <a
                href={activeDetailItem.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 text-zinc-300 hover:text-white font-bold transition-colors"
              >
                <span>BUKA DI YOUTUBE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Description & Strategy Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Markdown Rendered Description */}
            <div className="lg:col-span-6 bg-black p-6 rounded-2xl border border-[#27272a] space-y-3">
              <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span>DESKRIPSI REFERENSI RUN</span>
              </h3>

              {/* Renders Markdown Content */}
              <div className="pt-1">
                <MarkdownRenderer content={activeDetailItem.description} />
              </div>
            </div>

            {/* Right Column: Tips & Strategy Notes */}
            <div className="lg:col-span-6 bg-[#121215] p-6 rounded-2xl border border-[#27272a] space-y-4">
              <div className="flex items-center space-x-2">
                <Lightbulb className="w-4.5 h-4.5 text-white" />
                <h3 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                  TIPS &amp; CATATAN STRATEGI ROTASI
                </h3>
              </div>

              {activeDetailItem.tips && activeDetailItem.tips.length > 0 ? (
                <div className="space-y-3">
                  {activeDetailItem.tips.map((tip, tIdx) => (
                    <div key={tIdx} className="flex items-start space-x-3 text-xs sm:text-sm font-sans text-zinc-200 bg-black/60 p-3 rounded-xl border border-[#27272a]">
                      <CheckCircle2 className="w-4 h-4 text-white flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-tech text-zinc-500">Tidak ada catatan khusus.</p>
              )}
            </div>

          </div>

        </div>

      </div>
    );
  }

  // VIEW MODE 1: REFERENCES LIST PAGE
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-white" />
              <span>Competitive Gameplay References Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GAMEPLAY <span className="text-zinc-500 font-normal">REFFS &amp; ROTATIONS</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Kumpulan panduan video rotasi, strategi, dan run kompetitif untuk Guild Challenge, Warzone, dan PPC
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari Referensi / Judul..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>
        </div>
      </div>

      {/* Main Category Tabs (Guild Challenge, Warzone, PPC) */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['guild_challenge', 'warzone', 'ppc'] as const).map((cat) => {
            const isSelected = selectedCategory === cat;
            const IconComp = getCategoryIcon(cat);
            const count = publishedReferences.filter((r) => r.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedSubcategory('all');
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-black text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-xl border ${
                    isSelected ? 'bg-black text-white border-black' : 'bg-[#121215] text-white border-[#27272a]'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-tech uppercase block font-bold tracking-wider opacity-75">
                      CATEGORY
                    </span>
                    <h3 className="font-heading font-bold text-sm sm:text-base leading-tight">
                      {CATEGORIES_CONFIG[cat].label}
                    </h3>
                  </div>
                </div>

                <span className={`text-xs font-tech font-bold px-2.5 py-0.5 rounded-full ${
                  isSelected ? 'bg-black text-white' : 'bg-[#18181b] text-zinc-300 border border-[#27272a]'
                }`}>
                  {count} Reffs
                </span>
              </button>
            );
          })}
        </div>

        {/* Subcategories Filter Pills */}
        <div className="minimal-card p-3 sm:p-4 space-y-2">
          <span className="text-[10px] font-tech text-zinc-400 font-bold uppercase tracking-wider block px-1">
            SUB-KATEGORI ({currentCategoryConfig.label})
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedSubcategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all border ${
                selectedSubcategory === 'all'
                  ? 'bg-white text-black border-white'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              Semua Sub-Kategori
            </button>

            {currentCategoryConfig.subcategories.map((sub) => {
              const isSubActive = selectedSubcategory.toLowerCase() === sub.toLowerCase();
              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubcategory(sub)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all border ${
                    isSubActive
                      ? 'bg-white text-black border-white'
                      : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
                  }`}
                >
                  {sub}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* References Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1 text-xs font-tech text-zinc-400">
          <span className="font-bold uppercase tracking-wider">
            DAFTAR REFERENSI ({filteredReferences.length})
          </span>
          <span>Klik card untuk membuka halaman video &amp; tips</span>
        </div>

        {filteredReferences.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm space-y-2">
            <Video className="w-8 h-8 text-zinc-600 mx-auto" />
            <p>Belum ada video referensi pada sub-kategori ini.</p>
            <p className="text-xs text-zinc-500">Video referensi baru dapat ditambahkan melalui Admin Panel (/admin).</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReferences.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetail(item)}
                className="minimal-card-interactive p-4 flex flex-col justify-between cursor-pointer group space-y-3"
              >
                {/* Thumbnail Image Container */}
                <div className="relative aspect-video w-full rounded-xl bg-black border border-[#27272a] overflow-hidden group-hover:border-white transition-colors">
                  <img
                    src={item.thumbnailUrl || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                    alt={item.title}
                    className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${item.videoId}/0.jpg`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Subcategory Badge Overlay */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/90 text-white font-tech font-bold text-[10px] px-2.5 py-1 rounded-md border border-[#27272a] uppercase tracking-wider">
                      {item.subcategory}
                    </span>
                  </div>
                </div>

                {/* Title & Short Description */}
                <div className="space-y-1.5">
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-zinc-200 transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <div className="text-xs font-sans text-zinc-400 line-clamp-2 leading-relaxed">
                    <MarkdownRenderer content={item.description} />
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="pt-2 border-t border-[#27272a] flex items-center justify-between text-[11px] font-tech text-zinc-500">
                  <span>By {item.author || 'Karuhun Corps'}</span>
                  <span>{item.dateAdded || 'Latest'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
