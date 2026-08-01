import React, { useState, useEffect } from 'react';
import {
  getStoredReferences,
  fetchLiveReferences,
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
    if (onNavigateRefDetail) {
      onNavigateRefDetail(undefined);
    }
  };

  // FULL-PAGE THEATER DETAIL VIEW (`/reffs/:refId`)
  if (activeDetailItem) {
    const CategoryIcon = getCategoryIcon(activeDetailItem.category);

    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        
        {/* Navigation & Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>BACK TO REFERENCES LIST</span>
          </button>

          <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider hidden sm:inline-block">
            INSPECTING: <strong className="text-white">{activeDetailItem.title}</strong>
          </span>
        </div>

        {/* Video Player Theater Screen */}
        <div className="minimal-card p-4 sm:p-6 space-y-6 relative overflow-hidden">
          <div className="aspect-video w-full rounded-2xl bg-black overflow-hidden border border-[#27272a] shadow-2xl relative">
            <iframe
              src={`https://www.youtube.com/embed/${activeDetailItem.videoId}?autoplay=1`}
              title={activeDetailItem.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
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
                href={activeDetailItem.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-md"
              >
                <span>OPEN ON YOUTUBE</span>
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
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Category Tabs Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-white" />
              <span>Competitive References Library</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GAMEPLAY <span className="text-zinc-500 font-normal">ROTATION REFERENCES</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Verified high score rotations and strategy guides curated by Dalaos
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

      {/* Search Input Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Reference Video Title / Keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>

          <div className="text-xs font-tech text-zinc-400">
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
          {filteredReferences.map((refItem) => (
            <div
              key={refItem.id}
              onClick={() => handleOpenDetail(refItem)}
              className="minimal-card-interactive p-4 space-y-4 flex flex-col justify-between cursor-pointer group rounded-3xl border border-[#27272a] hover:border-zinc-400 transition-all"
            >
              {/* Thumbnail with Play Overlay */}
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

                <div className="absolute top-3 left-3">
                  <span className="bg-black/90 text-white text-[10px] font-tech font-bold px-2.5 py-0.5 rounded-full border border-[#27272a] uppercase">
                    {refItem.subcategory}
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
          ))}
        </div>
      )}

    </div>
  );
};
