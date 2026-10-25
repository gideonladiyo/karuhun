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
import { YoutubeReferenceCard } from '@/components/reffs/YoutubeReferenceCard';
import { 
  LayoutGrid, 
  Search, 
  ExternalLink, 
  Lightbulb, 
  Shield, 
  Swords, 
  Skull, 
  Sparkles 
} from 'lucide-react';

interface ReffsPageProps {
  initialRefId?: string;
  onNavigateRefDetail?: (refId?: string) => void;
}

export const ReffsPage: React.FC<ReffsPageProps> = ({ initialRefId, onNavigateRefDetail }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'guild_challenge' | 'warzone' | 'ppc'>('all');
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

  const currentCategoryConfig = selectedCategory === 'all' ? null : CATEGORIES_CONFIG[selectedCategory];

  const filteredReferences = publishedReferences.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSubcategory = selectedSubcategory === 'all' || item.subcategory.toLowerCase() === selectedSubcategory.toLowerCase();
    const itemPlat = item.platform || 'youtube';
    const matchesPlatform = selectedPlatform === 'all' || itemPlat === selectedPlatform;
    
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query) ||
      item.subcategory.toLowerCase().includes(query) ||
      (item.author && item.author.toLowerCase().includes(query)) ||
      (item.category && item.category.toLowerCase().includes(query)) ||
      (CATEGORIES_CONFIG[item.category]?.label.toLowerCase().includes(query));

    return matchesCategory && matchesSubcategory && matchesPlatform && matchesSearch;
  });

  const getCategoryIcon = (cat: 'all' | 'guild_challenge' | 'warzone' | 'ppc') => {
    if (cat === 'guild_challenge') return Shield;
    if (cat === 'warzone') return Swords;
    if (cat === 'ppc') return Skull;
    return LayoutGrid;
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
      btnClass: 'bg-red-600 hover:bg-red-500 text-white',
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
    const authorName = activeDetailItem.author || 'Karuhun Tactical';

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

          {/* Reference Meta Information with YouTube Style Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 border-b border-[#27272a] pb-6">
            <div className="space-y-2 min-w-0">
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

                <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-black text-white tracking-tight leading-snug">
                  {activeDetailItem.title}
                </h1>

                <div className="text-xs text-zinc-400 font-sans">
                  <span>Author: </span>
                  <strong className="text-white">{authorName}</strong>
                </div>
              </div>

            <div className="self-start md:self-auto flex-shrink-0">
              <a
                href={directUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md ${platBadge.btnClass}`}
              >
                <span>{platBadge.btnText}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Rendered Strategy Description */}
          <div className="space-y-3 pt-2">
            <h2 className="font-heading font-bold text-base sm:text-lg text-white uppercase tracking-wider flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>STRATEGY &amp; ROTATION DETAILS</span>
            </h2>

            <div className="bg-[#09090b] p-5 sm:p-6 rounded-2xl border border-[#27272a]">
              <MarkdownRenderer content={activeDetailItem.description} />
            </div>
          </div>

          {/* Key Tips Component Box */}
          {activeDetailItem.tips && activeDetailItem.tips.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-[#27272a]">
              <h3 className="font-heading font-bold text-sm sm:text-base text-white uppercase tracking-wider flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>KEY EXECUTION TIPS</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {activeDetailItem.tips.map((tip, idx) => (
                  <div key={idx} className="bg-[#09090b] p-4 rounded-xl border border-[#27272a] space-y-1.5">
                    <span className="text-[10px] font-tech text-amber-400 uppercase font-bold block">
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
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GAMEPLAY <span className="text-zinc-500 font-normal">ROTATION REFERENCES</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Verified high score rotations and strategy guides across YouTube, TikTok, and Bilibili
            </p>
          </div>

          {/* Category Tabs: ALL + Individual Categories */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedSubcategory('all');
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="uppercase">ALL</span>
            </button>
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

        {/* Subcategory Pills Filter (Shown when a specific category is selected) */}
        {selectedCategory !== 'all' && currentCategoryConfig && (
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
        )}
      </div>

      {/* Search & Platform Filter Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative min-w-[260px] flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                selectedCategory === 'all'
                  ? 'Search all reference videos (Warzone, PPC, Siege, keyword, author)...'
                  : `Search ${CATEGORIES_CONFIG[selectedCategory]?.label} reference videos...`
              }
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

      {/* Reference Video Cards Grid (YouTube Feed Style: Thumbnail on top, Avatar/Title/Views below, bg-transparent) */}
      {loading ? (
        <div className="text-center py-20 bg-[#121215] rounded-3xl border border-[#27272a]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-tech text-zinc-400">Loading References Database...</p>
        </div>
      ) : filteredReferences.length === 0 ? (
        <div className="text-center py-16 bg-[#121215] rounded-3xl border border-[#27272a] text-zinc-400 font-tech text-sm">
          No reference video matches search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 sm:gap-y-12">
          {filteredReferences.map((refItem) => (
            <YoutubeReferenceCard
              key={refItem.id}
              reference={refItem}
              onOpen={handleOpenDetail}
              variant="grid"
            />
          ))}
        </div>
      )}

    </div>
  );
};
