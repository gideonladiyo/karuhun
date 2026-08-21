import React, { useState, useEffect } from 'react';
import {
  getStoredReferences,
  fetchLiveReferences,
  CATEGORIES_CONFIG,
  ReferenceItem,
  VideoPlatform
} from '@/data/static/reffsData';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { MultiPlatformVideoPlayer } from '@/components/reffs/MultiPlatformVideoPlayer';
import { BackButton } from '@/components/common/BackButton';
import { Video, Search, Play, ExternalLink, Lightbulb, Shield, Swords, Skull, Sparkles } from 'lucide-react';

interface ReffsPageProps {
  initialRefId?: string;
  onNavigateRefDetail?: (refId?: string) => void;
}

export const ReffsPage: React.FC<ReffsPageProps> = ({ initialRefId, onNavigateRefDetail }) => {
  const [selectedCategory, setSelectedCategory] = useState<'guild_challenge' | 'warzone' | 'ppc'>('warzone');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<'all' | VideoPlatform>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeDetailItem, setActiveDetailItem] = useState<ReferenceItem | null>(null);

  const [allReferences, setAllReferences] = useState<ReferenceItem[]>(() => getStoredReferences());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLiveReferences().then((data) => {
      setAllReferences(data);
      setLoading(false);
    });
  }, []);

  // Normal users only see published items (isPublished !== false)
  const publishedReferences = allReferences.filter((r) => r.isPublished !== false);

  // Sync active detail item if initialRefId changes or is set via URL (/reffs/:refId)
  useEffect(() => {
    if (initialRefId) {
      const found = allReferences.find((r) => r.id === initialRefId);
      if (found) setActiveDetailItem(found);
    } else {
      setActiveDetailItem(null);
    }
  }, [initialRefId, allReferences]);

  const currentCategoryConfig = CATEGORIES_CONFIG[selectedCategory];

  const filteredReferences = publishedReferences.filter((item) => {
    const matchesCategory = item.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    const itemPlat = item.platform || 'youtube';
    const matchesPlatform = selectedPlatform === 'all' || itemPlat === selectedPlatform;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subcategory.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesPlatform && matchesSearch;
  });

  const getCategoryIcon = (cat: 'guild_challenge' | 'warzone' | 'ppc') => {
    if (cat === 'guild_challenge') return Shield;
    if (cat === 'warzone') return Swords;
    return Skull;
  };

  const getPlatformBadge = (platform?: VideoPlatform) => {
    const plat = platform || 'youtube';
    if (plat === 'tiktok') {
      return {
        label: 'TikTok',
        classes: 'bg-black/90 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
        btnText: 'OPEN ON TIKTOK',
        btnClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
      };
    }
    if (plat === 'bilibili') {
      return {
        label: 'Bilibili',
        classes: 'bg-pink-950/90 text-pink-300 border-pink-500/50 shadow-[0_0_10px_rgba(244,114,182,0.2)]',
        btnText: 'OPEN ON BILIBILI',
        btnClass: 'bg-pink-500 hover:bg-pink-400 text-black',
      };
    }
    return {
      label: 'YouTube',
      classes: 'bg-red-950/90 text-red-300 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
      btnText: 'OPEN ON YOUTUBE',
      btnClass: 'bg-white hover:bg-zinc-200 text-black',
    };
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
    if (onNavigateRefDetail) {
      onNavigateRefDetail(undefined);
    }
  };

  // FULL-PAGE THEATER DETAIL VIEW (`/reffs/:refId`)
  if (activeDetailItem) {
    const CategoryIcon = getCategoryIcon(activeDetailItem.category);
    const itemPlat = activeDetailItem.platform || 'youtube';
    const platBadge = getPlatformBadge(itemPlat);
    const directUrl = activeDetailItem.videoUrl || activeDetailItem.youtubeUrl || '';

    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <BackButton label="BACK TO REFERENCES" onClick={handleBackToList} />

          <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider hidden sm:inline-block">
            INSPECTING: <strong className="text-white">{activeDetailItem.title}</strong>
          </span>
        </div>

        {/* Video Player Theater Screen */}
        <div className="minimal-card p-4 sm:p-6 space-y-6 relative overflow-hidden">
          
          {/* Universal Multi-Platform Video Player */}
          <div className="w-full flex justify-center">
            <MultiPlatformVideoPlayer
              platform={itemPlat}
              videoId={activeDetailItem.videoId}
              videoUrl={directUrl}
              title={activeDetailItem.title}
              thumbnailUrl={activeDetailItem.thumbnailUrl}
            />
          </div>

          {/* Reference Meta Information */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase">
                  <CategoryIcon className="w-3.5 h-3.5 text-white" />
                  <span>{CATEGORIES_CONFIG[activeDetailItem.category]?.label || activeDetailItem.category}</span>
                </span>
                
                <span className="bg-white text-black text-xs font-heading font-bold px-2.5 py-0.5 rounded-md uppercase">
                  {activeDetailItem.subcategory}
                </span>

                <span className={`text-[10px] font-tech font-bold px-2.5 py-0.5 rounded-full border uppercase ${platBadge.classes}`}>
                  {platBadge.label}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                {activeDetailItem.title}
              </h1>

              <p className="text-xs font-tech text-zinc-400">
                Author: <strong className="text-white">{activeDetailItem.author || 'Karuhun'}</strong> • Published: <span className="text-zinc-300">{activeDetailItem.dateAdded || 'Latest'}</span>
              </p>
            </div>

            <div>
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md ${platBadge.btnClass}`}
              >
                <span>{platBadge.btnText}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Rendered Strategy Description */}
          <div className="space-y-3 pt-2">
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-white" />
              <span>STRATEGY &amp; ROTATION DETAILS</span>
            </h2>

            <div className="bg-[#09090b] p-5 sm:p-6 rounded-2xl border border-[#27272a]">
              <MarkdownRenderer content={activeDetailItem.description} />
            </div>
          </div>

          {/* Key Tips Component Box */}
          {activeDetailItem.tips && activeDetailItem.tips.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#27272a]">
              <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-white" />
                <span>KEY EXECUTION TIPS</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeDetailItem.tips.map((tip, idx) => (
                  <div key={idx} className="bg-[#09090b] p-4 rounded-xl border border-[#27272a] space-y-1.5">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                      TIP #{idx + 1}
                    </span>
                    <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // MAIN REFFS HUB CATALOG VIEW
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      
      {/* Category Tabs Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-tech font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5" />
              <span>Multi-Platform Rotation Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GAMEPLAY <span className="text-zinc-500 font-normal">ROTATION REFERENCES</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Verified high score rotations and strategy guides across YouTube, TikTok, and Bilibili
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
            {(['guild_challenge', 'warzone', 'ppc'] as const).map((catKey) => {
              const Icon = getCategoryIcon(catKey);
              const isActive = selectedCategory === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setSelectedSubcategory('all');
                  }}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="uppercase">{CATEGORIES_CONFIG[catKey].label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategory Pills Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pt-2 border-t border-[#27272a] pb-1">
          <button
            onClick={() => setSelectedSubcategory('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all whitespace-nowrap ${
              selectedSubcategory === 'all'
                ? 'bg-white text-black shadow-sm'
                : 'bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a]'
            }`}
          >
            All Subcategories
          </button>
          {currentCategoryConfig.subcategories.map((sub) => {
            const isActive = selectedSubcategory.toLowerCase() === sub.toLowerCase();
            return (
              <button
                key={sub}
                onClick={() => setSelectedSubcategory(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-tech font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a]'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search & Platform Filter Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Reference Video Title / Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>

          {/* Platform Filter Tabs */}
          <div className="flex items-center space-x-1.5 bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
            {(['all', 'youtube', 'tiktok', 'bilibili'] as const).map((plat) => {
              const isActive = selectedPlatform === plat;
              const label = plat === 'all' ? 'All Platforms' : plat === 'youtube' ? 'YouTube' : plat === 'tiktok' ? 'TikTok' : 'Bilibili';
              return (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold uppercase transition-all ${
                    isActive
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-tech text-zinc-400 whitespace-nowrap">
            Showing <strong className="text-white">{filteredReferences.length}</strong> References
          </div>

        </div>
      </div>

      {/* Reference Video Cards Grid */}
      {loading ? (
        <div className="text-center py-20 bg-[#121215] rounded-3xl border border-[#27272a]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-tech text-zinc-400">Loading References Database...</p>
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] rounded-3xl border border-[#27272a] text-zinc-400 font-tech text-sm">
          No reference video matches search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReferences.map((refItem) => {
            const plat = refItem.platform || 'youtube';
            const platBadge = getPlatformBadge(plat);

            return (
              <div
                key={refItem.id}
                onClick={() => handleOpenDetail(refItem)}
                className="minimal-card-interactive p-4 space-y-4 flex flex-col justify-between cursor-pointer group rounded-3xl border border-[#27272a] hover:border-zinc-400 transition-all"
              >
                {/* Thumbnail with Play Overlay & Platform Badge */}
                <div className="relative w-full aspect-video rounded-2xl bg-black border border-[#27272a] overflow-hidden group-hover:border-white transition-colors">
                  <img
                    src={refItem.thumbnailUrl}
                    alt={refItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Subcategory Badge (Top Left) */}
                  <div className="absolute top-3 left-3">
                    <span className="bg-black/90 text-white text-[10px] font-tech font-bold px-2.5 py-0.5 rounded-full border border-[#27272a] uppercase">
                      {refItem.subcategory}
                    </span>
                  </div>

                  {/* Platform Badge (Top Right) */}
                  <div className="absolute top-3 right-3">
                    <span className={`text-[10px] font-tech font-bold px-2.5 py-0.5 rounded-full border uppercase ${platBadge.classes}`}>
                      {platBadge.label}
                    </span>
                  </div>
                </div>

                {/* Title & Author Info */}
                <div className="space-y-1.5 flex-1">
                  <h3 className="font-heading font-bold text-base text-white group-hover:text-zinc-200 transition-colors line-clamp-2">
                    {refItem.title}
                  </h3>
                  <p className="text-xs font-tech text-zinc-400">
                    By <strong className="text-white">{refItem.author || 'Karuhun Corps'}</strong>
                  </p>
                </div>

                {/* Action Link Footer */}
                <div className="pt-3 border-t border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-400 group-hover:text-white">
                  <span className="font-bold uppercase tracking-wider">FULL THEATER VIEW</span>
                  <span className="font-heading font-bold">→</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
