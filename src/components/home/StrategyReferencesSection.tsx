import React, { useState, useEffect } from 'react';
import { BookOpen, Swords, Skull, Shield, ChevronRight, Play, ArrowUpRight, User, Calendar } from 'lucide-react';
import { 
  fetchLiveReferences, 
  getStoredReferences, 
  ReferenceItem,
  getPlatformThumbnail
} from '@/data/static/reffsData';
import { MainTab } from '@/pages/HomePage';

interface StrategyReferencesSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onNavigateRefDetail: (refId: string) => void;
}

export const StrategyReferencesSection: React.FC<StrategyReferencesSectionProps> = ({
  onNavigate,
  onNavigateRefDetail
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'warzone' | 'ppc' | 'guild_challenge'>('all');
  const [references, setReferences] = useState<ReferenceItem[]>(() => getStoredReferences());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLiveReferences()
      .then((data) => {
        if (data && data.length > 0) {
          setReferences(data.filter((r) => r.isPublished !== false));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch live references', err);
        setLoading(false);
      });
  }, []);

  // Helper to clean Markdown tags for preview descriptions
  const cleanMarkdown = (text: string): string => {
    return text
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/[#*`_~>-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const filteredReferences = references.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const featuredGuide = filteredReferences[0];
  const recentGuides = filteredReferences.slice(1, 4);

  const getCategoryBadge = (cat: string) => {
    if (cat === 'warzone') {
      return { label: 'Warzone', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', icon: Swords };
    }
    if (cat === 'ppc') {
      return { label: 'PPC Cage', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Skull };
    }
    return { label: 'Guild Siege', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30', icon: Shield };
  };

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            PGR REFERENCES
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Curated combat rotations, high-score reference runs, and tactical gameplay guides compiled by union veterans and dalaos.
          </p>
        </div>

        {/* Controls: Filter Pills & Catalog CTA */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          
          <div className="flex items-center space-x-1 bg-[#121215] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all focus-tactical ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedCategory('warzone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all focus-tactical flex items-center space-x-1 ${
                selectedCategory === 'warzone'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Swords className="w-3 h-3" />
              <span>WARZONE</span>
            </button>
            <button
              onClick={() => setSelectedCategory('ppc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all focus-tactical flex items-center space-x-1 ${
                selectedCategory === 'ppc'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Skull className="w-3 h-3" />
              <span>PPC</span>
            </button>
            <button
              onClick={() => setSelectedCategory('guild_challenge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all focus-tactical flex items-center space-x-1 ${
                selectedCategory === 'guild_challenge'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>SIEGE</span>
            </button>
          </div>


        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-80 rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReferences.length === 0 && (
        <div className="py-16 text-center text-zinc-500 space-y-2 rounded-2xl bg-[#121215] border border-[#27272a]">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
          <div className="font-heading font-bold text-sm text-zinc-300">No references yet</div>
          <div className="text-xs font-sans">No reference guides found in this category.</div>
        </div>
      )}

      {/* Grid: 1 Large Featured Spotlight (Left 7 cols) + 3 Recent Guides (Right 5 cols) */}
      {!loading && featuredGuide && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT 7 COLS: Editor's Choice Featured Spotlight */}
          <div 
            onClick={() => onNavigateRefDetail(featuredGuide.id)}
            className="lg:col-span-7 p-1 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="h-full rounded-xl sm:rounded-2xl bg-[#0d0d11] p-5 sm:p-7 border border-[#27272a]/60 bracket-corner flex flex-col justify-between space-y-5">
              
              <div>
                {/* Thumbnail Container (Maintains 16:9 Aspect Ratio without CLS) */}
                <div className="relative w-full aspect-video rounded-xl bg-black border border-[#27272a] overflow-hidden mb-5">
                  <img
                    src={getPlatformThumbnail(featuredGuide.platform || 'youtube', featuredGuide.videoId, featuredGuide.thumbnailUrl)}
                    alt={featuredGuide.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/logo.png';
                    }}
                    className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>

                  {/* Badge Pills on Video */}
                  <div className="absolute top-3 left-3 flex items-center space-x-2">
                    <span className="text-[10px] font-tech font-black px-2.5 py-1 rounded bg-amber-500 text-black uppercase shadow-md">
                      FEATURED SPOTLIGHT
                    </span>
                    {(() => {
                      const badge = getCategoryBadge(featuredGuide.category);
                      const IconComp = badge.icon;
                      return (
                        <div className="flex items-center space-x-1.5">
                          <span className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded border ${badge.color} bg-black/80 flex items-center space-x-1 backdrop-blur-sm`}>
                            <IconComp className="w-3 h-3" />
                            <span>{badge.label}</span>
                          </span>
                          <span className={`text-[9px] font-tech font-bold px-1.5 py-0.5 rounded border uppercase ${
                            featuredGuide.platform === 'tiktok'
                              ? 'bg-black text-cyan-400 border-cyan-500/50'
                              : featuredGuide.platform === 'bilibili'
                              ? 'bg-pink-950 text-pink-300 border-pink-500/50'
                              : 'bg-red-950 text-red-300 border-red-500/50'
                          }`}>
                            {featuredGuide.platform || 'YouTube'}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="absolute bottom-3 right-3 text-[10px] font-tech bg-black/80 border border-[#27272a] text-zinc-300 px-2 py-0.5 rounded">
                    {featuredGuide.subcategory}
                  </div>
                </div>

                {/* Guide Title & Summary */}
                <div className="space-y-2">
                  <h3 className="font-heading font-black text-lg sm:text-2xl text-white group-hover:text-amber-300 transition-colors leading-tight">
                    {featuredGuide.title}
                  </h3>

                  <p className="text-zinc-400 text-xs sm:text-sm font-sans line-clamp-2 leading-relaxed">
                    {cleanMarkdown(featuredGuide.description) || 'Comprehensive rotation strategy and character synergy reference run.'}
                  </p>
                </div>
              </div>

              {/* Author & Action Footer */}
              <div className="pt-4 border-t border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-400">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1 text-zinc-300">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{featuredGuide.author || 'Karuhun Tactical'}</span>
                  </span>
                  {featuredGuide.dateAdded && (
                    <span className="flex items-center space-x-1 text-zinc-500">
                      <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{featuredGuide.dateAdded}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-1 text-amber-400 font-bold group-hover:translate-x-1 transition-transform">
                  <span>Open Reference</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT 5 COLS: Recent Guides Stack */}
          <div className="lg:col-span-5 flex flex-col space-y-3 sm:space-y-3.5">
            {recentGuides.map((guide) => {
              const badge = getCategoryBadge(guide.category);

              return (
                <div
                  key={guide.id}
                  onClick={() => onNavigateRefDetail(guide.id)}
                  className="p-3.5 rounded-2xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 transition-all cursor-pointer group flex items-center gap-3.5"
                >
                  {/* Compact Video Thumbnail */}
                  <div className="relative w-28 sm:w-32 aspect-video rounded-xl bg-black border border-[#27272a] overflow-hidden flex-shrink-0">
                    <img
                      src={getPlatformThumbnail(guide.platform || 'youtube', guide.videoId, guide.thumbnailUrl)}
                      alt={guide.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/logo.png';
                      }}
                      className="w-full h-full object-cover filter contrast-110 group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-white/90 text-black flex items-center justify-center">
                        <Play className="w-3 h-3 fill-black ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Title & Category info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                      <span className={`text-[9px] font-tech font-bold px-1.5 py-0.2 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                      <span className={`text-[9px] font-tech font-bold px-1.5 py-0.2 rounded border uppercase ${
                        guide.platform === 'tiktok'
                          ? 'bg-black text-cyan-400 border-cyan-500/50'
                          : guide.platform === 'bilibili'
                          ? 'bg-pink-950 text-pink-300 border-pink-500/50'
                          : 'bg-red-950 text-red-300 border-red-500/50'
                      }`}>
                        {guide.platform || 'YouTube'}
                      </span>
                      <span className="text-[10px] font-tech text-zinc-500 truncate">
                        {guide.subcategory}
                      </span>
                    </div>

                    <h4 className="font-heading font-bold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {guide.title}
                    </h4>

                    <div className="text-[10px] font-tech text-zinc-500 truncate flex items-center space-x-1">
                      <span>By {guide.author || 'Karuhun'}</span>
                    </div>
                  </div>

                  <div className="flex-shrink-0 text-zinc-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}

            {/* Bottom Catalog Action */}
            <div className="p-4 rounded-2xl bg-[#0d0d11] border border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-400">
              <span>Want to see other Warzone or PPC Rotation?</span>
              <button
                onClick={() => onNavigate('reffs')}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
              >
                <span>See More</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </section>
  );
};
